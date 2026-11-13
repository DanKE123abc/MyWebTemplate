#!/usr/bin/env node
const provider = process.env.DATABASE_PROVIDER?.toLowerCase();

if (provider === "dk1") {
  const base = process.env.DK1_URL?.replace(/\/+$/, "");
  const appId = process.env.DK1_APP_ID;
  const apiKey = process.env.DK1_API_KEY;
  if (!base || !appId || !apiKey) {
    console.error("[db:check] DK1 需要 DK1_URL、DK1_APP_ID、DK1_API_KEY。");
    process.exit(1);
  }
  try {
    const res = await fetch(
      `${base}/v1/dk1/database/${encodeURIComponent(appId)}`,
      { headers: { authorization: `Bearer ${apiKey}` } },
    );
    const body = await res.json().catch(() => null);
    if (!res.ok || body?.success !== true) {
      throw new Error(body?.error?.message || `HTTP ${res.status}`);
    }
    console.log(
      `[db:check] DK1 连接正常：${body.result.app_id}（${body.result.table_count} 张表）。\n`,
    );
  } catch (error) {
    console.error(
      `[db:check] DK1 连接失败：${error instanceof Error ? error.message : String(error)}`,
    );
    process.exit(1);
  }
  process.exit(0);
}

const url = process.env.DATABASE_URL;

if (!provider || !["pg", "mysql"].includes(provider)) {
  console.error("[db:check] 请设置 DATABASE_PROVIDER=pg、mysql 或 dk1。");
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