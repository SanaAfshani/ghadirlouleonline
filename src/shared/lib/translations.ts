import { defaultLocale, type Locale } from '@/shared/i18n/config';
import type { FaqItem } from '@/shared/types';

/**
 * ترجمه محتوای دیتابیس (محصول، دسته، مقاله، پروژه، سوال متداول، نظر مشتری، ردیف قیمت).
 * ستون translations هر مدل: {"en": {"name": "...", "faqs": [...], ...}}. فارسی خود ستون‌های اصلی است.
 *
 * فیلد ترجمه‌نشده (خالی یا نبودن) متن فارسی را نگه می‌دارد؛ translated=false یعنی فیلد اصلی (نام/عنوان) ترجمه ندارد
 * و صفحه انگلیسی باید noindex شود و از sitemap انگلیسی بیرون بماند (localeAlternates(..., translated)).
 */

/** مشخصه فنی: کلید فارسی محصول ثابت می‌ماند (منطق سایت مثل SIZE_SPEC_KEY به آن وابسته است)؛ ترجمه برچسب و مقدار جداست */
export type SpecTranslation = { label: string; value: string };

export type TranslationValue = string | string[] | FaqItem[] | Record<string, SpecTranslation>;
export type StoredTranslations = Partial<Record<Locale, Record<string, TranslationValue>>>;

/** فیلدهای قابل ترجمه هر مدل — همان کلیدهایی که فرم ادمین و API می‌پذیرند */
export const TRANSLATABLE_FIELDS = {
  category: ['name', 'description', 'content'],
  product: ['name', 'shortDescription', 'description', 'metaTitle', 'metaDescription', 'ogTitle', 'ogDescription', 'faqs', 'specifications', 'catalogTitles'],
  blogPost: ['title', 'excerpt', 'content', 'metaTitle', 'metaDescription', 'ogTitle', 'ogDescription', 'faqs', 'tags'],
  project: ['title', 'description', 'content', 'location', 'client', 'metaTitle', 'metaDescription', 'ogTitle', 'ogDescription', 'faqs', 'imageAlts'],
  faq: ['question', 'answer', 'category'],
  testimonial: ['name', 'company', 'position', 'content'],
  priceItem: ['title', 'spec', 'note'],
} as const;

export type TranslatableModel = keyof typeof TRANSLATABLE_FIELDS;

export function parseTranslations(raw: string | null | undefined): StoredTranslations {
  if (!raw) return {};
  try {
    const data = JSON.parse(raw);
    return typeof data === 'object' && data !== null && !Array.isArray(data) ? data : {};
  } catch {
    return {};
  }
}

function hasValue(value: unknown): boolean {
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return typeof value === 'object' && value !== null && Object.keys(value).length > 0;
}

/** آیا رکورد در این زبان ترجمه فیلد اصلی (نام/عنوان) را دارد — برای sitemap و noindex */
export function isTranslated(raw: string | null | undefined, locale: Locale, primary: string): boolean {
  return locale === defaultLocale || hasValue(translationsFor(raw, locale)[primary]);
}

/** ترجمه یک زبان از یک رکورد (برای فرم ادمین و ساخت نسخه انگلیسی) */
export function translationsFor(raw: string | null | undefined, locale: Locale): Record<string, TranslationValue> {
  return parseTranslations(raw)[locale] ?? {};
}

type Localized<T> = T & { translated: boolean };

/**
 * رکورد به زبان صفحه: فیلدهای رشته‌ای و faqs روی همان نام جایگزین می‌شوند.
 * primary فیلدی است که ترجمه‌شدن رکورد را تعیین می‌کند (name یا title).
 */
export function localizeRecord<T extends { translations?: string | null }>(
  record: T,
  locale: Locale,
  primary: keyof T & string,
): Localized<T> {
  if (locale === defaultLocale) return { ...record, translated: true };
  const tr = translationsFor(record.translations, locale);
  const out: Record<string, unknown> = { ...record };
  for (const [field, value] of Object.entries(tr)) {
    if (!hasValue(value) || !(field in record)) continue;
    const original = (record as Record<string, unknown>)[field];
    // فقط هم‌نوع با فیلد اصلی — داده خراب نسخه انگلیسی صفحه را نشکند
    if (typeof value === 'string' && (typeof original === 'string' || original == null)) out[field] = value;
    else if (Array.isArray(value) && Array.isArray(original) && field === 'faqs') out[field] = sanitizeFaqs(value);
    else if (Array.isArray(value) && Array.isArray(original) && value.every((v) => typeof v === 'string')) out[field] = value;
  }
  return { ...(out as T), translated: hasValue(tr[primary]) };
}

