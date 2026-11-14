import { SkeletonArticle } from '@/shared/ui/Skeleton';

export default function ArticleLoading() {
  return (
    <div role="status" aria-busy="true">
      <SkeletonArticle />
    </div>
  );
}
