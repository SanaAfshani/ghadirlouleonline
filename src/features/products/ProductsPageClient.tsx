'use client';

import { useState } from 'react';
import { Link } from '@/shared/i18n/Link';
import { m as motion } from 'framer-motion';
import { ChevronLeft, Search } from 'lucide-react';
import { PageHero } from '@/shared/ui/PageHero';
import { SearchInput } from '@/shared/ui/SearchInput';
import { ProductCard } from '@/features/products/ProductCard';
import { groupCategories } from '@/shared/config/product-lines';
import type { ProductListItem } from '@/shared/lib/serializers';
import { latinDigits } from '@/shared/lib/utils';
import { useLocale, useMessages } from '@/shared/i18n/LocaleProvider';
import { defineMessages, fill } from '@/shared/i18n/messages';
import { digits } from '@/shared/i18n/format';
import type { ContentOf } from '@/shared/content/types';
import type { productsHero } from '@/shared/content/pages/products';

const messages = defineMessages({
  fa: {
    searchPlaceholder: 'جستجو: مثلاً ۴۰۰ یا کوپلر…',
    categoryLink: 'جدول قیمت و راهنمای {name}',
    empty: 'محصولی یافت نشد',
  },
  en: {
    searchPlaceholder: 'Search, e.g. 400 or coupler…',
    categoryLink: '{name}: price table and guide',
    empty: 'No products found',
  },
});

type CategoryInfo = { slug: string; name: string; description: string | null };

type ProductsPageClientProps = {
  hero: ContentOf<typeof productsHero>;
  categories: CategoryInfo[];
  products: ProductListItem[];
};

/**
 * تنها صفحه جامع محصولات (/categories هم به همین‌جا می‌آید): به‌جای شبکه تخت همه محصولات با تب دسته،
 * هر گروه یک بخش است — «لوله و اتصالات کاروگیت» و «لوله اسپیرال» — و هر دسته کارت‌های سایزهایش را دارد.
 */
export function ProductsPageClient({ hero, categories, products }: ProductsPageClientProps) {
  const locale = useLocale();
  const t = useMessages(messages);
  const [search, setSearch] = useState('');
  const term = latinDigits(search.trim()).toLowerCase();
  const matches = (p: ProductListItem) =>
    !term || latinDigits(p.name).toLowerCase().includes(term) || p.categoryName.toLowerCase().includes(term);
  const groups = groupCategories(categories, locale);
  const total = products.filter(matches).length;

  return (
    <>
      <PageHero label={hero.label} title={hero.title} description={hero.description} />

      <div className="container-main py-6 md:py-10">
        <SearchInput value={search} onValueChange={setSearch} placeholder={t.searchPlaceholder} wrapperClassName="mb-8 max-w-xl" className="h-12" />

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
                        <p className="mt-1 text-sm leading-7 text-[var(--muted-foreground)]">{digits(category.description, locale)}</p>
                      )}
                    </div>
                    {/* روی گوشی باریک متن انگلیسی بلندتر است؛ فقط از sm به بالا جمع نشود */}
                    <Link href={`/products/${category.slug}`} className="min-w-0 text-sm font-bold text-[var(--accent-text)] flex items-center gap-1 sm:shrink-0">
                      <span className="min-w-0">{fill(t.categoryLink, { name: category.name })}</span> <ChevronLeft className="w-4 h-4 shrink-0 ltr:rotate-180" />
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
            <p className="font-semibold text-[var(--foreground)]">{t.empty}</p>
          </div>
        )}
      </div>
    </>
  );
}
