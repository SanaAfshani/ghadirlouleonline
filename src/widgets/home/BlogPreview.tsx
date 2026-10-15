import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { faDigits, formatDate } from '@/shared/lib/utils';
import type { BlogPost } from '@/shared/types';

/** مجله در صفحه اصلی — فشرده: فهرست کارت‌های افقی با تصویر کوچک؛ موبایل یک ستون، دسکتاپ سه ستون */
export function BlogPreview({ posts }: { posts: BlogPost[] }) {
  if (!posts.length) return null;

  return (
    <section className="section-padding-sm" aria-labelledby="blog-title">
      <div className="container-main">
        <div className="flex items-end justify-between gap-4 mb-4">
          <div>
            <p className="tech-label">مجله تخصصی</p>
            <h2 id="blog-title" className="mt-1.5 text-lg sm:text-xl font-black">آخرین مقالات و راهنماهای خرید</h2>
          </div>
          <Link href="/blog" className="shrink-0 flex items-center gap-1 text-sm font-bold text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            همه مقالات <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>

        <ul className="grid grid-cols-1 lg:grid-cols-3 gap-2.5 lg:gap-4">
          {posts.map((post) => (
            <li key={post.id}>
              <Link href={`/blog/${post.slug}`} className="group flex items-center gap-3.5 p-2.5 rounded-2xl border border-[var(--border)] bg-[var(--background)] hover:border-[var(--foreground)]/25 transition-colors">
                <span className="relative w-24 sm:w-28 aspect-[4/3] rounded-xl overflow-hidden bg-[var(--ink-2)] shrink-0">
                  {post.coverImage ? (
                    <Image src={post.coverImage} alt={post.title} fill sizes="112px" className="object-cover" />
                  ) : (
                    <span className="absolute inset-0 bp-grid" aria-hidden />
                  )}
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-2 text-[11px] text-[var(--muted-foreground)] num">
                    {post.tags[0] && <span className="font-bold text-[var(--accent-text)] truncate">{post.tags[0]}</span>}
                    <span className="whitespace-nowrap">{formatDate(post.createdAt)}</span>
                  </span>
                  <span className="mt-1 block font-bold text-[14px] leading-6 line-clamp-2 group-hover:text-[var(--accent-text)] transition-colors">
                    {faDigits(post.title)}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