function sanitizeFaqs(list: unknown[]): FaqItem[] {
  return list
    .map((item) => ({
      question: String((item as FaqItem)?.question ?? '').trim(),
      answer: String((item as FaqItem)?.answer ?? '').trim(),
    }))
    .filter((f) => f.question && f.answer);
}

/** برچسب و مقدار مشخصات فنی به زبان صفحه؛ کلیدها همان کلیدهای فارسی می‌مانند */
export function localizedSpecs(
  specs: Record<string, string>,
  translationsRaw: string | null | undefined,
  locale: Locale,
): { key: string; label: string; value: string }[] {
  const tr = locale === defaultLocale ? undefined : translationsFor(translationsRaw, locale).specifications;
  const map = tr && typeof tr === 'object' && !Array.isArray(tr) ? (tr as Record<string, SpecTranslation>) : {};
  return Object.entries(specs).map(([key, value]) => ({
    key,
    label: map[key]?.label?.trim() || key,
    value: map[key]?.value?.trim() || value,
  }));
}

/** عنوان کاتالوگ‌ها/alt عکس‌ها که به ترتیب ذخیره می‌شوند (catalogTitles، imageAlts) */
export function localizedList(original: string[], translationsRaw: string | null | undefined, locale: Locale, field: 'catalogTitles' | 'imageAlts'): string[] {
  if (locale === defaultLocale) return original;
  const tr = translationsFor(translationsRaw, locale)[field];
  const list = Array.isArray(tr) ? tr : [];
  return original.map((value, i) => (typeof list[i] === 'string' && (list[i] as string).trim()) || value);
}

/** فیلدهای HTML هر مدل — هنگام ذخیره پاک‌سازی می‌شوند */
const HTML_FIELDS = new Set(['description', 'content', 'answer']);
const MAX_TRANSLATION_TEXT = 60000;

/**
 * ورودی فرم پنل ({ en: {...} }) ← رشته JSON ستون translations.
 * فقط فیلدهای مجاز همان مدل با نوع درست؛ HTML مثل محتوای صفحات پاک‌سازی می‌شود.
 * stripHtml از بیرون داده می‌شود تا این فایل (که در کلاینت هم import می‌شود) به کد سرور وابسته نشود.
 */
export function sanitizeTranslations(model: TranslatableModel, input: unknown, stripHtml: (html: string) => string): string {
  const allowed = new Set<string>(TRANSLATABLE_FIELDS[model]);
  const out: StoredTranslations = {};
  const source = typeof input === 'string' ? parseTranslations(input) : (input as StoredTranslations | null);
  for (const locale of ['en'] as const) {
    const fields = source?.[locale];
    if (!fields || typeof fields !== 'object') continue;
    const clean: Record<string, TranslationValue> = {};
    for (const [field, value] of Object.entries(fields)) {
      if (!allowed.has(field)) continue;
      if (typeof value === 'string') {
        const text = value.trim().slice(0, MAX_TRANSLATION_TEXT);
        if (text) clean[field] = HTML_FIELDS.has(field) ? stripHtml(text) : text;
      } else if (field === 'faqs' && Array.isArray(value)) {
        const faqs = sanitizeFaqs(value);
        if (faqs.length) clean.faqs = faqs;
      } else if (field === 'specifications' && value && typeof value === 'object' && !Array.isArray(value)) {
        const specs = Object.fromEntries(
          Object.entries(value as Record<string, SpecTranslation>)
            .map(([key, v]) => [key.slice(0, 120), { label: String(v?.label ?? '').trim().slice(0, 200), value: String(v?.value ?? '').trim().slice(0, 500) }] as const)
            .filter(([, v]) => v.label || v.value),
        );
        if (Object.keys(specs).length) clean.specifications = specs;
      } else if (Array.isArray(value) && ['tags', 'catalogTitles', 'imageAlts'].includes(field)) {
        const list = value.map((v) => String(v ?? '').trim().slice(0, 300)).slice(0, 100);
        if (list.some(Boolean)) clean[field] = list;
      }
    }
    if (Object.keys(clean).length) out[locale] = clean;
  }
  return JSON.stringify(out);
}
