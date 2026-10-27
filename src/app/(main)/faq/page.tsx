/** سوالات متداول کم عوض می‌شوند. */
export const revalidate = 1800;

import type { Metadata } from 'next';
import { FAQPageClient } from '@/features/faq/FAQPageClient';
import { getPublishedFaqs } from '@/shared/lib/data';
import { siteConfig } from '@/shared/config/site';
import { JsonLd } from '@/shared/ui/JsonLd';
import { breadcrumbSchema, faqPageSchema } from '@/shared/lib/seo';

export const metadata: Metadata = {
  title: 'سوالات متداول خرید لوله و اتصالات',
  description:
    'پاسخ پرتکرارترین سوالات درباره خرید لوله و اتصالات صنعتی، قیمت‌گذاری، نحوه سفارش، ارسال و تحویل در سراسر کشور.',
  alternates: { canonical: `${siteConfig.url}/faq` },
};

export default async function FAQPage() {
  const faqs = await getPublishedFaqs();

  return (
    <>
      {/* FAQPage schema — واجد شرایط نمایش آکاردئونی سوالات زیر نتیجه در گوگل */}
      {faqs.length > 0 && <JsonLd data={faqPageSchema(faqs)} />}
      <JsonLd data={breadcrumbSchema([{ name: 'سوالات متداول', path: '/faq' }])} />
      <FAQPageClient faqs={faqs} />
    </>
  );
}
