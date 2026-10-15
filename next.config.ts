import type { NextConfig } from "next";
import path from "path";
import { siteConfig } from "./src/shared/config/site";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    // کیفیت‌های مجاز (Next 16 فقط همین‌ها را می‌پذیرد): ۵۰ برای تصویر پس‌زمینه زیر لایه تیره، ۹۰ برای عکس محصولات
    qualities: [50, 75, 90],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  turbopack: {
    root: __dirname,
  },
  // نسخه www همان محتوا را با ۲۰۰ برمی‌گرداند و برای گوگل محتوای تکراری است — ریدایرکت دائمی به دامنه اصلی
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: `www.${new URL(siteConfig.url).host}` }],
        destination: `${siteConfig.url}/:path*`,
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
