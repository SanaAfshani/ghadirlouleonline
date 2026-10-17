'use client';

import { RouteError } from '@/shared/ui/RouteError';

/** پیش‌فاکتور بارگذاری نشد (معمولاً قطعی لحظه‌ای دیتابیس) — به جای صفحه خام خطای Next.js */
export default function QuoteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <RouteError error={error} reset={reset} title="پیش‌فاکتور بارگذاری نشد" homeHref="/prices" homeLabel="جدول قیمت" />;
}
