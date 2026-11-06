import type { Metadata } from 'next';
import { ClipboardList, Factory, FileText, Truck } from 'lucide-react';
import { PageHero } from '@/shared/ui/PageHero';
import { IconTile } from '@/shared/ui/IconTile';
import { JsonLd } from '@/shared/ui/JsonLd';
import { siteConfig } from '@/shared/config/site';
import { breadcrumbSchema } from '@/shared/lib/seo';
import { CORRUGATED_FITTINGS } from '@/shared/config/product-lines';
import { ProjectInquiryForm, type InquiryRow } from '@/features/inquiry/ProjectInquiryForm';

const TITLE = 'استعلام خرید پروژه‌ای';
const DESCRIPTION = `استعلام قیمت عمده لوله کاروگیت، اسپیرال و اتصالات برای پروژه‌های عمرانی: چند سایز در یک درخواست، با کلاس SN، متراژ، شهر پروژه و زمان تحویل — مستقیم به واحد فروش عمده ${siteConfig.name}.`;

export const metadata: Metadata = {
  title: `${TITLE} | لوله کاروگیت و اسپیرال`,
  description: DESCRIPTION,
  alternates: { canonical: `${siteConfig.url}/project-inquiry` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${siteConfig.url}/project-inquiry` },
};

/** لینک «استعلام پروژه‌ای» از صفحه هر محصول: ?product=<اسلاگ> ردیف اول فرم را پر می‌کند */
function rowFromSlug(slug: string | undefined): InquiryRow {
  const pipe = slug?.match(/^(corrugated|spiral)-pipe-(\d+)$/);
  if (pipe) return { kind: pipe[1], size: Number(pipe[2]), sn: '', qty: '' };
  if (slug && CORRUGATED_FITTINGS.some((f) => f.slug === slug)) return { kind: slug, size: 110, sn: '', qty: '' };
  return { kind: 'corrugated', size: 400, sn: '', qty: '' };
}

const STEPS = [
  { icon: ClipboardList, title: 'ثبت اقلام', text: 'چند سایز و محصول را با متراژ و کلاس SN در یک درخواست بفرستید.' },
  { icon: FileText, title: 'پیش‌فاکتور', text: 'کارشناس فروش عمده قیمت روز کارخانه و شرایط پرداخت را اعلام می‌کند.' },
  { icon: Factory, title: 'تأمین از کارخانه', text: `بارگیری مستقیم از انبار ${siteConfig.legalName} در گرمسار.` },
  { icon: Truck, title: 'ارسال به پروژه', text: 'هماهنگی حمل تا شهر و محل پروژه در سراسر کشور.' },
];

export default async function ProjectInquiryPage({ searchParams }: { searchParams: Promise<{ product?: string }> }) {
  const { product } = await searchParams;

  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: TITLE, path: '/project-inquiry' }])} />
      <PageHero label="فروش عمده" title={TITLE} description="سایز، کلاس SN، متراژ، شهر پروژه و زمان تحویل را بنویسید؛ درخواست مستقیم به واحد فروش عمده می‌رسد." />

      <div className="container-main section-padding-sm grid gap-8 lg:grid-cols-[1fr_300px] items-start">
        <ProjectInquiryForm initial={rowFromSlug(product)} />

        <aside className="grid gap-3">
          {STEPS.map((s) => (
            <div key={s.title} className="flex items-start gap-3 rounded-[var(--radius-panel)] border border-[var(--border)] p-4">
              <IconTile icon={s.icon} size="sm" />
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
