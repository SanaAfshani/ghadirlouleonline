import { ensureProject } from '@/shared/lib/route-guards';
import { safeDecode } from '@/shared/lib/utils';
import { resolveLocale } from '@/shared/i18n/server';

type Props = { children: React.ReactNode; params: Promise<{ lang: string; slug: string }> };

/** بررسی وجود پروژه قبل از مرز loading.tsx — ۴۰۴ و ریدایرکت ۳۰۸ واقعی بمانند */
export default async function ProjectLayout({ children, params }: Props) {
  const locale = await resolveLocale(params);
  const { slug } = await params;
  await ensureProject(safeDecode(slug), locale);
  return children;
}
