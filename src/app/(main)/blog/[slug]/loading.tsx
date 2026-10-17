import { SkeletonArticle } from '@/shared/ui/Skeleton';

export default function ArticleLoading() {
  return (
    <div role="status" aria-label="در حال بارگذاری">
      <SkeletonArticle />
    </div>
  );
}
