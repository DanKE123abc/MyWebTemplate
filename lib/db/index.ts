import { getD1Binding, D1Adapter } from "./d1";
import { MysqlAdapter } from "./mysql";
import { PostgresAdapter } from "./pg";
import type {
  DatabaseAdapter,
  DatabaseProvider,
  DbStatus,
  QueryParams,
  QueryResult,
  SqlStatement,
} from "./types";

// =============================================
// 数据库中间层 · 统一入口
//
// 用法（服务端）：
//   import { getDb, all, first, run, batch } from "@/lib/db";
//   const db = await getDb();
//   const { rows } = await db.query<User>("SELECT * FROM users WHERE id = $1", [id]);
//
// 本模块不强制子项目用数据库：只有调用 getDb() / all() 等函数时才
// 解析配置和创建连接；pg/mysql2 驱动也仅在对应 provider 真正用到时加载。
// =============================================

export type {
  DatabaseAdapter,
  DatabaseProvider,
  DbStatus,
  QueryParams,
  QueryResult,
  SqlStatement,
} from "./types";
export { D1Adapter } from "./d1";
export { PostgresAdapter } from "./pg";
export { MysqlAdapter } from "./mysql";
export { toD1Sql, toMysqlSql, stripPgCasts } from "./sql";

interface ResolvedConfig {
  provider: DatabaseProvider;
  connectionString?: string;
  source: "env" | "url" | "d1-binding";
}

interface CacheEntry {
  key: string;
  adapter: DatabaseAdapter;
}

/**
 * globalThis 缓存 Node 连接池：Next dev 热更新不会反复 new Pool。
 * Workers 中 provider 为 D1；其适配器不持有请求级 binding，每次 query
 * 从 getBindings() 读当前请求的 env，不会把 A 请求的绑定泄漏给 B 请求。
 */
const CACHE_KEY = "__mywebtemplate_db_adapter__";
const globals = globalThis as unknown as Record<string, CacheEntry | undefined>;

function cachedEntry(): CacheEntry | undefined {
  return globals[CACHE_KEY];
}

function normalizeProvider(value: string | undefined): DatabaseProvider | null {
  if (!value) return null;
  const lower = value.toLowerCase();
  if (lower === "pg" || lower === "postgres" || lower === "postgresql") return "pg";
  if (lower === "mysql" || lower === "mariadb") return "mysql";
  if (lower === "d1") return "d1";
  return null;
}

function providerFromUrl(url: string | undefined): DatabaseProvider | null {
  if (!url) return null;
  const scheme = /^([a-z][a-z\d+.-]*):\/\//i.exec(url)?.[1]?.toLowerCase();
  if (scheme === "postgres" || scheme === "postgresql") return "pg";
  if (scheme === "mysql" || scheme === "mariadb") return "mysql";
  return null;
}

/**
 * 解析数据库配置。优先级：
 *   1. DATABASE_PROVIDER（显式配置，优先于 D1 绑定）
 *   2. DATABASE_URL 的 scheme（postgres://、mysql://）
 *   3. Workers 环境检测到 D1 绑定 DB → d1
 *   4. 都没有 → 未启用数据库（Next dev 用 D1 请显式设置 DATABASE_PROVIDER=d1）
 *
 * Workers 中如果误选 pg/mysql，会在下面直接给出可操作的错误提示。
 */
