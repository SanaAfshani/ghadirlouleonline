import { ensureCategory } from '@/shared/lib/route-guards';
import { safeDecode } from '@/shared/lib/utils';
import { resolveLocale } from '@/shared/i18n/server';

type Props = { children: React.ReactNode; params: Promise<{ lang: string; category: string }> };

/** بررسی وجود دسته قبل از مرز loading.tsx — فقط صفحه دسته را می‌پوشاند، نه صفحه محصول‌ها */
export default async function CategoryLayout({ children, params }: Props) {
  const locale = await resolveLocale(params);
  const { category } = await params;
  await ensureCategory(safeDecode(category), locale);
  return children;
}
