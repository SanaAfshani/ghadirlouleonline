import { MetadataRoute } from 'next';
import { siteConfig } from '@/shared/config/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // /admin بدون اسلش هم (صفحه ورود)؛ /api فقط داده تعاملی است و محتوای صفحه‌ها سمت سرور رندر می‌شود.
        // /search و پیش‌فاکتور /q عمداً بسته نیستند: noindex دارند و گوگل فقط وقتی صفحه را بخزد noindex را می‌بیند —
        // Disallow باعث می‌شد آدرسِ لینک‌شده بدون محتوا در نتایج بماند.
        disallow: ['/admin', '/api/'],
      },
    ],
    // Host فقط برای یاندکس بود و منسوخ است
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
