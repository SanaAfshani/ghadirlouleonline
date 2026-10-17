'use client';

import Link from 'next/link';
import { m as motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { PageHero } from '@/shared/ui/PageHero';
import { CategoryThumb } from '@/widgets/header/Header';
import { faDigits } from '@/shared/lib/utils';

export type CategoryCard = {
  slug: string;
  name: string;
  description: string | null;
  image: string | null;
  icon: string | null;
  productCount: number;
  comingSoon: boolean;
};

export function CategoriesPageClient({ categories }: { categories: CategoryCard[] }) {
  return (
    <>
      <PageHero label="دسته‌بندی محصولات" title="همه دسته‌های لوله و اتصالات" description="دسته مورد نظر را انتخاب کنید تا محصولات، مشخصات فنی و قیمت روز را ببینید." />

      <div className="container-main section-padding-sm">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
          {categories.map((cat, i) => (
            <motion.div key={cat.slug}>
              <div className="h-full rounded-3xl">
                <Link href={`/products/${cat.slug}`} className="group h-full flex flex-col rounded-3xl border border-[var(--border)] bg-[var(--background)] overflow-hidden hover:border-[var(--accent)]/50 transition-colors">
                  <div className="relative aspect-[4/3] sm:aspect-[16/10] overflow-hidden">
                    <CategoryThumb
                      category={cat}
                      sizes="(min-width: 1024px) 420px, 50vw"
                      quality={90}
                      className="absolute inset-0 w-full h-full transition-transform duration-700 group-hover:scale-105"
                    />
                    {cat.comingSoon ? (
                      <span className="absolute top-3 right-3 h-7 px-3 rounded-lg bg-[var(--accent)] text-[var(--accent-foreground)] text-[11px] font-bold flex items-center">به زودی</span>
                    ) : (
                      <span className="absolute top-3 right-3 h-7 px-3 rounded-lg bg-white/90 text-slate-900 text-[11px] font-bold flex items-center num">
                        {faDigits(cat.productCount)} محصول
                      </span>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col p-4 sm:p-5">
                    <h2 className="font-black text-[15px] sm:text-lg group-hover:text-[var(--accent-text)] transition-colors">{cat.name}</h2>
                    {cat.description && <p className="mt-1.5 text-xs sm:text-sm text-[var(--muted-foreground)] leading-6 line-clamp-2">{faDigits(cat.description)}</p>}
                    <span className="mt-auto pt-4 flex items-center gap-1.5 text-sm font-bold text-[var(--accent-text)]">
                      مشاهده محصولات <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    </span>
                  </div>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
}
