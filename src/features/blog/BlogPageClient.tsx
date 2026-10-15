'use client';

import { useState } from 'react';
import { m as motion } from 'framer-motion';
import Link from 'next/link';
import { Search, Clock, ArrowLeft } from 'lucide-react';

const posts = [
  {
    slug: 'guide-to-choosing-industrial-pipes',
    title: 'راهنمای انتخاب لوله مناسب برای پروژه‌های صنعتی',
    excerpt: 'در این مقاله به بررسی انواع لوله‌های صنعتی و نحوه انتخاب مناسب‌ترین نوع برای پروژه‌های مختلف می‌پردازیم.',
    tag: 'راهنما',
    author: 'مدیر سیستم',
    readTime: 5,
    date: '۱۵ آذر ۱۴۰۲',
    featured: true,
  },
  {
    slug: 'welded-vs-seamless-pipes',
    title: 'مقایسه لوله‌های فولادی درزدار و بدون درز',
    excerpt: 'تفاوت‌های اساسی بین لوله‌های درزدار و بدون درز و کاربرد هر کدام در صنایع مختلف را بررسی می‌کنیم.',
    tag: 'مقایسه',
    author: 'مدیر سیستم',
    readTime: 7,
    date: '۸ آذر ۱۴۰۲',
    featured: false,
  },
  {
    slug: 'international-pipe-standards',
    title: 'استانداردهای بین‌المللی لوله و اتصالات',
    excerpt: 'آشنایی با مهم‌ترین استانداردهای بین‌المللی در حوزه لوله و اتصالات صنعتی.',
    tag: 'استاندارد',
    author: 'مدیر سیستم',
    readTime: 8,
    date: '۱ آذر ۱۴۰۲',
    featured: false,
  },
  {
    slug: 'pipe-installation-tips',
    title: 'نکات مهم نصب لوله‌های صنعتی',
    excerpt: 'اشتباهات رایج در نصب لوله‌های صنعتی و راه‌های جلوگیری از آن‌ها.',
    tag: 'نصب',
    author: 'مدیر سیستم',
    readTime: 6,
    date: '۲۴ آبان ۱۴۰۲',
    featured: false,
  },
  {
    slug: 'carbon-steel-applications',
    title: 'کاربردهای فولاد کربنی در صنعت لوله',
    excerpt: 'بررسی جامع کاربردهای مختلف فولاد کربنی در تولید لوله‌های صنعتی.',
    tag: 'فنی',
    author: 'مدیر سیستم',
    readTime: 10,
    date: '۱۷ آبان ۱۴۰۲',
    featured: false,
  },
  {
    slug: 'flange-selection-guide',
    title: 'راهنمای انتخاب فلنج مناسب',
    excerpt: 'انواع فلنج و نحوه انتخاب درست آن‌ها بر اساس شرایط کاری.',
    tag: 'فلنج',
    author: 'مدیر سیستم',
    readTime: 9,
    date: '۱۰ آبان ۱۴۰۲',
    featured: false,
  },
];

const tags = ['همه', 'راهنما', 'مقایسه', 'استاندارد', 'نصب', 'فنی', 'فلنج'];

export function BlogPageClient() {
  const [activeTag, setActiveTag] = useState('همه');
  const [search, setSearch] = useState('');

  const filtered = posts.filter(p => {
    const matchTag = activeTag === 'همه' || p.tag === activeTag;
    const matchSearch = !search || p.title.includes(search) || p.excerpt.includes(search);
    return matchTag && matchSearch;
  });

  const featured = posts.find(p => p.featured);
  const showFeatured = !search && activeTag === 'همه';
  const gridPosts = showFeatured ? filtered.filter(p => !p.featured) : filtered;

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 py-16">
        <div className="container-main">
          <motion.div className="max-w-2xl">
            <div className="text-[var(--accent-text)] text-sm font-semibold mb-3 flex items-center gap-2">
              <span className="w-8 h-0.5 bg-[var(--accent)]" />
              وبلاگ
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-4">مقالات و راهنماهای تخصصی</h1>
            <p className="text-slate-400 text-lg">آموزش، راهنما و اخبار دنیای لوله، اتصالات و تجهیزات صنعتی</p>
          </motion.div>
        </div>
      </div>

      <div className="container-main py-10">
        {/* Featured post */}
        {featured && showFeatured && (
          <motion.div className="mb-10">
            <Link
              href={`/blog/${featured.slug}`}
              className="group block rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden hover:-translate-y-1 transition-all duration-300 shadow-xl"
            >
              <div className="grid grid-cols-1 md:grid-cols-5">
                <div className="md:col-span-3 h-64 md:h-auto bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center relative">
                  <div className="text-8xl opacity-20">📰</div>
                  <div className="absolute top-5 right-5">
                    <span className="bg-[var(--accent)] text-[var(--accent-foreground)] text-sm font-bold px-3 py-1.5 rounded-full">ویژه</span>
                  </div>
                </div>
                <div className="md:col-span-2 p-8 flex flex-col justify-center">
                  <span className="text-[var(--accent-text)] text-xs font-semibold mb-3">{featured.tag}</span>
                  <h2 className="text-white font-bold text-xl mb-3 group-hover:text-[var(--accent-text)] transition-colors leading-relaxed">
                    {featured.title}
                  </h2>
                  <p className="text-slate-400 text-sm leading-relaxed mb-4">{featured.excerpt}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{featured.readTime} دقیقه</span>
                    <span>{featured.date}</span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        )}

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="جستجو در مقالات..."
              className="w-full h-11 bg-[var(--card)] border border-[var(--border)] rounded-xl pr-12 pl-4 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none"
            />
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tags.map(tag => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTag === tag ? 'bg-[var(--accent)] text-[var(--accent-foreground)]' : 'bg-[var(--card)] border border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--accent)]/40'}`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gridPosts.map((post, i) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                href={`/blog/${post.slug}`}
                className="group block rounded-3xl bg-[var(--card)] border border-[var(--border)] overflow-hidden hover:border-[var(--accent)]/40 hover:-translate-y-2 transition-all duration-300 shadow-sm hover:shadow-xl"
              >
                <div className="h-48 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 relative flex items-center justify-center">
                  <div className="text-5xl opacity-20">📄</div>
                  <div className="absolute top-4 right-4">
                    <span className="bg-[var(--accent)] text-[var(--accent-foreground)] text-xs font-bold px-2.5 py-1 rounded-full">{post.tag}</span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)] mb-3">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{post.readTime} دقیقه</span>
                    <span>{post.date}</span>
                  </div>
                  <h3 className="font-bold text-[var(--foreground)] mb-2 line-clamp-2 group-hover:text-[var(--accent-text)] transition-colors leading-relaxed">
                    {post.title}
                  </h3>
                  <p className="text-[var(--muted-foreground)] text-sm line-clamp-2 leading-relaxed mb-4">{post.excerpt}</p>
                  <div className="flex items-center gap-2 text-[var(--accent-text)] text-sm font-medium">
                    ادامه مطلب
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-[var(--muted-foreground)]">مقاله‌ای پیدا نشد</p>
          </div>
        )}
      </div>
    </div>
  );
}
