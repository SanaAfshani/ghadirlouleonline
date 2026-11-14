import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BadgeCheck, FileText, ShieldCheck } from 'lucide-react';
import { PageHero } from '@/shared/ui/PageHero';
import { CertificatesGrid } from '@/features/certificates/Certificates';
import { getSiteSettingsMap } from '@/shared/lib/site-settings-store';
import { mergeSiteSettings } from '@/shared/lib/site-settings';
import { siteConfig } from '@/shared/config/site';
import { JsonLd } from '@/shared/ui/JsonLd';
import { RichText } from '@/shared/ui/RichText';
import { absoluteUrl, breadcrumbSchema } from '@/shared/lib/seo';
import { LtrCodes } from '@/shared/ui/LtrCodes';
import { Reveal } from '@/shared/ui/Reveal';
import { localizePath } from '@/shared/i18n/config';
import { defineMessages, fill } from '@/shared/i18n/messages';
import { resolveLocale } from '@/shared/i18n/server';
import { getSection } from '@/shared/content/server';
import { staticPageMetadata } from '@/shared/content/metadata';
import {
  certificatesDocs,
  certificatesExclusive,
  certificatesHero,
  certificatesRepresentation,
  certificatesSeo,
  certificatesStandards,
} from '@/shared/content/pages/certificates';

type Props = { params: Promise<{ lang: string }> };

const PATH = '/certificates';