async function resolveConfig(): Promise<{ config: ResolvedConfig | null; error?: string }> {
  const rawProvider = process.env.DATABASE_PROVIDER?.trim();
  const url = process.env.DATABASE_URL?.trim();
  const explicit = normalizeProvider(rawProvider);
  const fromUrl = providerFromUrl(url);

  if (rawProvider && !explicit) {
    return { config: null, error: `未知的 DATABASE_PROVIDER "${rawProvider}"，支持 pg / mysql / d1。` };
  }

  // 无配置的 Node 项目不启动 wrangler 代理；只有 Workers 会自动探测 D1。
  // Next dev 若要使用本地 D1，请显式设置 DATABASE_PROVIDER=d1。
  const isWorker = typeof navigator !== "undefined" && navigator.userAgent === "Cloudflare-Workers";
  const provider = explicit ?? fromUrl ?? (isWorker && (await getD1Binding()) ? "d1" : null);
  if (!provider) {
    return {
      config: null,
      error: "数据库未启用：设置 DATABASE_PROVIDER=pg/mysql + DATABASE_URL，或在 wrangler.jsonc 配置 D1 绑定 DB。",
    };
  }

  if (provider !== "d1") {
    if (!url) {
      return { config: null, error: `缺少 DATABASE_URL：${provider} 需要连接串（例如 ${provider}://user:password@host:port/dbname）。` };
    }
    if (fromUrl && fromUrl !== provider) {
      return { config: null, error: `DATABASE_PROVIDER=${provider} 与 DATABASE_URL 的协议不一致，请检查配置。` };
    }
    if (typeof navigator !== "undefined" && navigator.userAgent === "Cloudflare-Workers") {
      return { config: null, error: "Cloudflare Workers 不支持 Node TCP 连接池，请改用 DATABASE_PROVIDER=d1 并配置 D1 绑定 DB。" };
    }
    return { config: { provider, connectionString: url, source: explicit ? "env" : "url" } };
  }

  if (!(await getD1Binding())) {
    return { config: null, error: "D1 绑定 `DB` 不可用：请在 wrangler.jsonc 的 d1_databases 中配置 binding = \"DB\"。" };
  }
  return { config: { provider: "d1", source: explicit ? "env" : "d1-binding" } };
}

/**
 * 查看数据库配置状态（不会抛错或创建连接）。
 * 注意 enabled 表示已配置，不保证数据库可连接；连通性请调用 getDb().ping()。
 */
export async function getDbStatus(): Promise<DbStatus> {
  try {
    const { config, error } = await resolveConfig();
    return config
      ? { enabled: true, provider: config.provider, source: config.source }
      : { enabled: false, provider: null, source: null, message: error };
  } catch (error) {
    return { enabled: false, provider: null, source: null, message: error instanceof Error ? error.message : String(error) };
  }
}

/** 获取数据库适配器；同一配置复用同一实例（Node 池跨热更新复用） */
export async function getDb(): Promise<DatabaseAdapter> {
  const { config, error } = await resolveConfig();
  if (!config) throw new Error(error ?? "数据库未配置。");

  const key = `${config.provider}:${config.connectionString ?? ""}`;
  const cached = cachedEntry();
  if (cached?.key === key) return cached.adapter;

  // 配置在热更新期间改变时清理旧池；D1 没有池，close() 是空实现
  if (cached) {
    delete globals[CACHE_KEY];
    await cached.adapter.close().catch(() => undefined);
  }

  let adapter: DatabaseAdapter;
  switch (config.provider) {
    case "pg":
      adapter = new PostgresAdapter(config.connectionString!);
      break;
    case "mysql":
      adapter = new MysqlAdapter(config.connectionString!);
      break;
    case "d1":
      adapter = new D1Adapter();
      break;
  }

  globals[CACHE_KEY] = { key, adapter };
  return adapter;
}

/** 主动关闭连接池并清除缓存（测试/脚本退出时调用） */
export async function closeDb(): Promise<void> {
  const cached = cachedEntry();
  if (!cached) return;
  delete globals[CACHE_KEY];
  await cached.adapter.close();
}

/** 执行 SELECT 并返回全部行 */
export async function all<T = Record<string, unknown>>(
  sql: string,
  params: QueryParams = [],
): Promise<T[]> {
  return (await (await getDb()).query<T>(sql, params)).rows;
}

/** 执行 SELECT 并返回第一行（找不到时为 null） */
export async function first<T = Record<string, unknown>>(
  sql: string,
  params: QueryParams = [],
): Promise<T | null> {
  return (await all<T>(sql, params))[0] ?? null;
}

/** 执行任意 SQL，返回统一的结果（rows / rowCount / lastInsertId） */
export async function run<T = Record<string, unknown>>(
  sql: string,
  params: QueryParams = [],
): Promise<QueryResult<T>> {
  return (await getDb()).query<T>(sql, params);
}

/** 原子批量写入（D1 用原生 batch；PG/MySQL 用事务） */
export async function batch<T = Record<string, unknown>>(
  statements: SqlStatement[],
): Promise<QueryResult<T>[]> {
  return (await getDb()).batch<T>(statements);
}

/** 事务回调。注意 D1 的回调式 transaction() 不保证原子性；请用 batch() */
export async function transaction<T>(fn: (tx: DatabaseAdapter) => Promise<T>): Promise<T> {
  return (await getDb()).transaction(fn);
}

/** 帮助构造 batch() 语句 */
export function statement(sql: string, params: QueryParams = []): SqlStatement {
  return { sql, params };
}