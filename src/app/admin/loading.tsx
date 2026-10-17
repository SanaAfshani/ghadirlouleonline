import { Skeleton } from '@/shared/ui/Skeleton';

export default function AdminLoading() {
  return (
    <div role="status" aria-label="در حال بارگذاری" className="max-w-7xl space-y-5">
      <Skeleton className="h-7 w-48" />
      <Skeleton className="h-4 w-80" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
      </div>
      <Skeleton className="h-80 rounded-2xl" />
    </div>
  );
}
