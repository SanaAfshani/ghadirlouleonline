import { MetadataRoute } from 'next';
import { siteConfig } from '@/shared/config/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // خزنده‌های دستیارهای هوش مصنوعی جدا و صریح آمده‌اند. با قانون * هم اجازه داشتند، ولی
        // نوشتنشان تصمیم را ثبت می‌کند: این سایت می‌خواهد در پاسخ‌های ChatGPT، Claude، Perplexity،
        // Gemini و Copilot نقل شود، پس کسی بعداً سهواً آن‌ها را نبندد.
        userAgent: [
          'GPTBot', 'OAI-SearchBot', 'ChatGPT-User',
          'ClaudeBot', 'Claude-SearchBot', 'Claude-User', 'anthropic-ai',
          'PerplexityBot', 'Perplexity-User',
          'Google-Extended', 'Applebot-Extended', 'CCBot', 'Bingbot',
        ],
        allow: '/',
        disallow: ['/admin', '/api/'],
      },
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
