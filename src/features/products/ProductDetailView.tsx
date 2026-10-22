'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, m as motion } from 'framer-motion';
import {
  BookOpen, Check, ChevronLeft, ChevronRight, Clock, Download, FileText, Headphones, ListChecks, MessageCircle, Phone, Table2, X,
} from 'lucide-react';
import type { Product } from '@/shared/types';
import type { ProductListItem } from '@/shared/lib/serializers';
import { formatProductPrice } from '@/shared/lib/serializers';
import { useSiteSettings } from '@/shared/providers/SiteSettingsProvider';
import { useConsult } from '@/features/consult/ConsultProvider';
import { FaqAccordion } from '@/shared/ui/FaqAccordion';
import { LivePriceTable } from '@/features/prices/LivePriceTable';
import { MarketStatus } from '@/features/prices/MarketStatus';
import { useLiveBoard } from '@/features/prices/live-store';
import { summarizeLine, type PriceBoard } from '@/shared/lib/price-board-types';
import { ProductCard } from '@/features/products/ProductCard';
import { CategoryThumb } from '@/widgets/header/Header';
import { siteConfig } from '@/shared/config/site';
import { IconTile } from '@/shared/ui/IconTile';
import { SpecCards, specMeta, withDerivedSpecs } from '@/features/products/SpecCards';
import { ProductCatalogs } from '@/features/products/ProductCatalogs';
import { subjectFor } from '@/features/products/SpecIllustration';
import { CertificateStrip } from '@/features/certificates/Certificates';
import { cn, faDigits } from '@/shared/lib/utils';

type Section = { id: string; label: string };

