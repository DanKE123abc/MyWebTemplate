import { env } from "cloudflare:workers";

/**
 * Vinext 运行时：RSC 环境由 @cloudflare/vite-plugin 跑在 workerd 里，
 * 直接用标准的 cloudflare:workers 模块读取 D1 等绑定。
 */
export async function getBindings(): Promise<Record<string, unknown>> {
  return env as unknown as Record<string, unknown>;
}
