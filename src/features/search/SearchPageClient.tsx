'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { m as motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Search, Package, FileText, Building2, ArrowLeft, TrendingUp, Loader2 } from 'lucide-react';
import { SearchInput } from '@/shared/ui/SearchInput';

const suggestions = ['لوله پلیکا', 'پلی اتیلن', 'منهول', 'شیرآلات', 'اتصالات', 'چدن داکتیل'];

type SearchProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
  categoryName: string;
  shortDescription?: string;
};

type SearchPost = {
  slug: string;
  title: string;
  excerpt: string;
};

type SearchProject = {
  slug: string;
  title: string;
  description: string;
};

function SearchResultsInner() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<SearchProduct[]>([]);
  const [posts, setPosts] = useState<SearchPost[]>([]);
  const [projects, setProjects] = useState<SearchProject[]>([]);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setProducts([]);
      setPosts([]);
      setProjects([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const json = await res.json();
        if (json.success) {
          setProducts(json.data.products);
          setPosts(json.data.posts);
          setProjects(json.data.projects);
        }
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const total = products.length + posts.length + projects.length;

  return (
    <div className="container-main py-8 md:py-12">
      <SearchInput
        value={query}
        onValueChange={setQuery}
        placeholder="جستجو در محصولات، مقالات و پروژه‌ها..."
        wrapperClassName="mb-8 max-w-2xl"
        className="h-12 text-base"
        autoFocus={!initialQuery}
      />

      <div className="flex flex-wrap gap-2 mb-8">
        <span className="flex items-center gap-1 text-xs text-[var(--muted-foreground)] ml-1 self-center">
          <TrendingUp className="w-3.5 h-3.5" />
          جستجوهای پرطرفدار:
        </span>
        {suggestions.map((term) => (
          <button
            key={term}
            type="button"
            onClick={() => setQuery(term)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
              query === term
                ? 'bg-[var(--accent)] border-[var(--accent)] text-[var(--accent-foreground)]'
                : 'bg-[var(--card)] border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--accent)]/40 hover:text-[var(--accent-text)]'
            }`}
          >
            {term}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-12 text-[var(--muted-foreground)]">
          <Loader2 className="w-5 h-5 animate-spin" />
          در حال جستجو...
        </div>
      )}

      <AnimatePresence mode="wait">
        {!loading && !query.trim() ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-[var(--muted)] flex items-center justify-center mx-auto mb-5">
              <Search className="w-8 h-8 text-[var(--muted-foreground)]" />
            </div>
            <p className="text-[var(--foreground)] font-semibold text-lg mb-2">دنبال چه محصولی می‌گردید؟</p>
            <p className="text-[var(--muted-foreground)] text-sm">عبارت جستجو را وارد کنید یا یکی از پیشنهادها را انتخاب کنید</p>
          </motion.div>
        ) : !loading && total === 0 ? (
          <motion.div key="no-result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-[var(--muted)] flex items-center justify-center mx-auto mb-5">
              <Search className="w-8 h-8 text-[var(--muted-foreground)]" />
            </div>
            <p className="text-[var(--foreground)] font-semibold text-lg mb-1">نتیجه‌ای یافت نشد</p>
            <p className="text-[var(--muted-foreground)] text-sm">برای «{query}» نتیجه‌ای پیدا نکردیم.</p>
            <Link href="/products" className="inline-flex items-center gap-2 mt-6 h-10 px-6 rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] text-sm font-semibold">
              مشاهده همه محصولات
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </motion.div>
        ) : !loading ? (
          <motion.div key="results" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-10">
            <p className="text-sm text-[var(--muted-foreground)]">
              <span className="font-semibold text-[var(--foreground)]">{total}</span> نتیجه برای «{query}»
            </p>

            {products.length > 0 && (
              <section>
                <h2 className="flex items-center gap-2 font-bold text-lg mb-4">
                  <Package className="w-4 h-4 text-[var(--accent-text)]" />
                  محصولات ({products.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((p) => (
                    <Link
                      key={p.id}
                      href={`/products/${p.category}/${p.slug}`}
                      className="group flex items-start gap-4 p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] hover:border-[var(--accent)]/40 transition-all"
                    >
                      <Package className="w-5 h-5 text-[var(--accent-text)] flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm group-hover:text-[var(--accent-text)] line-clamp-1">{p.name}</h3>
                        <p className="text-xs text-[var(--muted-foreground)]">{p.categoryName}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {posts.length > 0 && (
              <section>
                <h2 className="flex items-center gap-2 font-bold text-lg mb-4">
                  <FileText className="w-4 h-4 text-blue-400" />
                  مقالات ({posts.length})
                </h2>
                <div className="space-y-2.5">
                  {posts.map((p) => (
                    <Link
                      key={p.slug}
                      href={`/blog/${p.slug}`}
                      className="group flex items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] hover:border-[var(--accent)]/40"
                    >
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm group-hover:text-[var(--accent-text)] truncate">{p.title}</h3>
                        <p className="text-xs text-[var(--muted-foreground)] line-clamp-1">{p.excerpt}</p>
                      </div>
                      <ArrowLeft className="w-4 h-4 flex-shrink-0 text-[var(--muted-foreground)]" />
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {projects.length > 0 && (
              <section>
                <h2 className="flex items-center gap-2 font-bold text-lg mb-4">
                  <Building2 className="w-4 h-4 text-teal-400" />
                  پروژه‌ها ({projects.length})
                </h2>
                <div className="space-y-2.5">
                  {projects.map((p) => (
                    <Link
                      key={p.slug}
                      href={`/projects/${p.slug}`}
                      className="group flex items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] hover:border-[var(--accent)]/40"
                    >
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm group-hover:text-[var(--accent-text)] truncate">{p.title}</h3>
                        <p className="text-xs text-[var(--muted-foreground)] line-clamp-1">{p.description}</p>
                      </div>
                      <ArrowLeft className="w-4 h-4 flex-shrink-0" />
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function SearchPageClient() {
  return (
    <Suspense
      fallback={
        <div className="container-main py-16 text-center text-[var(--muted-foreground)]">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" />
          در حال بارگذاری...
        </div>
      }
    >
      <SearchResultsInner />
    </Suspense>
  );
}
