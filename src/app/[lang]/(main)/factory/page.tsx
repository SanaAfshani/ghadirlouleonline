import type { Metadata } from 'next';
import Image from 'next/image';
import { BadgeCheck, ChevronLeft, ClipboardList, Factory, Globe, MapPin, PlayCircle, Ruler, ShieldCheck, Truck } from 'lucide-react';
import { IconTile } from '@/shared/ui/IconTile';
import { JsonLd } from '@/shared/ui/JsonLd';
import { LtrCodes } from '@/shared/ui/LtrCodes';
import { FaqAccordion } from '@/shared/ui/FaqAccordion';
import { RichText } from '@/shared/ui/RichText';
import { Link } from '@/shared/i18n/Link';
import { siteConfig } from '@/shared/config/site';
import { absoluteUrl, breadcrumbSchema, faqPageSchema } from '@/shared/lib/seo';
import { getSiteSettingsMap } from '@/shared/lib/data';
import { mergeSiteSettings } from '@/shared/lib/site-settings';
import { localeTag, localizePath, type Locale } from '@/shared/i18n/config';
import { digits } from '@/shared/i18n/format';
import { defineMessages, fill } from '@/shared/i18n/messages';
import { resolveLocale } from '@/shared/i18n/server';
import { getSection } from '@/shared/content/server';
import { staticPageMetadata } from '@/shared/content/metadata';
import {
  factoryAbout,
  factoryCta,
  factoryFaq,
  factoryGallery,
  factoryHero,
  factoryNav,
  factoryProcess,
  factoryQuality,
  factorySeo,
  factoryStats,
  factorySupply,
  factoryVideos,
} from '@/shared/content/pages/factory';
import { videoSeconds } from '@/shared/config/factory-media';
import { FactoryGallery, FactoryVideos } from '@/features/factory/FactoryMedia';

type Props = { params: Promise<{ lang: string }> };

const PATH = '/factory';

const messages = defineMessages({
  fa: {
    sectionsNav: 'بخش‌های صفحه',
    videoDescription: '{title} — خط تولید {legalName}',
    ctaTitle: '{siteName}، {exclusiveTitle}',
  },
  en: {
    sectionsNav: 'Page sections',
    videoDescription: '{title} — {legalName} production line',
    ctaTitle: '{siteName}, {exclusiveTitle}',
  },
});

/** نام کارخانه به زبان دیگر — alternateName در schema */
const otherLegalName = (locale: Locale) => (locale === 'fa' ? siteConfig.legalNameEn : siteConfig.legalName);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const [seo, hero, raw] = await Promise.all([getSection(factorySeo, locale), getSection(factoryHero, locale), getSiteSettingsMap()]);
  const base = staticPageMetadata(seo, PATH, locale);
  return {
    ...base,
    openGraph: {
      title: `${seo.metaTitle} | ${mergeSiteSettings(raw, locale).siteName}`,
      description: seo.metaDescription,
      url: absoluteUrl(localizePath(PATH, locale)),
      ...(hero.image && { images: [{ url: hero.image, alt: hero.imageAlt }] }),
    },
  };
}

/** آیکن کارت‌های معرفی به ترتیب */
const FACT_ICONS = [Factory, Ruler, ShieldCheck, Truck];

const prose = 'text-sm sm:text-[15px] leading-8 text-[var(--muted-foreground)]';

/** متن چندپاراگرافی پنل — پاراگراف‌ها با خط خالی از هم جدا می‌شوند */
const paragraphs = (text: string) => text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

function SectionTitle({ id, eyebrow, title }: { id: string; eyebrow: string; title: string }) {
  return (
    <>
      <span className="eyebrow">{eyebrow}</span>
      <h2 id={id} className="mt-2 text-xl sm:text-2xl lg:text-[1.75rem] font-black leading-snug">{title}</h2>
    </>
  );
}

