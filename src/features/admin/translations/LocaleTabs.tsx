'use client';

import { cn } from '@/shared/lib/utils';
import type { Locale } from '@/shared/i18n/config';
import type { EnglishTranslations } from './TranslationEditor';

const LOCALE_TABS: { locale: Locale; label: string }[] = [
  { locale: 'fa', label: 'فارسی' },
  { locale: 'en', label: 'English' },
];

/** فیلد اصلی (نام/عنوان/سوال) ترجمه ندارد — صفحه انگلیسی این رکورد noindex می‌ماند */
export function isUntranslated(en: EnglishTranslations, primary: string): boolean {
  const value = en[primary];
  return !(typeof value === 'string' && value.trim());
}

/**
 * سوییچ «فارسی | English» فرم‌های پنل (همان ظاهر زبانه‌های SectionEditor).
 * زبانه فارسی همان فرم قبلی است و زبانه English ویرایشگر ترجمه؛ هر دو با یک دکمه ذخیره می‌شوند.
 */
export function LocaleTabs({
  value,
  onChange,
  untranslated,
  className,
}: {
  value: Locale;
  onChange: (locale: Locale) => void;
  untranslated: boolean;
  className?: string;
}) {
  return (
    <div className={cn('inline-flex p-1 rounded-xl bg-[var(--muted)]', className)} role="tablist">
      {LOCALE_TABS.map((t) => (
        <button
          key={t.locale}
          type="button"
          role="tab"
          aria-selected={value === t.locale}
          onClick={() => onChange(t.locale)}
          className={cn(
            'h-9 px-4 rounded-lg text-sm font-bold transition-colors flex items-center gap-1.5',
            value === t.locale ? 'bg-[var(--card)] shadow-sm text-[var(--foreground)]' : 'text-[var(--muted-foreground)]',
          )}
        >
          {t.label}
          {t.locale === 'en' && untranslated && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-400">ترجمه نشده</span>
          )}
        </button>
      ))}
    </div>
  );
}
