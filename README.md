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

## 技术栈

- **Next.js 14** - React 框架
- **React 18** - UI 库
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