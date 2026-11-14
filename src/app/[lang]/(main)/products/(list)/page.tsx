/** فهرست محصولات با افزودن یا ویرایش محصول عوض می‌شود، نه بیشتر. */
export const revalidate = 900;

import type { Metadata } from 'next';
import { ProductsPageClient } from '@/features/products/ProductsPageClient';
import { getPublishedCategories, getPublishedProducts } from '@/shared/lib/data';
import { JsonLd } from '@/shared/ui/JsonLd';
import { breadcrumbSchema } from '@/shared/lib/seo';
import { localizeRecord } from '@/shared/lib/translations';
import { resolveLocale } from '@/shared/i18n/server';
import { getSection } from '@/shared/content/server';
import { staticPageMetadata } from '@/shared/content/metadata';
import { productsHero, productsSeo } from '@/shared/content/pages/products';

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await resolveLocale(params);
  return staticPageMetadata(await getSection(productsSeo, locale), '/products', locale);
}

export default async function ProductsPage({ params }: Props) {
  const locale = await resolveLocale(params);
  const [dbCategories, products, hero] = await Promise.all([
    getPublishedCategories(),
    getPublishedProducts({ locale }),
    getSection(productsHero, locale),
  ]);

  const categories = dbCategories.map((category) => {
    const c = localizeRecord(category, locale, 'name');
    return { slug: c.slug, name: c.name, description: c.description };
  });

  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: hero.label, path: '/products' }], locale)} />
      <ProductsPageClient hero={hero} categories={categories} products={products} />
    </>
  );
}
