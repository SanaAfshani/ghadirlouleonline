'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, m as motion } from 'framer-motion';
import {
  ArrowLeft, Building2, ChartLine, ChevronDown, ChevronLeft, CircleHelp, Clock, Factory, Headphones, House, LayoutGrid, Menu, MessageCircle,
  Moon, Newspaper, PackageSearch, Phone, Search, Sun, Truck, Wrench, X, type LucideIcon,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn, faDigits } from '@/shared/lib/utils';
import { useSiteSettings } from '@/shared/providers/SiteSettingsProvider';
import { useConsult } from '@/features/consult/ConsultProvider';
import { siteConfig } from '@/shared/config/site';
import { phoneHref as toTel } from '@/shared/lib/site-settings';
import type { NavCategory } from '@/shared/lib/data';

const NAV = [
  { href: '/', label: 'خانه' },
  { href: '/products', label: 'محصولات', mega: true },
  { href: '/prices', label: 'لیست قیمت' },
  { href: '/services', label: 'خدمات' },
  { href: '/blog', label: 'مجله' },
  { href: '/contact', label: 'تماس با ما' },
] as const;

/** میانبرهای منوی موبایل — لیست قیمت کارت جدا دارد */
const DRAWER_LINKS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: '/', label: 'خانه', icon: House },
  { href: '/products', label: 'محصولات', icon: LayoutGrid },
  { href: '/services', label: 'خدمات', icon: Wrench },
  { href: '/blog', label: 'مجله', icon: Newspaper },
  { href: '/projects', label: 'پروژه‌های اجراشده', icon: Building2 },
  { href: '/track', label: 'پیگیری سفارش', icon: PackageSearch },
  { href: '/faq', label: 'سوالات', icon: CircleHelp },
  { href: '/contact', label: 'تماس', icon: Phone },
];

function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname.startsWith(href);
}

function Logo({ compact = false }: { compact?: boolean }) {
  const { siteName } = useSiteSettings();
  return (
    <Link href="/" className="flex items-center gap-2.5 shrink-0" aria-label={`${siteName} — صفحه اصلی`}>
      <Image src="/images/logo.png" alt="" width={44} height={44} className={cn('object-contain', compact ? 'w-9 h-9' : 'w-11 h-11')} priority />
      <span className="leading-tight">
        <span className={cn('block font-black text-[var(--foreground)]', compact ? 'text-[15px]' : 'text-lg')}>{siteName}</span>
        {!compact && <span className="block text-[11px] text-[var(--muted-foreground)]">نماینده انحصاری {siteConfig.legalName}</span>}
      </span>
    </Link>
  );
}

