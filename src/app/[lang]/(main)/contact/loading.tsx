import { SkeletonTextPage } from '@/shared/ui/Skeleton';

export default function PageLoading() {
  return (
    <div role="status" aria-busy="true">
      <SkeletonTextPage />
    </div>
  );
}
