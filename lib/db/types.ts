// =============================================
// 数据库中间层 · 公共类型
//
// 上层只依赖 DatabaseAdapter，不感知底层是 PostgreSQL、MySQL 还是 D1。
// 新增后端：实现该接口 → 在 index.ts 的工厂里注册一行即可。
// =============================================

/** 已支持的后端标识 */
export type DatabaseProvider = "pg" | "mysql" | "d1";

/** 参数统一按位置传入；业务 SQL 一律写 $1 / $2 ...，由各适配器翻译 */
export type QueryParams = unknown[];

export interface QueryResult<T = Record<string, unknown>> {
  rows: T[];
  /** 影响或返回的行数；无法确定时为 null */
  rowCount: number | null;
  /** 自增主键（MySQL / D1 提供；PG 请用 INSERT ... RETURNING 取 id） */
  lastInsertId: number | null;
}

/** batch() 的一条语句 */
export interface SqlStatement {
  sql: string;
  params?: QueryParams;
}

export interface DatabaseAdapter {
  readonly provider: DatabaseProvider;

  /** 执行一条 SQL */
  query<T = Record<string, unknown>>(sql: string, params?: QueryParams): Promise<QueryResult<T>>;

  /**
   * 原子地执行一批写入：
   *   - PG / MySQL：包在事务里
   *   - D1：走 batch()（Cloudflare 原生的单事务批量执行）
   */
  batch<T = Record<string, unknown>>(statements: SqlStatement[]): Promise<QueryResult<T>[]>;

  /** 在事务中执行回调；出错自动回滚。D1 无 SQL 事务，详见 lib/db/d1.ts */
  transaction<T>(fn: (tx: DatabaseAdapter) => Promise<T>): Promise<T>;

  /** 连通性检测，成功返回 true */
  ping(): Promise<boolean>;

  /** 关闭连接池（D1 无连接池，空实现） */
  close(): Promise<void>;
}

/** 配置来源：环境变量 / 连接串推断 / D1 绑定 */
export type DbSource = "env" | "url" | "d1-binding";

/** 给页面、健康探针用的只读状态（不会抛错，也不会创建连接） */
export interface DbStatus {
  enabled: boolean;
  provider: DatabaseProvider | null;
  source: DbSource | null;
  /** 未启用或配置有误时的说明 */
  message?: string;
}