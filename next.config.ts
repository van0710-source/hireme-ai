// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // 保留原有配置
  transpilePackages: ['pdfjs-dist'],
  turbopack: {},

  // 安全响应头
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "style-src 'self' 'unsafe-inline'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              `connect-src 'self' ${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''} https://api.deepseek.com https://api.creem.io`,
              "worker-src 'self' blob: https://cdnjs.cloudflare.com",
              "script-src-elem 'self' 'unsafe-inline' https://cdnjs.cloudflare.com",
              "frame-src 'none'",
              "img-src 'self' data:",
              "font-src 'self' https://fonts.gstatic.com",
            ].join('; '),
          },
        ],
      },
    ]
  },

  // 解决 pdfjs-dist 在 Node.js 环境的 canvas 警告
  webpack(config) {
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      canvas: false,
    }
    return config
  },
}

export default nextConfig