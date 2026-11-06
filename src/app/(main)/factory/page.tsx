import type { Metadata } from 'next';
import Link from 'next/link';
import { BadgeCheck, ChevronLeft, Factory, Globe, Ruler, ShieldCheck, Truck } from 'lucide-react';
import { PageHero } from '@/shared/ui/PageHero';
import { IconTile } from '@/shared/ui/IconTile';
import { JsonLd } from '@/shared/ui/JsonLd';
import { Reveal } from '@/shared/ui/Reveal';
import { siteConfig } from '@/shared/config/site';
import { absoluteUrl, breadcrumbSchema } from '@/shared/lib/seo';
import { FACTORY_PHOTO_GROUPS, FACTORY_VIDEOS } from '@/shared/config/factory-media';
import { FactoryPhotos, FactoryVideos } from '@/features/factory/FactoryMedia';

const TITLE = 'کارخانه و توانمندی تأمین';
const DESCRIPTION = `خط تولید، انبار و بارگیری ${siteConfig.legalName} در گرمسار با عکس و فیلم واقعی؛ تأمین لوله کاروگیت، لوله اسپیرال و اتصالات کاروگیت برای پروژه‌های سراسر ایران.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${siteConfig.url}/factory` },
  openGraph: {
    title: `${TITLE} | ${siteConfig.name}`,
    description: DESCRIPTION,
    url: `${siteConfig.url}/factory`,
    images: [{ url: FACTORY_PHOTO_GROUPS[0].photos[0].src, alt: FACTORY_PHOTO_GROUPS[0].photos[0].alt }],
  },
};

const CAPABILITIES = [
  { icon: Factory, title: 'تولید در گرمسار', text: `کارخانه ${siteConfig.legalName} از سال ۱۳۹۱ در شهرک صنعتی گرمسار` },
  { icon: Ruler, title: 'سایزهای تولید', text: 'لوله کاروگیت ۱۱۰ تا ۱۲۰۰ و لوله اسپیرال ۹۰۰ تا ۲۰۰۰ میلی‌متر، کلاس SN4 و SN8' },
  { icon: ShieldCheck, title: 'استاندارد و کیفیت', text: 'پروانه استاندارد ISIRI 9116-3 و گواهینامه ISO 9001:2015' },
  { icon: Truck, title: 'ارسال از انبار', text: 'بارگیری مستقیم از انبار کارخانه و ارسال به سراسر کشور' },
];

export default function FactoryPage() {
  const url = `${siteConfig.url}/factory`;
  const photos = FACTORY_PHOTO_GROUPS.flatMap((g) => g.photos);

  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: TITLE, path: '/factory' }])} />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          name: TITLE,
          description: DESCRIPTION,
          url,
          inLanguage: 'fa-IR',
          about: { '@type': 'Organization', name: siteConfig.legalName, alternateName: siteConfig.legalNameEn },
          image: photos.map((p) => ({ '@type': 'ImageObject', contentUrl: absoluteUrl(p.src), caption: p.alt })),
          video: FACTORY_VIDEOS.map((v) => ({
            '@type': 'VideoObject',
            name: v.title,
            description: `${v.title} — خط تولید ${siteConfig.legalName}`,
            contentUrl: absoluteUrl(v.src),
            thumbnailUrl: absoluteUrl(v.poster),
            duration: `PT${v.duration}S`,
            uploadDate: '2026-11-06',
          })),
        }}
      />

      <PageHero label="اعتمادسازی" title={TITLE} description={DESCRIPTION} />

      <section className="section-padding-sm" aria-label="توانمندی‌ها">
        <div className="container-main">
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {CAPABILITIES.map((c) => (
              <li key={c.title} className="flex items-start gap-3 rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--card)] p-4">
                <IconTile icon={c.icon} size="sm" />
                <div className="min-w-0">
                  <p className="font-black text-sm">{c.title}</p>
                  <p className="mt-1 text-sm leading-7 text-[var(--muted-foreground)] num">{c.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section-padding-sm" aria-labelledby="factory-videos">
        <div className="container-main">
          <span className="eyebrow">فیلم</span>
          <h2 id="factory-videos" className="mt-2 text-xl sm:text-2xl font-black">فیلم‌های خط تولید</h2>
          <p className="mt-2 mb-6 text-sm sm:text-[15px] leading-8 text-[var(--muted-foreground)]">
            از قالب‌های کاروگیتور تا خروج لوله قطر بزرگ از خط؛ همه فیلم‌ها در کارخانه گرمسار گرفته شده‌اند.
          </p>
          <FactoryVideos videos={FACTORY_VIDEOS} />
        </div>
      </section>

      {FACTORY_PHOTO_GROUPS.map((g) => (
        <section key={g.id} className="section-padding-sm" aria-labelledby={`factory-${g.id}`}>
          <Reveal>
            <div className="container-main">
              <span className="eyebrow">عکس</span>
              <h2 id={`factory-${g.id}`} className="mt-2 text-xl sm:text-2xl font-black">{g.title}</h2>
              <p className="mt-2 mb-6 text-sm sm:text-[15px] leading-8 text-[var(--muted-foreground)]">{g.description}</p>
              <FactoryPhotos group={g} />
            </div>
          </Reveal>
        </section>
      ))}

      <section className="section-padding-sm">
        <div className="container-main">
          <div className="rounded-[var(--radius-sheet)] bg-[var(--ink)] text-white p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div>
              <p className="text-lg sm:text-xl font-black">{siteConfig.name}، {siteConfig.exclusiveTitle}</p>
              <p className="mt-2 text-sm leading-7 text-slate-300">مدارک کارخانه را ببینید یا برای استعلام قیمت و سفارش پروژه‌ای با ما تماس بگیرید.</p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Link href="/certificates" className="inline-flex items-center gap-2 h-11 px-5 rounded-[var(--radius-control)] border border-white/20 text-sm font-bold hover:bg-white/10">
                <BadgeCheck className="w-4 h-4" />گواهینامه‌ها
              </Link>
              <a href={siteConfig.manufacturerUrl} target="_blank" rel="noopener" className="inline-flex items-center gap-2 h-11 px-5 rounded-[var(--radius-control)] border border-white/20 text-sm font-bold hover:bg-white/10">
                <Globe className="w-4 h-4" />سایت کارخانه
              </a>
              <Link href="/products" className="inline-flex items-center gap-2 h-11 px-5 rounded-[var(--radius-control)] bg-[var(--accent)] text-[var(--accent-foreground)] text-sm font-bold">
                مشاهده محصولات<ChevronLeft className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
