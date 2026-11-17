'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { AnimatePresence, m as motion } from 'framer-motion';
import {
  ArrowLeft, Building2, ChartLine, ChevronDown, ChevronLeft, CircleHelp, Clock, Factory, Headphones, House, LayoutGrid, Link2, Menu, MessageCircle,
  Moon, Newspaper, PackageSearch, Phone, Search, Sun, Truck, ClipboardList, X, type LucideIcon,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/shared/lib/utils';
import { useSiteSettings } from '@/shared/providers/SiteSettingsProvider';
import { useConsult } from '@/features/consult/ConsultProvider';
import { phoneHref as toTel } from '@/shared/lib/site-settings';
import type { NavCategory } from '@/shared/lib/data';
import { groupCategories } from '@/shared/config/product-lines';
import { RubikaButton } from '@/shared/ui/RubikaButton';
import { RubikaIcon } from '@/shared/ui/RubikaIcon';
import { Link } from '@/shared/i18n/Link';
import { useLocale, useLocalizedRouter, useMessages } from '@/shared/i18n/LocaleProvider';
import { defineMessages, fill } from '@/shared/i18n/messages';
import { digits } from '@/shared/i18n/format';
import { localeDir, splitLocalePath } from '@/shared/i18n/config';
import type { ContentOf } from '@/shared/content/types';
import type { globalHeader } from '@/shared/content/pages/global';
import { LanguageSwitcher } from './LanguageSwitcher';

const messages = defineMessages({
  fa: {
    home: '{name} — صفحه اصلی',
    exclusiveAgent: 'نماینده انحصاری {name}',
    track: 'پیگیری سفارش',
    headOffice: 'دفتر مرکزی:',
    rubika: 'روبیکا',
    menu: 'منو',
    mainNav: 'ناوبری اصلی',
    search: 'جستجو',
    theme: 'تغییر حالت روشن و تیره',
    productCount: '{n} محصول',
    closeMenu: 'بستن منو',
    siteMenu: 'منوی سایت',
    close: 'بستن',
    searchPlaceholder: 'جستجوی لوله، اتصالات، سایز…',
    mobileNav: 'ناوبری موبایل',
    whatsapp: 'واتس‌اپ',
    closeSearch: 'بستن جستجو',
    dailyPrice: 'قیمت روز',
  },
  en: {
    home: '{name} — home page',
    exclusiveAgent: 'Exclusive agent of {name}',
    track: 'Track order',
    headOffice: 'Head office:',
    rubika: 'Rubika',
    menu: 'Menu',
    mainNav: 'Main navigation',
    search: 'Search',
    theme: 'Toggle light and dark mode',
    productCount: '{n} products',
    closeMenu: 'Close menu',
    siteMenu: 'Site menu',
    close: 'Close',
    searchPlaceholder: 'Search pipes, fittings, sizes…',
    mobileNav: 'Mobile navigation',
    whatsapp: 'WhatsApp',
    closeSearch: 'Close search',
    dailyPrice: 'daily price',
  },
});

/** آیکون میانبرهای منوی موبایل بر اساس id آیتم پنل؛ میانبر تازه آیکون عمومی می‌گیرد — لیست قیمت کارت جدا دارد */
const DRAWER_ICONS: Record<string, LucideIcon> = {
  home: House,
  products: LayoutGrid,
  factory: Factory,
  'project-inquiry': ClipboardList,
  blog: Newspaper,
  projects: Building2,
  track: PackageSearch,
  faq: CircleHelp,
  contact: Phone,
};

function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname.startsWith(href);
}

function Logo({ compact = false }: { compact?: boolean }) {
  const { siteName, legalName, logo } = useSiteSettings();
  const t = useMessages(messages);
  return (
    <Link href="/" className="flex items-center gap-2.5 shrink-0" aria-label={fill(t.home, { name: siteName })}>
      <Image src={logo} alt="" width={44} height={44} className={cn('object-contain', compact ? 'w-9 h-9' : 'w-11 h-11')} priority />
      <span className="leading-tight whitespace-nowrap">
        <span className={cn('block font-black text-[var(--foreground)]', compact ? 'text-[15px]' : 'text-lg')}>{siteName}</span>
        {!compact && <span className="block text-[11px] text-[var(--muted-foreground)]">{fill(t.exclusiveAgent, { name: legalName })}</span>}
      </span>
    </Link>
  );
}

