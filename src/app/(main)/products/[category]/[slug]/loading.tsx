import { SkeletonProductPage } from '@/shared/ui/Skeleton';

export default function ProductLoading() {
  return (
    <div role="status" aria-label="در حال بارگذاری محصول">
      <SkeletonProductPage />
    </div>
  );
}
