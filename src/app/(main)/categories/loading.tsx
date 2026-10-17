import { SkeletonCard, SkeletonPageHero } from '@/shared/ui/Skeleton';

// loading.tsx فقط روی مسیرهای بدون notFound: با استریم، پاسخ ۴۰۴ واقعی به ۲۰۰ تبدیل می‌شد (soft 404 برای گوگل)
export default function CategoriesLoading() {
  return (
    <div role="status" aria-label="در حال بارگذاری">
      <SkeletonPageHero />
      <div className="container-main section-padding-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }, (_, i) => <SkeletonCard key={i} />)}
      </div>
    </div>
  );
}
