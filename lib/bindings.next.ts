import { existsSync } from "node:fs";
import type { PlatformProxy } from "wrangler";

/**
 * Next.js（Node 运行时）下的绑定读取。
 *
 * 不依赖 OpenNext：本地 `next dev` 通过 wrangler 的 getPlatformProxy 启动本地
 * Miniflare，拿到与 `vinext dev` 相同的 D1 绑定，并加载 `.dev.vars`。
 *
 * 注意：`next build` / `next start`（NODE_ENV=production）下不会启动代理，
 * D1 只在开发环境可用；生产请使用 Vinext 部署到 Cloudflare Workers。
 */
let proxyPromise: Promise<PlatformProxy<Record<string, unknown>> | null> | null = null;

async function getProxy(): Promise<PlatformProxy<Record<string, unknown>> | null> {
  if (process.env.NODE_ENV === "production") return null;

  if (!proxyPromise) {
    proxyPromise = (async () => {
      try {
        const { getPlatformProxy } = await import("wrangler");
        return await getPlatformProxy<Record<string, unknown>>({
          configPath: "wrangler.jsonc",
          envFiles: existsSync(".dev.vars") ? [".dev.vars"] : undefined,
          persist: true,
          remoteBindings: false,
        });
      } catch (error) {
        console.error("[bindings] 无法启动 wrangler 本地代理：", error);
        return null;
      }
    })();
  }
  return proxyPromise;
}

export async function getBindings(): Promise<Record<string, unknown>> {
  const proxy = await getProxy();
  return proxy ? { ...proxy.env } : {};
}
