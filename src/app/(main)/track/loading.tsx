import { SkeletonTextPage } from '@/shared/ui/Skeleton';

export default function PageLoading() {
  return (
    <div role="status" aria-label="در حال بارگذاری">
      <SkeletonTextPage />
    </div>
  );
}
