import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['pdfjs-dist'],
  turbopack: {},

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
              // Added ipapi.co for IP language detection, vercel.live for preview toolbar
              `connect-src 'self' ${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''} https://api.deepseek.com https://api.creem.io https://ipapi.co https://vercel.live https://*.vercel.live wss://vercel.live wss://*.vercel.live`,
              "worker-src 'self' blob:",
              // Added vercel.live for preview feedback script
              "script-src-elem 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://vercel.live https://*.vercel.live",,
              "frame-src 'none'",
              "img-src 'self' data:",
              "font-src 'self' https://fonts.gstatic.com",
            ].join('; '),
          },
        ],
      },
    ]
  },

  webpack(config) {
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      canvas: false,
    }
    return config
  },
}

export default nextConfig