'use client';

import Image from 'next/image';
import { m as motion } from 'framer-motion';
import Link from 'next/link';
import { Clock, Calendar, ArrowRight, ArrowLeft, BookOpen, Tag } from 'lucide-react';
import type { BlogPost } from '@/shared/types';
import { faDigits, formatDate } from '@/shared/lib/utils';
import { PdfViewer } from '@/shared/ui/PdfViewer';
import { FaqAccordion } from '@/shared/ui/FaqAccordion';

type RelatedCategory = { slug: string; name: string; comingSoon: boolean };

export function BlogPostView({ post, relatedCategories = [] }: { post: BlogPost; relatedCategories?: RelatedCategory[] }) {
  const tag = post.tags[0] || 'مقاله';
  const isPdfOnly = !post.content || post.content === '<p></p>' || post.content.trim() === '';

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="container-main py-10 max-w-5xl">
        <nav className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] mb-8 flex-wrap">
          <Link href="/" className="hover:text-[var(--accent-text)] transition-colors">خانه</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-[var(--accent-text)] transition-colors">وبلاگ</Link>
          <span>/</span>
          <span className="text-[var(--foreground)] truncate min-w-0 max-w-full">{faDigits(post.title)}</span>
        </nav>

        <motion.article>
          {/* Meta */}
          <header className="max-w-3xl mb-8">
            <span className="text-sm font-bold text-[var(--accent-text)]">{tag}</span>
            <h1 className="mt-2 text-2xl sm:text-3xl md:text-[2.5rem] font-black text-[var(--foreground)] leading-snug md:leading-tight">
              {faDigits(post.title)}
            </h1>
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[var(--muted-foreground)] num">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {formatDate(post.createdAt)}
              </span>
              {!isPdfOnly && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {faDigits(post.readTime)} دقیقه مطالعه
                </span>
              )}
              {post.author?.name && <span>نویسنده: {post.author.name}</span>}
              {post.pdfUrl && (
                <span className="flex items-center gap-1.5 text-[var(--foreground)] font-bold">
                  <BookOpen className="w-4 h-4" />
                  کاتالوگ PDF
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
              <div
                className="article-content mb-10"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            )}

            {/* PDF Viewer */}
            {post.pdfUrl && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <PdfViewer url={post.pdfUrl} title={`کاتالوگ — ${post.title}`} />
              </motion.div>
            )}

            {/* سوالات متداول اختصاصی مقاله — در انتهای محتوا */}
            <FaqAccordion faqs={post.faqs ?? []} />

            {/* مسیر از مقاله به صفحات خرید: دسته‌های نام‌برده در مقاله + لیست قیمت */}
            <section className="mt-12 pt-8 border-t border-[var(--border)]" aria-labelledby="related-products">
              <h2 id="related-products" className="text-xl font-black text-[var(--foreground)] mb-4">قیمت و خرید محصولات مرتبط</h2>
              <ul className="flex flex-wrap gap-2">
                {relatedCategories.map((c) => (
                  <li key={c.slug}>
                    <Link href={`/products/${c.slug}`} className="h-10 px-4 rounded-xl border border-[var(--border)] text-sm font-bold inline-flex items-center gap-1.5 hover:border-[var(--accent)] hover:text-[var(--accent-text)] transition-colors">
                      <Tag className="w-4 h-4" />
                      {c.comingSoon ? <>{c.name} (به زودی)</> : <>قیمت {c.name}</>}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/prices" className="h-10 px-4 rounded-xl bg-[var(--foreground)] text-[var(--background)] text-sm font-bold inline-flex items-center gap-1.5">
                    لیست قیمت روز همه محصولات
                    <ArrowLeft className="w-4 h-4" />
                  </Link>
                </li>
              </ul>
            </section>

            <div className="mt-12 pt-8 border-t border-[var(--border)]">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-[var(--accent-text)] font-semibold hover:gap-3 transition-all"
              >
                <ArrowRight className="w-4 h-4" />
                بازگشت به وبلاگ
              </Link>
            </div>
          </div>
        </motion.article>
      </div>
    </div>
  );
}
