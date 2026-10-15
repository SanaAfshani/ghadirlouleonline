'use client';

import Link from 'next/link';
import { m as motion } from 'framer-motion';
import { ArrowLeft, LayoutGrid } from 'lucide-react';
import { SectionHeading } from '@/shared/ui/SectionHeading';
import { CategoryThumb } from '@/widgets/header/Header';
import { cn, faDigits } from '@/shared/lib/utils';
import type { NavCategory } from '@/shared/lib/data';

export function CategoriesSection({ categories }: { categories: NavCategory[] }) {
  if (!categories.length) return null;
  const shown = categories.slice(0, 7);

  return (
    <section className="section-padding" aria-labelledby="categories-title">
      <div className="container-main">
        <SectionHeading id="categories-title"
          align="right"
          label="دسته‌بندی محصولات"
          title="خرید لوله و اتصالات"
          description="لوله کاروگیت با قیمت روز و مشخصات فنی؛ سایر دسته‌ها به زودی عرضه می‌شوند."
          action={{ href: '/categories', label: 'همه دسته‌ها' }}
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 lg:auto-rows-[190px] gap-3 sm:gap-4">
          {shown.map((c, i) => {
            const big = i === 0;
            return (
              <motion.div
                key={c.slug}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className={cn(big && 'col-span-2 lg:row-span-2')}
              >
                <div className="h-full rounded-3xl">
                  <Link
                    href={`/products/${c.slug}`}
                    className={cn(
                      'group relative flex h-full overflow-hidden rounded-3xl bg-[var(--ink-2)]',
                      big ? 'aspect-[16/10] lg:aspect-auto' : 'aspect-[4/5] sm:aspect-square lg:aspect-auto',
                    )}
                  >
                    <CategoryThumb category={c} className="absolute inset-0 w-full h-full transition-transform duration-700 group-hover:scale-105" />
                    <span className="absolute inset-0 bg-gradient-to-t from-[var(--ink)] via-[var(--ink)]/40 to-transparent" />
                    {c.comingSoon && (
                      <span className="absolute top-3 right-3 h-7 px-2.5 rounded-lg bg-[var(--accent)] text-[var(--accent-foreground)] text-[11px] font-bold flex items-center">به زودی</span>
                    )}
                    <span className="relative mt-auto w-full p-4 sm:p-5 flex items-end justify-between gap-3">
                      <span className="min-w-0">
                        <span className={cn('block font-black text-white leading-snug', big ? 'text-2xl sm:text-3xl' : 'text-[15px] sm:text-lg')}>
                          {c.name}
                        </span>
                        <span className="block mt-1 text-xs text-slate-300 num">{faDigits(c.productCount)} محصول</span>
                      </span>
                      <span className="shrink-0 grid place-items-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-white/15 backdrop-blur text-white transition-colors group-hover:bg-[var(--accent)] group-hover:text-[var(--accent-foreground)]">
                        <ArrowLeft className="w-4 h-4" />
                      </span>
                    </span>
                  </Link>
                </div>
              </motion.div>
            );
          })}

          {/* کاشی آخر: همه دسته‌ها */}
          <Link
            href="/categories"
            className={cn(
              'group relative overflow-hidden rounded-3xl border-2 border-dashed border-[var(--border)] flex flex-col items-center justify-center gap-2 p-5 text-center hover:border-[var(--accent)] transition-colors',
              // کاشی آخر ردیف ناقص را پر می‌کند: موبایل ۲ ستونه، دسکتاپ ۴ ستونه (کارت اول ۲×۲)
              (shown.length - 1) % 2 === 0 ? 'col-span-2' : 'col-span-1',
              (shown.length - 1) % 4 === 2 ? 'lg:col-span-2' : 'lg:col-span-1',
            )}
          >
            <LayoutGrid className="w-8 h-8 text-[var(--accent-text)] transition-transform group-hover:scale-110" />
            <span className="font-black">همه دسته‌ها</span>
            <span className="text-xs text-[var(--muted-foreground)] num">{faDigits(categories.length)} دسته‌بندی</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
