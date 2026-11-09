#!/usr/bin/env node
/**
 * PG / MySQL 迁移脚本（D1 继续用 wrangler d1 migrations apply）。
 *
 * 用法：DATABASE_PROVIDER=pg DATABASE_URL=... npm run db:migrate
 *      DATABASE_PROVIDER=mysql DATABASE_URL=... npm run db:migrate
 *
 * 文件约定：
 *   db/migrations/pg/0001_init.sql
 *   db/migrations/mysql/0001_init.sql
 *
 * 每个迁移文件只放一条 SQL（可多行），以文件名顺序执行。若需要多条 SQL，
 * 分成多个编号文件。这样不需要用分号切 SQL，避免误伤字符串 / 存储过程。
 */

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const provider = process.env.DATABASE_PROVIDER?.toLowerCase();
const url = process.env.DATABASE_URL;

if (!provider || !["pg", "mysql"].includes(provider)) {
  console.error("[db:migrate] 请设置 DATABASE_PROVIDER=pg 或 DATABASE_PROVIDER=mysql。D1 请用 npm run db:migrate:local/remote。");
  process.exit(1);
}
if (!url) {
  console.error("[db:migrate] 缺少 DATABASE_URL 环境变量。");
  process.exit(1);
}

const dir = path.join(root, "db", "migrations", provider);
const files = (await readdir(dir)).filter((name) => /^\d+_[\w-]+\.sql$/.test(name)).sort();
if (files.length === 0) {
  console.log(`[db:migrate] ${dir} 下没有待执行的迁移。`);
  process.exit(0);
}

// 表名由脚本固定，不接受用户输入。仅执行本仓库随附的 SQL 文件。
const CREATE_TABLE_PG = `CREATE TABLE IF NOT EXISTS _db_migrations (
  name TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
)`;
const CREATE_TABLE_MYSQL = `CREATE TABLE IF NOT EXISTS _db_migrations (
  name VARCHAR(255) PRIMARY KEY,
  applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
)`;

if (provider === "pg") {
  const { Pool } = await import("pg");
  const pool = new Pool({ connectionString: url, connectionTimeoutMillis: 5000 });
  try {
    const client = await pool.connect();
    try {
      await client.query(CREATE_TABLE_PG);
      const { rows } = await client.query("SELECT name FROM _db_migrations");
      const applied = new Set(rows.map((row) => row.name));
      for (const file of files) {
        if (applied.has(file)) continue;
        const sql = await readFile(path.join(dir, file), "utf8");
        console.log(`[db:migrate] PG → ${file}`);
        await client.query("BEGIN");
        try {
          await client.query(sql);
          await client.query("INSERT INTO _db_migrations (name) VALUES ($1)", [file]);
          await client.query("COMMIT");
        } catch (error) {
          await client.query("ROLLBACK").catch(() => undefined);
          throw error;
        }
      }
    } finally {
      client.release();
    }
  } finally {
    await pool.end();
  }
} else {
  const mysql = await import("mysql2/promise");
  const pool = mysql.createPool({ uri: url, connectionLimit: 5, waitForConnections: true, connectTimeout: 5000 });
  try {
    const conn = await pool.getConnection();
    try {
      await conn.query(CREATE_TABLE_MYSQL);
      const [rows] = await conn.query("SELECT name FROM _db_migrations");
      const applied = new Set(rows.map((row) => row.name));
      for (const file of files) {
        if (applied.has(file)) continue;
        const sql = await readFile(path.join(dir, file), "utf8");
        console.log(`[db:migrate] MySQL → ${file}`);
        // MySQL DDL 会隐式提交事务，无法保证 DDL + 迁移记录原子性。
        // 脚本仍按顺序执行；若失败请修复后重试（示例 DDL 是幂等的）。
        await conn.query(sql);
        await conn.query("INSERT INTO _db_migrations (name) VALUES (?)", [file]);
      }
    } finally {
      conn.release();
    }
  } finally {
    await pool.end();
  }
}

console.log("[db:migrate] 完成。");