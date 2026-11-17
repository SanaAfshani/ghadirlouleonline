import { siteConfig } from '@/shared/config/site';
import type { SiteSettings } from '@/shared/lib/site-settings';
import { defaultLocale, localeTag, localizePath, locales, type Locale } from '@/shared/i18n/config';

/** حذف تگ‌های HTML و کوتاه‌سازی برای meta description */
export function toMetaDescription(input: string | null | undefined, max = 158): string {
  if (!input) return siteConfig.description;
  const text = input
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length <= max) return text;
  return text.slice(0, max).replace(/\s+\S*$/, '') + '…';
}

export function absoluteUrl(path: string): string {
  if (!path) return siteConfig.url;
  if (path.startsWith('http')) return path;
  return `${siteConfig.url}${path.startsWith('/') ? '' : '/'}${path}`;
}

type Crumb = { name: string; path: string };

/**
 * BreadcrumbList — گوگل مسیر صفحه را به جای URL خام در نتایج نشان می‌دهد.
 * همیشه با «خانه» شروع می‌شود؛ path ها فارسی‌وار نوشته می‌شوند و این‌جا پیشوند زبان می‌گیرند.
 */
export function breadcrumbSchema(crumbs: Crumb[], locale: Locale = defaultLocale) {
  const items = [{ name: locale === 'fa' ? 'خانه' : 'Home', path: '/' }, ...crumbs];
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: absoluteUrl(localizePath(c.path, locale)),
    })),
  };
}

/** FAQPage — واجد شرایط rich result آکاردئونی در نتایج گوگل */
export function faqPageSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(),
      },
    })),
  };
}

/** WebSite + SearchAction — شرط لازم برای sitelinks searchbox */
export function websiteSchema(s: Pick<SiteSettings, 'siteName' | 'locale'>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: s.siteName,
    alternateName: s.locale === 'fa' ? siteConfig.nameEn : siteConfig.name,
    url: absoluteUrl(localizePath('/', s.locale)),
    inLanguage: localeTag[s.locale],
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${absoluteUrl(localizePath('/search', s.locale))}?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/** شماره به فرمت بین‌المللی برای schema: 02186038220 → +982186038220 */
function e164(phone: string) {
  const d = phone.replace(/[۰-۹]/g, (x) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(x))).replace(/\D/g, '');
  return d.startsWith('98') ? `+${d}` : `+98${d.replace(/^0/, '')}`;
}

type ContactSettings = Pick<
  SiteSettings,
  'locale' | 'siteName' | 'siteDescription' | 'legalName' | 'logo' | 'phone' | 'mobile' | 'email' | 'address' | 'companyPhones' | 'factoryAddress' | 'mapUrl' | 'whatsappUrl' | 'rubikaUrl'
>;

/** نام شهر و استان در آدرس پستی schema — به زبان صفحه */
const PLACE_NAMES: Record<Locale, { officeCity: string; officeRegion: string; factoryCity: string; factoryRegion: string; country: string }> = {
  fa: { officeCity: siteConfig.office.city, officeRegion: siteConfig.office.region, factoryCity: siteConfig.factory.city, factoryRegion: siteConfig.factory.region, country: siteConfig.serviceArea },
  en: { officeCity: 'Tehran', officeRegion: 'Tehran', factoryCity: 'Garmsar', factoryRegion: 'Semnan', country: 'Iran' },
};

const officeAddress = (s: ContactSettings) => ({
  '@type': 'PostalAddress',
  streetAddress: s.address,
  addressLocality: PLACE_NAMES[s.locale].officeCity,
  addressRegion: PLACE_NAMES[s.locale].officeRegion,
  addressCountry: 'IR',
});

const factoryPlace = (s: ContactSettings) => ({
  '@type': 'Place',
  name: s.locale === 'fa' ? `کارخانه ${s.legalName}` : `${s.legalName} factory`,
  address: {
    '@type': 'PostalAddress',
    streetAddress: s.factoryAddress,
    addressLocality: PLACE_NAMES[s.locale].factoryCity,
    addressRegion: PLACE_NAMES[s.locale].factoryRegion,
    addressCountry: 'IR',
  },
  geo: { '@type': 'GeoCoordinates', latitude: siteConfig.factory.lat, longitude: siteConfig.factory.lng },
  hasMap: s.mapUrl,
});

/** Organization — شرکت مادر (قدیر لوله پاسارگاد) با دفتر مرکزی و کارخانه */
export function organizationSchema(s: ContactSettings) {
  const phones = s.companyPhones.map(e164);
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${siteConfig.url}/#organization`,
    name: s.siteName,
    legalName: s.legalName,
    alternateName: [siteConfig.name, siteConfig.nameEn, siteConfig.legalName, siteConfig.legalNameEn].filter((n) => n !== s.siteName),
    url: absoluteUrl(localizePath('/', s.locale)),
    logo: absoluteUrl(s.logo),
    image: absoluteUrl(s.logo),
    description: s.siteDescription,
    email: s.email,
    telephone: phones[0] ?? e164(s.phone),
    address: officeAddress(s),
    location: [factoryPlace(s)],
    contactPoint: [
      ...phones.map((telephone) => ({
        '@type': 'ContactPoint',
        telephone,
        contactType: 'sales',
        areaServed: 'IR',
        availableLanguage: [...locales],
      })),
      { '@type': 'ContactPoint', telephone: e164(s.mobile), contactType: 'customer service', areaServed: 'IR', availableLanguage: ['fa'] },
    ],
    sameAs: [s.mapUrl, s.whatsappUrl, s.rubikaUrl].filter(Boolean),
  };
}

/**
 * LocalBusiness — مهم‌ترین schema برای سئوی محلی و نقشه:
 * دفتر فروش تهران + کارخانه و انبار گرمسار (همان مکان ثبت‌شده در گوگل مپ).
 */
export function localBusinessSchema(s: ContactSettings) {
  const phones = s.companyPhones.map(e164);
  const factory = factoryPlace(s);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'HardwareStore',
        '@id': `${siteConfig.url}/#localbusiness`,
        name: s.siteName,
        url: absoluteUrl(localizePath('/', s.locale)),
        image: absoluteUrl(s.logo),
        telephone: phones[0] ?? e164(s.phone),
        email: s.email,
        description:
          s.locale === 'fa'
            ? `فروش آنلاین مستقیم از کارخانه ${s.legalName} — ${s.siteDescription}`
            : `Online sales direct from the ${s.legalName} factory — ${s.siteDescription}`,
        address: officeAddress(s),
        priceRange: '$$',
        currenciesAccepted: 'IRR',
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
            opens: '08:00',
            closes: '18:00',
          },
        ],
        areaServed: { '@type': 'Country', name: PLACE_NAMES[s.locale].country },
        parentOrganization: { '@id': `${siteConfig.url}/#organization` },
      },
      {
        '@type': 'LocalBusiness',
        '@id': `${siteConfig.url}/#factory`,
        name: factory.name,
        url: absoluteUrl(localizePath('/contact', s.locale)),
        image: absoluteUrl(s.logo),
        telephone: phones[0] ?? e164(s.phone),
        description:
          s.locale === 'fa'
            ? `کارخانه تولید لوله دوجداره پلی اتیلن و انبار ${s.legalName}`
            : `${s.legalName} double-wall polyethylene pipe factory and warehouse`,
        address: factory.address,
        geo: factory.geo,
        hasMap: factory.hasMap,
        parentOrganization: { '@id': `${siteConfig.url}/#organization` },
      },
    ],
  };
}
