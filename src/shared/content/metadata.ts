import 'server-only';
import type { Metadata } from 'next';
import type { Locale } from '@/shared/i18n/config';
import { localeAlternates } from '@/shared/i18n/server';

/** متادیتای صفحه ثابت از بخش سئوی همان صفحه + canonical و hreflang هر دو زبان */
export function staticPageMetadata(seo: { metaTitle: string; metaDescription: string }, path: string, locale: Locale): Metadata {
  return {
    title: seo.metaTitle,
    description: seo.metaDescription,
    ...localeAlternates(path, locale),
  };
}
