'use client';

import { FileQuestion, Headphones, Table2 } from 'lucide-react';
import { ErrorState, stateButton } from '@/shared/ui/ErrorState';
import { Link } from '@/shared/i18n/Link';
import { useLocale, useMessages } from '@/shared/i18n/LocaleProvider';
import { digits } from '@/shared/i18n/format';
import { defineMessages } from '@/shared/i18n/messages';

const messages = defineMessages({
  fa: {
    title: 'پیش‌فاکتوری با این لینک پیدا نشد',
    text: 'ممکن است لینک ناقص کپی شده باشد یا این پیش‌فاکتور حذف شده باشد. لینک را دوباره بررسی کنید یا از جدول قیمت پیش‌فاکتور جدید بسازید.',
    prices: 'جدول قیمت',
    contact: 'تماس با فروش',
  },
  en: {
    title: 'No quote was found at this link',
    text: 'The link may have been copied incompletely, or this quote may have been deleted. Check the link again or create a new quote from the price list.',
    prices: 'Price list',
    contact: 'Contact sales',
  },
});

/** لینک پیش‌فاکتور اشتباه است یا حذف شده — به جای ۴۰۴ عمومی */
export default function QuoteNotFound() {
  const t = useMessages(messages);
  const locale = useLocale();
  return (
    <ErrorState icon={FileQuestion} tone="slate" code={digits(404, locale)} title={t.title} description={t.text}>
      <Link href="/prices" className={stateButton.primary}><Table2 className="w-4 h-4" />{t.prices}</Link>
      <Link href="/contact" className={stateButton.secondary}><Headphones className="w-4 h-4" />{t.contact}</Link>
    </ErrorState>
  );
}
