import type { Metadata } from 'next';
import { AboutContent } from './AboutContent';
import { siteConfig } from '@/shared/config/site';
import { JsonLd } from '@/shared/ui/JsonLd';
import { breadcrumbSchema, organizationSchema } from '@/shared/lib/seo';
import { getSiteSettingsMap } from '@/shared/lib/data';
import { mergeSiteSettings } from '@/shared/lib/site-settings';

export const metadata: Metadata = {
  title: 'درباره ما | ۲۰ سال تجربه در تامین لوله و اتصالات',
  description:
    'قدیر لوله آنلاین، فروش آنلاین مستقیم از کارخانه قدیر لوله پاسارگاد (گرمسار) — تولید لوله دوجداره پلی اتیلن و تامین لوله پلی اتیلن، پلیکا، منهول، سپتیک تانک و اتصالات با ارسال به سراسر کشور.',
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
