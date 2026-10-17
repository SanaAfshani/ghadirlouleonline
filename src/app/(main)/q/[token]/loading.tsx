import { Skeleton } from '@/shared/ui/Skeleton';

/**
 * اسکلت سند پیش‌فاکتور — هم‌شکل QuoteView.
 * با استریم، لینک نامعتبر به‌جای ۴۰۴ کد ۲۰۰ (با noindex) می‌گیرد؛ برای لینک خصوصی پیش‌فاکتور اشکالی ندارد.
 */
export default function QuoteLoading() {
  return (
    <div role="status" aria-label="در حال بارگذاری پیش‌فاکتور" className="container-main section-padding-sm max-w-4xl">
      <div className="mb-5 flex flex-wrap gap-2">
        {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-10 w-24 rounded-xl" />)}
      </div>
      <div className="rounded-2xl border border-[var(--border)] overflow-hidden">
        <div className="px-6 sm:px-8 py-6 flex flex-col sm:flex-row justify-between gap-5 border-b border-[var(--border)]">
          <div className="flex gap-3">
            <Skeleton className="w-14 h-14 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-3 w-52" />
            </div>
          </div>
          <Skeleton className="h-24 w-44 rounded-xl" />
        </div>
        <div className="py-6 grid place-items-center border-b border-[var(--border)]">
          <Skeleton className="h-7 w-48" />
        </div>
        <div className="px-6 sm:px-8 py-5 space-y-2 border-b border-[var(--border)]">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-4 w-60" />
        </div>
        <div className="px-6 sm:px-8 py-4 space-y-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-4 w-6" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
        <div className="px-6 sm:px-8 py-5 border-t border-[var(--border)]">
          <div className="ms-auto max-w-xs space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
