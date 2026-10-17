import { cn } from '@/shared/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('skeleton rounded-lg', className)} />
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </div>
  );
}

/** سربرگ تیره هم‌شکل PageHero — تا هنگام بارگذاری صفحه پرش نکند */
export function SkeletonPageHero() {
  return (
    <div className="relative overflow-hidden bg-[var(--ink)]">
      <div className="absolute inset-0 bp-grid bp-grid-fade" />
      <div className="container-main page-hero relative space-y-4 max-w-2xl">
        <div className="h-4 w-24 rounded-md bg-white/10 animate-pulse" />
        <div className="h-9 w-4/5 rounded-lg bg-white/10 animate-pulse" />
        <div className="h-4 w-full rounded-md bg-white/[0.07] animate-pulse" />
        <div className="h-4 w-2/3 rounded-md bg-white/[0.07] animate-pulse" />
      </div>
    </div>
  );
}

/** جدول قیمت در حال بارگذاری — دسکتاپ ردیف جدول، موبایل کارت */
export function SkeletonTable({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div role="status" aria-label="در حال بارگذاری">
      <div className="hidden md:block rounded-2xl border border-[var(--border)] overflow-hidden">
        <div className="bg-[var(--muted)] px-5 py-3.5 flex gap-6">
          {Array.from({ length: cols }, (_, i) => <Skeleton key={i} className={i === 0 ? 'h-3 w-40' : 'h-3 w-16'} />)}
        </div>
        {Array.from({ length: rows }, (_, r) => (
          <div key={r} className="border-t border-[var(--border)] px-5 py-4 flex items-center gap-6">
            <Skeleton className="h-4 flex-1 max-w-sm" />
            {Array.from({ length: cols - 2 }, (_, i) => <Skeleton key={i} className="h-4 w-20" />)}
            <Skeleton className="h-9 w-24 rounded-xl ms-auto" />
          </div>
        ))}
      </div>
      <div className="md:hidden space-y-2">
        {Array.from({ length: Math.min(rows, 4) }, (_, r) => (
          <div key={r} className="rounded-2xl border border-[var(--border)] p-3.5 space-y-3">
            <Skeleton className="h-4 w-4/5" />
            <div className="flex justify-between">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-10 w-24 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
