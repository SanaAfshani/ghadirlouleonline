/**
 * زبان‌های سایت. فارسی زبان اصلی است و آدرس‌هایش بدون پیشوند می‌ماند (/products) تا اعتبار سئوی
 * آدرس‌های فعلی حفظ شود؛ انگلیسی زیر /en است. proxy درخواست بدون پیشوند را داخلی به /fa بازنویسی می‌کند.
 */
export const locales = ['fa', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'fa';

export function isLocale(value: string | undefined): value is Locale {
  return (locales as readonly string[]).includes(value ?? '');
}

export const localeDir: Record<Locale, 'rtl' | 'ltr'> = { fa: 'rtl', en: 'ltr' };
/** برچسب BCP 47 برای Intl، hreflang و JSON-LD */
export const localeTag: Record<Locale, string> = { fa: 'fa-IR', en: 'en-US' };
export const ogLocale: Record<Locale, string> = { fa: 'fa_IR', en: 'en_US' };
export const localeName: Record<Locale, string> = { fa: 'فارسی', en: 'English' };

/** مسیرهایی که زبان ندارند (API، پنل، فایل‌ها) — لینک به آن‌ها پیشوند /en نمی‌گیرد */
const UNLOCALIZED = /^\/(api|admin|media|uploads|images|videos|catalogs|_next)(\/|$)|^\/(sitemap\.xml|robots\.txt|llms\.txt)$/;

/** '/products' در انگلیسی ← '/en/products'؛ آدرس خارجی، tel:، # و مسیرهای بدون زبان دست نمی‌خورند */
export function localizePath(href: string, locale: Locale): string {
  if (locale === defaultLocale || !href.startsWith('/') || href.startsWith('//') || UNLOCALIZED.test(href)) return href;
  if (href === '/') return `/${locale}`;
  if (/^\/[?#]/.test(href)) return `/${locale}${href.slice(1)}`;
  return `/${locale}${href}`;
}

/** '/en/products' ← { locale: 'en', path: '/products' }؛ آدرس بدون پیشوند فارسی است */
export function splitLocalePath(pathname: string): { locale: Locale; path: string } {
  const match = pathname.match(/^\/([a-z]{2})(?=\/|$)(.*)$/);
  if (match && isLocale(match[1]) && match[1] !== defaultLocale) {
    return { locale: match[1], path: match[2] || '/' };
  }
  return { locale: defaultLocale, path: pathname };
}

/** لینک‌های داخلی متن HTML پنل (href="/...") به زبان صفحه — متن انگلیسی کاربر را به صفحه فارسی نفرستد */
export function localizeHtmlLinks(html: string, locale: Locale): string {
  if (locale === defaultLocale) return html;
  return html.replace(/href=(["'])(\/[^"']*)\1/g, (_, quote: string, href: string) => `href=${quote}${localizePath(href, locale)}${quote}`);
}
