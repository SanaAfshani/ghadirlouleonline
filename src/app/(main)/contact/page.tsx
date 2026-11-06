import type { Metadata } from 'next';
import { ContactPageClient, type ContactInfoItem, type ContactLocation } from '@/features/contact/ContactPageClient';
import { getSiteSettingsMap } from '@/shared/lib/data';
import { mergeSiteSettings, phoneHref } from '@/shared/lib/site-settings';
import { siteConfig } from '@/shared/config/site';
import { JsonLd } from '@/shared/ui/JsonLd';
import { breadcrumbSchema, faqPageSchema, localBusinessSchema } from '@/shared/lib/seo';
import { FACTORY_FAQS, FactoryAbout, factorySchema } from '@/features/contact/FactoryAbout';
import { FaqAccordion } from '@/shared/ui/FaqAccordion';

export const metadata: Metadata = {
  title: 'تماس با ما | خرید لوله کاروگیت و اسپیرال',
  description:
    `تماس با ${siteConfig.name}، ${siteConfig.exclusiveTitle}: فروش و سفارش عمده ${siteConfig.mobile} (تماس، واتس‌اپ و روبیکا)، دفتر ${siteConfig.companyPhones[0]}، دفتر تهران و کارخانه گرمسار.`,
  alternates: { canonical: `${siteConfig.url}/contact` },
};

export default async function ContactPage() {
  const settings = mergeSiteSettings(await getSiteSettingsMap());

  const contactInfo: ContactInfoItem[] = [
    {
      icon: 'phone',
      title: `تلفن دفتر مرکزی ${siteConfig.legalName}`,
      items: settings.companyPhones.map((p) => ({ text: p, href: phoneHref(p), ltr: true })),
    },
    {
      icon: 'phone',
      title: `فروش و سفارش عمده — ${siteConfig.salesExpert.name} (تماس، واتس‌اپ و روبیکا)`,
      items: [settings.phone, settings.mobile]
        .filter((p, i, all) => p && all.indexOf(p) === i)
        .map((p) => ({ text: p, href: phoneHref(p), ltr: true })),
    },
    { icon: 'rubika', title: 'پیام‌رسان روبیکا', items: [{ text: siteConfig.socials.rubikaId, ltr: true }] },
    { icon: 'mail', title: 'ایمیل', items: [{ text: settings.email, href: `mailto:${settings.email}`, ltr: true }] },
    { icon: 'clock', title: 'ساعت کاری دفتر فروش', items: [{ text: siteConfig.workingHours }, { text: 'جمعه: تعطیل' }] },
  ];

  const locations: ContactLocation[] = [
    { kind: 'office', title: 'دفتر مرکزی و فروش', address: settings.address },
    {
      kind: 'factory',
      title: 'کارخانه و انبار',
      address: settings.factoryAddress,
      mapUrl: settings.mapUrl,
      embedUrl: `https://maps.google.com/maps?q=${siteConfig.factory.lat},${siteConfig.factory.lng}&z=15&hl=fa&output=embed`,
    },
  ];

  return (
    <>
      {/* تکرار LocalBusiness در صفحه تماس — گوگل این صفحه را منبع اصلی اطلاعات تماس می‌داند */}
      <JsonLd data={localBusinessSchema(settings)} />
      <JsonLd data={breadcrumbSchema([{ name: 'تماس با ما', path: '/contact' }])} />
      <JsonLd data={factorySchema} />
      <JsonLd data={faqPageSchema(FACTORY_FAQS)} />
      {/* اول راه‌های تماس و فرم، بعد آدرس و نقشه، بعد معرفی کارخانه و آخر سوالات متداول */}
      <ContactPageClient contactInfo={contactInfo} locations={locations} whatsappUrl={settings.whatsappUrl} about={<FactoryAbout />} />
      <div className="container-main pb-12 [&>section]:mt-0">
        <FaqAccordion faqs={FACTORY_FAQS} />
      </div>
    </>
  );
}
