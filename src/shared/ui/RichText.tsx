'use client';

import { localizeHtmlLinks } from '@/shared/i18n/config';
import { useLocale } from '@/shared/i18n/LocaleProvider';

/**
 * متن HTML بخش‌های قابل‌ویرایش پنل (shared/content). HTML در API ذخیره پاک‌سازی می‌شود (sanitize.ts)؛
 * این‌جا فقط لینک‌های داخلی به زبان صفحه برده می‌شوند.
 */
export function RichText({ html, className, as: Tag = 'div' }: { html: string; className?: string; as?: 'div' | 'p' | 'span' }) {
  const locale = useLocale();
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: localizeHtmlLinks(html, locale) }} />;
}
