/**
 * Vinext 在 Cloudflare Workers 上的入口。
 * vinext 负责 App Router 的 RSC / SSR / 静态资源路由，这里只做转发。
 */
import handler from "vinext/server/app-router-entry";

export default {
  fetch(request, env, ctx) {
    return handler.fetch(request, env, ctx);
  },
};
