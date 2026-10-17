'use client';

import { RouteError } from '@/shared/ui/RouteError';

/** خطای صفحات سایت — داخل هدر و فوتر سایت نمایش داده می‌شود */
export default function MainError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <RouteError error={error} reset={reset} />;
}
