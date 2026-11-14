'use client';

import Image from 'next/image';
import { m as motion } from 'framer-motion';
import { Clock, Calendar, ArrowRight, ArrowLeft, BookOpen, Tag } from 'lucide-react';
import type { BlogPost } from '@/shared/types';
import { PdfViewer } from '@/shared/ui/PdfViewer';
import { FaqAccordion } from '@/shared/ui/FaqAccordion';
import { RichText } from '@/shared/ui/RichText';
import { Link } from '@/shared/i18n/Link';
import { useLocale, useMessages } from '@/shared/i18n/LocaleProvider';
import { digits, formatDate } from '@/shared/i18n/format';
import { defineMessages, fill } from '@/shared/i18n/messages';

type RelatedCategory = { slug: string; name: string; comingSoon: boolean };

const messages = defineMessages({
  fa: {
    home: 'خانه',
    blog: 'وبلاگ',
    defaultTag: 'مقاله',
    readTime: '{n} دقیقه مطالعه',
    author: 'نویسنده: {name}',
    pdf: 'کاتالوگ PDF',
    pdfTitle: 'کاتالوگ — {title}',
    related: 'قیمت و خرید محصولات مرتبط',
    comingSoon: '{name} (به زودی)',
    price: 'قیمت {name}',
    allPrices: 'لیست قیمت روز همه محصولات',
    back: 'بازگشت به وبلاگ',
  },
  en: {
    home: 'Home',
    blog: 'Blog',
    defaultTag: 'Article',
    readTime: '{n} min read',
    author: 'By {name}',
    pdf: 'PDF catalogue',
    pdfTitle: 'Catalogue — {title}',
    related: 'Prices for related products',
    comingSoon: '{name} (coming soon)',
    price: '{name} price',
    allPrices: "Today's price list for all products",
    back: 'Back to blog',
  },
});

export function BlogPostView({ post, relatedCategories = [] }: { post: BlogPost; relatedCategories?: RelatedCategory[] }) {
  const locale = useLocale();
  const t = useMessages(messages);
  const tag = post.tags[0] || t.defaultTag;
  const isPdfOnly = !post.content || post.content === '<p></p>' || post.content.trim() === '';

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="container-main py-10 max-w-5xl">
        <nav className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] mb-8 flex-wrap">
          <Link href="/" className="hover:text-[var(--accent-text)] transition-colors">{t.home}</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-[var(--accent-text)] transition-colors">{t.blog}</Link>
          <span>/</span>
          <span className="text-[var(--foreground)] truncate min-w-0 max-w-full">{digits(post.title, locale)}</span>
        </nav>

        <motion.article>
          {/* Meta */}
          <header className="max-w-3xl mb-8">
            <span className="text-sm font-bold text-[var(--accent-text)]">{tag}</span>
            <h1 className="mt-2 text-2xl sm:text-3xl md:text-[2.5rem] font-black text-[var(--foreground)] leading-snug md:leading-tight">
              {digits(post.title, locale)}
            </h1>
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[var(--muted-foreground)] num">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {formatDate(post.createdAt, locale)}
              </span>
              {!isPdfOnly && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {fill(t.readTime, { n: digits(post.readTime, locale) })}
                </span>
              )}
              {post.author?.name && <span>{fill(t.author, { name: post.author.name })}</span>}
              {post.pdfUrl && (
                <span className="flex items-center gap-1.5 text-[var(--foreground)] font-bold">
                  <BookOpen className="w-4 h-4" />
                  {t.pdf}
                </span>
              )}
            </div>
          </header>

          {/* Cover image — بدون کاور، جای خالی نمی‌گذاریم */}
          {post.coverImage && (
            <div className="relative aspect-[16/9] sm:aspect-[2/1] rounded-3xl overflow-hidden mb-10 bg-[var(--muted)]">
              <Image src={post.coverImage} alt={post.title} fill sizes="(max-width:1024px) 100vw, 1024px" className="object-cover" priority />
            </div>
          )}

          <div className="max-w-3xl">
            {/* Text content */}
            {!isPdfOnly && (
              // لینک‌های داخلی متن مقاله در نسخه انگلیسی /en می‌گیرند
              <RichText html={post.content} className="article-content mb-10" />
            )}

            {/* PDF Viewer */}
            {post.pdfUrl && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <PdfViewer url={post.pdfUrl} title={fill(t.pdfTitle, { title: post.title })} />
              </motion.div>
            )}

            {/* سوالات متداول اختصاصی مقاله — در انتهای محتوا */}
            <FaqAccordion faqs={post.faqs ?? []} />

            {/* مسیر از مقاله به صفحات خرید: دسته‌های نام‌برده در مقاله + لیست قیمت */}
            <section className="mt-12 pt-8 border-t border-[var(--border)]" aria-labelledby="related-products">
              <h2 id="related-products" className="text-xl font-black text-[var(--foreground)] mb-4">{t.related}</h2>
              <ul className="flex flex-wrap gap-2">
                {relatedCategories.map((c) => (
                  <li key={c.slug}>
                    <Link href={`/products/${c.slug}`} className="h-10 px-4 rounded-xl border border-[var(--border)] text-sm font-bold inline-flex items-center gap-1.5 hover:border-[var(--accent)] hover:text-[var(--accent-text)] transition-colors">
                      <Tag className="w-4 h-4" />
                      {fill(c.comingSoon ? t.comingSoon : t.price, { name: c.name })}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/prices" className="h-10 px-4 rounded-xl bg-[var(--foreground)] text-[var(--background)] text-sm font-bold inline-flex items-center gap-1.5">
                    {t.allPrices}
                    <ArrowLeft className="w-4 h-4 ltr:rotate-180" />
                  </Link>
                </li>
              </ul>
            </section>

            <div className="mt-12 pt-8 border-t border-[var(--border)]">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-[var(--accent-text)] font-semibold hover:gap-3 transition-all"
              >
                <ArrowRight className="w-4 h-4 ltr:rotate-180" />
                {t.back}
              </Link>
            </div>
          </div>
        </motion.article>
      </div>
    </div>
  );
}
