import type { Locale } from './config';

/**
 * متن‌های ثابت رابط (دکمه، برچسب فرم، پیام خطا) کنار همان کامپوننت تعریف می‌شوند، نه در یک فایل بزرگ مشترک:
 * هر صفحه فقط متن‌های خودش را بارگذاری می‌کند و نسخه انگلیسی باید دقیقاً همان کلیدهای فارسی را داشته باشد
 * (NoInfer یعنی شکل را فقط فارسی تعیین می‌کند؛ کلید جاافتاده در انگلیسی خطای TypeScript است).
 *
 * متن‌های محتوایی صفحه (عنوان، پاراگراف، فهرست خدمات) این‌جا نیستند؛ آن‌ها از پنل ادمین ویرایش می‌شوند (shared/content).
 */
export function defineMessages<T extends Record<string, unknown>>(messages: { fa: T; en: NoInfer<T> }): Record<Locale, T> {
  return messages;
}

/** «{count} محصول» با { count: '۵' } ← «۵ محصول» */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}
