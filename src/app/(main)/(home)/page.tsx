export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { HeroSection } from '@/widgets/home/HeroSection';
import { Reveal } from '@/shared/ui/Reveal';
import { CategoriesSection } from '@/widgets/home/CategoriesSection';
import { LatestPrices } from '@/widgets/home/LatestPrices';
import { FeaturedProducts } from '@/widgets/home/FeaturedProducts';
import { ServicesSection } from '@/widgets/home/ServicesSection';
import { BrandsSection } from '@/widgets/home/BrandsSection';
import { FactorySection } from '@/widgets/home/FactorySection';
import { BlogPreview } from '@/widgets/home/BlogPreview';
import { SeoContent } from '@/widgets/home/SeoContent';
import {
  getNavCategories,
  getPublishedBlogPosts,
  getPublishedProducts,
  getSiteSettingsMap,
} from '@/shared/lib/data';
import { mergeSiteSettings } from '@/shared/lib/site-settings';
import { getPriceBoard } from '@/shared/lib/price-board';
import { siteConfig } from '@/shared/config/site';
import { JsonLd } from '@/shared/ui/JsonLd';
import { localBusinessSchema, organizationSchema, websiteSchema } from '@/shared/lib/seo';

const HOME_TITLE = 'خرید لوله کاروگیت با قیمت روز | نماینده انحصاری قدیر لوله پاسارگاد';
const HOME_DESCRIPTION =
  'قدیر لوله آنلاین، تنها نماینده انحصاری قدیر لوله پاسارگاد: قیمت روز لوله کاروگیت دوجداره با استاندارد ISIRI 9116 و ISO 9001، تامین پروژه‌ای و ارسال از کارخانه گرمسار به سراسر ایران.';

export const metadata: Metadata = {
  // absolute: وگرنه قالب «%s | نام سایت» لایه روت نام سایت را دوباره اضافه می‌کند
  title: { absolute: HOME_TITLE },
  description: HOME_DESCRIPTION,
  alternates: { canonical: siteConfig.url },
  openGraph: {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    url: siteConfig.url,
    type: 'website',
  },
};

export default async function HomePage() {
  const [categories, board, products, posts, rawSettings] = await Promise.all([
    getNavCategories(),
    getPriceBoard(),
    getPublishedProducts({ limit: 8, withImage: true }),
    getPublishedBlogPosts({ limit: 3 }),
    getSiteSettingsMap(),
  ]);
  const settings = mergeSiteSettings(rawSettings);

  return (
    <>
      <JsonLd data={organizationSchema(settings)} />
      <JsonLd data={localBusinessSchema(settings)} />
      <JsonLd data={websiteSchema()} />
      <HeroSection categories={categories} board={board} />
      {/*
        بخش‌هایی که خودشان انیمیشن ورود دارند (CategoriesSection، FeaturedProducts، ServicesSection
        و تیترها) دست‌نخورده می‌مانند؛ بقیه با همان حرکت داخل Reveal می‌آیند تا کل صفحه یکدست باشد.
        هرو پوشانده نمی‌شود — اولین چیز صفحه است و نباید منتظر اسکرول بماند.
      */}
      <Reveal>
        <LatestPrices board={board} />
      </Reveal>
      <CategoriesSection categories={categories} />
      <FeaturedProducts products={products} />
      <ServicesSection />
      <Reveal>
        <BrandsSection />
      </Reveal>
      <Reveal>
        <BlogPreview posts={posts} />
      </Reveal>
      <Reveal>
        <FactorySection address={settings.address} factoryAddress={settings.factoryAddress} companyPhones={settings.companyPhones} mapUrl={settings.mapUrl} certificates={settings.certificates} />
      </Reveal>
      <Reveal>
        <SeoContent html={settings.homeSeoContent} />
      </Reveal>
    </>
  );
}
