import { ensureProduct } from '@/shared/lib/route-guards';
import { safeDecode } from '@/shared/lib/utils';
import { resolveLocale } from '@/shared/i18n/server';

type Props = { children: React.ReactNode; params: Promise<{ lang: string; category: string; slug: string }> };

/** بررسی وجود محصول قبل از مرز loading.tsx — ۴۰۴ و ریدایرکت ۳۰۸ واقعی بمانند (نه soft 404) */
export default async function ProductLayout({ children, params }: Props) {
  const locale = await resolveLocale(params);
  const { category, slug } = await params;
  await ensureProduct(safeDecode(category), safeDecode(slug), locale);
  return children;
}
