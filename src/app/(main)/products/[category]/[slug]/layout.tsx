import { ensureProduct } from '@/shared/lib/route-guards';
import { safeDecode } from '@/shared/lib/utils';

type Props = { children: React.ReactNode; params: Promise<{ category: string; slug: string }> };

/** بررسی وجود محصول قبل از مرز loading.tsx — ۴۰۴ و ریدایرکت ۳۰۸ واقعی بمانند (نه soft 404) */
export default async function ProductLayout({ children, params }: Props) {
  const { category, slug } = await params;
  await ensureProduct(safeDecode(category), safeDecode(slug));
  return children;
}