export function Header({ categories, content }: { categories: NavCategory[]; content: ContentOf<typeof globalHeader> }) {
  // مسیر بدون پیشوند /en — تشخیص لینک فعال برای هر دو زبان یکی است
  const { path: pathname } = splitLocalePath(usePathname());
  const isHome = pathname === '/';
  const router = useLocalizedRouter();
  const locale = useLocale();
  const t = useMessages(messages);
  const groups = groupCategories(categories, locale);
  const { phone, phoneHref, companyPhones, whatsappUrl, exclusiveTitle, workingHours } = useSiteSettings();
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

  // کشو از لبه شروع می‌آید؛ framer جهت را نمی‌شناسد
  const drawerOffscreen = localeDir[locale] === 'rtl' ? '100%' : '-100%';

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
          <div className="container-main h-full flex items-center justify-between gap-5 whitespace-nowrap">
            <div className="flex items-center gap-5 min-w-0">
              <Link href="/official-representative" className="flex items-center gap-1.5 font-black text-white hover:text-[var(--accent-text)]"><Factory className="w-3.5 h-3.5 text-[var(--accent-text)]" />{exclusiveTitle}</Link>
              <span className="flex items-center gap-1.5 min-w-0"><Truck className="w-3.5 h-3.5 shrink-0 text-[var(--accent-text)]" /><span className="truncate">{content.shippingNote}</span></span>
              <span className="hidden xl:flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-[var(--accent-text)]" />{workingHours}</span>
            </div>
            <div className="flex items-center gap-5">
              <Link href="/track" className="flex items-center gap-1.5 h-6 px-2.5 rounded-full bg-white/10 text-white font-bold hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors">
                <PackageSearch className="w-3.5 h-3.5" />{t.track}
              </Link>
              {companyPhones[0] && (
                <a href={toTel(companyPhones[0])} className="flex items-center gap-1.5 hover:text-white">
                  <Building2 className="w-3.5 h-3.5" />{t.headOffice} <span dir="ltr" className="num">{digits(companyPhones[0], locale)}</span>
                </a>
              )}
              <a href={phoneHref} className="flex items-center gap-1.5 hover:text-white font-bold"><Phone className="w-3.5 h-3.5 text-[var(--accent-text)]" /><span dir="ltr" className="num">{digits(phone, locale)}</span></a>
              <RubikaButton className="flex items-center gap-1.5 hover:text-white"><RubikaIcon className="w-3.5" />{t.rubika}</RubikaButton>
              <LanguageSwitcher className="flex items-center gap-1.5 h-6 px-2.5 rounded-full border border-white/20 text-white font-bold hover:border-[var(--accent)] hover:text-[var(--accent-text)] transition-colors" />
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
            <button onClick={() => setDrawer(true)} aria-label={t.menu} className="lg:hidden grid place-items-center w-10 h-10 -ms-1.5 rounded-xl hover:bg-[var(--muted)]">
              <Menu className="w-6 h-6" />
            </button>

            <div className="lg:hidden flex-1 flex justify-center"><Logo compact /></div>
            <div className="hidden lg:block"><Logo /></div>

            {/* دسکتاپ: ناوبری */}
            <nav className="hidden lg:flex items-center gap-1 mx-auto" aria-label={t.mainNav}>
              {content.nav.map(({ id, label, link }) =>
                link === '/products' ? (
                  <div key={id} onMouseEnter={openMega} onMouseLeave={closeMega} className="relative">
                    <Link
                      href={link}
                      onClick={closeAll}
                      aria-expanded={mega}
                      className={cn(
                        'flex items-center gap-1 h-10 px-3.5 ltr:px-2.5 rounded-xl text-[15px] font-semibold whitespace-nowrap transition-colors',
                        isActive(pathname, link) ? 'text-[var(--accent-text)]' : 'text-[var(--foreground)] hover:bg-[var(--muted)]',
                      )}
                    >
                      {label}
                      <ChevronDown className={cn('w-4 h-4 transition-transform', mega && 'rotate-180')} />
                    </Link>
                  </div>
                ) : (
                  <Link
                    key={id}
                    href={link}
                    onClick={closeAll}
                    className={cn(
                      'relative h-10 px-3.5 ltr:px-2.5 rounded-xl text-[15px] font-semibold whitespace-nowrap flex items-center transition-colors',
                      isActive(pathname, link) ? 'text-[var(--accent-text)]' : 'text-[var(--foreground)] hover:bg-[var(--muted)]',
                    )}
                  >
                    {label}
                    {isActive(pathname, link) && (
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
                <button onClick={() => setSearch(true)} aria-label={t.search} className="grid place-items-center w-10 h-10 rounded-xl hover:bg-[var(--muted)]">
                  <Search className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                aria-label={t.theme}
                className="hidden lg:grid place-items-center w-10 h-10 rounded-xl hover:bg-[var(--muted)]"
              >
                {mounted && (resolvedTheme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />)}
              </button>
              <button
                onClick={() => openConsult()}
                className="hidden lg:flex items-center gap-2 h-11 px-5 rounded-2xl bg-[var(--accent)] text-[var(--accent-foreground)] font-bold whitespace-nowrap shadow-accent hover:-translate-y-0.5 transition-transform"
              >
                <Headphones className="w-4.5 h-4.5" />
                {content.consultLabel}
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
                    {/* هر گروه یک ستون؛ زیر هر دسته، سایزها و انواعش مستقیم — هر سایز یک کلیک */}
                    <div className="grid grid-cols-2 gap-6">
                      {groups.map((g) => (
                        <div key={g.title}>
                          <p className="tech-label mb-3">{g.title}</p>
                          <div className="space-y-4">
                            {g.categories.map((c) => (
                              <div key={c.slug}>
                                <Link href={`/products/${c.slug}`} onClick={closeAll} className="group flex items-center gap-3 rounded-2xl p-1.5 -m-1.5 hover:bg-[var(--muted)] transition-colors">
                                  <CategoryThumb category={c} className="w-11 h-11 rounded-xl" />
                                  <span className="min-w-0">
                                    <span className="block font-black text-sm group-hover:text-[var(--accent-text)]">{c.name}</span>
                                    <span className="block text-xs text-[var(--muted-foreground)] num">{fill(t.productCount, { n: digits(c.productCount, locale) })} · {t.dailyPrice}</span>
                                  </span>
                                </Link>
                                <ul className="mt-2 flex flex-wrap gap-1.5">
                                  {c.items.map((it) => (
                                    <li key={it.slug}>
                                      <Link
                                        href={`/products/${c.slug}/${it.slug}`}
                                        onClick={closeAll}
                                        className="h-8 px-2.5 rounded-lg border border-[var(--border)] text-xs font-bold flex items-center num hover:border-[var(--accent)] hover:text-[var(--accent-text)]"
                                      >
                                        {it.label}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <Link
                      href="/prices"
                      onClick={closeAll}
                      className="relative overflow-hidden rounded-2xl bg-[var(--ink)] text-white p-5 flex flex-col justify-between bp-grid"
                    >
                      <span className="relative">
                        <span className="eyebrow">{content.megaEyebrow}</span>
                        <span className="block mt-2 text-xl font-black leading-snug">{content.megaTitle}</span>
                      </span>
                      <span className="relative flex items-center gap-1.5 text-sm font-bold text-[var(--accent-text)]">
                        {content.megaCta} <ArrowLeft className="w-4 h-4 ltr:rotate-180" />
                      </span>
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* منوی کشویی موبایل — از لبه شروع (راست در فارسی، چپ در انگلیسی) */}
      <AnimatePresence>
        {drawer && (
          <motion.div className="lg:hidden fixed inset-0 z-[60]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button aria-label={t.closeMenu} onClick={() => setDrawer(false)} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.aside
              initial={{ x: drawerOffscreen }}
              animate={{ x: 0 }}
              exit={{ x: drawerOffscreen }}
              transition={{ type: 'spring', damping: 32, stiffness: 320 }}
              className="absolute inset-y-0 start-0 w-[88%] max-w-[380px] bg-[var(--background)] flex flex-col safe-pb border-s-4 border-[var(--accent)]"
              aria-label={t.siteMenu}
            >
              <div className="flex items-center justify-between gap-2 ps-5 pe-3 h-[60px] border-b border-[var(--border)]">
                <Logo compact />
                <div className="flex items-center gap-2">
                  <LanguageSwitcher
                    onClick={closeAll}
                    className="flex items-center gap-1.5 h-10 px-3 rounded-xl border border-[var(--border)] text-[13px] font-bold"
                  />
                  <button onClick={() => setDrawer(false)} aria-label={t.close} className="grid place-items-center w-10 h-10 rounded-xl border border-[var(--border)]">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto overscroll-contain no-scrollbar">
                <form onSubmit={submitSearch} className="relative px-4 pt-4">
                  <Search className="absolute start-8 top-[calc(50%+8px)] -translate-y-1/2 w-4.5 h-4.5 text-[var(--muted-foreground)]" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t.searchPlaceholder}
                    enterKeyHint="search"
                    aria-label={t.search}
                    className="w-full h-12 rounded-xl bg-[var(--muted)] border border-[var(--border)] ps-11 pe-3 text-[15px] focus:border-[var(--accent)]"
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
                    <span className="block font-black">{content.drawerPriceTitle}</span>
                    <span className="block text-xs text-slate-400">{content.drawerPriceText}</span>
                  </span>
                  <ArrowLeft className="w-4 h-4 text-[var(--accent-text)] ltr:rotate-180" />
                </Link>

                <nav aria-label={t.mobileNav} className="px-4 mt-3 grid grid-cols-3 gap-2">
                  {content.drawerLinks.map(({ id, label, link: href }) => {
                    const Icon = DRAWER_ICONS[id] ?? Link2;
                    return (
                      <Link
                        key={id}
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
                    );
                  })}
                </nav>

                {groups.map((g) => (
                  <div key={g.title} className="mt-6 px-4">
                    <p className="tech-label">{g.title}</p>
                    <ul className="mt-2">
                      {g.categories.map((c) => (
                        <li key={c.slug} className="border-b border-[var(--border)] last:border-b-0 pb-3">
                          <Link
                            href={`/products/${c.slug}`}
                            onClick={closeAll}
                            className={cn('flex items-center gap-3 py-2.5 active:bg-[var(--muted)]', pathname.startsWith(`/products/${c.slug}`) && 'text-[var(--accent-text)]')}
                          >
                            <CategoryThumb category={c} className="w-11 h-11 rounded-lg" />
                            <span className="flex-1 min-w-0">
                              <span className="block text-[14px] font-bold truncate">{c.name}</span>
                              <span className="block text-[11px] text-[var(--muted-foreground)] num">{fill(t.productCount, { n: digits(c.productCount, locale) })}</span>
                            </span>
                            <ChevronLeft className="w-4 h-4 text-[var(--muted-foreground)] ltr:rotate-180" />
                          </Link>
                          <div className="flex flex-wrap gap-1.5">
                            {c.items.map((it) => (
                              <Link
                                key={it.slug}
                                href={`/products/${c.slug}/${it.slug}`}
                                onClick={closeAll}
                                className={cn(
                                  'h-8 px-2.5 rounded-lg border text-xs font-bold flex items-center num',
                                  pathname.endsWith(`/${it.slug}`) ? 'border-[var(--accent)] text-[var(--accent-text)]' : 'border-[var(--border)]',
                                )}
                              >
                                {it.label}
                              </Link>
                            ))}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                <div className="mb-4" />
              </div>

              <div className="p-4 border-t border-[var(--border)] grid grid-cols-[1fr_auto_auto_auto] gap-2">
                <a href={phoneHref} className="h-12 rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] font-black flex items-center justify-center gap-2 min-w-0">
                  <Phone className="w-5 h-5 shrink-0" /><span dir="ltr" className="num truncate">{digits(phone, locale)}</span>
                </a>
                {whatsappUrl && (
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label={t.whatsapp} className="w-12 h-12 rounded-xl bg-[#128C7E] text-white grid place-items-center">
                    <MessageCircle className="w-5 h-5" />
                  </a>
                )}
                <RubikaButton className="w-12 h-12 rounded-xl bg-white border border-[var(--border)] grid place-items-center">
                  <RubikaIcon className="w-6" />
                </RubikaButton>
                <button
                  onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                  aria-label={t.theme}
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
                  <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
                  <input
                    ref={searchInput}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t.searchPlaceholder}
                    aria-label={t.search}
                    className="w-full h-14 lg:h-16 rounded-2xl bg-[var(--muted)] border border-[var(--border)] ps-12 pe-4 text-base lg:text-lg focus:border-[var(--accent)]"
                    enterKeyHint="search"
                  />
                </form>
                <button onClick={() => setSearch(false)} aria-label={t.closeSearch} className="grid place-items-center w-12 h-12 rounded-2xl hover:bg-[var(--muted)]">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="mt-6 text-xs font-bold text-[var(--muted-foreground)]">{content.popularHeading}</p>
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
