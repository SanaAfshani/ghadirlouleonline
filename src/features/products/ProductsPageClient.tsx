'use client';

import { useState } from 'react';
import Link from 'next/link';
import { m as motion } from 'framer-motion';
import { ChevronLeft, Search } from 'lucide-react';
import { PageHero } from '@/shared/ui/PageHero';
import { SearchInput } from '@/shared/ui/SearchInput';
import { ProductCard } from '@/features/products/ProductCard';
import { groupCategories } from '@/shared/config/product-lines';
import type { ProductListItem } from '@/shared/lib/serializers';
import { faDigits, latinDigits } from '@/shared/lib/utils';

type CategoryInfo = { slug: string; name: string; description: string | null };

type ProductsPageClientProps = {
  categories: CategoryInfo[];
  products: ProductListItem[];
};

/**
 * تنها صفحه جامع محصولات (/categories هم به همین‌جا می‌آید): به‌جای شبکه تخت همه محصولات با تب دسته،
 * هر گروه یک بخش است — «لوله و اتصالات کاروگیت» و «لوله اسپیرال» — و هر دسته کارت‌های سایزهایش را دارد.
 */
export function ProductsPageClient({ categories, products }: ProductsPageClientProps) {
  const [search, setSearch] = useState('');
  const term = latinDigits(search.trim());
  const matches = (p: ProductListItem) => !term || latinDigits(p.name).includes(term) || p.categoryName.includes(term);
  const groups = groupCategories(categories);
  const total = products.filter(matches).length;

  return (
    <>
      <PageHero
        label="محصولات"
        title="لوله کاروگیت، اسپیرال و اتصالات"
        description="هر سایز صفحه، مشخصات فنی و قیمت روز خودش را دارد. سایز را انتخاب کنید یا جستجو کنید."
      />

      <div className="container-main py-6 md:py-10">
        <SearchInput value={search} onValueChange={setSearch} placeholder="جستجو: مثلاً ۴۰۰ یا کوپلر…" wrapperClassName="mb-8 max-w-xl" className="h-12" />

        {groups.map((g) => {
          const sections = g.categories
            .map((c) => ({ category: c, items: products.filter((p) => p.category === c.slug && matches(p)) }))
            .filter((s) => s.items.length);
          if (!sections.length) return null;
          return (
            <section key={g.title} className="mb-14 last:mb-0" aria-labelledby={`group-${g.categories[0].slug}`}>
              <h2 id={`group-${g.categories[0].slug}`} className="text-2xl sm:text-3xl font-black mb-6">{g.title}</h2>
              {sections.map(({ category, items }) => (
                <div key={category.slug} className="mb-10 last:mb-0">
                  <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
                    <div className="max-w-2xl">
                      <h3 className="text-lg sm:text-xl font-black">{category.name}</h3>
                      {category.description && (
                        <p className="mt-1 text-sm leading-7 text-[var(--muted-foreground)]">{faDigits(category.description)}</p>
                      )}
                    </div>
                    <Link href={`/products/${category.slug}`} className="text-sm font-bold text-[var(--accent-text)] flex items-center gap-1 shrink-0">
                      جدول قیمت و راهنمای {category.name} <ChevronLeft className="w-4 h-4" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
                    {items.map((product) => (
                      <motion.div key={product.id}>
                        <ProductCard product={product} />
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          );
        })}

        {total === 0 && (
          <div className="text-center py-20 text-[var(--muted-foreground)]">
            <Search className="w-8 h-8 mx-auto mb-3 opacity-50" />
            <p className="font-semibold text-[var(--foreground)]">محصولی یافت نشد</p>
          </div>
        )}
      </div>
    </>
  );
}
