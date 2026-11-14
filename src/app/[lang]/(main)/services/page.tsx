import type { Metadata } from 'next';
import { ServicesContent } from './ServicesContent';
import { JsonLd } from '@/shared/ui/JsonLd';
import { absoluteUrl, breadcrumbSchema } from '@/shared/lib/seo';
import { getSiteSettingsMap } from '@/shared/lib/data';
import { mergeSiteSettings } from '@/shared/lib/site-settings';
import { resolveLocale } from '@/shared/i18n/server';
import { localeTag, localizePath, type Locale } from '@/shared/i18n/config';
import { defineMessages } from '@/shared/i18n/messages';
import { getSection } from '@/shared/content/server';
import { staticPageMetadata } from '@/shared/content/metadata';
import { servicesCta, servicesFactory, servicesHero, servicesList, servicesSeo } from '@/shared/content/pages/services';

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await resolveLocale(params);
  return staticPageMetadata(await getSection(servicesSeo, locale), '/services', locale);
}

const messages = defineMessages({ fa: { crumb: 'خدمات' }, en: { crumb: 'Services' } });

/** متن schema خدمات به زبان صفحه */
const SERVICE_SCHEMA_TEXT: Record<Locale, { name: (site: string) => string; serviceType: string; description: string; country: string }> = {
  fa: {
    name: (site) => `خدمات ${site}`,
    serviceType: 'تامین و خدمات فنی لوله و اتصالات صنعتی',
    description: 'مشاوره فنی رایگان، برش و تبدیل لوله، ارائه Mill Certificate، گارانتی کیفیت و ارسال به سراسر ایران.',
    country: 'ایران',
  },
  en: {
    name: (site) => `${site} services`,
    serviceType: 'Supply and technical services for industrial pipes and fittings',
    description: 'Free technical advice, pipe cutting and adaptation, Mill Certificates, quality guarantee and delivery anywhere in Iran.',
    country: 'Iran',
  },
};

export default async function ServicesPage({ params }: Props) {
  const locale = await resolveLocale(params);
  const [raw, hero, list, factory, cta] = await Promise.all([
    getSiteSettingsMap(),
    getSection(servicesHero, locale),
    getSection(servicesList, locale),
    getSection(servicesFactory, locale),
    getSection(servicesCta, locale),
  ]);
  const settings = mergeSiteSettings(raw, locale);
  const text = SERVICE_SCHEMA_TEXT[locale];

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: text.name(settings.siteName),
    serviceType: text.serviceType,
    description: text.description,
    provider: { '@type': 'Organization', name: settings.siteName, url: absoluteUrl(localizePath('/', locale)) },
    areaServed: { '@type': 'Country', name: text.country },
    url: absoluteUrl(localizePath('/services', locale)),
    inLanguage: localeTag[locale],
  };

  return (
    <>
      <JsonLd data={serviceSchema} />
      <JsonLd data={breadcrumbSchema([{ name: messages[locale].crumb, path: '/services' }], locale)} />
      <ServicesContent hero={hero} list={list} factory={factory} cta={cta} />
    </>
  );
}
