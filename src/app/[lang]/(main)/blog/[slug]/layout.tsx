import { ensureBlogPost } from '@/shared/lib/route-guards';
import { safeDecode } from '@/shared/lib/utils';
import { resolveLocale } from '@/shared/i18n/server';

type Props = { children: React.ReactNode; params: Promise<{ lang: string; slug: string }> };

/** بررسی وجود مقاله قبل از مرز loading.tsx — ۴۰۴ و ریدایرکت ۳۰۸ واقعی بمانند */
export default async function BlogPostLayout({ children, params }: Props) {
  const locale = await resolveLocale(params);
  const { slug } = await params;
  await ensureBlogPost(safeDecode(slug), locale);
  return children;
}
