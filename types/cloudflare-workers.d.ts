declare module "cloudflare:workers" {
  /** Worker 绑定的运行时入口；具体结构由 wrangler 配置决定。 */
  export const env: Record<string, unknown>;
}
