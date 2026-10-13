import type { Metadata } from 'next';
import { ContactPageClient, type ContactInfoItem, type ContactLocation } from '@/features/contact/ContactPageClient';
import { getSiteSettingsMap } from '@/shared/lib/data';
import { mergeSiteSettings, phoneHref } from '@/shared/lib/site-settings';
import { siteConfig } from '@/shared/config/site';
import { JsonLd } from '@/shared/ui/JsonLd';
import { breadcrumbSchema, localBusinessSchema } from '@/shared/lib/seo';

export const metadata: Metadata = {
  title: 'تماس با ما | آدرس کارخانه و دفتر مرکزی',
  description:
    `راه‌های ارتباط با ${siteConfig.legalName}: تلفن دفتر مرکزی ${siteConfig.companyPhones[0]}، آدرس دفتر تهران (شادآباد) و کارخانه و انبار شهرک صنعتی گرمسار. استعلام قیمت لوله و مسیریابی روی نقشه.`,
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
      title: 'کارشناس فروش (تماس و واتس‌اپ)',
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
      <ContactPageClient contactInfo={contactInfo} locations={locations} whatsappUrl={settings.whatsappUrl} />
    </>
  );
}
