import { localizePath, type Locale } from '@/shared/i18n/config';

/**
 * تصویر اشتراک‌گذاری (app/[lang]/opengraph-image.tsx). alt به زبان صفحه است، پس تصویر با generateImageMetadata
 * و شناسه ثابت ساخته می‌شود؛ صفحه‌هایی که openGraph خودشان را دارند همین را صریح می‌گذارند.
 */
export const OG_IMAGE_ID = 'card';
export const OG_IMAGE_SIZE = { width: 1200, height: 630 };

export function ogImageAlt(siteName: string, locale: Locale): string {
  return locale === 'fa' ? `${siteName} | تامین کننده لوله و اتصالات صنعتی` : `${siteName} | Corrugated pipe, spiral pipe and fittings supplier`;
}

export function ogImage(siteName: string, locale: Locale) {
  return { url: localizePath(`/opengraph-image/${OG_IMAGE_ID}`, locale), ...OG_IMAGE_SIZE, alt: ogImageAlt(siteName, locale) };
}
