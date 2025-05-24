import type { Metadata } from "next"
import "@/styles/globals.css"
import ClientLayout from "./client-layout"

export const metadata: Metadata = {
  title: "DanKe's Template",
  description: "基于Next.js和Tailwind CSS构建的现代化UI组件库模板。",
  keywords: "Template"
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="shortcut icon" href="./favicon.ico"/>
      </head>
      <body className="min-h-screen bg-gray-50">
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  )
}
