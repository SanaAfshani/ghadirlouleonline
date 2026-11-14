import { defaultLocale, type Locale } from '@/shared/i18n/config';
import type { Fields } from './types';

const MAX_TEXT = 4000;
const MAX_HTML = 60000;
const ITEM_ID = /^[\w-]{1,40}$/;
/** عکس: آپلودی‌های پنل (/media)، فایل‌های ثابت پروژه (/images، و پوستر ویدیوها در /videos) یا https */
const IMAGE_SRC = /^(\/(?:media|images|videos)\/[\w./-]+|https:\/\/\S+)$/i;
/** لینک: مسیر داخلی، http(s)، تلفن و ایمیل — javascript: و data: نه */
const LINK = /^(\/(?!\/)\S*|https?:\/\/\S+|tel:[+\d-]+|mailto:\S+|#[\w-]*)$/i;

/**
 * HTML از پنل مستقیم در صفحه می‌نشیند. ویرایشگر محتوا کاربر مورد اعتماد است ولی مدیر کل نیست؛
 * اسکریپت، iframe، رویدادهای on* و آدرس javascript: حذف می‌شوند تا حساب ویرایشگر راهی برای اجرای کد در مرورگر بازدیدکننده نباشد.
 */
export function stripDangerousHtml(html: string): string {
  return html
    // اول کل عنصر همراه محتوایش، بعد تگ باز/بسته تنها (بدون جفت) — وگرنه متن داخل <script> بیرون می‌ماند
    .replace(/<\s*(script|style|iframe|object|embed|form)\b[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
    .replace(/<\s*\/?\s*(script|style|iframe|object|embed|form|meta|link|base)\b[^>]*>/gi, '')
    .replace(/\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/(href|src)\s*=\s*(["']?)\s*(javascript|data|vbscript):[^"'\s>]*\2/gi, '$1="#"');
}

function cleanValue(fields: Fields, input: unknown, primary: boolean): Record<string, unknown> {
  const source = typeof input === 'object' && input !== null && !Array.isArray(input) ? (input as Record<string, unknown>) : {};
  const out: Record<string, unknown> = {};
  for (const [name, field] of Object.entries(fields)) {
    const value = source[name];
    if (field.type === 'list') {
      if (!Array.isArray(value)) continue;
      const seen = new Set<string>();
      out[name] = value
        .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null && typeof item.id === 'string' && ITEM_ID.test(item.id))
        .filter((item) => !seen.has(item.id as string) && seen.add(item.id as string))
        .slice(0, field.max ?? 60)
        .map((item) => ({ id: item.id, ...cleanValue(field.fields, item, primary) }));
      continue;
    }
    if (typeof value !== 'string') continue;
    // عکس و لینک مشترک‌اند و فقط در زبان اصلی ذخیره می‌شوند
    if (field.type === 'image' || field.type === 'link') {
      if (!primary) continue;
      const trimmed = value.trim();
      if (trimmed === '' || (field.type === 'image' ? IMAGE_SRC : LINK).test(trimmed)) out[name] = trimmed;
      continue;
    }
    out[name] = field.type === 'html' ? stripDangerousHtml(value.slice(0, MAX_HTML)) : value.slice(0, MAX_TEXT);
  }
  return out;
}

/** داده ارسالی پنل برای یک زبان از یک بخش — فقط فیلدهای تعریف‌شده، با نوع و طول مجاز */
export function sanitizeSectionData(fields: Fields, locale: Locale, input: unknown): Record<string, unknown> {
  return cleanValue(fields, input, locale === defaultLocale);
}
