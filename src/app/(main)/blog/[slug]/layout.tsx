import { ensureBlogPost } from '@/shared/lib/route-guards';
import { safeDecode } from '@/shared/lib/utils';

type Props = { children: React.ReactNode; params: Promise<{ slug: string }> };

/** بررسی وجود مقاله قبل از مرز loading.tsx — ۴۰۴ و ریدایرکت ۳۰۸ واقعی بمانند */
export default async function BlogPostLayout({ children, params }: Props) {
  const { slug } = await params;
  await ensureBlogPost(safeDecode(slug));
  return children;
}
