import type { Pool, PoolConnection } from "mysql2/promise";
import { toMysqlSql } from "./sql";
import type { DatabaseAdapter, QueryParams, QueryResult, SqlStatement } from "./types";

// =============================================
// MySQL 适配器
//
// - 连接池复用（mysql2/promise）
// - 业务 SQL 统一写 $1 占位符，发送前由 toMysqlSql 转成 ? 并重排参数
//   （支持 $3/$1/$2 这种乱序写法；纯 ? 写法原样透传）
// - 驱动按需加载，避免打进 Worker bundle
// =============================================

type MysqlModule = typeof import("mysql2/promise");

let mysqlModule: MysqlModule | null = null;

async function loadMysql(): Promise<MysqlModule> {
  if (mysqlModule) return mysqlModule;
  try {
    const specifier = "mysql2/promise";
    mysqlModule = (await import(
      /* webpackIgnore: true */ /* @vite-ignore */ specifier
    )) as MysqlModule;
    return mysqlModule;
  } catch {
    throw new Error("无法加载 MySQL 驱动：请先执行 `npm install mysql2`。");
  }
}

function toResult<T>(result: unknown): QueryResult<T> {
  // 查询语句返回行数组；写入语句返回 ResultSetHeader
  if (Array.isArray(result)) {
    return { rows: result as T[], rowCount: result.length, lastInsertId: null };
  }
  const header = (result ?? {}) as { affectedRows?: number; insertId?: number };
  return {
    rows: [],
    rowCount: header.affectedRows ?? null,
    lastInsertId: header.insertId ?? null,
  };
}

export class MysqlAdapter implements DatabaseAdapter {
  readonly provider = "mysql" as const;
  private poolPromise: Promise<Pool> | null = null;

  constructor(private readonly connectionString: string) {}

  private pool(): Promise<Pool> {
    if (!this.poolPromise) {
      this.poolPromise = loadMysql().then((mod) =>
        mod.createPool({
          uri: this.connectionString,
          connectionLimit: 10,
          waitForConnections: true,
          // 连不上时尽快失败，避免健康检查/请求长时间挂起
          connectTimeout: 5000,
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
    const { sql: normalized, params: bound } = toMysqlSql(sql, params);
    const [result] = await pool.query(normalized, bound as never);
    return toResult<T>(result);
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
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const result = await fn(this.wrapConnection(conn));
      await conn.commit();
      return result;
    } catch (error) {
      await conn.rollback().catch(() => undefined);
      throw error;
    } finally {
      conn.release();
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

  /** 把单个连接包装成事务内的 DatabaseAdapter */
  private wrapConnection(conn: PoolConnection): DatabaseAdapter {
    return {
      provider: this.provider,
      query: async <T = Record<string, unknown>>(
        sql: string,
        params: QueryParams = [],
      ): Promise<QueryResult<T>> => {
        const { sql: normalized, params: bound } = toMysqlSql(sql, params);
        const [result] = await conn.query(normalized, bound as never);
        return toResult<T>(result);
      },
      batch: async <T = Record<string, unknown>>(statements: SqlStatement[]): Promise<QueryResult<T>[]> => {
        const results: QueryResult<T>[] = [];
        for (const { sql, params = [] } of statements) {
          const { sql: normalized, params: bound } = toMysqlSql(sql, params);
          const [result] = await conn.query(normalized, bound as never);
          results.push(toResult<T>(result));
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