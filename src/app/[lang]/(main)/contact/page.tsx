import type { Metadata } from 'next';
import { ContactPageClient, type ContactInfoItem, type ContactLocation } from '@/features/contact/ContactPageClient';
import { getSiteSettingsMap } from '@/shared/lib/data';
import { mergeSiteSettings, phoneHref } from '@/shared/lib/site-settings';
import { siteConfig } from '@/shared/config/site';
import { JsonLd } from '@/shared/ui/JsonLd';
import { breadcrumbSchema, faqPageSchema, localBusinessSchema } from '@/shared/lib/seo';
import { FactoryAbout, factorySchema } from '@/features/contact/FactoryAbout';
import { FaqAccordion } from '@/shared/ui/FaqAccordion';
import { resolveLocale } from '@/shared/i18n/server';
import { fill } from '@/shared/i18n/messages';
import { getSection } from '@/shared/content/server';
import { staticPageMetadata } from '@/shared/content/metadata';
import {
  contactChannels,
  contactFactory,
  contactFaq,
  contactHero,
  contactLocations,
  contactProjectCta,
  contactSeo,
} from '@/shared/content/pages/contact';

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const [seo, raw] = await Promise.all([getSection(contactSeo, locale), getSiteSettingsMap()]);
  const settings = mergeSiteSettings(raw, locale);
  const metaDescription = fill(seo.metaDescription, { mobile: settings.mobile, officePhone: settings.companyPhones[0] ?? settings.phone });
  return staticPageMetadata({ ...seo, metaDescription }, '/contact', locale);
}

export default async function ContactPage({ params }: Props) {
  const locale = await resolveLocale(params);
  const [raw, hero, channels, projectCta, locationsText, factory, faq] = await Promise.all([
    getSiteSettingsMap(),
    getSection(contactHero, locale),
    getSection(contactChannels, locale),
    getSection(contactProjectCta, locale),
    getSection(contactLocations, locale),
    getSection(contactFactory, locale),
    getSection(contactFaq, locale),
  ]);
  const settings = mergeSiteSettings(raw, locale);

  const contactInfo: ContactInfoItem[] = [
    {
      icon: 'phone',
      title: channels.officePhonesTitle,
      items: settings.companyPhones.map((p) => ({ text: p, href: phoneHref(p), ltr: true })),
    },
    {
      icon: 'phone',
      title: fill(channels.salesTitle, { name: settings.salesExpertName }),
      items: [settings.phone, settings.mobile]
        .filter((p, i, all) => p && all.indexOf(p) === i)
        .map((p) => ({ text: p, href: phoneHref(p), ltr: true })),
    },
    { icon: 'rubika', title: channels.rubikaTitle, items: [{ text: settings.rubikaId, ltr: true }] },
    { icon: 'mail', title: channels.emailTitle, items: [{ text: settings.email, href: `mailto:${settings.email}`, ltr: true }] },
    { icon: 'clock', title: channels.hoursTitle, items: [{ text: settings.workingHours }, { text: channels.closedNote }] },
  ];

  const locations: ContactLocation[] = [
    { kind: 'office', title: locationsText.officeTitle, address: settings.address },
    {
      kind: 'factory',
      title: locationsText.factoryTitle,
      address: settings.factoryAddress,
      mapUrl: settings.mapUrl,
      embedUrl: `https://maps.google.com/maps?q=${siteConfig.factory.lat},${siteConfig.factory.lng}&z=15&hl=${locale}&output=embed`,
    },
  ];

  // آکاردئون و FAQPage گوگل از یک فهرست؛ آدرس‌ها از تنظیمات سایت
  const faqs = faq.items.map(({ question, answer }) => ({
    question,
    answer: fill(answer, { factoryAddress: settings.factoryAddress, officeAddress: settings.address }),
  }));

  return (
    <>
      {/* تکرار LocalBusiness در صفحه تماس — گوگل این صفحه را منبع اصلی اطلاعات تماس می‌داند */}
      <JsonLd data={localBusinessSchema(settings)} />
      <JsonLd data={breadcrumbSchema([{ name: hero.label, path: '/contact' }], locale)} />
      <JsonLd data={factorySchema(settings)} />
      <JsonLd data={faqPageSchema(faqs)} />
      {/* اول راه‌های تماس و فرم، بعد آدرس و نقشه، بعد معرفی کارخانه و آخر سوالات متداول */}
      <ContactPageClient
        contactInfo={contactInfo}
        locations={locations}
        whatsappUrl={settings.whatsappUrl}
        hero={hero}
        channels={channels}
        projectCta={projectCta}
        locationsText={locationsText}
        about={<FactoryAbout content={factory} />}
      />
      <div className="container-main pb-12 [&>section]:mt-0">
        <FaqAccordion faqs={faqs} />
      </div>
    </>
  );
}
