import { getBindings } from "@/lib/bindings";

/**
 * 统一读取运行时绑定。
 *
 * - 生产：OpenNext 把 wrangler 的 vars / secrets / D1 绑定注入 env。
 * - 本地：initOpenNextCloudflareForDev() 让 next dev 通过 wrangler 的本地代理拿到同样的绑定。
 * - 兜底：process.env（例如脚本、构建期或未启用 Cloudflare 上下文时）。
 */
export async function getEnv(name: string): Promise<string | undefined> {
  const bindings = await getBindings();
  const bound = bindings[name];
  if (typeof bound === "string" && bound.length > 0) return bound;
  if (typeof process !== "undefined" && process.env) {
    const value = process.env[name];
    if (value !== undefined && value !== "") return value;
  }
  return undefined;
}

export async function requireEnv(name: string): Promise<string> {
  const value = await getEnv(name);
  if (!value) {
    throw new Error(`缺少环境变量 ${name}，请检查 .dev.vars 或 wrangler secrets。`);
  }
  return value;
}

export async function getFlag(name: string, fallback = false): Promise<boolean> {
  const value = await getEnv(name);
  if (value === undefined) return fallback;
  return value === "true" || value === "1";
}