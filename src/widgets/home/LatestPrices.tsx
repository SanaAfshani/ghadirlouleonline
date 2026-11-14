'use client';

import { useState } from 'react';
import { m as motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { LivePriceTable } from '@/features/prices/LivePriceTable';
import { MarketStatus } from '@/features/prices/MarketStatus';
import { useLiveBoard } from '@/features/prices/live-store';
import { cn } from '@/shared/lib/utils';
import { groupLinesByCategory, type PriceBoard } from '@/shared/lib/price-board-types';
import { Link } from '@/shared/i18n/Link';
import { useLocale } from '@/shared/i18n/LocaleProvider';
import { defineMessages, fill } from '@/shared/i18n/messages';
import { digits } from '@/shared/i18n/format';
import type { ContentOf } from '@/shared/content/types';
import type { homePrices } from '@/shared/content/pages/home';

const messages = defineMessages({
  fa: { lines: 'خط محصول', caption: 'قیمت {name}', fullTable: 'جدول کامل {name}', rows: '({n} ردیف)' },
  en: { lines: 'Product line', caption: '{name} prices', fullTable: 'Full {name} price table', rows: '({n} rows)' },
});

/** جدول «آخرین قیمت‌ها» صفحه اصلی — تب برای هر دسته، به‌روزرسانی لحظه‌ای */
export function LatestPrices({ board: initial, content }: { board: PriceBoard; content: ContentOf<typeof homePrices> }) {
  const { board } = useLiveBoard(initial);
  const locale = useLocale();
  const t = messages[locale];
  const groups = groupLinesByCategory(board.lines);
  const [active, setActive] = useState(groups[0]?.categorySlug);
  if (!groups.length) return null;
  const line = groups.find((g) => g.categorySlug === active) ?? groups[0];

  return (
    <section id="prices" className="section-padding bg-[var(--card)] border-b border-[var(--border)]" aria-labelledby="prices-title">
      <div className="container-main">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <span className="eyebrow">{content.eyebrow}</span>
            <h2 id="prices-title" className="mt-2 text-[1.35rem] sm:text-3xl font-black">{content.title}</h2>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">{content.note}</p>
          </div>
          <MarketStatus market={board.market} className="self-start sm:self-auto" />
        </div>

        <div role="tablist" aria-label={t.lines} className="snap-row -mx-4 px-4 sm:mx-0 sm:px-0 mb-4">
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
          <LivePriceTable key={line.categorySlug} initial={initial} productIds={line.productIds} showProduct={line.productIds.length > 1} limit={8} searchFrom={9999} caption={fill(t.caption, { name: line.categoryName })} />
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <Link href={line.href} className="inline-flex items-center gap-1.5 h-11 px-5 rounded-xl bg-[var(--foreground)] text-[var(--background)] text-sm font-bold">
            {fill(t.fullTable, { name: line.categoryName })}
            <span className="opacity-60 num">{fill(t.rows, { n: digits(line.items.length, locale) })}</span>
            <ArrowLeft className="w-4 h-4 ltr:rotate-180" />
          </Link>
          <Link href="/prices" className="text-sm font-bold text-[var(--muted-foreground)] hover:text-[var(--foreground)]">{content.allPricesLabel}</Link>
        </div>
      </div>
    </section>
  );
}
