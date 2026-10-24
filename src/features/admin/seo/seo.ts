import { formatPersianNumber, slugify, stripHtml } from '@/shared/lib/utils';

export { stripHtml };

/** نوع محتوایی که پنل سئو روی آن کار می‌کند — متن‌های راهنما و چک‌ها را تعیین می‌کند */
export type SeoVariant = 'article' | 'product' | 'project';

export const VARIANT_LABELS: Record<SeoVariant, { entity: string; summary: string; body: string }> = {
  article: { entity: 'مقاله', summary: 'خلاصه مقاله', body: 'متن مقاله' },
  product: { entity: 'محصول', summary: 'توضیح کوتاه محصول', body: 'توضیحات محصول' },
  project: { entity: 'پروژه', summary: 'توضیح کوتاه پروژه', body: 'شرح پروژه' },
};

/** فیلدهای سئو — همه اختیاری‌اند و در صورت خالی بودن fallback می‌شوند */
export type SeoFields = {
  slug: string;
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  ogTitle: string;
  ogDescription: string;
};

export const EMPTY_SEO: SeoFields = {
  slug: '',
  metaTitle: '',
  metaDescription: '',
  focusKeyword: '',
  ogTitle: '',
  ogDescription: '',
};

/** بازه‌های توصیه‌شده گوگل (کاراکتر) */
export const SEO_LIMITS = {
  metaTitle: { min: 30, max: 60 },
  metaDescription: { min: 70, max: 158 },
} as const;

export type CounterTone = 'empty' | 'short' | 'good' | 'over';

export function counterTone(length: number, { min, max }: { min: number; max: number }): CounterTone {
  if (length === 0) return 'empty';
  if (length > max) return 'over';
  if (length < min) return 'short';
  return 'good';
}

export const TONE_CLASS: Record<CounterTone, string> = {
  empty: 'text-[var(--muted-foreground)]',
  short: 'text-amber-700 dark:text-amber-400',
  good: 'text-emerald-700 dark:text-emerald-400',
  over: 'text-red-700 dark:text-red-400',
};

export function formatCounter(length: number, max: number): string {
  return `${formatPersianNumber(length)} / ${formatPersianNumber(max)}`;
}

/**
 * نرمال‌سازی فارسی برای مقایسه: عربی«ي/ك» → فارسی«ی/ک»، حذف اعراب،
 * نیم‌فاصله و خط تیره → فاصله. بدون این کار «لوله‌کشی» و «لوله کشی» متفاوت دیده می‌شوند.
 */
export function normalizeFa(input: string): string {
  return input
    .toLowerCase()
    .replace(/[يى]/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[ً-ْـ]/g, '')
    .replace(/[‌‏‎\-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function containsKeyword(haystack: string, keyword: string): boolean {
  const k = normalizeFa(keyword);
  if (!k) return false;
  return normalizeFa(haystack).includes(k);
}

export type KeywordCheck = { label: string; passed: boolean; hint: string };

/** تحلیل ساده کلمه کلیدی محوری — به ادمین می‌گوید کجا را جا انداخته است */
export function analyzeKeyword(
  keyword: string,
  ctx: {
    title: string;
    metaTitle: string;
    metaDescription: string;
    excerpt: string;
    slug: string;
    content: string;
  },
  variant: SeoVariant = 'article'
): KeywordCheck[] {
  const labels = VARIANT_LABELS[variant];
  const plain = stripHtml(ctx.content);
  const firstWords = plain.split(' ').slice(0, 120).join(' ');
  const effectiveTitle = ctx.metaTitle || ctx.title;
  const effectiveDesc = ctx.metaDescription || ctx.excerpt;

  const checks: KeywordCheck[] = [
    {
      label: 'در عنوان سئو',
      passed: containsKeyword(effectiveTitle, keyword),
      hint: 'کلمه کلیدی باید در عنوانی که در گوگل دیده می‌شود بیاید — ترجیحاً در ابتدای آن.',
    },
    {
      label: 'در توضیحات متا',
      passed: containsKeyword(effectiveDesc, keyword),
      hint: 'گوگل کلمه جستجوشده را در توضیحات پررنگ می‌کند و نرخ کلیک بالا می‌رود.',
    },
    {
      label: 'در آدرس صفحه (slug)',
      // آدرس انگلیسی است؛ کلمه کلیدی فارسی را با همان نویسه‌گردانی اسلاگ مقایسه می‌کنیم
      passed: Boolean(ctx.slug) && ctx.slug.includes(slugify(keyword)),
      hint: `آدرس صفحه یکی از سیگنال‌های ثابت سئو است. نسخه انگلیسی کلمه کلیدی (مثلاً ${slugify(keyword)}) را در آدرس بیاور.`,
    },
    {
      label: `در ${labels.body}`,
      passed: containsKeyword(variant === 'article' ? firstWords : plain, keyword),
      hint:
        variant === 'article'
          ? 'کلمه کلیدی بهتر است در ۱۲۰ کلمه اول مقاله ظاهر شود.'
          : 'کلمه کلیدی را حداقل یک بار به شکل طبیعی در توضیحات محصول بیاورید.',
    },
  ];

  // حجم محتوا فقط برای مقاله معنا دارد؛ صفحه محصول ذاتاً کوتاه است
  if (variant === 'article') {
    checks.push({
      label: 'حداقل ۳۰۰ کلمه محتوا',
      passed: plain.split(' ').filter(Boolean).length >= 300,
      hint: 'مقالات کوتاه به‌سختی رتبه می‌گیرند. حدود ۸۰۰ تا ۱۵۰۰ کلمه ایده‌آل است.',
    });
  }

  return checks;
}
