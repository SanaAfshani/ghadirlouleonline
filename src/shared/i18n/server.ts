import 'server-only';
import { notFound } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import type { Metadata } from 'next';
import { absoluteUrl } from '@/shared/lib/seo';
import { defaultLocale, isLocale, localeTag, localizePath, locales, type Locale } from './config';

/** پارامتر [lang] صفحه؛ هر مقداری جز fa/en یعنی ۴۰۴ */
export async function resolveLocale(params: Promise<{ lang: string }>): Promise<Locale> {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return lang;
}

/**
 * مسیر واقعی صفحه‌ها /[lang]/... است (فارسی با rewrite در proxy)، پس revalidatePath('/products') هیچ صفحه‌ای را
 * تازه نمی‌کند. این تابع همان مسیر را برای هر دو زبان تازه می‌کند.
 */
export function revalidateLocalized(path: string, type?: 'layout' | 'page') {
  // کل سایت (هر دو زبان) — همان معنای قبلی revalidatePath('/', 'layout')
  if (path === '/' && type === 'layout') return revalidatePath('/', 'layout');
  for (const locale of locales) {
    revalidatePath(path === '/' ? `/${locale}` : `/${locale}${path}`, type);
  }
}

/**
 * canonical و hreflang یک صفحه: هر زبان canonical خودش را دارد و نسخه دیگر را با hreflang معرفی می‌کند؛
 * x-default فارسی است چون مخاطب اصلی سایت ایرانی است.
 * translated=false (محتوای ترجمه‌نشده که در /en فارسی نمایش داده می‌شود): noindex و بدون hreflang انگلیسی.
 */
export function localeAlternates(path: string, locale: Locale, translated = true): Pick<Metadata, 'alternates' | 'robots'> {
  const url = (l: Locale) => absoluteUrl(localizePath(path, l));
  if (!translated) {
    return locale === defaultLocale
      ? { alternates: { canonical: url(defaultLocale) } }
      : { alternates: { canonical: url(locale) }, robots: { index: false, follow: true } };
  }
  return {
    alternates: {
      canonical: url(locale),
      languages: {
        ...Object.fromEntries(locales.map((l) => [localeTag[l], url(l)])),
        'x-default': url(defaultLocale),
      },
    },
  };
}
