import Link from 'next/link';
import { BookOpen, ChevronLeft } from 'lucide-react';

type Guide = { slug: string; title: string; excerpt: string | null };

/**
 * راهنماهای خرید همان دسته، پایین فهرست محصولات.
 *
 * خریدار لوله قبل از قیمت‌گرفتن سوال دارد — چه سایزی، چه کلاسی، کاروگیت یا پلی‌اتیلن — و جواب
 * همه‌شان در وبلاگ همین سایت هست ولی از صفحه دسته هیچ راهی به آن نبود. این بخش آن راه را باز
 * می‌کند و در عین حال به گوگل می‌گوید صفحه دسته و این مقاله‌ها یک موضوع‌اند.
 */
export function CategoryGuides({ categoryName, guides }: { categoryName: string; guides: Guide[] }) {
  if (guides.length === 0) return null;

  return (
    <section className="container-main pb-12 lg:pb-16" aria-labelledby="category-guides">
      <div className="flex items-center gap-2.5 mb-4">
        <BookOpen className="w-5 h-5 text-[var(--accent-text)]" aria-hidden />
        <h2 id="category-guides" className="text-lg sm:text-xl font-black text-[var(--foreground)]">
          راهنمای خرید {categoryName}
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {guides.map((g) => (
          <Link
            key={g.slug}
            href={`/blog/${g.slug}`}
            className="group rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 hover:border-[var(--accent)]/60 transition-colors"
          >
            <h3 className="font-bold leading-7 text-[var(--foreground)] group-hover:text-[var(--accent-text)] transition-colors">
              {g.title}
            </h3>
            {g.excerpt && (
              <p className="mt-1.5 text-sm leading-7 text-[var(--muted-foreground)] line-clamp-2">{g.excerpt}</p>
            )}
            <span className="mt-2.5 inline-flex items-center gap-1 text-xs font-bold text-[var(--accent-text)]">
              خواندن راهنما
              <ChevronLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" aria-hidden />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
