import type { Locale } from '@/shared/i18n/config';
import { localizedList, localizeRecord } from '@/shared/lib/translations';
import type { Project } from '@/shared/types';

/** پروژه به زبان صفحه: عنوان/توضیح/مکان/کارفرما با localizeRecord و alt عکس‌ها به ترتیب ذخیره‌شده (imageAlts) */
export function localizeProject(project: Project, locale: Locale) {
  const localized = localizeRecord(project, locale, 'title');
  const alts = localizedList(project.images.map((image) => image.alt), project.translations, locale, 'imageAlts');
  return { ...localized, images: project.images.map((image, i) => ({ ...image, alt: alts[i] })) };
}

/**
 * سال پروژه در پنل شمسی وارد می‌شود (۱۴۰۲)؛ نسخه انگلیسی سال میلادی نشان می‌دهد.
 * سال شمسی دو سال میلادی را می‌پوشاند — +۶۲۱ سالی است که بیشتر ماه‌هایش در آن است. سال میلادی (مثلاً ۲۰۲۳) دست نمی‌خورد.
 */
export function projectYear(year: number, locale: Locale): number {
  return locale === 'en' && year < 1700 ? year + 621 : year;
}