/** نمایش تمام‌صفحه عکس‌ها — RTL: «بعدی» سمت چپ است و با کشیدن به راست می‌آید */
function Lightbox({ images, name, index, onIndex, onClose }: { images: string[]; name: string; index: number | null; onIndex: (i: number) => void; onClose: () => void }) {
  const isOpen = index != null;
  const count = images.length;
  const go = useCallback((delta: number) => index != null && onIndex((index + delta + count) % count), [index, count, onIndex]);
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') go(1);
      else if (e.key === 'ArrowRight') go(-1);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, go]);

  return (
    <AnimatePresence>
      {index != null && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={`تصاویر ${name}`}
          className="fixed inset-0 z-[80] bg-black/90 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => {
            if (touchX.current == null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            touchX.current = null;
            if (Math.abs(dx) > 50) go(dx > 0 ? 1 : -1);
          }}
        >
          <button aria-label="بستن" onClick={onClose} className="absolute inset-0 cursor-zoom-out" />
          <div className="pointer-events-none absolute inset-4 sm:inset-12">
            <Image key={images[index]} src={images[index]} alt={`${name} — تصویر ${faDigits(index + 1)}`} fill sizes="100vw" quality={90} className="object-contain" />
          </div>
          <button onClick={onClose} aria-label="بستن" className="absolute top-4 left-4 grid place-items-center w-11 h-11 rounded-full bg-black/60 ring-1 ring-white/25 text-white hover:bg-black/80">
            <X className="w-5 h-5" />
          </button>
          {count > 1 && (
            <>
              <button onClick={() => go(-1)} aria-label="تصویر قبلی" className="absolute right-3 top-1/2 -translate-y-1/2 grid place-items-center w-11 h-11 rounded-full bg-black/60 ring-1 ring-white/25 text-white hover:bg-black/80">
                <ChevronRight className="w-6 h-6" />
              </button>
              <button onClick={() => go(1)} aria-label="تصویر بعدی" className="absolute left-3 top-1/2 -translate-y-1/2 grid place-items-center w-11 h-11 rounded-full bg-black/60 ring-1 ring-white/25 text-white hover:bg-black/80">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <span className="absolute bottom-5 inset-x-0 text-center text-sm text-white/80 num pointer-events-none">
                {faDigits(index + 1)} / {faDigits(count)}
              </span>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Gallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState<number | null>(null);
  const closeZoom = useCallback(() => setZoom(null), []);

  if (!images.length) {
    return <CategoryThumb category={{ name, image: null }} className="w-full aspect-[4/3] rounded-3xl" />;
  }

  return (
    <div>
      {/* موبایل: اسلاید افقی */}
      <div className="lg:hidden -mx-4">
        <div
          className="snap-row gap-0 px-0"
          onScroll={(e) => {
            const el = e.currentTarget;
            // RTL: scrollLeft منفی است
            setActive(Math.round(Math.abs(el.scrollLeft) / el.clientWidth));
          }}
        >
          {images.map((src, i) => (
            <button key={src} type="button" onClick={() => setZoom(i)} aria-label={`بزرگ‌نمایی تصویر ${faDigits(i + 1)}`} className="relative block w-full aspect-[4/3] bg-[var(--muted)] cursor-zoom-in">
              <Image src={src} alt={i === 0 ? name : `${name} — تصویر ${faDigits(i + 1)}`} fill sizes="100vw" quality={90} className="object-cover" priority={i === 0} />
            </button>
          ))}
        </div>
        {images.length > 1 && (
          <div className="flex justify-center gap-1.5 mt-3">
            {images.map((src, i) => (
              <span key={src} className={cn('h-1.5 rounded-full transition-all', i === active ? 'w-6 bg-[var(--accent)]' : 'w-1.5 bg-[var(--border)]')} />
            ))}
          </div>
        )}
      </div>

      {/* دسکتاپ: تصویر اصلی + بندانگشتی */}
      <div className="hidden lg:block">
        <button type="button" onClick={() => setZoom(active)} aria-label="بزرگ‌نمایی تصویر" className="relative block w-full aspect-[4/3] rounded-3xl overflow-hidden bg-[var(--muted)] border border-[var(--border)] cursor-zoom-in">
          {/* همه عکس‌ها روی هم و از اول بارگذاری می‌شوند؛ کلیک روی بندانگشتی فقط عکس آماده را نشان می‌دهد —
              قبلاً با هر کلیک آدرس عکس عوض می‌شد و تا ساخت نسخه جدید روی سرور منتظر می‌ماند */}
          {images.map((src, i) => (
            <Image
              key={src}
              src={src}
              alt={i === active ? name : ''}
              aria-hidden={i !== active}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              quality={90}
              priority={i === 0}
              className={cn('object-cover transition-opacity duration-200', i === active ? 'opacity-100' : 'opacity-0')}
            />
          ))}
        </button>
        {images.length > 1 && (
          // نوار افقی بندانگشتی — با عکس‌های زیاد چند ردیف نمی‌شود
          <div className="mt-3 snap-row gap-2 pb-1">
            {images.map((src, i) => (
              <button
                key={src}
                onClick={() => setActive(i)}
                aria-label={`تصویر ${faDigits(i + 1)}`}
                className={cn('relative w-20 xl:w-24 aspect-square rounded-2xl overflow-hidden border-2 transition-colors', i === active ? 'border-[var(--accent)]' : 'border-transparent opacity-70 hover:opacity-100')}
              >
                <Image src={src} alt="" fill sizes="10vw" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <Lightbox images={images} name={name} index={zoom} onIndex={setZoom} onClose={closeZoom} />
    </div>
  );
}

type Props = {
  product: Product;
  related?: ProductListItem[];
  board: PriceBoard;
  /** دسته فعلاً فروش ندارد — بدون قیمت، با برچسب «به زودی» */
  comingSoon?: boolean;
};

export function ProductDetailView({ product, related = [], board: initialBoard, comingSoon = false }: Props) {
  const { phone, phoneHref, whatsappUrl, mobile, mobileHref, certificates } = useSiteSettings();
  const { open } = useConsult();

  const images = product.images.length ? product.images : product.category.image ? [product.category.image] : [];
  const specs = Object.entries(product.specifications ?? {});
  const catalogs = product.catalogs ?? [];
  const showCertificates = siteConfig.certificateCategorySlugs.includes(product.category.slug);
  const { board } = useLiveBoard(initialBoard);
  const line = board.lines.find((l) => l.productId === product.id);
  const summary = summarizeLine(line?.items ?? []);
  const subject = subjectFor(product.category.slug, product.slug);
  const cardSpecs = withDerivedSpecs(specs, line?.items ?? [], subject).slice(0, 4);
  const marketOpen = board.market.open;
  const legacyPrice = product.price ? formatProductPrice(product.price) : null;

  const sections: Section[] = [
    ...(summary.count ? [{ id: 'price-table', label: 'جدول قیمت' }] : []),
    ...(product.description ? [{ id: 'overview', label: 'معرفی محصول' }] : []),
    ...(specs.length ? [{ id: 'specs', label: 'مشخصات فنی' }] : []),
    ...(catalogs.length ? [{ id: 'catalog', label: 'کاتالوگ' }] : []),
    ...(product.faqs.length ? [{ id: 'faq', label: 'سوالات متداول' }] : []),
  ];
  const [current, setCurrent] = useState(sections[0]?.id);
  const sectionIds = sections.map((s) => s.id).join(',');

  // scroll-spy: تب فعال با بخشی که در دید است هماهنگ می‌شود
  useEffect(() => {
    const els = sectionIds.split(',').map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setCurrent(visible.target.id);
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [sectionIds]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - (window.innerWidth >= 1024 ? 180 : 120);
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  return (
    <div className="pb-24 lg:pb-0">
      {/* مسیر صفحه */}
      <div className="border-b border-[var(--border)] bg-[var(--card)]">
        <nav aria-label="مسیر صفحه" className="container-main h-11 flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] overflow-x-auto no-scrollbar whitespace-nowrap">
          <Link href="/" className="hover:text-[var(--accent-text)]">خانه</Link>
          <ChevronLeft className="w-3 h-3 shrink-0" />
          <Link href="/products" className="hover:text-[var(--accent-text)]">محصولات</Link>
          <ChevronLeft className="w-3 h-3 shrink-0" />
          <Link href={`/products/${product.category.slug}`} className="hover:text-[var(--accent-text)]">{product.category.name}</Link>
          <ChevronLeft className="w-3 h-3 shrink-0" />
          <span className="text-[var(--foreground)] font-semibold">{faDigits(product.name)}</span>
        </nav>
      </div>

      <div className="container-main pt-4 lg:pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
          <motion.div>
            <Gallery images={images} name={product.name} />
          </motion.div>

          <motion.div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-2">
              <Link href={`/products/${product.category.slug}`} className="h-7 px-3 rounded-lg bg-[var(--accent)]/12 text-[var(--accent-text)] text-xs font-bold flex items-center">
                {product.category.name}
              </Link>
              {comingSoon ? (
                <span className="h-7 px-3 rounded-lg text-xs font-bold flex items-center bg-[var(--accent)] text-[var(--accent-foreground)]">به زودی</span>
              ) : (
                <span className={cn('h-7 px-3 rounded-lg text-xs font-bold flex items-center gap-1', product.inStock ? 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400' : 'bg-[var(--muted)] text-[var(--muted-foreground)]')}>
                  {product.inStock ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                  {product.inStock ? 'موجود' : 'ناموجود'}
                </span>
              )}
            </div>

            <h1 className="mt-3 text-2xl sm:text-3xl lg:text-[2.1rem] font-black leading-[1.45]">{faDigits(product.name)}</h1>
            {product.shortDescription && (
              <p className="mt-3 text-[15px] leading-8 text-[var(--muted-foreground)]">{faDigits(product.shortDescription)}</p>
            )}

            <SpecCards specs={cardSpecs} subject={subject} />

            {/* فقط عکس گواهی‌های واقعی — نام استانداردها همین حالا در جدول مشخصات فنی هست و تکرارش شلوغ می‌کرد.
                فقط روی دسته‌هایی که این پروانه‌ها واقعاً برایشان صادر شده (کاروگیت و دیواره ساختمند) */}
            {showCertificates && (
              <div className="mt-4 rounded-3xl border border-[var(--border)] bg-[var(--card)] p-4 empty:hidden">
                <CertificateStrip certificates={certificates} />
              </div>
            )}

            {/* کارشناس فروش — موبایل (در دسکتاپ سایدبار همین کار را می‌کند) */}
            <div className="lg:hidden mt-4 flex items-center gap-3 rounded-3xl border border-[var(--border)] bg-[var(--card)] p-3">
              <span className="relative shrink-0">
                <Image src="/images/site/sales-expert-avatar.webp" alt={siteConfig.salesExpert.name} width={56} height={56} className="w-14 h-14 rounded-2xl object-cover ring-2 ring-[var(--accent)]" />
                <span className="live-dot absolute -bottom-0.5 -left-0.5 ring-2 ring-[var(--card)]" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-black text-[15px] leading-6">{siteConfig.salesExpert.name}</p>
                <p className="text-[11px] text-[var(--muted-foreground)]">{siteConfig.salesExpert.role} · مشاوره و خرید</p>
              </div>
              <a href={phoneHref} aria-label="تماس" className="w-11 h-11 rounded-2xl bg-[var(--ink)] text-white grid place-items-center shrink-0"><Phone className="w-5 h-5" /></a>
              <a href={whatsappUrl} target="_blank" rel="noopener" aria-label="واتس‌اپ" className="w-11 h-11 rounded-2xl bg-[#128C7E] text-white grid place-items-center shrink-0"><MessageCircle className="w-5 h-5" /></a>
            </div>

            {/* خلاصه قیمت — زنده */}
            <div className="mt-5 rounded-3xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-5">
              {summary.count > 0 ? (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-[var(--muted-foreground)]">{marketOpen ? 'محدوده قیمت امروز' : 'قیمت'}</p>
                      <p className="mt-1 text-lg sm:text-xl font-black num">
                        {marketOpen && summary.minPrice != null ? (
                          <>
                            {summary.minPrice.toLocaleString('fa-IR')}
                            {summary.maxPrice !== summary.minPrice && summary.maxPrice != null && <> تا {summary.maxPrice.toLocaleString('fa-IR')}</>}
                            <span className="text-xs font-medium text-[var(--muted-foreground)] ms-1">تومان</span>
                          </>
                        ) : (
                          'استعلام قیمت'
                        )}
                      </p>
                    </div>
                    <span className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-bold num">{faDigits(summary.count)} نوع</span>
                      <IconTile icon={Table2} size="sm" />
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <MarketStatus market={board.market} />
                  </div>
                  <button onClick={() => scrollTo('price-table')} className="mt-3 text-sm font-bold text-[var(--accent-text)] hover:underline">
                    مشاهده جدول کامل قیمت ←
                  </button>
                </>
              ) : comingSoon ? (
                <div>
                  <p className="text-xs text-[var(--muted-foreground)]">قیمت</p>
                  <p className="mt-1 text-xl font-black">به زودی</p>
                  <p className="mt-1 text-xs leading-6 text-[var(--muted-foreground)]">
                    عرضه این محصول به زودی آغاز می‌شود. برای استعلام قیمت و اطلاع از زمان عرضه درخواست ثبت کنید.
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-xs text-[var(--muted-foreground)]">قیمت</p>
                  <p className="mt-1 text-xl font-black num">
                    {legacyPrice && legacyPrice !== '۰' ? <>{legacyPrice} <span className="text-xs font-medium text-[var(--muted-foreground)]">تومان</span></> : 'استعلام قیمت'}
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">برای قیمت روز و خرید عمده با کارشناسان تماس بگیرید.</p>
                </div>
              )}
            </div>

            {/* کاتالوگ — بالای صفحه قابل دیدن باشد، نه فقط در بخش پایینی */}
            {catalogs.length > 0 && (
              <div className="mt-3 flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-3">
                <span className="w-10 h-10 rounded-xl bg-[var(--accent)]/12 grid place-items-center shrink-0">
                  <BookOpen className="w-5 h-5 text-[var(--accent-text)]" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold leading-6">کاتالوگ و مدارک فنی</p>
                  <p className="text-xs text-[var(--muted-foreground)] num">
                    {faDigits(catalogs.length)} فایل — جدول سایز، ابعاد و کد فنی
                  </p>
                </div>
                <button
                  onClick={() => scrollTo('catalog')}
                  className="h-10 px-4 rounded-xl border border-[var(--border)] text-sm font-bold flex items-center gap-1.5 shrink-0 hover:border-[var(--accent)] transition-colors"
                >
                  <Download className="w-4 h-4 text-[var(--accent-text)]" />
                  دانلود
                </button>
              </div>
            )}

            {/* دکمه‌ها — در موبایل نوار پایین همین کار را می‌کند */}
            <div className="hidden lg:flex gap-3 mt-5">
              <button onClick={() => open(product.name)} className="flex-1 h-13 rounded-2xl bg-[var(--accent)] text-[var(--accent-foreground)] font-black shadow-accent flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-transform">
                <Headphones className="w-5 h-5" />
                {comingSoon ? 'استعلام و اطلاع از زمان عرضه' : 'ثبت درخواست مشاوره و خرید'}
              </button>
              <a href={phoneHref} className="h-13 px-5 rounded-2xl border border-[var(--border)] font-bold flex items-center gap-2 hover:border-[var(--accent)]">
                <Phone className="w-4.5 h-4.5 text-[var(--accent-text)]" />
                <span dir="ltr" className="num">{faDigits(phone)}</span>
              </a>
              <a href={whatsappUrl} target="_blank" rel="noopener" aria-label="واتس‌اپ" className="h-13 w-13 rounded-2xl bg-[#128C7E] text-white grid place-items-center">
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>

          </motion.div>
        </div>
      </div>

      {/* نوار بخش‌ها — چسبان زیر هدر */}
      {sections.length > 1 && (
        <div className="sticky top-[var(--nav-height)] z-30 mt-8 lg:mt-12 bg-[var(--background)]/90 backdrop-blur-xl border-y border-[var(--border)]">
          <div className="container-main">
            <div className="snap-row gap-1 h-13 items-center">
              {sections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className={cn('relative h-13 px-4 text-sm font-bold whitespace-nowrap transition-colors', current === s.id ? 'text-[var(--accent-text)]' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]')}
                >
                  {s.label}
                  {current === s.id && <motion.span layoutId="product-tab" className="absolute inset-x-3 bottom-0 h-[3px] rounded-full bg-[var(--accent)]" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="container-main mt-8 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 lg:gap-10 items-start">
        <div className="min-w-0 space-y-12">
          {summary.count > 0 && (
            <section id="price-table" aria-labelledby="price-table-title" className="scroll-mt-40">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h2 id="price-table-title" className="text-xl sm:text-2xl font-black flex items-center gap-3"><IconTile icon={Table2} size="sm" />جدول قیمت {faDigits(product.name)}</h2>
                <MarketStatus market={board.market} />
              </div>
              <LivePriceTable initial={initialBoard} productIds={[product.id]} caption={`قیمت ${product.name}`} toolbar />
            </section>
          )}

          {product.description && (
            <section id="overview" aria-labelledby="overview-title" className="scroll-mt-40">
              <h2 id="overview-title" className="text-xl sm:text-2xl font-black mb-4 flex items-center gap-3"><IconTile icon={FileText} tone="sky" size="sm" />معرفی {faDigits(product.name)}</h2>
              <div className="article-content" dangerouslySetInnerHTML={{ __html: product.description }} />
            </section>
          )}

          {specs.length > 0 && (
            <section id="specs" aria-labelledby="specs-title" className="scroll-mt-40">
              <h2 id="specs-title" className="text-xl sm:text-2xl font-black mb-4 flex items-center gap-3"><IconTile icon={ListChecks} tone="emerald" size="sm" />مشخصات فنی</h2>
              <dl className="rounded-2xl border border-[var(--border)] overflow-hidden">
                {specs.map(([k, v], i) => {
                  const SpecIcon = specMeta(k).icon;
                  return (
                  <div key={k} className={cn('grid grid-cols-[40%_1fr] sm:grid-cols-[220px_1fr] text-sm transition-colors hover:bg-[var(--muted)]/40', i > 0 && 'border-t border-[var(--border)]')}>
                    <dt className="px-4 py-3.5 bg-[var(--muted)] font-semibold text-[var(--muted-foreground)] flex items-center gap-2"><SpecIcon className="w-4 h-4 shrink-0 text-[var(--accent-text)]" />{k}</dt>
                    <dd className="px-4 py-3.5 font-bold num">{faDigits(v)}</dd>
                  </div>
                  );
                })}
              </dl>
            </section>
          )}

          {catalogs.length > 0 && (
            <section id="catalog" aria-labelledby="catalog-title" className="scroll-mt-40">
              <h2 id="catalog-title" className="text-xl sm:text-2xl font-black mb-2 flex items-center gap-3"><IconTile icon={BookOpen} tone="sky" size="sm" />کاتالوگ و مدارک فنی</h2>
              <p className="mb-4 text-sm leading-7 text-[var(--muted-foreground)]">
                کاتالوگ رسمی با جدول سایزها، ابعاد و کد فنی — برای مطالعه آفلاین دانلود کنید یا همین‌جا ببینید.
              </p>
              <ProductCatalogs catalogs={catalogs} productName={product.name} />
            </section>
          )}

          {product.faqs.length > 0 && (
            <section id="faq" className="scroll-mt-40 [&>section]:mt-0 [&>section]:pt-0 [&>section]:border-0">
              <FaqAccordion faqs={product.faqs} />
            </section>
          )}
        </div>

        {/* سایدبار کارشناس فروش — دسکتاپ */}
        <aside className="hidden lg:block sticky top-[calc(var(--nav-height)+72px)]">
          <div className="rounded-3xl bg-[var(--ink)] text-white relative overflow-hidden">
            {/* عکس کارشناس فروش */}
            <div className="group relative aspect-[4/3.4] overflow-hidden">
              <Image
                src="/images/site/sales-expert-wm.webp"
                alt={`${siteConfig.salesExpert.name}، ${siteConfig.salesExpert.role}`}
                fill
                sizes="320px"
                quality={90}
                className="object-cover object-[50%_20%] transition-transform duration-700 group-hover:scale-105"
              />
              <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-[var(--ink)] via-[var(--ink)]/20 to-transparent" />
              <div className="text-legible absolute inset-x-0 bottom-0 px-6 pb-3">
                <p className="text-[11px] text-white/85 flex items-center gap-1.5"><span className="live-dot" />{siteConfig.salesExpert.role} · پاسخگو</p>
                <p className="font-black text-xl leading-8 text-white">{siteConfig.salesExpert.name}</p>
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 top-[60%] bp-grid opacity-60 pointer-events-none" />
            <div className="relative px-6 pb-6">
              <p className="mt-2 text-sm text-slate-300 leading-7">برای استعلام قیمت و خرید این محصول تماس بگیرید</p>
              <div className="mt-5 space-y-2">
                <a href={phoneHref} className="flex items-center justify-between h-12 px-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10">
                  <Phone className="w-4.5 h-4.5 text-[var(--accent-text)]" />
                  <span dir="ltr" className="num font-bold">{faDigits(phone)}</span>
                </a>
                {mobile && mobile !== phone && (
                  <a href={mobileHref} className="flex items-center justify-between h-12 px-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10">
                    <Phone className="w-4.5 h-4.5 text-[var(--accent-text)]" />
                    <span dir="ltr" className="num font-bold">{faDigits(mobile)}</span>
                  </a>
                )}
                <a href={whatsappUrl} target="_blank" rel="noopener" className="flex items-center justify-center gap-2 h-12 rounded-2xl bg-[#128C7E] font-bold">
                  <MessageCircle className="w-5 h-5" /> گفتگو در واتس‌اپ
                </a>
              </div>
              <p className="mt-4 flex items-center gap-1.5 text-xs text-slate-400"><Clock className="w-3.5 h-3.5" />{siteConfig.workingHours}</p>
            </div>
          </div>
          <button onClick={() => open(product.name)} className="mt-3 w-full h-12 rounded-2xl border-2 border-[var(--accent)] text-[var(--accent-text)] font-black hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors">
            ثبت درخواست مشاوره
          </button>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="section-padding" aria-labelledby="related-title">
          <div className="container-main">
            <h2 id="related-title" className="text-xl sm:text-2xl font-black mb-5">محصولات مرتبط</h2>
            <div className="snap-row -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-5 sm:overflow-visible">
              {related.map((p) => (
                <div key={p.id} className="w-[72%] sm:w-auto"><ProductCard product={p} /></div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* نوار اقدام موبایل */}
      <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 bg-[var(--background)]/95 backdrop-blur-xl border-t border-[var(--border)] px-4 pt-3 pb-[max(env(safe-area-inset-bottom),12px)]">
        <div className="flex gap-2">
          <button onClick={() => open(product.name)} className="flex-1 h-12 rounded-2xl bg-[var(--accent)] text-[var(--accent-foreground)] font-black flex items-center justify-center gap-2 shadow-accent">
            <Headphones className="w-5 h-5" />
            {comingSoon ? 'استعلام قیمت' : 'مشاوره و خرید'}
          </button>
          <a href={phoneHref} aria-label="تماس" className="w-12 h-12 rounded-2xl bg-[var(--ink)] text-white grid place-items-center"><Phone className="w-5 h-5" /></a>
          <a href={whatsappUrl} target="_blank" rel="noopener" aria-label="واتس‌اپ" className="w-12 h-12 rounded-2xl bg-[#128C7E] text-white grid place-items-center"><MessageCircle className="w-5 h-5" /></a>
        </div>
      </div>
    </div>
  );
}
