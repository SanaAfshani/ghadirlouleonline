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
  title: `تماس با ما | ${siteConfig.exclusiveTitle}`,
  description:
    `تماس با ${siteConfig.name}، ${siteConfig.exclusiveTitle}: تلفن ${siteConfig.companyPhones[0]}، دفتر تهران (شادآباد) و کارخانه گرمسار. معرفی کارخانه از ۱۳۹۱، استاندارد ISIRI 9116-3 و ابعاد لوله کاروگیت.`,
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
      title: `${siteConfig.salesExpert.role}: ${siteConfig.salesExpert.name} (تماس و واتس‌اپ)`,
      items: [settings.phone, settings.mobile]
        .filter((p, i, all) => p && all.indexOf(p) === i)
        .map((p) => ({ text: p, href: phoneHref(p), ltr: true })),
    },
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
      {/* اول معرفی کارخانه، بعد راه‌های تماس و نقشه، آخر سوالات متداول */}
      <ContactPageClient contactInfo={contactInfo} locations={locations} whatsappUrl={settings.whatsappUrl} intro={<FactoryAbout />} />
      <div className="container-main pb-12 [&>section]:mt-0">
        <FaqAccordion faqs={FACTORY_FAQS} />
      </div>
    </>
  );
}
