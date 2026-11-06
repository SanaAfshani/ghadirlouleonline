import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { SectionHeading } from '@/shared/ui/SectionHeading';
import { CategoryThumb } from '@/widgets/header/Header';
import { groupCategories } from '@/shared/config/product-lines';
import { faDigits } from '@/shared/lib/utils';
import type { NavCategory } from '@/shared/lib/data';

/**
 * محصولات صفحه اول: به‌جای «دسته‌ها» و «محصولات پرطرفدار» (که فقط ۸ سایز اول بود)، هر گروه یک کارت
 * با سایزها و انواعش — بازدیدکننده از همین‌جا مستقیم به صفحه سایز موردنظرش می‌رود.
 */
export function ProductLinesSection({ categories }: { categories: NavCategory[] }) {
  const groups = groupCategories(categories);
  if (!groups.length) return null;

  return (
    <section className="section-padding" aria-labelledby="product-lines-title">
      <div className="container-main">
        <SectionHeading
          id="product-lines-title"
          align="right"
          label="محصولات"
          title="لوله کاروگیت، اسپیرال و اتصالات"
          description="سایز را انتخاب کنید؛ هر سایز صفحه، مشخصات فنی و قیمت روز خودش را دارد."
          action={{ href: '/products', label: 'همه محصولات' }}
        />

        <div className="grid gap-4 sm:gap-5 lg:grid-cols-[1.5fr_1fr] items-start">
          {groups.map((g) => (
            <article key={g.title} className="rounded-[var(--radius-sheet)] border border-[var(--border)] bg-[var(--card)] overflow-hidden">
              <Link href={`/products/${g.categories[0].slug}`} className="group relative block aspect-[16/7] bg-[var(--ink-2)]">
                <CategoryThumb
                  category={g.categories[0]}
                  sizes="(min-width: 1024px) 720px, 100vw"
                  quality={90}
                  className="absolute inset-0 w-full h-full transition-transform duration-700 group-hover:scale-105"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-[var(--ink)] via-[var(--ink)]/30 to-transparent" />
                <h3 className="absolute bottom-0 inset-x-0 p-4 sm:p-5 text-xl sm:text-2xl font-black text-white">{g.title}</h3>
              </Link>

              <div className="p-4 sm:p-5 space-y-5">
                {g.categories.map((c) => (
                  <div key={c.slug}>
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-black">
                        {c.name} <span className="text-xs font-medium text-[var(--muted-foreground)] num">({faDigits(c.productCount)})</span>
                      </p>
                      <Link href={`/products/${c.slug}`} className="text-xs font-bold text-[var(--accent-text)] flex items-center gap-0.5 shrink-0">
                        جدول قیمت <ChevronLeft className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                    <ul className="mt-2.5 flex flex-wrap gap-2">
                      {c.items.map((it) => (
                        <li key={it.slug}>
                          <Link
                            href={`/products/${c.slug}/${it.slug}`}
                            className="h-9 px-3 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--background)] text-sm font-bold flex items-center num hover:border-[var(--accent)] hover:text-[var(--accent-text)] transition-colors"
                          >
                            {it.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
