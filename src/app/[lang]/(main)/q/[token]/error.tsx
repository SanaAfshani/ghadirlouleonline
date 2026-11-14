'use client';

import { RouteError } from '@/shared/ui/RouteError';
import { useMessages } from '@/shared/i18n/LocaleProvider';
import { defineMessages } from '@/shared/i18n/messages';

const messages = defineMessages({
  fa: { title: 'پیش‌فاکتور بارگذاری نشد', home: 'جدول قیمت' },
  en: { title: 'The quote could not be loaded', home: 'Price list' },
});

/** پیش‌فاکتور بارگذاری نشد (معمولاً قطعی لحظه‌ای دیتابیس) — به جای صفحه خام خطای Next.js */
export default function QuoteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useMessages(messages);
  return <RouteError error={error} reset={reset} title={t.title} homeHref="/prices" homeLabel={t.home} />;
}
