import { getBindings } from "@/lib/bindings";
import { toD1Sql } from "./sql";
import type {
  DatabaseAdapter,
  QueryParams,
  QueryResult,
  SqlStatement,
} from "./types";

// =============================================
// DK1 适配器（通过 DK1 REST 数据面访问虚拟 D1）
//
// 业务 SQL 仍写 $1 / $2；发送前用 toD1Sql() 转成 SQLite 的 ?N。
// 本地 Next dev 使用 DK1_URL（例如 http://127.0.0.1:3000）；
// Workers 优先使用 DK1_SERVICE Service Binding 调 Runtime。
// =============================================

export interface Dk1Options {
  baseUrl?: string;
  appId: string;
  apiKey: string;
}

interface Dk1FetchLike {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}

interface Dk1Response {
  success?: boolean;
  error?: { code?: string; message?: string };
  result?: unknown;
  results?: unknown;
}

interface D1ResultLike<T> {
  success?: boolean;
  results?: T[];
  meta?: {
    changes?: number;
    last_row_id?: number;
    [key: string]: unknown;
  };
}

const DEFAULT_BASE_URL = "https://dk1.internal";
const DEFAULT_TIMEOUT_MS = 10_000;
let transactionWarned = false;

function isWorkerRuntime(): boolean {
  return (
    typeof navigator !== "undefined" &&
    navigator.userAgent === "Cloudflare-Workers"
  );
}

/** 检查 Workers 环境是否有 DK1 Service Binding。 */
export async function hasDk1Binding(): Promise<boolean> {
  if (!isWorkerRuntime()) return false;
  try {
    const bindings = await getBindings();
    const binding = bindings.DK1_SERVICE as Dk1FetchLike | undefined;
    return Boolean(binding && typeof binding.fetch === "function");
  } catch {
    return false;
  }
}

function toResult<T = Record<string, unknown>>(
  value: D1ResultLike<T>,
): QueryResult<T> {
  return {
    rows: value.results ?? [],
    rowCount: value.meta?.changes ?? null,
    lastInsertId: value.meta?.last_row_id ?? null,
  };
}

export class Dk1Adapter implements DatabaseAdapter {
  readonly provider = "dk1" as const;
  private readonly baseUrl: string;
  private readonly appId: string;
  private readonly apiKey: string;

  constructor(options: Dk1Options) {
    this.baseUrl = (options.baseUrl || DEFAULT_BASE_URL).replace(/\/+$/, "");
    this.appId = options.appId;
    this.apiKey = options.apiKey;
  }

  async query<T = Record<string, unknown>>(
    sql: string,
    params: QueryParams = [],
  ): Promise<QueryResult<T>> {
    const body = await this.request("/query", {
      sql: toD1Sql(sql),
      params,
    });
    const first = Array.isArray(body.result) ? body.result[0] : null;
    if (!first || typeof first !== "object") {
      throw new Error("DK1 返回了无效的 query 结果");
    }
    return toResult<T>(first as D1ResultLike<T>);
  }

  async batch<T = Record<string, unknown>>(
    statements: SqlStatement[],
  ): Promise<QueryResult<T>[]> {
    if (statements.length === 0) return [];
    const body = await this.request("/batch", {
      statements: statements.map(({ sql, params = [] }) => ({
        sql: toD1Sql(sql),
        params,
      })),
    });
    if (!Array.isArray(body.result)) {
      throw new Error("DK1 返回了无效的 batch 结果");
    }
    return (body.result as D1ResultLike<T>[]).map((item) => toResult<T>(item));
  }

  /**
   * DK1 与 D1 一样不支持 SQL 事务；这里按顺序执行，不保证原子性。
   * 需要原子写入请使用 batch()。
   */
  async transaction<T>(fn: (tx: DatabaseAdapter) => Promise<T>): Promise<T> {
    if (!transactionWarned) {
      transactionWarned = true;
      console.warn(
        "[db/dk1] DK1 不支持 SQL 事务，transaction() 内的语句将按顺序执行（不保证原子性）；" +
          "需要原子写入请使用 batch()。",
      );
    }
    return fn(this);
  }

  async ping(): Promise<boolean> {
    await this.request("");
    return true;
  }

  async close(): Promise<void> {
    // DK1 是 HTTP/Service Binding，无连接池可关闭
  }

  private async service(): Promise<Dk1FetchLike | null> {
    if (!isWorkerRuntime()) return null;
    try {
      const bindings = await getBindings();
      const binding = bindings.DK1_SERVICE as Dk1FetchLike | undefined;
      return binding && typeof binding.fetch === "function" ? binding : null;
    } catch {
      return null;
    }
  }

  private async request(
    path: string,
    payload?: Record<string, unknown>,
  ): Promise<Dk1Response> {
    const appId = encodeURIComponent(this.appId);
    const url = `${this.baseUrl}/v1/dk1/database/${appId}${path}`;
    const headers = new Headers({
      authorization: `Bearer ${this.apiKey}`,
      accept: "application/json",
    });
    if (payload) headers.set("content-type", "application/json");

    const timeoutMs = Number(process.env.DK1_TIMEOUT_MS ?? DEFAULT_TIMEOUT_MS);
    const controller = new AbortController();
    const timer = setTimeout(
      () => controller.abort(),
      Number.isFinite(timeoutMs) && timeoutMs > 0
        ? timeoutMs
        : DEFAULT_TIMEOUT_MS,
    );

    let response: Response;
    try {
      const init: RequestInit = {
        method: payload ? "POST" : "GET",
        headers,
        cache: "no-store",
        signal: controller.signal,
        ...(payload ? { body: JSON.stringify(payload) } : {}),
      };
      const binding = await this.service();
      response = binding
        ? await binding.fetch(new Request(url, init))
        : await fetch(url, init);
    } catch (error) {
      throw new Error(
        `无法连接 DK1（${path || "/"}）：${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    } finally {
      clearTimeout(timer);
    }

    const text = await response.text();
    let body: Dk1Response = {};
    if (text) {
      try {
        body = JSON.parse(text) as Dk1Response;
      } catch {
        throw new Error(`DK1 返回了非 JSON 响应（HTTP ${response.status}）`);
      }
    }

    if (!response.ok || body.success !== true) {
      const code = body.error?.code || "DK1_INTERNAL";
      const message = body.error?.message || `HTTP ${response.status}`;
      throw new Error(`DK1 ${code}: ${message}`);
    }
    return body;
  }
}
