import type { Metadata } from 'next';
import { AboutContent } from './AboutContent';
import { siteConfig } from '@/shared/config/site';
import { JsonLd } from '@/shared/ui/JsonLd';
import { breadcrumbSchema, organizationSchema } from '@/shared/lib/seo';
import { getSiteSettingsMap } from '@/shared/lib/data';
import { mergeSiteSettings } from '@/shared/lib/site-settings';

export const metadata: Metadata = {
  title: 'درباره ما | نماینده رسمی قدیر لوله پاسارگاد',
  description:
    'قدیر لوله آنلاین، نماینده انحصاری قدیر لوله پاسارگاد: فروش لوله کاروگیت دوجداره، لوله اسپیرال و اتصالات کاروگیت با ارسال به سراسر کشور.',
  alternates: { canonical: `${siteConfig.url}/about` },
};

export default async function AboutPage() {
  const settings = mergeSiteSettings(await getSiteSettingsMap());
  return (
    <>
      <JsonLd data={organizationSchema(settings)} />
      <JsonLd data={breadcrumbSchema([{ name: 'درباره ما', path: '/about' }])} />
      <AboutContent />
    </>
  );
}
