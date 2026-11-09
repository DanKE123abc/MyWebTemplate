import type { Pool, PoolClient } from "pg";
import type { DatabaseAdapter, QueryParams, QueryResult, SqlStatement } from "./types";

// =============================================
// PostgreSQL 适配器
//
// - 连接池复用（pg.Pool），适合 Next.js 这种「一次请求可能多次查询」的场景
// - 驱动按需加载：不配置 PG 的项目永远不会走到这里，也不会把 pg 打进 Worker
//   bundle（模板里的 UI 子项目可以完全不碰数据库）
// =============================================

type PgModule = typeof import("pg");

let pgModule: PgModule | null = null;

async function loadPg(): Promise<PgModule> {
  if (pgModule) return pgModule;
  try {
    // 变量说明符 + webpackIgnore/@vite-ignore：
    // Next（webpack）与 Vinext（Vite）都不会静态解析 pg，只有运行时才加载。
    const specifier = "pg";
    pgModule = (await import(/* webpackIgnore: true */ /* @vite-ignore */ specifier)) as PgModule;
    return pgModule;
  } catch {
    throw new Error("无法加载 PostgreSQL 驱动：请先执行 `npm install pg`。");
  }
}

function toResult<T>(res: { rows: T[]; rowCount: number | null }): QueryResult<T> {
  return { rows: res.rows, rowCount: res.rowCount, lastInsertId: null };
}

export class PostgresAdapter implements DatabaseAdapter {
  readonly provider = "pg" as const;
  private poolPromise: Promise<Pool> | null = null;

  constructor(private readonly connectionString: string) {}

  private pool(): Promise<Pool> {
    if (!this.poolPromise) {
      this.poolPromise = loadPg().then(
        ({ Pool }) =>
          new Pool({
            connectionString: this.connectionString,
            max: 10,
            // 连不上时尽快失败，避免健康检查/请求长时间挂起
            connectionTimeoutMillis: 5000,
          }),
      );
    }
    return this.poolPromise;
  }

  async query<T = Record<string, unknown>>(
    sql: string,
    params: QueryParams = [],
  ): Promise<QueryResult<T>> {
    const pool = await this.pool();
    const res = await pool.query(sql, params as unknown[]);
    return toResult<T>({ rows: res.rows as T[], rowCount: res.rowCount ?? null });
  }

  async batch<T = Record<string, unknown>>(statements: SqlStatement[]): Promise<QueryResult<T>[]> {
    if (statements.length === 0) return [];
    return this.transaction(async (tx) => {
      const results: QueryResult<T>[] = [];
      for (const { sql, params = [] } of statements) {
        results.push(await tx.query<T>(sql, params));
      }
      return results;
    });
  }

  async transaction<T>(fn: (tx: DatabaseAdapter) => Promise<T>): Promise<T> {
    const pool = await this.pool();
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const result = await fn(this.wrapClient(client));
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK").catch(() => undefined);
      throw error;
    } finally {
      client.release();
    }
  }

  async ping(): Promise<boolean> {
    await this.query("SELECT 1");
    return true;
  }

  async close(): Promise<void> {
    if (!this.poolPromise) return;
    const pool = await this.poolPromise.catch(() => null);
    this.poolPromise = null;
    if (pool) await pool.end();
  }

  /** 把单个 PoolClient 包装成事务内的 DatabaseAdapter */
  private wrapClient(client: PoolClient): DatabaseAdapter {
    return {
      provider: this.provider,
      query: async <T = Record<string, unknown>>(
        sql: string,
        params: QueryParams = [],
      ): Promise<QueryResult<T>> => {
        const res = await client.query(sql, params as unknown[]);
        return toResult<T>({ rows: res.rows as T[], rowCount: res.rowCount ?? null });
      },
      batch: async <T = Record<string, unknown>>(statements: SqlStatement[]): Promise<QueryResult<T>[]> => {
        const results: QueryResult<T>[] = [];
        for (const { sql, params = [] } of statements) {
          const res = await client.query(sql, params as unknown[]);
          results.push(toResult<T>({ rows: res.rows as T[], rowCount: res.rowCount ?? null }));
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