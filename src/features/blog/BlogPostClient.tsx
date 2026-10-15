'use client';

import { m as motion } from 'framer-motion';
import Link from 'next/link';
import { Clock, User, Share2, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSiteSettings } from '@/shared/providers/SiteSettingsProvider';

const postData: Record<string, {
  title: string;
  author: string;
  date: string;
  readTime: number;
  tag: string;
  content: string;
}> = {
  'guide-to-choosing-industrial-pipes': {
    title: 'راهنمای انتخاب لوله مناسب برای پروژه‌های صنعتی',
    author: 'تیم فنی قدیر لوله آنلاین ',
    date: '۱۵ آذر ۱۴۰۲',
    readTime: 5,
    tag: 'راهنما',
    content: `
      <h2>مقدمه</h2>
      <p>انتخاب لوله مناسب یکی از مهم‌ترین تصمیماتی است که در پروژه‌های صنعتی باید گرفته شود. اشتباه در این انتخاب می‌تواند منجر به خسارات جبران‌ناپذیری شود.</p>
      
      <h2>عوامل مهم در انتخاب لوله</h2>
      <p>هنگام انتخاب لوله صنعتی باید چندین فاکتور مهم را در نظر گرفت:</p>
      <ul>
        <li><strong>نوع سیال:</strong> آب، گاز، نفت یا مواد شیمیایی</li>
        <li><strong>فشار کاری:</strong> حداکثر فشار در سیستم</li>
        <li><strong>دمای کاری:</strong> محدوده دمایی سیستم</li>
        <li><strong>محیط نصب:</strong> داخلی یا خارجی</li>
        <li><strong>استانداردهای مورد نیاز:</strong> API, ASME, ISO</li>
      </ul>
      
      <h2>انواع لوله‌های صنعتی</h2>
      <p>لوله‌های فولادی به دو دسته اصلی تقسیم می‌شوند:</p>
      <h3>۱. لوله‌های درزدار (Welded)</h3>
      <p>این نوع لوله‌ها از ورق‌های فولادی تولید می‌شوند و برای اکثر کاربردهای عمومی مناسب هستند. قیمت پایین‌تری دارند.</p>
      <h3>۲. لوله‌های بدون درز (Seamless)</h3>
      <p>این لوله‌ها برای کاربردهای با فشار و دمای بالا مناسب‌تر هستند و استحکام بالاتری دارند.</p>
      
      <h2>نتیجه‌گیری</h2>
      <p>برای انتخاب صحیح لوله، با کارشناسان ما مشورت کنید تا بهترین محصول متناسب با نیاز شما را پیشنهاد دهیم.</p>
    `,
  },
};

const defaultPost = {
  title: 'مقاله تخصصی',
  author: 'تیم فنی قدیر لوله آنلاین ',
  date: '۱۴۰۲',
  readTime: 5,
  tag: 'فنی',
  content: '<p>محتوای این مقاله در حال آماده‌سازی است.</p>',
};

interface Props { slug: string; }

export function BlogPostClient({ slug }: Props) {
  const post = postData[slug] ?? { ...defaultPost, title: slug.replace(/-/g, ' ') };
  const { phone, phoneHref } = useSiteSettings();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('لینک کپی شد!');
  };

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(post.title + ' ' + (typeof window !== 'undefined' ? window.location.href : ''))}`;

  return (
    <div className="container-main py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] mb-8">
        <Link href="/" className="hover:text-[var(--accent-text)]">خانه</Link>
        <span>/</span>
        <Link href="/blog" className="hover:text-[var(--accent-text)]">وبلاگ</Link>
        <span>/</span>
        <span className="text-[var(--foreground)] line-clamp-1">{post.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Main content */}
        <article className="lg:col-span-3">
          {/* Cover image */}
          <div className="h-64 md:h-80 rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center mb-8 relative overflow-hidden">
            <div className="text-8xl opacity-20">📰</div>
            <div className="absolute top-5 right-5 bg-[var(--accent)] text-[var(--accent-foreground)] text-sm font-bold px-3 py-1.5 rounded-full">
              {post.tag}
            </div>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--muted-foreground)] mb-6">
            <span className="flex items-center gap-1.5"><User className="w-4 h-4" />{post.author}</span>
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{post.readTime} دقیقه مطالعه</span>
            <span>{post.date}</span>
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-black text-[var(--foreground)] mb-6 leading-tight"
          >
            {post.title}
          </motion.h1>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="prose prose-slate dark:prose-invert max-w-none text-[var(--foreground)] leading-loose"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            <div
              dangerouslySetInnerHTML={{ __html: post.content }}
              className="[&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-[var(--foreground)] [&>h2]:mt-8 [&>h2]:mb-4 [&>h3]:text-xl [&>h3]:font-bold [&>h3]:text-[var(--foreground)] [&>h3]:mt-6 [&>h3]:mb-3 [&>p]:text-[var(--muted-foreground)] [&>p]:mb-4 [&>p]:leading-loose [&>ul]:text-[var(--muted-foreground)] [&>ul]:mb-4 [&>ul]:list-disc [&>ul]:list-inside [&>ul>li]:mb-2"
            />
          </motion.div>

          {/* Share */}
          <div className="mt-10 pt-8 border-t border-[var(--border)]">
            <div className="flex items-center gap-4">
              <span className="text-[var(--muted-foreground)] text-sm">اشتراک‌گذاری:</span>
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--muted)] text-[var(--foreground)] text-sm hover:bg-[var(--accent)] hover:text-white transition-all"
              >
                <Share2 className="w-4 h-4" />
                کپی لینک
              </button>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/10 text-green-600 dark:text-green-400 text-sm hover:bg-green-500/20 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                واتساپ
              </a>
            </div>
          </div>
        </article>

        {/* Sidebar */}
        <aside className="lg:col-span-1 space-y-6">
          {/* Related posts */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
            <h3 className="font-bold text-[var(--foreground)] mb-4">مقالات مرتبط</h3>
            <div className="space-y-3">
              {[
                { slug: 'welded-vs-seamless-pipes', title: 'مقایسه لوله‌های درزدار و بدون درز' },
                { slug: 'international-pipe-standards', title: 'استانداردهای بین‌المللی لوله' },
                { slug: 'flange-selection-guide', title: 'راهنمای انتخاب فلنج مناسب' },
              ].map(p => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="block p-3 rounded-xl hover:bg-[var(--muted)] transition-colors group"
                >
                  <div className="text-sm text-[var(--foreground)] group-hover:text-[var(--accent-text)] transition-colors leading-relaxed">
                    {p.title}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* CTA */}
          <motion.div className="rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-hover)] p-5 text-center">
            <div className="text-[var(--accent-foreground)] font-bold mb-2">نیاز به مشاوره دارید؟</div>
            <p className="text-[var(--accent-foreground)]/80 text-sm mb-4">کارشناسان ما آماده راهنمایی هستند</p>
            <a
              href={phoneHref}
              className="block w-full py-2.5 rounded-xl bg-[var(--accent-foreground)]/90 text-[var(--accent-text)] font-semibold text-sm hover:opacity-90 transition-colors"
            >
              {phone}
            </a>
          </motion.div>
        </aside>
      </div>
    </div>
  );
}
