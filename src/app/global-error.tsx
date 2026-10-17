'use client';

import './globals.css';
import { RouteError } from '@/shared/ui/RouteError';

/** آخرین لایه: خطا در خود root layout — باید html و body خودش را داشته باشد */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="fa" dir="rtl">
      <body style={{ fontFamily: 'Tahoma, system-ui, sans-serif' }} className="min-h-screen grid place-items-center bg-[var(--background)]">
        <RouteError error={error} reset={reset} />
      </body>
    </html>
  );
}
