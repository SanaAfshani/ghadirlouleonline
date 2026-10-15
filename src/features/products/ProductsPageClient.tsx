'use client';

import { useState } from 'react';
import { m as motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { PageHero } from '@/shared/ui/PageHero';
import { SearchInput } from '@/shared/ui/SearchInput';
import { ProductCard } from '@/features/products/ProductCard';
import type { ProductListItem } from '@/shared/lib/serializers';
import { cn, faDigits, latinDigits } from '@/shared/lib/utils';

type CategoryTab = { slug: string; name: string };

type ProductsPageClientProps = {
  categories: CategoryTab[];
  products: ProductListItem[];
};

export function ProductsPageClient({ categories, products: allProducts }: ProductsPageClientProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [search, setSearch] = useState('');

  const term = latinDigits(search.trim());
  const displayed = allProducts.filter((p) => {
    const matchCategory = activeCategory === 'all' || p.category === activeCategory;
    const matchSearch = !term || latinDigits(p.name).includes(term) || p.categoryName.includes(term);
    return matchCategory && matchSearch;
  });

  return (
    <>
      <PageHero
        label="کاتالوگ محصولات"
        title="لوله و اتصالات"
        description="لوله کاروگیت، پلی اتیلن، پلیکا، منهول، سپتیک تانک، آبیاری قطره‌ای و اتصالات با قیمت روز"
      />

      <div className="container-main py-6 md:py-10">
        <SearchInput value={search} onValueChange={setSearch} placeholder="جستجو در محصولات…" wrapperClassName="mb-4 max-w-xl" className="h-12" />

        <div role="tablist" aria-label="دسته‌بندی" className="snap-row -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap mb-5">
          {categories.map((cat) => (
            <button
              key={cat.slug}
              type="button"
              role="tab"
              aria-selected={activeCategory === cat.slug}
              onClick={() => setActiveCategory(cat.slug)}
              className={cn(
                'relative h-10 px-4 rounded-lg text-sm font-bold whitespace-nowrap transition-colors',
                activeCategory === cat.slug ? 'text-[var(--accent-foreground)]' : 'border border-[var(--border)] hover:border-[var(--accent)]',
              )}
            >
              {activeCategory === cat.slug && (
                <motion.span layoutId="products-tab" className="absolute inset-0 rounded-lg bg-[var(--accent)]" transition={{ type: 'spring', damping: 28, stiffness: 380 }} />
              )}
              <span className="relative">{cat.name}</span>
            </button>
          ))}
        </div>

        <p className="mb-5 text-sm text-[var(--muted-foreground)] num">
          <span className="font-bold text-[var(--foreground)]">{faDigits(displayed.length)}</span> محصول
          {activeCategory !== 'all' && <> در دسته «{categories.find((c) => c.slug === activeCategory)?.name}»</>}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
          {displayed.map((product, i) => (
            <motion.div key={product.id}>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>

        {displayed.length === 0 && (
          <div className="text-center py-20 text-[var(--muted-foreground)]">
            <Search className="w-8 h-8 mx-auto mb-3 opacity-50" />
            <p className="font-semibold text-[var(--foreground)]">محصولی یافت نشد</p>
          </div>
        )}
      </div>
    </>
  );
}
