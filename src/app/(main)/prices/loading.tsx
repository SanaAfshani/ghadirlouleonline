import { Skeleton, SkeletonPageHero, SkeletonTable } from '@/shared/ui/Skeleton';

// loading.tsx فقط روی مسیرهای بدون notFound: با استریم، پاسخ ۴۰۴ واقعی به ۲۰۰ تبدیل می‌شد (soft 404 برای گوگل)
export default function PricesLoading() {
  return (
    <div role="status" aria-label="در حال بارگذاری قیمت‌ها">
      <SkeletonPageHero />
      <div className="container-main section-padding-sm space-y-10">
        {Array.from({ length: 2 }, (_, i) => (
          <section key={i} className="space-y-4">
            <Skeleton className="h-6 w-48" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-16 rounded-xl" />
              <Skeleton className="h-9 w-16 rounded-xl" />
              <Skeleton className="h-9 w-16 rounded-xl" />
            </div>
            <SkeletonTable rows={6} cols={5} />
          </section>
        ))}
      </div>
    </div>
  );
}
