import { cloudflare } from "@cloudflare/vite-plugin";
import vinext from "vinext";
import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

/**
 * Vinext 配置（Cloudflare Workers 目标）。
 * 与 Next.js 共用同一套 app/ 源码；`npm run dev` 仍然是 Next。
 */
export default defineConfig({
  plugins: [
    vinext(),
    cloudflare({
      configPath: "wrangler.jsonc",
      viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
    }),
  ],
  resolve: {
    alias: [
      {
        find: /^@\/lib\/bindings$/,
        replacement: fileURLToPath(new URL("./lib/bindings.vinext.ts", import.meta.url)),
      },
    ],
  },
});
