/** سوالات متداول کم عوض می‌شوند. */
export const revalidate = 1800;

import type { Metadata } from 'next';
import { FAQPageClient } from '@/features/faq/FAQPageClient';
import { getPublishedFaqs } from '@/shared/lib/data';
import { JsonLd } from '@/shared/ui/JsonLd';
import { breadcrumbSchema, faqPageSchema } from '@/shared/lib/seo';
import { resolveLocale } from '@/shared/i18n/server';
import { localizeRecord } from '@/shared/lib/translations';
import { getSection } from '@/shared/content/server';
import { staticPageMetadata } from '@/shared/content/metadata';
import { faqCta, faqHero, faqSeo } from '@/shared/content/pages/faq';

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await resolveLocale(params);
  return staticPageMetadata(await getSection(faqSeo, locale), '/faq', locale);
}

export default async function FAQPage({ params }: Props) {
  const locale = await resolveLocale(params);
  const [rawFaqs, hero, cta] = await Promise.all([getPublishedFaqs(), getSection(faqHero, locale), getSection(faqCta, locale)]);
  const faqs = rawFaqs.map((f) => localizeRecord(f, locale, 'question'));

  return (
    <>
      {/* FAQPage schema — واجد شرایط نمایش آکاردئونی سوالات زیر نتیجه در گوگل */}
      {faqs.length > 0 && <JsonLd data={faqPageSchema(faqs)} />}
      <JsonLd data={breadcrumbSchema([{ name: hero.label, path: '/faq' }], locale)} />
      <FAQPageClient faqs={faqs} hero={hero} cta={cta} />
    </>
  );
}
