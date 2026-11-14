'use client';

import { SkeletonHome } from '@/shared/ui/Skeleton';
import { useMessages } from '@/shared/i18n/LocaleProvider';
import { defineMessages } from '@/shared/i18n/messages';

const messages = defineMessages({
  fa: { loading: 'در حال بارگذاری' },
  en: { loading: 'Loading' },
});

/** اسکلت صفحه اصلی — مسیر (home) جدا شده تا loading فقط همین صفحه را بپوشاند، نه صفحه‌هایی که ۴۰۴ دارند */
export default function HomeLoading() {
  const t = useMessages(messages);
  return (
    <div role="status" aria-label={t.loading}>
      <SkeletonHome />
    </div>
  );
}
