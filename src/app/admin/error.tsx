'use client';

import { RouteError } from '@/shared/ui/RouteError';

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <RouteError error={error} reset={reset} homeHref="/admin" homeLabel="داشبورد" />;
}
