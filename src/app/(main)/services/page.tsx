import type { Metadata } from 'next';
import { ServicesContent } from './ServicesContent';
import { siteConfig } from '@/shared/config/site';
import { JsonLd } from '@/shared/ui/JsonLd';
import { breadcrumbSchema } from '@/shared/lib/seo';

export const metadata: Metadata = {
  title: 'خدمات | مشاوره فنی، برش لوله و Mill Certificate',
  description:
    'خدمات قدیر لوله آنلاین، تنها نماینده انحصاری قدیر لوله پاسارگاد: مشاوره فنی رایگان، مستندات و گواهینامه‌های کارخانه (ISIRI 9116-3، ISO 9001)، گارانتی کیفیت و ارسال به سراسر ایران.',
  alternates: { canonical: `${siteConfig.url}/services` },
};

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: `خدمات ${siteConfig.name}`,
  serviceType: 'تامین و خدمات فنی لوله و اتصالات صنعتی',
  description:
    'مشاوره فنی رایگان، برش و تبدیل لوله، ارائه Mill Certificate، گارانتی کیفیت و ارسال به سراسر ایران.',
  provider: { '@type': 'Organization', name: siteConfig.name, url: siteConfig.url },
  areaServed: { '@type': 'Country', name: siteConfig.serviceArea },
  url: `${siteConfig.url}/services`,
};

export default function ServicesPage() {
  return (
    <>
      <JsonLd data={serviceSchema} />
      <JsonLd data={breadcrumbSchema([{ name: 'خدمات', path: '/services' }])} />
      <ServicesContent />
    </>
  );
}
