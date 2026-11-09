// =============================================
// 数据库中间层 · SQL 方言归一化
//
// 业务层统一写 PostgreSQL 风格：
//   - 位置占位符 $1 / $2 ...
//   - 可选的 ::jsonb / ::int 等类型转换
// 由适配器在发送前翻译：
//   - D1    $N → ?N（编号占位符，保持参数顺序语义）
//   - MySQL $N → ?（按出现顺序重排参数数组）
//
// 转换只作用于「代码」片段：字符串字面量、引号标识符、注释原样保留，
// 避免误伤 '$1'、'a::b' 这类内容（参考项目用裸正则会踩这个坑）。
// =============================================

import type { QueryParams } from "./types";

/**
 * PostgreSQL 类型转换：::jsonb / ::int / ::numeric(10,2) / ::text[] /
 * ::timestamp with time zone / ::public.my_type 等。
 * `::` 在 SQL 里只会出现在类型转换处，所以这里可以放心地宽匹配。
 */
const PG_CAST_RE =
  /::\s*(?:(?:double\s+precision|character\s+varying|bit\s+varying)|[A-Za-z_][A-Za-z0-9_$]*(?:\.[A-Za-z_][A-Za-z0-9_$]*)?)(?:\s+(?:with|without)\s+time\s+zone)?(?:\s*\(\s*\d+(?:\s*,\s*\d+)?\s*\))?(?:\s*\[\s*\])*/gi;

interface SegmentOptions {
  /** 单/双引号内是否支持反斜杠转义（MySQL 默认开启；PG / SQLite 关闭） */
  backslashEscapes: boolean;
  /** 是否支持 # 行注释（仅 MySQL） */
  hashComment: boolean;
}

interface Segment {
  code: boolean;
  text: string;
}

const PG_OPTS: SegmentOptions = { backslashEscapes: false, hashComment: false };
const D1_OPTS: SegmentOptions = { backslashEscapes: false, hashComment: false };
const MYSQL_OPTS: SegmentOptions = { backslashEscapes: true, hashComment: true };

/**
 * 把 SQL 切成「代码 / 非代码」片段。
 *
 * 非代码包括：'...' 字符串、双引号标识符、`...` 标识符、-- 行注释、
 * # 行注释（MySQL）、/* *\/ 块注释。
 */
function segmentSql(sql: string, opts: SegmentOptions): Segment[] {
  const segments: Segment[] = [];
  let code = "";
  let i = 0;

  const flushCode = () => {
    if (code) {
      segments.push({ code: true, text: code });
      code = "";
    }
  };

  const pushLiteral = (start: number, end: number) => {
    flushCode();
    segments.push({ code: false, text: sql.slice(start, end) });
  };

  while (i < sql.length) {
    const ch = sql[i];

    // 引号：'...' 字符串、双引号标识符、`...` 标识符
    if (ch === "'" || ch === '"' || ch === "`") {
      const quote = ch;
      // 反引号永远不用反斜杠转义；单/双引号按方言决定
      const backslash = quote === "`" ? false : opts.backslashEscapes;
      let j = i + 1;
      while (j < sql.length) {
        const c = sql[j];
        if (backslash && c === "\\") {
          j += 2;
          continue;
        }
        if (c === quote) {
          // 连续两个引号表示转义（'' / "" / ``）
          if (sql[j + 1] === quote) {
            j += 2;
            continue;
          }
          j += 1;
          break;
        }
        j += 1;
      }
      pushLiteral(i, Math.min(j, sql.length));
      i = j;
      continue;
    }

    // -- 行注释（三种方言都支持）
    if (ch === "-" && sql[i + 1] === "-") {
      const nl = sql.indexOf("\n", i);
      const end = nl === -1 ? sql.length : nl + 1;
      pushLiteral(i, end);
      i = end;
      continue;
    }

    // # 行注释（MySQL）
    if (opts.hashComment && ch === "#") {
      const nl = sql.indexOf("\n", i);
      const end = nl === -1 ? sql.length : nl + 1;
      pushLiteral(i, end);
      i = end;
      continue;
    }

    // /* ... */ 块注释
    if (ch === "/" && sql[i + 1] === "*") {
      const close = sql.indexOf("*/", i + 2);
      const end = close === -1 ? sql.length : close + 2;
      pushLiteral(i, end);
      i = end;
      continue;
    }

    code += ch;
    i += 1;
  }

  flushCode();
  return segments;
}

function mapCode(sql: string, opts: SegmentOptions, replace: (code: string) => string): string {
  return segmentSql(sql, opts)
    .map((segment) => (segment.code ? replace(segment.text) : segment.text))
    .join("");
}

/** 仅剥离 PG 类型转换（PG 本身不需要，供其它方言或工具使用） */
export function stripPgCasts(sql: string): string {
  return mapCode(sql, PG_OPTS, (code) => code.replace(PG_CAST_RE, ""));
}

/**
 * 转成 D1（SQLite）可执行的 SQL：
 *   $1 → ?1，并剥离 ::jsonb 等 PG 类型转换。
 *
 * 使用 ?N 编号占位符而不是裸 ?，这样即使 SQL 里出现 $3/$1/$2 的乱序写法，
 * 参数数组仍然按 PG 的序号语义绑定。
 */
export function toD1Sql(sql: string): string {
  return mapCode(sql, D1_OPTS, (code) =>
    code.replace(PG_CAST_RE, "").replace(/\$(\d+)/g, "?$1"),
  );
}

/**
 * 转成 MySQL 可执行的 SQL：
 *   $1 → ?，并按占位符出现顺序重排参数数组；
 *   剥离 ::jsonb 等 PG 类型转换。
 *
 * 若 SQL 里没有任何 $N（说明直接用了 MySQL 原生的 ?），参数原样透传；
 * 两种写法混用会直接报错，避免参数错位。
 */
export function toMysqlSql(sql: string, params: QueryParams = []): { sql: string; params: QueryParams } {
  const order: number[] = [];
  let hasNativePlaceholder = false;

  const out = mapCode(sql, MYSQL_OPTS, (code) => {
    const stripped = code.replace(PG_CAST_RE, "");
    if (stripped.includes("?")) hasNativePlaceholder = true;
    return stripped.replace(/\$(\d+)/g, (_match, n: string) => {
      order.push(Number(n));
      return "?";
    });
  });

  if (order.length === 0) return { sql: out, params };

  if (hasNativePlaceholder) {
    throw new Error(
      "SQL 不能混用 `?` 与 `$1` 占位符：请统一写成 $1（lib/db 会自动适配各数据库）。",
    );
  }

  const reordered = order.map((n) => {
    if (!Number.isInteger(n) || n < 1 || n > params.length) {
      throw new Error(`SQL 占位符 $${n} 超出参数数量（共 ${params.length} 个参数）。`);
    }
    return params[n - 1];
  });

  return { sql: out, params: reordered };
}