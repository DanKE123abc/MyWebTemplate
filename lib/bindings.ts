// 默认解析目标（Next.js / tsc / Node 脚本）。
// Vinext 构建时由 vite.config.ts 的 resolve.alias 指向 lib/bindings.vinext.ts。
export { getBindings } from "./bindings.next";
