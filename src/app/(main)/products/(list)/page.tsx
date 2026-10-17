export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { ProductsPageClient } from '@/features/products/ProductsPageClient';
import { getPublishedCategories, getPublishedProducts } from '@/shared/lib/data';
import { siteConfig } from '@/shared/config/site';
import { JsonLd } from '@/shared/ui/JsonLd';
import { breadcrumbSchema } from '@/shared/lib/seo';

export const metadata: Metadata = {
  title: 'محصولات | خرید لوله کاروگیت و لوله آب و فاضلاب',
  description:
    'لوله کاروگیت، پلی اتیلن، پلیکا، منهول، سپتیک تانک و اتصالات با قیمت روز، مستقیم از کارخانه و ارسال به سراسر ایران.',
  alternates: { canonical: `${siteConfig.url}/products` },
};

export default async function ProductsPage() {
  const [dbCategories, products] = await Promise.all([
    getPublishedCategories(),
    getPublishedProducts(),
  ]);

  const categories = [
    { slug: 'all', name: 'همه محصولات' },
    ...dbCategories.map((c) => ({ slug: c.slug, name: c.name })),
  ];

  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: 'محصولات', path: '/products' }])} />
      <ProductsPageClient categories={categories} products={products} />
    </>
  );
}