export function Header({ categories }: { categories: NavCategory[] }) {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const router = useRouter();
  const { phone, phoneHref, companyPhones, whatsappUrl } = useSiteSettings();
  const { open: openConsult } = useConsult();
  const { resolvedTheme, setTheme } = useTheme();

  const [scrolled, setScrolled] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [mega, setMega] = useState(false);
  const [search, setSearch] = useState(false);
  const [query, setQuery] = useState('');
  const [mounted, setMounted] = useState(false);
  const megaTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // next-themes فقط سمت کلاینت تم واقعی را می‌داند؛ تا mount آیکن تم رندر نمی‌شود
    const onScroll = () => setScrolled(window.scrollY > 12);
    const id = requestAnimationFrame(() => {
      setMounted(true);
      onScroll();
    });
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  // بستن منوها با تغییر صفحه — در رویداد کلیک انجام می‌شود، نه effect
  const closeAll = () => {
    setDrawer(false);
    setMega(false);
    setSearch(false);
  };

  useEffect(() => {
    document.body.style.overflow = drawer || search ? 'hidden' : '';
    if (search) setTimeout(() => searchInput.current?.focus(), 50);
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawer, search]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    closeAll();
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const openMega = () => {
    if (megaTimer.current) clearTimeout(megaTimer.current);
    setMega(true);
  };
  const closeMega = () => {
    megaTimer.current = setTimeout(() => setMega(false), 120);
  };

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 print:hidden">
        {/* نوار بالا — فقط دسکتاپ */}
        <div className="hidden lg:block h-[38px] bg-[var(--ink)] text-[12px] text-slate-300">
          <div className="container-main h-full flex items-center justify-between">
            <div className="flex items-center gap-5">
              <strong className="flex items-center gap-1.5 font-black text-white"><Factory className="w-3.5 h-3.5 text-[var(--accent-text)]" />{siteConfig.exclusiveTitle}</strong>
              <span className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5 text-[var(--accent-text)]" />ارسال از انبار به سراسر کشور</span>
              <span className="hidden xl:flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-[var(--accent-text)]" />{siteConfig.workingHours}</span>
            </div>
            <div className="flex items-center gap-5">
              <Link href="/track" className="flex items-center gap-1.5 h-6 px-2.5 rounded-full bg-white/10 text-white font-bold hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors">
                <PackageSearch className="w-3.5 h-3.5" />پیگیری سفارش
              </Link>
              {companyPhones[0] && (
                <a href={toTel(companyPhones[0])} className="flex items-center gap-1.5 hover:text-white">
                  <Building2 className="w-3.5 h-3.5" />دفتر مرکزی: <span dir="ltr" className="num">{faDigits(companyPhones[0])}</span>
                </a>
              )}
              <a href={phoneHref} className="flex items-center gap-1.5 hover:text-white font-bold"><Phone className="w-3.5 h-3.5 text-[var(--accent-text)]" /><span dir="ltr" className="num">{faDigits(phone)}</span></a>
            </div>
          </div>
        </div>

        {/* نوار اصلی */}
        <div
          className={cn(
            'transition-[background,box-shadow,border-color] duration-300 border-b',
            scrolled
              ? 'bg-[var(--background)]/85 backdrop-blur-xl border-[var(--border)] shadow-[0_8px_30px_-12px_rgba(0,0,0,0.18)]'
              : 'bg-[var(--background)] border-[var(--border)]',
          )}
        >
          <div className="container-main h-[60px] lg:h-[74px] flex items-center gap-3 lg:gap-6">
            {/* موبایل: منو */}
            <button onClick={() => setDrawer(true)} aria-label="منو" className="lg:hidden grid place-items-center w-10 h-10 -ms-1.5 rounded-xl hover:bg-[var(--muted)]">
              <Menu className="w-6 h-6" />
            </button>

            <div className="lg:hidden flex-1 flex justify-center"><Logo compact /></div>
            <div className="hidden lg:block"><Logo /></div>

            {/* دسکتاپ: ناوبری */}
            <nav className="hidden lg:flex items-center gap-1 mx-auto" aria-label="ناوبری اصلی">
              {NAV.map((item) =>
                'mega' in item ? (
                  <div key={item.href} onMouseEnter={openMega} onMouseLeave={closeMega} className="relative">
                    <Link
                      href={item.href}
                      onClick={closeAll}
                      aria-expanded={mega}
                      className={cn(
                        'flex items-center gap-1 h-10 px-3.5 rounded-xl text-[15px] font-semibold transition-colors',
                        isActive(pathname, item.href) ? 'text-[var(--accent-text)]' : 'text-[var(--foreground)] hover:bg-[var(--muted)]',
                      )}
                    >
                      {item.label}
                      <ChevronDown className={cn('w-4 h-4 transition-transform', mega && 'rotate-180')} />
                    </Link>
                  </div>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeAll}
                    className={cn(
                      'relative h-10 px-3.5 rounded-xl text-[15px] font-semibold flex items-center transition-colors',
                      isActive(pathname, item.href) ? 'text-[var(--accent-text)]' : 'text-[var(--foreground)] hover:bg-[var(--muted)]',
                    )}
                  >
                    {item.label}
                    {isActive(pathname, item.href) && (
                      <motion.span layoutId="nav-underline" className="absolute inset-x-3 -bottom-[15px] h-[3px] bg-[var(--accent)]" />
                    )}
                  </Link>
                ),
              )}
            </nav>

            <div className="flex items-center gap-1.5 lg:gap-2">
              {/* صفحه اصلی جستجوی بزرگ هیرو را دارد؛ در موبایل جای خالی نگه داشته می‌شود تا لوگو وسط بماند */}
              {isHome ? (
                <span className="lg:hidden w-10 h-10" aria-hidden />
              ) : (
                <button onClick={() => setSearch(true)} aria-label="جستجو" className="grid place-items-center w-10 h-10 rounded-xl hover:bg-[var(--muted)]">
                  <Search className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                aria-label="تغییر حالت روشن و تیره"
                className="hidden lg:grid place-items-center w-10 h-10 rounded-xl hover:bg-[var(--muted)]"
              >
                {mounted && (resolvedTheme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />)}
              </button>
              <button
                onClick={() => openConsult()}
                className="hidden lg:flex items-center gap-2 h-11 px-5 rounded-2xl bg-[var(--accent)] text-[var(--accent-foreground)] font-bold shadow-accent hover:-translate-y-0.5 transition-transform"
              >
                <Headphones className="w-4.5 h-4.5" />
                مشاوره رایگان
              </button>
            </div>
          </div>

          {/* مگامنو محصولات */}
          <AnimatePresence>
            {mega && (
              <motion.div
                onMouseEnter={openMega}
                onMouseLeave={closeMega}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="hidden lg:block absolute inset-x-0 top-full"
              >
                <div className="container-main">
                  <div className="mt-2 rounded-3xl border border-[var(--border)] bg-[var(--background)] shadow-2xl p-6 grid grid-cols-[1fr_280px] gap-6">
                    <div className="grid grid-cols-3 gap-2">
                      {categories.map((c) => (
                        <Link
                          key={c.slug}
                          href={`/products/${c.slug}`}
                          onClick={closeAll}
                          className="group flex items-center gap-3 p-2.5 rounded-2xl hover:bg-[var(--muted)] transition-colors"
                        >
                          <CategoryThumb category={c} className="w-12 h-12 rounded-xl" />
                          <span className="min-w-0">
                            <span className="block font-bold text-sm truncate group-hover:text-[var(--accent-text)]">{c.name}</span>
                            {c.comingSoon ? (
                              <span className="block text-xs font-bold text-[var(--accent-text)]">به زودی</span>
                            ) : (
                              <span className="block text-xs text-[var(--muted-foreground)] num">{faDigits(c.productCount)} محصول</span>
                            )}
                          </span>
                        </Link>
                      ))}
                    </div>
                    <Link
                      href="/prices"
                      onClick={closeAll}
                      className="relative overflow-hidden rounded-2xl bg-[var(--ink)] text-white p-5 flex flex-col justify-between bp-grid"
                    >
                      <span className="relative">
                        <span className="eyebrow">به‌روز</span>
                        <span className="block mt-2 text-xl font-black leading-snug">لیست قیمت روز لوله و اتصالات</span>
                      </span>
                      <span className="relative flex items-center gap-1.5 text-sm font-bold text-[var(--accent-text)]">
                        مشاهده قیمت‌ها <ArrowLeft className="w-4 h-4" />
                      </span>
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* منوی کشویی موبایل — از سمت راست (شروع در RTL) */}
      <AnimatePresence>
        {drawer && (
          <motion.div className="lg:hidden fixed inset-0 z-[60]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button aria-label="بستن منو" onClick={() => setDrawer(false)} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 320 }}
              className="absolute inset-y-0 right-0 w-[88%] max-w-[380px] bg-[var(--background)] flex flex-col safe-pb border-s-4 border-[var(--accent)]"
              aria-label="منوی سایت"
            >
              <div className="flex items-center justify-between ps-5 pe-3 h-[60px] border-b border-[var(--border)]">
                <Logo compact />
                <button onClick={() => setDrawer(false)} aria-label="بستن" className="grid place-items-center w-10 h-10 rounded-xl border border-[var(--border)]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto overscroll-contain no-scrollbar">
                <form onSubmit={submitSearch} className="relative px-4 pt-4">
                  <Search className="absolute right-8 top-[calc(50%+8px)] -translate-y-1/2 w-4.5 h-4.5 text-[var(--muted-foreground)]" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="جستجوی لوله، اتصالات، سایز…"
                    enterKeyHint="search"
                    aria-label="جستجو"
                    className="w-full h-12 rounded-xl bg-[var(--muted)] border border-[var(--border)] pr-11 pl-3 text-[15px] focus:border-[var(--accent)]"
                  />
                </form>

                <Link
                  href="/prices"
                  onClick={closeAll}
                  className="corner-marks mx-4 mt-3 flex items-center gap-3 p-4 rounded-xl bg-[var(--ink)] bp-grid text-white"
                >
                  <span className="grid place-items-center w-11 h-11 rounded-lg bg-[var(--accent)] text-[var(--accent-foreground)] shrink-0">
                    <ChartLine className="w-5 h-5" />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block font-black">لیست قیمت روز</span>
                    <span className="block text-xs text-slate-400">قیمت لحظه‌ای و نمودار نوسان</span>
                  </span>
                  <ArrowLeft className="w-4 h-4 text-[var(--accent-text)]" />
                </Link>

                <nav aria-label="ناوبری موبایل" className="px-4 mt-3 grid grid-cols-3 gap-2">
                  {DRAWER_LINKS.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={closeAll}
                      aria-current={isActive(pathname, href) ? 'page' : undefined}
                      className={cn(
                        'h-[72px] rounded-xl border flex flex-col items-center justify-center gap-1.5 text-[13px] font-bold transition-colors active:scale-[0.97]',
                        isActive(pathname, href)
                          ? 'border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)]'
                          : 'border-[var(--border)] bg-[var(--card)]',
                      )}
                    >
                      <Icon className={cn('w-5 h-5', !isActive(pathname, href) && 'text-[var(--muted-foreground)]')} />
                      {label}
                    </Link>
                  ))}
                </nav>

                <div className="mt-6 px-4 flex items-center justify-between">
                  <p className="tech-label">دسته‌بندی محصولات</p>
                  <span className="text-[11px] text-[var(--muted-foreground)] num">{faDigits(categories.length)} دسته</span>
                </div>
                <ul className="mt-2 mb-4 px-4">
                  {categories.map((c) => (
                    <li key={c.slug} className="border-b border-[var(--border)] last:border-b-0">
                      <Link
                        href={`/products/${c.slug}`}
                        onClick={closeAll}
                        className={cn('flex items-center gap-3 py-2.5 active:bg-[var(--muted)]', pathname.startsWith(`/products/${c.slug}`) && 'text-[var(--accent-text)]')}
                      >
                        <CategoryThumb category={c} className="w-11 h-11 rounded-lg" />
                        <span className="flex-1 min-w-0">
                          <span className="block text-[14px] font-bold truncate">{c.name}</span>
                          {c.comingSoon ? (
                            <span className="block text-[11px] font-bold text-[var(--accent-text)]">به زودی</span>
                          ) : (
                            <span className="block text-[11px] text-[var(--muted-foreground)] num">{faDigits(c.productCount)} محصول</span>
                          )}
                        </span>
                        <ChevronLeft className="w-4 h-4 text-[var(--muted-foreground)]" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 border-t border-[var(--border)] grid grid-cols-[1fr_auto_auto] gap-2">
                <a href={phoneHref} className="h-12 rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] font-black flex items-center justify-center gap-2 min-w-0">
                  <Phone className="w-5 h-5 shrink-0" /><span dir="ltr" className="num truncate">{faDigits(phone)}</span>
                </a>
                {whatsappUrl && (
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="واتس‌اپ" className="w-12 h-12 rounded-xl bg-[#128C7E] text-white grid place-items-center">
                    <MessageCircle className="w-5 h-5" />
                  </a>
                )}
                <button
                  onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                  aria-label="تغییر حالت روشن و تیره"
                  className="w-12 h-12 rounded-xl border border-[var(--border)] grid place-items-center"
                >
                  {mounted && (resolvedTheme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />)}
                </button>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* جستجوی تمام‌صفحه */}
      <AnimatePresence>
        {search && (
          <motion.div className="fixed inset-0 z-[60] bg-[var(--background)]/95 backdrop-blur-xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="container-main pt-5 lg:pt-24 max-w-3xl">
              <div className="flex items-center gap-2">
                <form onSubmit={submitSearch} className="flex-1 relative">
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
                  <input
                    ref={searchInput}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="جستجوی لوله، اتصالات، سایز…"
                    className="w-full h-14 lg:h-16 rounded-2xl bg-[var(--muted)] border border-[var(--border)] pr-12 pl-4 text-base lg:text-lg focus:border-[var(--accent)]"
                    enterKeyHint="search"
                  />
                </form>
                <button onClick={() => setSearch(false)} aria-label="بستن جستجو" className="grid place-items-center w-12 h-12 rounded-2xl hover:bg-[var(--muted)]">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="mt-6 text-xs font-bold text-[var(--muted-foreground)]">دسته‌های پرجستجو</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {categories.map((c) => (
                  <Link key={c.slug} href={`/products/${c.slug}`} onClick={closeAll} className="h-10 px-4 rounded-lg border border-[var(--border)] flex items-center text-sm font-semibold hover:border-[var(--accent)] hover:text-[var(--accent-text)]">
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/** تصویر دسته؛ اگر تصویری ثبت نشده، کاشی گرافیکی با طرح لوله نمایش داده می‌شود (به جای عکس ۴۰۴) */
export function CategoryThumb({ category, className, sizes = '200px', quality = 75 }: {
  category: Pick<NavCategory, 'name' | 'image'>;
  className?: string;
  /** عرض واقعی نمایش — پیش‌فرض برای آیکون کوچک منو است؛ کاشی‌های بزرگ باید عرض خودشان را بدهند وگرنه عکس ۲۰۰ پیکسلی کش می‌آید */
  sizes?: string;
  quality?: 75 | 90;
}) {
  const gradientId = useId();
  if (category.image) {
    return (
      <span className={cn('relative block overflow-hidden bg-[var(--muted)] shrink-0', className)}>
        <Image src={category.image} alt={category.name} fill sizes={sizes} quality={quality} className="object-cover" />
      </span>
    );
  }
  return (
    <span className={cn('relative block overflow-hidden shrink-0 bg-[var(--ink-2)] bp-grid', className)} aria-hidden>
      <svg viewBox="0 0 64 40" className="absolute inset-0 w-full h-full p-[12%]" fill="none">
        <path d="M4 26 H34 a10 10 0 0 0 10 -10 V4" stroke={`url(#${gradientId})`} strokeWidth="7" strokeLinecap="round" />
        <rect x="40" y="2" width="8" height="4" rx="1" fill="var(--accent)" />
        <defs>
          <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#CBD5E1" />
            <stop offset="1" stopColor="#475569" />
          </linearGradient>
        </defs>
      </svg>
    </span>
  );
}
