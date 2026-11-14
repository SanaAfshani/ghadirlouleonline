import { SkeletonGridPage } from '@/shared/ui/Skeleton';

// گروه (list): loading فقط همین صفحه فهرست را می‌پوشاند، نه مسیرهای فرزند که ممکن است ۴۰۴ بدهند
export default function ListLoading() {
  return (
    <div role="status" aria-busy="true">
      <SkeletonGridPage />
    </div>
  );
}
