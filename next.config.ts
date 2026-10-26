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
    // فقط WebP: ساخت AVIF روی سرور هر عکس ~۱۶ ثانیه طول می‌کشید و عکس‌ها در اولین بازدید لود نمی‌شدند
    formats: ['image/webp'],
    // آدرس /media/<id> هرگز محتوایش عوض نمی‌شود؛ نسخه بهینه‌شده را دوباره نسازد
    minimumCacheTTL: 31536000,
    // کیفیت‌های مجاز (Next 16 فقط همین‌ها را می‌پذیرد): ۵۰ برای تصویر پس‌زمینه زیر لایه تیره،
    // ۹۰ برای عکس محصولات، ۹۵ برای اسلاید هرو که تمام‌عرض است و هر افتی رویش دیده می‌شود
    qualities: [50, 75, 90, 95],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  turbopack: {
    root: __dirname,
  },
  // هر دامنه‌ای جز دامنه اصلی همان محتوا را با ۲۰۰ برمی‌گرداند و برای گوگل محتوای تکراری است.
  // فهرست در siteConfig.altDomains است: www و دامنه .com هر دو با ۳۰۱ به دامنه اصلی می‌روند تا
  // اعتبار و لینک‌ها بین چند آدرس تقسیم نشود.
  async redirects() {
    return siteConfig.altDomains.map((host) => ({
      source: '/:path*',
      has: [{ type: 'host' as const, value: host }],
      destination: `${siteConfig.url}/:path*`,
      permanent: true,
    }));
  },
};

export default nextConfig;
