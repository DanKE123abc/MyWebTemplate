# UI Components Template

一个基于 Next.js、React 和 Tailwind CSS 构建的现代化 UI 组件项目模板。

## 特性

- 🎨 **现代化设计** - 精美组件
- 🚀 **Next.js** - 最新的 React 框架
- 💨 **Tailwind CSS** - 实用优先的 CSS 框架
- 📱 **响应式设计** - 适配各种屏幕尺寸
- 🎯 **TypeScript** - 完整的类型支持
- 🔧 **可定制** - 易于扩展和自定义

## 包含的组件

[演示链接](https://gallery.danke666.top/)

## 快速开始

### 安装依赖

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 启动开发服务器

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看结果。

## 使用组件

### 导入组件

```tsx
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
```

### 使用示例

```tsx
export default function MyPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>示例卡片</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Input placeholder="输入内容" />
          <Button>提交</Button>
        </div>
      </CardContent>
    </Card>
  )
}
```

## 自定义主题

### 修改颜色

在 `app/globals.css` 中修改 CSS 变量：

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  /* ... 其他颜色变量 */
}
```

### 添加新组件

1. 在 `components/ui/` 目录下创建新组件
2. 使用 Tailwind CSS 进行样式设计
3. 导出组件供其他地方使用

## 构建和部署

### 构建生产版本

```bash
npm run build
```

### 启动生产服务器

```bash
npm run start
```

## 双框架（Next.js / Vinext）

本项目同一套 `app/` 源码同时支持 **Next.js 16.4.5** 与 **Vinext 1.4.4**（Vite + Cloudflare Workers），切换框架不需要改业务代码。

环境要求：Node.js >= 22（Vite 8 / Vinext 的要求）。

| 用途 | Next.js | Vinext |
| --- | --- | --- |
| 开发 | `npm run dev`（3000） | `npm run dev:vinext`（3001） |
| 构建 | `npm run build`（`.next`） | `npm run build:vinext`（`dist/`） |
| 本地预览构建产物 | `npm start`（仅静态页） | `npm run preview:vinext`（3002） |
| 部署 | Node 平台（PG / MySQL） | `npm run deploy:vinext`（Cloudflare Workers + D1） |
| 配置 | `next.config.mjs` | `vite.config.ts` + `wrangler.jsonc` |

目录约定：

```
vite.config.ts        Vinext / Vite 配置（@cloudflare/vite-plugin）
wrangler.jsonc        Workers 配置（开发入口 worker/vinext-entry.js）
worker/               Vinext Worker 入口（薄转发）
scripts/              build-vinext.mjs（构建收尾包装器）
dist/                 Vinext 构建产物（client + server）
```

说明：

- `npm run build:vinext` 会调用 `scripts/build-vinext.mjs`。Windows 上 `vinext build` 完成后可能残留 workerd 句柄不退出，包装器检测到完成标记后会主动收尾（产物已完整写入 `dist/`）。
- 实际部署使用构建生成的配置 `dist/server/wrangler.json`，而不是根目录的 `wrangler.jsonc`；根配置只作为构建输入。
- `tsconfig.json` 的 `exclude` 包含 `.next`、`dist`、`.vinext` 等目录，避免 Next 与 Vinext 各自生成的类型文件互相覆盖。
- `/` 路径本身没有页面，默认访问 `/gallery`。

首次部署到 Cloudflare：

```bash
npx wrangler login
npm run deploy:vinext
```

## 数据库中间层（PG / MySQL / D1）

`lib/db` 是**可选能力**：不需要数据库的子项目只要不 import，就不会加载驱动、不会读配置，也不占启动时间。需要时业务代码只面对统一接口，底层是 PostgreSQL、MySQL 还是 Cloudflare D1 由配置决定。

### 目录

```
lib/db/
├── index.ts       入口：getDb / getDbStatus / all / first / run / batch / transaction
├── types.ts       DatabaseAdapter 接口与公共类型
├── pg.ts          PostgreSQL 适配器（pg.Pool）
├── mysql.ts       MySQL 适配器（mysql2 连接池）
├── d1.ts          Cloudflare D1 适配器
├── sql.ts         $1 占位符 / PG 类型转换的方言归一化
└── d1-types.ts    D1 最小类型声明

lib/bindings*.ts        运行时绑定（D1 在 Next dev / Vinext 均可读）
db/migrations/          D1 迁移（wrangler）
db/migrations/pg/       PostgreSQL 迁移（npm run db:migrate）
db/migrations/mysql/    MySQL 迁移（npm run db:migrate）
scripts/db-check.mjs    连通性检查
scripts/db-migrate.mjs  PG / MySQL 迁移执行器
app/healthz/route.ts    健康检查（含数据库状态）
```

### 使用

```ts
import { all, run, transaction } from "@/lib/db";

