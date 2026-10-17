import { ensureProject } from '@/shared/lib/route-guards';
import { safeDecode } from '@/shared/lib/utils';

type Props = { children: React.ReactNode; params: Promise<{ slug: string }> };

/** بررسی وجود پروژه قبل از مرز loading.tsx — ۴۰۴ و ریدایرکت ۳۰۸ واقعی بمانند */
export default async function ProjectLayout({ children, params }: Props) {
  const { slug } = await params;
  await ensureProject(safeDecode(slug));
  return children;
}
