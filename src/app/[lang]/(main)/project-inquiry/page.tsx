import type { Metadata } from 'next';
import { ClipboardList, Factory, FileText, Truck } from 'lucide-react';
import { PageHero } from '@/shared/ui/PageHero';
import { IconTile } from '@/shared/ui/IconTile';
import { JsonLd } from '@/shared/ui/JsonLd';
import { absoluteUrl, breadcrumbSchema } from '@/shared/lib/seo';
import { CORRUGATED_FITTINGS } from '@/shared/config/product-lines';
import { ProjectInquiryForm, type InquiryRow } from '@/features/inquiry/ProjectInquiryForm';
import { resolveLocale } from '@/shared/i18n/server';
import { localizePath } from '@/shared/i18n/config';
import { getSection } from '@/shared/content/server';
import { staticPageMetadata } from '@/shared/content/metadata';
import { projectInquiryHero, projectInquirySeo, projectInquirySteps } from '@/shared/content/pages/project-inquiry';

type Props = { params: Promise<{ lang: string }>; searchParams: Promise<{ product?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const [seo, hero] = await Promise.all([getSection(projectInquirySeo, locale), getSection(projectInquiryHero, locale)]);
  return {
    ...staticPageMetadata(seo, '/project-inquiry', locale),
    openGraph: { title: hero.title, description: seo.metaDescription, url: absoluteUrl(localizePath('/project-inquiry', locale)) },
  };
}

/** لینک «استعلام پروژه‌ای» از صفحه هر محصول: ?product=<اسلاگ> ردیف اول فرم را پر می‌کند */
function rowFromSlug(slug: string | undefined): InquiryRow {
  const pipe = slug?.match(/^(corrugated|spiral)-pipe-(\d+)$/);
  if (pipe) return { kind: pipe[1], size: Number(pipe[2]), sn: '', qty: '' };
  if (slug && CORRUGATED_FITTINGS.some((f) => f.slug === slug)) return { kind: slug, size: 110, sn: '', qty: '' };
  return { kind: 'corrugated', size: 400, sn: '', qty: '' };
}

const STEP_ICONS = [ClipboardList, FileText, Factory, Truck];

export default async function ProjectInquiryPage({ params, searchParams }: Props) {
  const locale = await resolveLocale(params);
  const [{ product }, hero, steps] = await Promise.all([searchParams, getSection(projectInquiryHero, locale), getSection(projectInquirySteps, locale)]);

  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: hero.title, path: '/project-inquiry' }], locale)} />
      <PageHero label={hero.label} title={hero.title} description={hero.description} />

      <div className="container-main section-padding-sm grid gap-8 lg:grid-cols-[1fr_300px] items-start">
        <ProjectInquiryForm initial={rowFromSlug(product)} />

        <aside className="grid gap-3">
          {steps.items.map((s, i) => (
            <div key={s.id} className="flex items-start gap-3 rounded-[var(--radius-panel)] border border-[var(--border)] p-4">
              <IconTile icon={STEP_ICONS[i % STEP_ICONS.length]} size="sm" />
              <div>
                <p className="font-black text-sm">{s.title}</p>
                <p className="mt-1 text-sm leading-7 text-[var(--muted-foreground)]">{s.text}</p>
              </div>
            </div>
          ))}
        </aside>
      </div>
    </>
  );
}
