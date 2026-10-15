'use client';

import { useState } from 'react';
import Link from 'next/link';
import { m as motion } from 'framer-motion';
import { ChevronLeft, Search } from 'lucide-react';
import { SearchInput } from '@/shared/ui/SearchInput';
import { useConsult } from '@/features/consult/ConsultProvider';
import { ProductCard } from '@/features/products/ProductCard';
import { LivePriceTable } from '@/features/prices/LivePriceTable';
import { MarketStatus } from '@/features/prices/MarketStatus';
import type { ProductListItem } from '@/shared/lib/serializers';
import type { PriceBoard } from '@/shared/lib/price-board-types';
import { faDigits, latinDigits } from '@/shared/lib/utils';

type CategoryInfo = {
  slug: string;
  name: string;
  description: string | null;
  image: string | null;
  productCount: number;
  /** دسته فعلاً فروش ندارد */
  comingSoon: boolean;
};

type Props = {
  category: CategoryInfo;
  products: ProductListItem[];
  board: PriceBoard;
  priceProductIds: string[];
};

export function CategoryProductsClient({ category, products, board, priceProductIds }: Props) {
  const [search, setSearch] = useState('');
  const { open } = useConsult();

  const term = latinDigits(search.trim());
  const filtered = products.filter(
    (p) => !term || latinDigits(p.name).includes(term) || Object.values(p.specs).some((v) => latinDigits(v).includes(term)),
  );

  return (
    <div>
      <div className="relative overflow-hidden bg-[var(--ink)] text-white">
        <div className="absolute inset-0 bp-grid bp-grid-fade" />
        <div className="container-main relative z-10 py-7 sm:py-12">
          <nav aria-label="مسیر صفحه" className="flex items-center gap-1.5 text-xs text-slate-400 mb-4 overflow-x-auto no-scrollbar whitespace-nowrap">
            <Link href="/" className="hover:text-white">خانه</Link>
            <ChevronLeft className="w-3 h-3 shrink-0" />
            <Link href="/products" className="hover:text-white">محصولات</Link>
            <ChevronLeft className="w-3 h-3 shrink-0" />
            <span className="text-[var(--accent-text)]">{category.name}</span>
          </nav>
          <motion.div>
            <span className="h-7 px-3 rounded-lg border border-[var(--accent)]/40 bg-[var(--accent)]/10 text-[var(--accent-text)] text-xs font-bold inline-flex items-center num">
              {category.comingSoon ? 'به زودی' : `${faDigits(products.length)} محصول`}
            </span>
            <h1 className="mt-3 text-[1.7rem] sm:text-4xl font-black text-white">خرید {category.name}</h1>
            {category.description && <p className="mt-2 text-slate-300 text-sm sm:text-base leading-8 max-w-2xl">{faDigits(category.description)}</p>}
          </motion.div>
        </div>
      </div>

      <div className="container-main py-6 sm:py-10">
        {category.comingSoon && (
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent)]/8 px-4 py-3">
            <p className="text-sm leading-7">
              <span className="font-bold">عرضه {category.name} به زودی آغاز می‌شود.</span>{' '}
              <span className="text-[var(--muted-foreground)]">برای استعلام قیمت و اطلاع از زمان عرضه درخواست ثبت کنید.</span>
            </p>
            <button type="button" onClick={() => open(category.name)} className="shrink-0 h-10 px-5 rounded-xl bg-[var(--foreground)] text-[var(--background)] text-sm font-bold">
              استعلام قیمت
            </button>
          </div>
        )}
        {products.length > 4 && (
          <SearchInput value={search} onValueChange={setSearch} placeholder={`جستجو در ${category.name}…`} wrapperClassName="mb-6 max-w-md" />
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {filtered.map((product, i) => (
            <motion.div key={product.id}>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-[var(--muted-foreground)]">
            <Search className="w-8 h-8 mx-auto mb-3 opacity-50" />
            <p className="font-semibold text-[var(--foreground)]">محصولی یافت نشد</p>
          </div>
        )}

        {priceProductIds.length > 0 && (
          <section className="mt-14" aria-labelledby="category-prices">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 id="category-prices" className="text-xl sm:text-2xl font-black">قیمت روز {category.name}</h2>
              <MarketStatus market={board.market} />
            </div>
            <LivePriceTable initial={board} productIds={priceProductIds} showProduct={priceProductIds.length > 1} caption={`قیمت ${category.name}`} toolbar />
          </section>
        )}
      </div>
    </div>
  );
}
