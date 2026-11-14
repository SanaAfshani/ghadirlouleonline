'use client';

import { RouteError } from '@/shared/ui/RouteError';

/** خطایی که خود layout سایت (هدر/منو) را هم از کار انداخته — بدون هدر، تمام‌صفحه */
export default function RootError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-screen grid place-items-center bg-[var(--background)]">
      <RouteError error={error} reset={reset} />
    </div>
  );
}
