import { faDigits, latinDigits } from '@/shared/lib/utils';
import { localeTag, type Locale } from './config';

/**
 * قالب‌بندی وابسته به زبان. فارسی همان رفتار قبلی را دارد (faDigits: ارقام فارسی ولی PE100 و DN200 لاتین)،
 * انگلیسی همه‌چیز را لاتین می‌کند و تاریخ میلادی نشان می‌دهد.
 */
export function digits(value: string | number, locale: Locale): string {
  return locale === 'fa' ? faDigits(value) : latinDigits(String(value));
}

export function formatNumber(value: number, locale: Locale): string {
  return value.toLocaleString(localeTag[locale]);
}

export function formatDate(date: Date | string, locale: Locale): string {
  return new Date(date).toLocaleDateString(localeTag[locale], { year: 'numeric', month: 'long', day: 'numeric' });
}

/** قیمت تومانی؛ null یا صفر یعنی قیمت اعلام‌نشده */
export function formatToman(price: number | null | undefined, locale: Locale): string {
  if (price == null || price <= 0) return locale === 'fa' ? 'استعلام قیمت' : 'Price on request';
  return locale === 'fa' ? `${formatNumber(price, locale)} تومان` : `${formatNumber(price, locale)} Toman`;
}