const messages = defineMessages({
  fa: {
    exclusiveTitle: '{siteName}، {exclusiveTitle}',
    issuer: 'صادرکننده',
    validity: 'اعتبار',
    subject: 'موضوع',
    product: 'محصول',
    manufacturerDescription: 'تولیدکننده لوله دوجداره پلی اتیلن (کاروگیت) در شهرک صنعتی گرمسار. {siteName} {exclusiveTitle} است.',
  },
  en: {
    exclusiveTitle: '{siteName}, {exclusiveTitle}',
    issuer: 'Issuer',
    validity: 'Validity',
    subject: 'Subject',
    product: 'Product',
    manufacturerDescription: 'Manufacturer of double-wall polyethylene (corrugated) pipes in Garmsar Industrial Park. {siteName}: {exclusiveTitle}.',
  },
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const [seo, raw] = await Promise.all([getSection(certificatesSeo, locale), getSiteSettingsMap()]);
  const { certificates } = mergeSiteSettings(raw, locale);
  return {
    ...staticPageMetadata(seo, PATH, locale),
    openGraph: {
      title: seo.metaTitle,
      description: seo.metaDescription,
      url: absoluteUrl(localizePath(PATH, locale)),
      images: certificates.slice(0, 1).map((c) => ({ url: absoluteUrl(c.image), alt: c.title })),
    },
  };
}

export default async function CertificatesPage({ params }: Props) {
  const locale = await resolveLocale(params);
  const t = messages[locale];
  const [raw, hero, exclusive, representation, standards, docs] = await Promise.all([
    getSiteSettingsMap(),
    getSection(certificatesHero, locale),
    getSection(certificatesExclusive, locale),
    getSection(certificatesRepresentation, locale),
    getSection(certificatesStandards, locale),
    getSection(certificatesDocs, locale),
  ]);
  const settings = mergeSiteSettings(raw, locale);
  const { certificates } = settings;
  const docItems = docs.items.filter((d) => d.link);
  // تا وقتی گواهی‌ای ثبت نشده صفحه وجود ندارد — صفحه خالی برای گوگل و مشتری بد است
  if (!certificates.length) notFound();

  // مدارک متعلق به کارخانه (تولیدکننده) است؛ سایت نماینده انحصاری آن
  const manufacturer = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: settings.legalName,
    alternateName: locale === 'fa' ? siteConfig.legalNameEn : siteConfig.legalName,
    url: siteConfig.manufacturerUrl,
    description: fill(t.manufacturerDescription, { siteName: settings.siteName, exclusiveTitle: settings.exclusiveTitle }),
    hasCredential: certificates.map((c) => ({
      '@type': 'EducationalOccupationalCredential',
      name: c.title,
      credentialCategory: c.code || 'certificate',
      image: absoluteUrl(c.image),
      url: absoluteUrl(localizePath(PATH, locale)),
    })),
  };

  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: hero.title, path: PATH }], locale)} />
      <JsonLd data={manufacturer} />
      <PageHero label={hero.label} title={hero.title} description={hero.description} />

      <Reveal>
      <section className="container-main section-padding-sm">
        <div className="rounded-3xl border-2 border-[var(--accent)]/50 bg-[var(--accent)]/[0.07] p-5 sm:p-6 flex items-start gap-4">
          <ShieldCheck className="w-8 h-8 shrink-0 text-[var(--accent-text)]" />
          <div>
            <p className="text-lg sm:text-xl font-black leading-8">
              <strong>{fill(t.exclusiveTitle, { siteName: settings.siteName, exclusiveTitle: settings.exclusiveTitle })}</strong>
            </p>
            <p className="mt-2 text-sm sm:text-[15px] leading-8 text-[var(--muted-foreground)]">{exclusive.text}</p>
          </div>
        </div>

        <h2 className="mt-10 text-xl sm:text-2xl font-black">{representation.title}</h2>
        <div className="mt-4 grid gap-6 md:grid-cols-[minmax(0,280px)_1fr] items-start">
          {representation.image && (
            <CertificatesGrid
              certificates={[{ title: representation.certificateTitle, code: representation.certificateCode, image: representation.image }]}
              columns="single"
            />
          )}
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5 text-sm leading-8">
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
              <dt className="text-[var(--muted-foreground)]">{t.issuer}</dt>
              <dd className="font-bold">{settings.legalName}</dd>
              <dt className="text-[var(--muted-foreground)]">{t.validity}</dt>
              <dd className="font-bold">{representation.validity}</dd>
              <dt className="text-[var(--muted-foreground)]">{t.subject}</dt>
              <dd className="font-bold">{representation.subject}</dd>
            </dl>
            {representation.note && (
              <RichText
                as="p"
                html={representation.note}
                className="mt-3 text-[var(--muted-foreground)] [&_a]:font-bold [&_a]:text-[var(--accent-text)] [&_a:hover]:underline"
              />
            )}
          </div>
        </div>

        <h2 className="mt-12 text-xl sm:text-2xl font-black">{standards.title}</h2>
        <div className="mt-4">
          <CertificatesGrid certificates={certificates} />
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {standards.items.map((s) => (
            <article key={s.id} className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5">
              <h3 className="flex items-start gap-2 font-black text-base leading-7 num">
                <BadgeCheck className="w-5 h-5 mt-1 shrink-0 text-emerald-600" />
                <span><LtrCodes text={s.title} /></span>
              </h3>
              <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs leading-6">
                <dt className="text-[var(--muted-foreground)]">{t.issuer}</dt>
                <dd className="font-bold num">{s.issuer}</dd>
                <dt className="text-[var(--muted-foreground)]">{t.validity}</dt>
                <dd className="font-bold num">{s.validity}</dd>
                <dt className="text-[var(--muted-foreground)]">{t.product}</dt>
                <dd className="font-bold num">{s.product}</dd>
              </dl>
              <p className="mt-3 text-sm leading-7 text-[var(--muted-foreground)] num"><LtrCodes text={s.text} /></p>
            </article>
          ))}
        </div>

        {docItems.length > 0 && (
          <>
            <h2 className="mt-12 text-xl sm:text-2xl font-black">{docs.title}</h2>
            {docs.source && <p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">{docs.source}</p>}
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {docItems.map((d) => (
                <li key={d.id}>
                  <a href={localizePath(d.link, locale)} target="_blank" rel="noopener" className="flex items-start gap-3 h-full rounded-2xl border border-[var(--border)] p-4 hover:border-[var(--accent)] transition-colors">
                    <FileText className="w-5 h-5 mt-1 shrink-0 text-[var(--accent-text)]" />
                    <span>
                      <span className="block font-black text-sm leading-7">{d.title}</span>
                      <span className="block text-xs text-[var(--muted-foreground)]">{d.meta}</span>
                      <span className="mt-1 block text-sm leading-7 text-[var(--muted-foreground)]">{d.text}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
      </Reveal>
    </>
  );
}
