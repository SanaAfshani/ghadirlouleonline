/** دسته‌ها به‌ندرت عوض می‌شوند. */
export const revalidate = 1800;

import type { Metadata } from 'next';
import { CategoriesPageClient } from '@/features/categories/CategoriesPageClient';
import { getPublishedCategories, resolveCategoryImage } from '@/shared/lib/data';
import { siteConfig } from '@/shared/config/site';
import { JsonLd } from '@/shared/ui/JsonLd';
import { breadcrumbSchema } from '@/shared/lib/seo';
import { isComingSoon } from '@/shared/lib/catalog';

export const metadata: Metadata = {
  title: 'دسته‌بندی محصولات | کاروگیت، اسپیرال و اتصالات',
  description:
    'دسته‌بندی محصولات قدیر لوله آنلاین: لوله کاروگیت دوجداره، لوله اسپیرال و اتصالات کاروگیت با قیمت روز کارخانه.',
  alternates: { canonical: `${siteConfig.url}/categories` },
};

export default async function CategoriesPage() {
  const categories = await getPublishedCategories();

  const cards = categories.map((c) => ({
    slug: c.slug,
    name: c.name,
    description: c.description,
    image: resolveCategoryImage(c),
    icon: c.icon,
    productCount: c._count?.products ?? 0,
    comingSoon: isComingSoon(c.slug),
  }));

  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: 'دسته‌بندی محصولات', path: '/categories' }])} />
      <CategoriesPageClient categories={cards} />
    </>
  );
}
