'use client';

import { useState } from 'react';
import Link from 'next/link';
import { m as motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { LivePriceTable } from '@/features/prices/LivePriceTable';
import { MarketStatus } from '@/features/prices/MarketStatus';
import { useLiveBoard } from '@/features/prices/live-store';
import { cn, faDigits } from '@/shared/lib/utils';
import { groupLinesByCategory, type PriceBoard } from '@/shared/lib/price-board-types';

/** جدول «آخرین قیمت‌ها» صفحه اصلی — تب برای هر دسته، به‌روزرسانی لحظه‌ای */
export function LatestPrices({ board: initial }: { board: PriceBoard }) {
  const { board } = useLiveBoard(initial);
  const groups = groupLinesByCategory(board.lines);
  const [active, setActive] = useState(groups[0]?.categorySlug);
  if (!groups.length) return null;
  const line = groups.find((g) => g.categorySlug === active) ?? groups[0];

  return (
    <section id="prices" className="section-padding bg-[var(--card)] border-b border-[var(--border)]" aria-labelledby="prices-title">
      <div className="container-main">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <span className="eyebrow">قیمت روز</span>
            <h2 id="prices-title" className="mt-2 text-[1.35rem] sm:text-3xl font-black">قیمت روز لوله کاروگیت و اسپیرال</h2>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">قیمت نهایی هنگام ثبت سفارش تایید می‌شود.</p>
          </div>
          <MarketStatus market={board.market} className="self-start sm:self-auto" />
        </div>

        <div role="tablist" aria-label="خط محصول" className="snap-row -mx-4 px-4 sm:mx-0 sm:px-0 mb-4">
          {groups.map((g) => (
            <button
              key={g.categorySlug}
              role="tab"
              aria-selected={g.categorySlug === line.categorySlug}
              onClick={() => setActive(g.categorySlug)}
              className={cn(
                'relative h-10 px-4 rounded-lg text-sm font-bold whitespace-nowrap transition-colors',
                g.categorySlug === line.categorySlug ? 'text-[var(--background)]' : 'bg-[var(--background)] border border-[var(--border)] hover:border-[var(--foreground)]/30',
              )}
            >
              {g.categorySlug === line.categorySlug && (
                <motion.span layoutId="price-tab" className="absolute inset-0 rounded-lg bg-[var(--foreground)]" transition={{ type: 'spring', damping: 30, stiffness: 400 }} />
              )}
              <span className="relative">{g.categoryName}</span>
            </button>
          ))}
        </div>

        <div role="tabpanel">
          <LivePriceTable key={line.categorySlug} initial={initial} productIds={line.productIds} showProduct={line.productIds.length > 1} limit={8} searchFrom={9999} caption={`قیمت ${line.categoryName}`} />
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <Link href={line.href} className="inline-flex items-center gap-1.5 h-11 px-5 rounded-xl bg-[var(--foreground)] text-[var(--background)] text-sm font-bold">
            جدول کامل {line.categoryName}
            <span className="opacity-60 num">({faDigits(line.items.length)} ردیف)</span>
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <Link href="/prices" className="text-sm font-bold text-[var(--muted-foreground)] hover:text-[var(--foreground)]">لیست قیمت همه محصولات ←</Link>
        </div>
      </div>
    </section>
  );
}
