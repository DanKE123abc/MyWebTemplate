#!/usr/bin/env node
/** PG / MySQL 连通性检查；D1 请访问 /healthz 或使用 wrangler。 */

const provider = process.env.DATABASE_PROVIDER?.toLowerCase();
const url = process.env.DATABASE_URL;

if (!provider || !["pg", "mysql"].includes(provider)) {
  console.error("[db:check] 请设置 DATABASE_PROVIDER=pg 或 DATABASE_PROVIDER=mysql。D1 请访问 /healthz。");
  process.exit(1);
}
if (!url) {
  console.error("[db:check] 缺少 DATABASE_URL 环境变量。");
  process.exit(1);
}

if (provider === "pg") {
  const { Client } = await import("pg");
  const client = new Client({ connectionString: url, connectionTimeoutMillis: 5000 });
  try {
    await client.connect();
    await client.query("SELECT 1");
    console.log("[db:check] PostgreSQL 连接正常。\n");
  } finally {
    await client.end().catch(() => undefined);
  }
} else {
  const mysql = await import("mysql2/promise");
  const conn = await mysql.createConnection({ uri: url, connectTimeout: 5000 });
  try {
    await conn.query("SELECT 1");
    console.log("[db:check] MySQL 连接正常。\n");
  } finally {
    await conn.end().catch(() => undefined);
  }
}