// 业务 SQL 统一写 $1 / $2，中间层自动适配三种数据库
const settings = await all<{ key: string; value: string }>(
  "SELECT key, value FROM app_settings",
);

await run("UPDATE app_settings SET value = $1, updated_at = $2 WHERE key = $3", [
  "dark",
  new Date().toISOString(),
  "theme",
]);

await transaction(async (tx) => {
  await tx.query("UPDATE accounts SET balance = balance - $1 WHERE id = $2", [100, from]);
  await tx.query("UPDATE accounts SET balance = balance + $1 WHERE id = $2", [100, to]);
});
```

不需要数据库的页面不要 import `@/lib/db`；需要在运行时判断可用性时用 `getDbStatus()`：

```ts
const status = await getDbStatus(); // { enabled, provider, source, message? }
```

### 选择数据库

| provider | 配置 | 适用环境 |
| --- | --- | --- |
| `pg` | `DATABASE_PROVIDER=pg` + `DATABASE_URL=postgresql://...` | Node / Vercel 等平台 |
| `mysql` | `DATABASE_PROVIDER=mysql` + `DATABASE_URL=mysql://...` | Node / 自建 MySQL |
| `d1` | `DATABASE_PROVIDER=d1`（Workers 可省略；Next dev 必填） | Workers / Next dev；绑定来自 `wrangler.jsonc` |

解析优先级：显式 `DATABASE_PROVIDER` → `DATABASE_URL` 的协议 → Workers 环境检测到 D1 绑定 `DB` → 未启用。Next dev 如果要用本地 D1，需显式设置 `DATABASE_PROVIDER=d1`（避免无数据库项目的健康检查意外启动 wrangler 代理）。Cloudflare Workers 内无法使用 pg/mysql 的 TCP 连接池，中间层会直接提示改用 D1。

复制 `.env.example` 为 `.env.local` 后按需修改（`.env.local` 已被 gitignore）。

### 初始化与迁移

| 数据库 | 建表 / 迁移 | 连通性检查 |
| --- | --- | --- |
| D1（本地） | `npm run db:migrate:local` | 启动后访问 `/healthz` |
| D1（线上） | `npm run db:migrate:remote` | 部署后访问 `/healthz` |
| PostgreSQL | `npm run db:migrate`（执行 `db/migrations/pg/*.sql`） | `npm run db:check` |
| MySQL | `npm run db:migrate`（执行 `db/migrations/mysql/*.sql`） | `npm run db:check` |

`db:migrate` / `db:check` 从当前 shell 环境读取 `DATABASE_PROVIDER` 与 `DATABASE_URL`。迁移记录写入 `_db_migrations` 表，已执行的文件会跳过；每个迁移文件只放一条 SQL。

### 已知差异

- **事务**：D1 不支持 SQL `BEGIN/COMMIT`，`transaction()` 在 D1 上按顺序执行、不保证原子性；需要原子批量写入请用 `batch()`（D1 原生 batch 是单事务）。
- **自增主键**：PG 需要 `INSERT ... RETURNING id`；MySQL / D1 可直接读 `lastInsertId`。
- **保留字**：示例表的 `key` 在 MySQL 中是保留字，写 MySQL SQL 时需用反引号。
- **类型**：`jsonb` / `JSON`、时间类型在三种数据库上不完全一致，迁移脚本按方言分别维护（`db/migrations/<provider>/`）。
- **占位符**：三种数据库的业务 SQL 统一写 `$1`；MySQL 适配器会转成 `?` 并重排参数，禁止与原生 `?` 混用。

### 健康检查

`GET /healthz` 始终返回 `status: "ok"`（服务存活）；数据库状态在 `database` 字段：

```json
{ "status": "ok", "database": { "status": "ok", "provider": "pg" } }
{ "status": "ok", "database": { "status": "disabled" } }
```

已配置但探活失败时返回 503：`{"status":"error","database":{"status":"error","provider":"pg"}}`，错误详情只写服务端日志。

## 技术栈

- **Next.js 16.4.5** - React 框架
- **Vinext 1.4.4** - Vite 上的 Next.js 兼容运行时（Cloudflare Workers）
- **React 19** - UI 库
- **TypeScript** - 类型安全
- **Tailwind CSS** - CSS 框架
- **shadcn/ui** - 组件库
- **Radix UI** - 无样式组件基础
- **Lucide React** - 图标库

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个模板。

## 许可证

MIT License

## 相关链接

- [Next.js 文档](https://nextjs.org/docs)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [shadcn/ui 文档](https://ui.shadcn.com)
- [Radix UI 文档](https://www.radix-ui.com)