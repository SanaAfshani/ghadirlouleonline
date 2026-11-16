/** تابلوی قیمت دارد؛ کوتاه نگه داشته می‌شود. جدول سمت کلاینت هر ۵ ثانیه خودش تازه می‌شود. */
export const revalidate = 300;

import type { Metadata } from 'next';
import { HeroSection } from '@/widgets/home/HeroSection';
import { Reveal } from '@/shared/ui/Reveal';
import { LatestPrices } from '@/widgets/home/LatestPrices';
import { ProductLinesSection } from '@/widgets/home/ProductLinesSection';
import { ServicesSection } from '@/widgets/home/ServicesSection';
import { FactorySection } from '@/widgets/home/FactorySection';
import { BlogPreview } from '@/widgets/home/BlogPreview';
import { SeoContent } from '@/widgets/home/SeoContent';
import {
  getNavCategories,
  getPublishedBlogPosts,
  getSiteSettingsMap,
} from '@/shared/lib/data';
import { mergeSiteSettings } from '@/shared/lib/site-settings';
import { getPriceBoard } from '@/shared/lib/price-board';
import { localizeRecord } from '@/shared/lib/translations';
import { JsonLd } from '@/shared/ui/JsonLd';
import { absoluteUrl, localBusinessSchema, organizationSchema, websiteSchema } from '@/shared/lib/seo';
import { localizePath } from '@/shared/i18n/config';
import { localeAlternates, resolveLocale } from '@/shared/i18n/server';
import { getSection } from '@/shared/content/server';
import { homeBlog, homeFactory, homeHero, homePrices, homeProductLines, homeSeo, homeServices } from '@/shared/content/pages/home';
import { ogImage } from '@/shared/lib/og-image';

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const [seo, raw] = await Promise.all([getSection(homeSeo, locale), getSiteSettingsMap()]);
  const settings = mergeSiteSettings(raw, locale);
  return {
    // absolute: وگرنه قالب «%s | نام سایت» لایه روت نام سایت را دوباره اضافه می‌کند
    title: { absolute: seo.metaTitle },
    description: seo.metaDescription,
    ...localeAlternates('/', locale),
    openGraph: {
      title: seo.metaTitle,
      description: seo.metaDescription,
      url: absoluteUrl(localizePath('/', locale)),
      type: 'website',
      // openGraph صفحه جایگزین openGraph روت می‌شود و تصویر opengraph-image.tsx را با خودش می‌برد
      images: ogImage(settings.siteName, locale),
    },
  };
}

export default async function HomePage({ params }: Props) {
  const locale = await resolveLocale(params);
  const [categories, board, posts, rawSettings, hero, prices, productLines, services, blog, factory] = await Promise.all([
    getNavCategories(locale),
    getPriceBoard(locale),
    getPublishedBlogPosts({ limit: 3 }),
    getSiteSettingsMap(),
    getSection(homeHero, locale),
    getSection(homePrices, locale),
    getSection(homeProductLines, locale),
    getSection(homeServices, locale),
    getSection(homeBlog, locale),
    getSection(homeFactory, locale),
  ]);
  const settings = mergeSiteSettings(rawSettings, locale);

  return (
    <>
      <JsonLd data={organizationSchema(settings)} />
      <JsonLd data={localBusinessSchema(settings)} />
      <JsonLd data={websiteSchema(settings)} />
      <HeroSection categories={categories} board={board} content={hero} />
      {/*
        بخش‌هایی که خودشان انیمیشن ورود دارند (ServicesSection
        و تیترها) دست‌نخورده می‌مانند؛ بقیه با همان حرکت داخل Reveal می‌آیند تا کل صفحه یکدست باشد.
        هرو پوشانده نمی‌شود — اولین چیز صفحه است و نباید منتظر اسکرول بماند.
      */}
      <Reveal>
        <LatestPrices board={board} content={prices} />
      </Reveal>
      <ProductLinesSection categories={categories} content={productLines} locale={locale} />
      <ServicesSection content={services} />
      <Reveal>
        <BlogPreview posts={posts.map((post) => localizeRecord(post, locale, 'title'))} content={blog} locale={locale} />
      </Reveal>
      <Reveal>
        <FactorySection
          content={factory}
          locale={locale}
          exclusiveTitle={settings.exclusiveTitle}
          address={settings.address}
          factoryAddress={settings.factoryAddress}
          companyPhones={settings.companyPhones}
          mapUrl={settings.mapUrl}
          certificates={settings.certificates}
        />
      </Reveal>
      <Reveal>
        <SeoContent html={settings.homeSeoContent} />
      </Reveal>
    </>
  );
}
