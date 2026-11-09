import { getBindings } from "@/lib/bindings";
import type { D1Database, D1PreparedStatement } from "./d1-types";
import { toD1Sql } from "./sql";
import type { DatabaseAdapter, QueryParams, QueryResult, SqlStatement } from "./types";

// =============================================
// Cloudflare D1 适配器（SQLite，运行于 workerd）
//
// 绑定统一从 @/lib/bindings 读取：
//   - Vinext / Workers：cloudflare:workers 的 env
//   - Next dev：wrangler getPlatformProxy（因此 `next dev` 也能直连本地 D1）
//
// 调用方的 SQL 保持 PG 写法，发送前统一转换（见 lib/db/sql.ts）：
//   $1 → ?1；::jsonb / ::int 等类型转换直接剥离。
// =============================================

/** 写语句用 run() 执行，以便拿到 meta.changes 作为 rowCount */
const WRITE_RE = /^\s*(?:INSERT|UPDATE|DELETE|REPLACE|CREATE|ALTER|DROP|VACUUM|REINDEX)\b/i;

/** 需要一个只暴露 prepare() 的最小接口 */
interface D1PrepareLike {
  prepare(query: string): D1PreparedStatement;
}

/** 事务降级提示只打一次 */
let transactionWarned = false;

/** 读取 D1 绑定；不存在时返回 null（供 getDbStatus 判断，不抛错） */
export async function getD1Binding(): Promise<D1Database | null> {
  try {
    const bindings = await getBindings();
    const db = bindings.DB as D1Database | undefined;
    return db && typeof db.prepare === "function" ? db : null;
  } catch {
    return null;
  }
}

function bind(stmt: D1PreparedStatement, params: QueryParams): D1PreparedStatement {
  return params.length > 0 ? stmt.bind(...params) : stmt;
}

function toResult<T = Record<string, unknown>>(res: {
  results?: T[];
  meta?: { changes?: number; last_row_id?: number };
}): QueryResult<T> {
  return {
    rows: res.results ?? [],
    rowCount: res.meta?.changes ?? null,
    lastInsertId: res.meta?.last_row_id ?? null,
  };
}

async function execOn<T = Record<string, unknown>>(
  target: D1PrepareLike,
  sql: string,
  params: QueryParams = [],
): Promise<QueryResult<T>> {
  const normalized = toD1Sql(sql);
  const stmt = bind(target.prepare(normalized), params);
  // 写语句用 run() 拿 changes（run 同样支持 RETURNING 的 results）
  return WRITE_RE.test(normalized)
    ? toResult<T>(await stmt.run<T>())
    : toResult<T>(await stmt.all<T>());
}

export class D1Adapter implements DatabaseAdapter {
  readonly provider = "d1" as const;

  private async db(): Promise<D1Database> {
    const db = await getD1Binding();
    if (!db) {
      throw new Error(
        "D1 绑定 `DB` 不可用：请在 wrangler.jsonc 的 d1_databases 中配置 binding = \"DB\"，" +
          "并执行 `npm run db:migrate:local`（本地）或 `npm run db:migrate:remote`（线上）。",
      );
    }
    return db;
  }

  async query<T = Record<string, unknown>>(
    sql: string,
    params: QueryParams = [],
  ): Promise<QueryResult<T>> {
    return execOn<T>(await this.db(), sql, params);
  }

  async batch<T = Record<string, unknown>>(statements: SqlStatement[]): Promise<QueryResult<T>[]> {
    if (statements.length === 0) return [];
    const db = await this.db();
    const prepared = statements.map(({ sql, params = [] }) =>
      bind(db.prepare(toD1Sql(sql)), params),
    );
    const results = await db.batch<T>(prepared);
    return results.map((res) => toResult<T>(res));
  }

  /**
   * 事务。
   *
   * D1 官方禁止 SQL BEGIN/COMMIT，也没有通用的多语句原子事务；这里把回调中的
   * 语句按顺序执行（无原子性）。需要原子写入时请改用 batch()：
   *
   *   await db.batch([
   *     { sql: "UPDATE ...", params: [...] },
   *     { sql: "INSERT ...", params: [...] },
   *   ]);
   */
  async transaction<T>(fn: (tx: DatabaseAdapter) => Promise<T>): Promise<T> {
    const db = await this.db();
    if (!transactionWarned) {
      transactionWarned = true;
      console.warn(
        "[db/d1] D1 不支持 SQL 事务，transaction() 内的语句将按顺序执行（不保证原子性）；" +
          "需要原子写入请改用 batch()。",
      );
    }
    return fn(this.wrap(db));
  }

  async ping(): Promise<boolean> {
    await this.query("SELECT 1");
    return true;
  }

  async close(): Promise<void> {
    // D1 无连接池可关
  }

  /** 把具备 prepare() 的对象（D1Database）包装成事务内的适配器 */
  private wrap(target: D1PrepareLike): DatabaseAdapter {
    return {
      provider: this.provider,
      query: (sql, params = []) => execOn(target, sql, params),
      batch: async <T = Record<string, unknown>>(statements: SqlStatement[]): Promise<QueryResult<T>[]> => {
        const results: QueryResult<T>[] = [];
        for (const { sql, params = [] } of statements) {
          results.push(await execOn<T>(target, sql, params));
        }
        return results;
      },
      transaction: async () => {
        throw new Error("不支持在事务内再开启事务。");
      },
      ping: async () => true,
      close: async () => undefined,
    };
  }
}