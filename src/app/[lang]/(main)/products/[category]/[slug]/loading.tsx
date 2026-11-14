import { SkeletonProductPage } from '@/shared/ui/Skeleton';

export default function ProductLoading() {
  return (
    <div role="status" aria-busy="true">
      <SkeletonProductPage />
    </div>
  );
}
