import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 告诉 Next.js 转译 pdfjs-dist，解决模块格式问题
  transpilePackages: ['pdfjs-dist'],
  // 添加一个空的 turbopack 配置以消除警告，未来如需自定义可以在这里添加
  turbopack: {},
};

export default nextConfig;
