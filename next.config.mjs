let userConfig = undefined

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // wrangler 只在 Node 开发环境使用，交给 Node 直接加载，避免 Turbopack 打包其原生依赖。
  serverExternalPackages: ["wrangler", "miniflare", "esbuild"],
  async rewrites() {
    return [
      {
        source: '/docs',
        destination: '/docs/index.html'
      }
    ]
  }
}

mergeConfig(nextConfig, userConfig)

function mergeConfig(nextConfig, userConfig) {
  if (!userConfig) {
    return
  }

  for (const key in userConfig) {
    if (
      typeof nextConfig[key] === 'object' &&
      !Array.isArray(nextConfig[key])
    ) {
      nextConfig[key] = {
        ...nextConfig[key],
        ...userConfig[key],
      }
    } else {
      nextConfig[key] = userConfig[key]
    }
  }
}

export default nextConfig
