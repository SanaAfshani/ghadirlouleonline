import { BadgeCheck, Calendar, ChevronLeft, Factory, ShieldCheck, Waves } from 'lucide-react';
import { siteConfig } from '@/shared/config/site';
import { IconTile } from '@/shared/ui/IconTile';
import { LtrCodes } from '@/shared/ui/LtrCodes';
import { Link } from '@/shared/i18n/Link';
import type { SiteSettings } from '@/shared/lib/site-settings';
import type { ContentOf } from '@/shared/content/types';
import type { contactFactory } from '@/shared/content/pages/contact';

/**
 * معرفی کارخانه در صفحه تماس — سمت سرور تا کل متن در HTML اولیه برای گوگل باشد.
 * متن‌ها از پنل «محتوای صفحات ← تماس با ما ← درباره کارخانه» (shared/content/pages/contact.ts)؛
 * تاریخ‌ها و بازه‌ها از اسناد خود کارخانه (پروانه استاندارد و گواهی ISO) و اطلاعات عمومی شرکت.
 */
const FACT_ICONS = [Factory, ShieldCheck, Waves];
const LINK_ICONS = [Factory, ShieldCheck, BadgeCheck];

/** متن schema کارخانه به زبان صفحه */
const FACTORY_SCHEMA_TEXT = {
  fa: {
    foundingLocation: 'شهرک صنعتی گرمسار، استان سمنان',
    street: siteConfig.factory.street,
    city: siteConfig.factory.city,
    region: siteConfig.factory.region,
    description: (s: SiteSettings) =>
      `تولیدکننده لوله دوجداره پلی اتیلن (کاروگیت) و لوله اسپیرال در گرمسار از ۱۳۹۱، دارای پروانه استاندارد ISIRI 9116-3 و گواهینامه ISO 9001:2015. ${s.siteName} ${s.exclusiveTitle} است.`,
  },
  en: {
    foundingLocation: 'Garmsar Industrial Park, Semnan Province',
    street: 'Garmsar Industrial Park',
    city: 'Garmsar',
    region: 'Semnan',
    description: (s: SiteSettings) =>
      `Manufacturer of double-wall polyethylene (corrugated) pipes and spiral pipes in Garmsar since 2012, holding the ISIRI 9116-3 standard licence and ISO 9001:2015 certification. ${s.siteName} is its exclusive sales agent.`,
  },
};

/** Organization کارخانه — تولیدکننده، با سال تأسیس و محل */
export function factorySchema(s: SiteSettings) {
  const text = FACTORY_SCHEMA_TEXT[s.locale];
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: s.legalName,
    alternateName: s.locale === 'fa' ? siteConfig.legalNameEn : siteConfig.legalName,
    foundingDate: '2012',
    foundingLocation: { '@type': 'Place', name: text.foundingLocation },
    address: {
      '@type': 'PostalAddress',
      streetAddress: text.street,
      addressLocality: text.city,
      addressRegion: text.region,
      addressCountry: 'IR',
    },
    description: text.description(s),
    url: siteConfig.manufacturerUrl,
  };
}

export function FactoryAbout({ content }: { content: ContentOf<typeof contactFactory> }) {
  return (
    <section className="section-padding-sm" aria-labelledby="factory-about-title">
      <div className="container-main">
        <p className="eyebrow">{content.eyebrow}</p>
        <h2 id="factory-about-title" className="mt-2 text-xl sm:text-2xl lg:text-3xl font-black leading-snug">
          {content.title}
        </h2>

        <div className="mt-5 rounded-3xl border-2 border-[var(--accent)]/50 bg-[var(--accent)]/[0.07] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <p className="flex items-start gap-3 text-base sm:text-lg leading-8">
            <ShieldCheck className="w-7 h-7 shrink-0 mt-0.5 text-[var(--accent-text)]" />
            <span>
              <strong className="font-black">{content.highlightTitle}</strong>{' '}
              <span className="text-[var(--muted-foreground)] text-sm sm:text-base">{content.highlightText}</span>
            </span>
          </p>
          <Link href={content.buttonLink || '/certificates'} className="shrink-0 inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-[var(--foreground)] text-[var(--background)] text-sm font-bold">
            <BadgeCheck className="w-4 h-4" />
            {content.buttonLabel}
            <ChevronLeft className="w-4 h-4 ltr:rotate-180" />
          </Link>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="text-sm sm:text-[15px] leading-8 text-[var(--muted-foreground)]">
              <LtrCodes text={content.body} />
            </p>

            <ol className="mt-6 relative border-s-2 border-[var(--border)] ms-3 space-y-5">
              {content.timeline.map((t) => (
                <li key={t.id} className="ps-6 relative">
                  <span className="absolute -start-[0.6rem] top-1 w-4 h-4 rounded-full bg-[var(--accent)] ring-4 ring-[var(--background)]" />
                  <p className="flex items-center gap-1.5 text-sm font-black num"><Calendar className="w-4 h-4 text-[var(--accent-text)]" />{t.year}</p>
                  <p className="mt-0.5 text-sm leading-7 text-[var(--muted-foreground)]"><LtrCodes text={t.text} /></p>
                </li>
              ))}
            </ol>

            <ul className="mt-6 grid gap-3">
              {content.facts.map((f, i) => (
                <li key={f.id} className="flex items-start gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
                  <IconTile icon={FACT_ICONS[i % FACT_ICONS.length]} size="sm" />
                  <div className="min-w-0">
                    <p className="font-black text-sm">{f.title}</p>
                    <p className="mt-0.5 text-sm leading-7 text-[var(--muted-foreground)] num"><LtrCodes text={f.text} /></p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-6 content-start">
            <ul className="grid gap-3">
              {content.links.map((l, i) => (
                <li key={l.id}>
                  <Link href={l.href || '/'} className="group flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 hover:border-[var(--accent)] transition-colors">
                    <IconTile icon={LINK_ICONS[i % LINK_ICONS.length]} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block font-black text-sm">{l.title}</span>
                      <span className="block mt-0.5 text-sm leading-7 text-[var(--muted-foreground)] num"><LtrCodes text={l.text} /></span>
                    </span>
                    <ChevronLeft className="w-5 h-5 shrink-0 text-[var(--muted-foreground)] group-hover:text-[var(--accent-text)] ltr:rotate-180" />
                  </Link>
                </li>
              ))}
            </ul>

            <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5">
              <p className="font-black text-sm">{content.usesTitle}</p>
              <ul className="mt-3 grid sm:grid-cols-2 gap-2">
                {content.uses.map((u) => (
                  <li key={u.id} className="flex items-start gap-2 text-sm leading-7 text-[var(--muted-foreground)]">
                    <BadgeCheck className="w-4 h-4 mt-1.5 shrink-0 text-emerald-600" />
                    {u.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
