'use client';

import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { Languages } from 'lucide-react';
import { localeName, localeTag, localizePath, splitLocalePath, type Locale } from '@/shared/i18n/config';
import { useLocale } from '@/shared/i18n/LocaleProvider';

/**
 * لینک همین صفحه به زبان دیگر. next/link خام عمداً: Link سایت آدرس را دوباره به زبان صفحه جاری می‌برد.
 * صفحه‌ای که ترجمه ندارد هم باز می‌شود (متن فارسی) — همان رفتار صفحه‌های ترجمه‌نشده.
 */
export function LanguageSwitcher({ className, onClick }: { className?: string; onClick?: () => void }) {
  const locale = useLocale();
  const other: Locale = locale === 'fa' ? 'en' : 'fa';
  const { path } = splitLocalePath(usePathname());

  return (
    <NextLink href={localizePath(path, other)} hrefLang={localeTag[other]} lang={other} onClick={onClick} className={className}>
      <Languages className="w-3.5 h-3.5 shrink-0" aria-hidden />
      {localeName[other]}
    </NextLink>
  );
}
