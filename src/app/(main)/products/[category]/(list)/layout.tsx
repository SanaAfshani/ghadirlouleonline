import { ensureCategory } from '@/shared/lib/route-guards';
import { safeDecode } from '@/shared/lib/utils';

type Props = { children: React.ReactNode; params: Promise<{ category: string }> };

/** بررسی وجود دسته قبل از مرز loading.tsx — فقط صفحه دسته را می‌پوشاند، نه صفحه محصول‌ها */
export default async function CategoryLayout({ children, params }: Props) {
  const { category } = await params;
  await ensureCategory(safeDecode(category));
  return children;
}