export default async function FactoryPage({ params }: Props) {
  const locale = await resolveLocale(params);
  const t = messages[locale];
  const [raw, seo, hero, stats, nav, about, process, quality, videos, gallery, supply, faq, cta] = await Promise.all([
    getSiteSettingsMap(),
    getSection(factorySeo, locale),
    getSection(factoryHero, locale),
    getSection(factoryStats, locale),
    getSection(factoryNav, locale),
    getSection(factoryAbout, locale),
    getSection(factoryProcess, locale),
    getSection(factoryQuality, locale),
    getSection(factoryVideos, locale),
    getSection(factoryGallery, locale),
    getSection(factorySupply, locale),
    getSection(factoryFaq, locale),
    getSection(factoryCta, locale),
  ]);
  const settings = mergeSiteSettings(raw, locale);
  const url = absoluteUrl(localizePath(PATH, locale));
  const photos = gallery.groups.flatMap((g) => g.photos).filter((p) => p.image);

  const sections = [
    { id: 'about', label: nav.about },
    { id: 'process', label: nav.process },
    { id: 'quality', label: nav.quality },
    { id: 'videos', label: nav.videos },
    { id: 'gallery', label: nav.gallery },
    { id: 'supply', label: nav.supply },
    { id: 'faq', label: nav.faq },
  ];

  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: hero.eyebrow, path: PATH }], locale)} />
      <JsonLd data={faqPageSchema(faq.items)} />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          name: hero.title,
          description: seo.metaDescription,
          url,
          inLanguage: localeTag[locale],
          about: {
            '@type': 'Organization',
            name: settings.legalName,
            alternateName: otherLegalName(locale),
            foundingDate: '2012',
            url: siteConfig.manufacturerUrl,
            address: {
              '@type': 'PostalAddress',
              streetAddress: settings.factoryAddress,
              addressLocality: locale === 'fa' ? siteConfig.factory.city : 'Garmsar',
              addressRegion: locale === 'fa' ? siteConfig.factory.region : 'Semnan',
              addressCountry: 'IR',
            },
          },
          image: photos.map((p) => ({ '@type': 'ImageObject', contentUrl: absoluteUrl(p.image), caption: p.alt })),
          video: videos.items
            .filter((v) => v.video)
            .map((v) => ({
              '@type': 'VideoObject',
              name: v.title,
              description: fill(t.videoDescription, { title: v.title, legalName: settings.legalName }),
              contentUrl: absoluteUrl(v.video),
              ...(v.poster && { thumbnailUrl: absoluteUrl(v.poster) }),
              ...(videoSeconds(v.duration) && { duration: `PT${videoSeconds(v.duration)}S` }),
              uploadDate: '2026-11-06',
            })),
        }}
      />

      {/* هیرو با عکس واقعی کارخانه — بازدیدکننده از همان اول کارخانه را می‌بیند، نه فقط متن */}
      <section className="relative overflow-hidden bg-[var(--ink)] text-white">
        <div className="absolute inset-0 bp-grid bp-grid-fade" />
        <div className="container-main relative z-10 py-10 sm:py-14 lg:py-16 grid gap-8 lg:grid-cols-[1.15fr_1fr] items-center">
          <div>
            <span className="eyebrow">{hero.eyebrow}</span>
            <h1 className="mt-2 text-[1.6rem] sm:text-3xl md:text-[2.4rem] font-black leading-snug sm:leading-tight">{hero.title}</h1>
            <p className="mt-4 text-slate-300 text-sm sm:text-base leading-8">
              <LtrCodes text={hero.text} />
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {hero.inquiryLink && (
                <Link href={hero.inquiryLink} className="inline-flex items-center gap-2 h-12 px-5 rounded-[var(--radius-control)] bg-[var(--accent)] text-[var(--accent-foreground)] font-bold">
                  <ClipboardList className="w-4 h-4" />{hero.inquiryLabel}
                </Link>
              )}
              <a href="#videos" className="inline-flex items-center gap-2 h-12 px-5 rounded-[var(--radius-control)] border border-white/20 font-bold hover:bg-white/10">
                <PlayCircle className="w-4 h-4" />{hero.videosLabel}
              </a>
            </div>
          </div>
          {hero.image && (
            <div className="relative aspect-[4/3] lg:aspect-square max-h-[420px] w-full rounded-[var(--radius-sheet)] overflow-hidden border border-white/10">
              <Image src={hero.image} alt={hero.imageAlt} fill priority sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
              <span className="absolute bottom-3 start-3 inline-flex items-center gap-1 rounded-lg bg-black/55 backdrop-blur px-2.5 py-1 text-xs font-bold">
                <MapPin className="w-3.5 h-3.5" />{settings.factoryAddress}
              </span>
            </div>
          )}
        </div>
        {stats.items.length > 0 && (
          <div className="relative z-10 border-t border-white/10">
            <dl className="container-main grid grid-cols-2 lg:grid-cols-4">
              {stats.items.map((s) => (
                <div key={s.id} className="py-4 sm:py-5 px-2 text-center border-white/10 [&:not(:last-child)]:border-e max-lg:[&:nth-child(2)]:border-e-0 max-lg:[&:nth-child(-n+2)]:border-b">
                  <dd className="text-xl sm:text-2xl font-black num" dir="auto">{s.value}</dd>
                  <dt className="mt-0.5 text-xs sm:text-sm text-slate-400 num">{s.label}</dt>
                </div>
              ))}
            </dl>
          </div>
        )}
        <div className="absolute bottom-0 start-0 h-1.5 w-28 sm:w-40 hazard" aria-hidden />
      </section>

      {/* پرش سریع بین بخش‌ها — زیر هدر می‌چسبد */}
      <nav aria-label={t.sectionsNav} className="sticky top-[var(--nav-height)] z-20 bg-[var(--background)]/90 backdrop-blur-xl border-b border-[var(--border)]">
        <div className="container-main py-3 snap-row">
          {sections.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="h-9 px-4 rounded-lg border border-[var(--border)] text-sm font-bold flex items-center whitespace-nowrap hover:border-[var(--foreground)]/40">
              {s.label}
            </a>
          ))}
        </div>
      </nav>

      <section id="about" className="section-padding-sm scroll-mt-32" aria-labelledby="about-title">
        <div className="container-main grid gap-8 lg:grid-cols-[1.2fr_1fr] items-start">
          <div>
            <SectionTitle id="about-title" eyebrow={about.eyebrow} title={about.title} />
            <RichText html={about.body} className={`mt-4 space-y-4 ${prose} [&_a]:font-bold [&_a]:text-[var(--accent-text)]`} />
          </div>
          <ul className="grid gap-3">
            {about.facts.map((c, i) => (
              <li key={c.id} className="flex items-start gap-3 rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--card)] p-4">
                <IconTile icon={FACT_ICONS[i % FACT_ICONS.length]} size="sm" />
                <div className="min-w-0">
                  <p className="font-black text-sm">{c.title}</p>
                  <p className="mt-1 text-sm leading-7 text-[var(--muted-foreground)] num"><LtrCodes text={c.text} /></p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="process" className="section-padding-sm scroll-mt-32 bg-[var(--card)] border-y border-[var(--border)]" aria-labelledby="process-title">
        <div className="container-main">
          <SectionTitle id="process-title" eyebrow={process.eyebrow} title={process.title} />
          <p className={`mt-3 max-w-3xl ${prose}`}>{process.text}</p>
          <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {process.steps.map((p, i) => (
              <li key={p.id} className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--background)] p-5">
                <span className="w-9 h-9 rounded-lg bg-[var(--accent)] text-[var(--accent-foreground)] grid place-items-center font-black num">{digits(i + 1, locale)}</span>
                <h3 className="mt-3 font-black">{p.title}</h3>
                <p className="mt-1.5 text-sm leading-7 text-[var(--muted-foreground)] num"><LtrCodes text={p.text} /></p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="quality" className="section-padding-sm scroll-mt-32" aria-labelledby="quality-title">
        <div className="container-main grid gap-8 lg:grid-cols-[1fr_1.2fr] items-start">
          <div>
            <SectionTitle id="quality-title" eyebrow={quality.eyebrow} title={quality.title} />
            <p className={`mt-4 ${prose}`}>
              <LtrCodes text={quality.text} />
            </p>
            {quality.note && (
              <p className={`mt-3 ${prose}`}>
                <LtrCodes text={quality.note} />
              </p>
            )}
            {quality.buttonLink && (
              <Link href={quality.buttonLink} className="mt-5 inline-flex items-center gap-2 h-11 px-5 rounded-[var(--radius-control)] border border-[var(--border)] text-sm font-bold hover:border-[var(--accent)]">
                <BadgeCheck className="w-4 h-4 text-[var(--accent-text)]" />{quality.buttonLabel}<ChevronLeft className="w-4 h-4 ltr:rotate-180" />
              </Link>
            )}
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {quality.tests.map((test) => (
              <li key={test.id} className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--card)] p-5">
                <h3 className="font-black text-sm flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-600" />{test.title}</h3>
                <p className="mt-1.5 text-sm leading-7 text-[var(--muted-foreground)] num"><LtrCodes text={test.text} /></p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="videos" className="section-padding-sm scroll-mt-32 bg-[var(--card)] border-y border-[var(--border)]" aria-labelledby="videos-title">
        <div className="container-main">
          <SectionTitle id="videos-title" eyebrow={videos.eyebrow} title={videos.title} />
          <p className={`mt-3 mb-6 max-w-3xl ${prose}`}>{videos.text}</p>
          <FactoryVideos videos={videos.items} />
        </div>
      </section>

      <section id="gallery" className="section-padding-sm scroll-mt-32" aria-labelledby="gallery-title">
        <div className="container-main">
          <SectionTitle id="gallery-title" eyebrow={gallery.eyebrow} title={gallery.title} />
          <p className={`mt-3 mb-6 max-w-3xl ${prose}`}>{gallery.text}</p>
          <FactoryGallery groups={gallery.groups} />
        </div>
      </section>

      <section id="supply" className="section-padding-sm scroll-mt-32 bg-[var(--card)] border-y border-[var(--border)]" aria-labelledby="supply-title">
        <div className="container-main grid gap-8 lg:grid-cols-2 items-start">
          <div>
            <SectionTitle id="supply-title" eyebrow={supply.eyebrow} title={supply.title} />
            <div className={`mt-4 space-y-3 ${prose}`}>
              {paragraphs(supply.text).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
          <ol className="grid gap-3">
            {supply.steps.map((s, i) => (
              <li key={s.id} className="flex items-center gap-4 rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--background)] p-4">
                <span className="w-9 h-9 shrink-0 rounded-full border-2 border-[var(--accent)] text-[var(--accent-text)] grid place-items-center font-black num">{digits(i + 1, locale)}</span>
                <div>
                  <p className="font-black text-sm">{s.title}</p>
                  <p className="mt-0.5 text-sm text-[var(--muted-foreground)]">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <div id="faq" className="container-main scroll-mt-32 [&>section]:mt-4">
        <FaqAccordion faqs={faq.items} />
      </div>

      <section className="section-padding-sm">
        <div className="container-main">
          <div className="rounded-[var(--radius-sheet)] bg-[var(--ink)] text-white p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div>
              <p className="text-lg sm:text-xl font-black">{fill(t.ctaTitle, { siteName: settings.siteName, exclusiveTitle: settings.exclusiveTitle })}</p>
              <p className="mt-2 text-sm leading-7 text-slate-300">{cta.text}</p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <a href={siteConfig.manufacturerUrl} target="_blank" rel="noopener" className="inline-flex items-center gap-2 h-11 px-5 rounded-[var(--radius-control)] border border-white/20 text-sm font-bold hover:bg-white/10">
                <Globe className="w-4 h-4" />{cta.manufacturerLabel}
              </a>
              {cta.productsLink && (
                <Link href={cta.productsLink} className="inline-flex items-center gap-2 h-11 px-5 rounded-[var(--radius-control)] border border-white/20 text-sm font-bold hover:bg-white/10">
                  {cta.productsLabel}
                </Link>
              )}
              {cta.inquiryLink && (
                <Link href={cta.inquiryLink} className="inline-flex items-center gap-2 h-11 px-5 rounded-[var(--radius-control)] bg-[var(--accent)] text-[var(--accent-foreground)] text-sm font-bold">
                  {cta.inquiryLabel}<ChevronLeft className="w-4 h-4 ltr:rotate-180" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
