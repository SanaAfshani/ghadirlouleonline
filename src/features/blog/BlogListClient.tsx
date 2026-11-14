'use client';

import Image from 'next/image';
import { m as motion } from 'framer-motion';
import { ArrowLeft, Clock } from 'lucide-react';
import { PageHero } from '@/shared/ui/PageHero';
import { Link } from '@/shared/i18n/Link';
import { useLocale, useMessages } from '@/shared/i18n/LocaleProvider';
import { digits } from '@/shared/i18n/format';
import { defineMessages, fill } from '@/shared/i18n/messages';
import type { ContentOf } from '@/shared/content/types';
import type { blogHero } from '@/shared/content/pages/blog';

const messages = defineMessages({
  fa: { readTime: '{n} دقیقه مطالعه', minutes: '{n} دقیقه', readMore: 'خواندن مقاله' },
  en: { readTime: '{n} min read', minutes: '{n} min', readMore: 'Read article' },
});

export type BlogPostCard = {
  slug: string;
  title: string;
  excerpt: string;
  readTime: number;
  tag: string;
  date: string;
  featured: boolean;
  coverImage?: string;
};

function Cover({ src, alt, sizes }: { src?: string; alt: string; sizes: string }) {
  return src ? (
    <Image src={src} alt={alt} fill sizes={sizes} className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
  ) : (
    <span className="absolute inset-0 bg-[var(--ink-2)] bp-grid" aria-hidden />
  );
}

/** متن‌های سربرگ از پنل «محتوای صفحات ← وبلاگ» (shared/content/pages/blog.ts) */
export function BlogListClient({ posts, hero }: { posts: BlogPostCard[]; hero: ContentOf<typeof blogHero> }) {
  const locale = useLocale();
  const t = useMessages(messages);
  const featured = posts.find((p) => p.featured) ?? posts[0];
  const rest = posts.filter((p) => p !== featured);

  return (
    <>
      <PageHero label={hero.label} title={hero.title} description={hero.description} />

      <div className="container-main section-padding space-y-10">
        {featured && (
          <motion.article>
            <Link href={`/blog/${featured.slug}`} className="group grid grid-cols-1 md:grid-cols-[1.2fr_1fr] rounded-[var(--radius-panel)] border border-[var(--border)] overflow-hidden">
              <div className="relative aspect-[16/10] md:aspect-auto md:min-h-[360px] bg-[var(--muted)]">
                <Cover src={featured.coverImage} alt={featured.title} sizes="(max-width:768px) 100vw, 55vw" />
              </div>
              <div className="p-6 sm:p-10 flex flex-col justify-center">
                <span className="text-xs font-bold text-[var(--accent-text)]">{featured.tag}</span>
                <h2 className="mt-2 text-xl sm:text-[1.75rem] font-black leading-snug group-hover:text-[var(--accent-text)] transition-colors">{digits(featured.title, locale)}</h2>
                {featured.excerpt && <p className="mt-3 text-[15px] leading-8 text-[var(--muted-foreground)] line-clamp-3">{digits(featured.excerpt, locale)}</p>}
                <div className="mt-6 flex items-center gap-4 text-xs text-[var(--muted-foreground)] num">
                  <span>{featured.date}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{fill(t.readTime, { n: digits(featured.readTime, locale) })}</span>
                </div>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold">
                  {t.readMore} <ArrowLeft className="w-4 h-4 ltr:rotate-180 transition-transform rtl:group-hover:-translate-x-1 ltr:group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </motion.article>
        )}

        {rest.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
            {rest.map((post, i) => (
              <motion.article key={post.slug} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 3) * 0.06 }}>
                <Link href={`/blog/${post.slug}`} className="group block">
                  <div className="relative aspect-[16/10] rounded-3xl overflow-hidden bg-[var(--muted)]">
                    <Cover src={post.coverImage} alt={post.title} sizes="(max-width:640px) 100vw, 33vw" />
                  </div>
                  <div className="mt-4 flex items-center gap-3 text-xs text-[var(--muted-foreground)] num">
                    <span className="font-bold text-[var(--accent-text)]">{post.tag}</span>
                    <span>{post.date}</span>
                    <span>{fill(t.minutes, { n: digits(post.readTime, locale) })}</span>
                  </div>
                  <h3 className="mt-2 font-black text-[17px] leading-8 line-clamp-2 group-hover:text-[var(--accent-text)] transition-colors">{digits(post.title, locale)}</h3>
                  {post.excerpt && <p className="mt-1.5 text-sm leading-7 text-[var(--muted-foreground)] line-clamp-2">{digits(post.excerpt, locale)}</p>}
                </Link>
              </motion.article>
            ))}
          </div>
        )}

        {posts.length === 0 && <p className="text-center text-[var(--muted-foreground)] py-16">{hero.emptyText}</p>}
      </div>
    </>
  );
}
