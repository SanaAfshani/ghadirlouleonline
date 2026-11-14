'use client';

import { SkeletonTextPage } from '@/shared/ui/Skeleton';
import { useMessages } from '@/shared/i18n/LocaleProvider';
import { defineMessages } from '@/shared/i18n/messages';

const messages = defineMessages({
  fa: { loading: 'در حال بارگذاری' },
  en: { loading: 'Loading' },
});

export default function PageLoading() {
  const t = useMessages(messages);
  return (
    <div role="status" aria-label={t.loading}>
      <SkeletonTextPage />
    </div>
  );
}
