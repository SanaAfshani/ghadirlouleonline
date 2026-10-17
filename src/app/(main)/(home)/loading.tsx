import { SkeletonHome } from '@/shared/ui/Skeleton';

/** اسکلت صفحه اصلی — مسیر (home) جدا شده تا loading فقط همین صفحه را بپوشاند، نه صفحه‌هایی که ۴۰۴ دارند */
export default function HomeLoading() {
  return (
    <div role="status" aria-label="در حال بارگذاری">
      <SkeletonHome />
    </div>
  );
}
