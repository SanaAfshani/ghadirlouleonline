'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { m as motion } from 'framer-motion';
import {
  CalendarClock, Check, ChevronLeft, Clock, Headphones, MessageCircle, Phone, ShieldCheck, Table2, Truck, X,
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
import { priceTime } from '@/features/prices/LivePriceTable';
import { summarizeLine, type PriceBoard } from '@/shared/lib/price-board-types';
import { ProductCard } from '@/features/products/ProductCard';
import { CategoryThumb } from '@/widgets/header/Header';
import { siteConfig } from '@/shared/config/site';
import { cn, faDigits } from '@/shared/lib/utils';

type Section = { id: string; label: string };

function Gallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);

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
            <div key={src} className="relative w-full aspect-[4/3] bg-[var(--muted)]">
              <Image src={src} alt={i === 0 ? name : `${name} — تصویر ${faDigits(i + 1)}`} fill sizes="100vw" quality={90} className="object-cover" priority={i === 0} />
            </div>
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
        <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-[var(--muted)] border border-[var(--border)]">
          <Image src={images[active]} alt={name} fill sizes="(max-width: 1024px) 100vw, 50vw" quality={90} className="object-cover" priority />
        </div>
        {images.length > 1 && (
          <div className="mt-3 grid grid-cols-5 gap-2">
            {images.map((src, i) => (
              <button
                key={src}
                onClick={() => setActive(i)}
                aria-label={`تصویر ${faDigits(i + 1)}`}
                className={cn('relative aspect-square rounded-2xl overflow-hidden border-2 transition-colors', i === active ? 'border-[var(--accent)]' : 'border-transparent opacity-70 hover:opacity-100')}
              >
                <Image src={src} alt="" fill sizes="10vw" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
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
  const { phone, phoneHref, whatsappUrl, mobile, mobileHref } = useSiteSettings();
  const { open } = useConsult();

  const images = product.images.length ? product.images : product.category.image ? [product.category.image] : [];
  const specs = Object.entries(product.specifications ?? {});
  const { board } = useLiveBoard(initialBoard);
  const line = board.lines.find((l) => l.productId === product.id);
  const summary = summarizeLine(line?.items ?? []);
  const marketOpen = board.market.open;
  const legacyPrice = product.price ? formatProductPrice(product.price) : null;

  const sections: Section[] = [
    ...(summary.count ? [{ id: 'price-table', label: 'جدول قیمت' }] : []),
    ...(product.description ? [{ id: 'overview', label: 'معرفی محصول' }] : []),
    ...(specs.length ? [{ id: 'specs', label: 'مشخصات فنی' }] : []),
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

            {specs.length > 0 && (
              <dl className="mt-5 grid grid-cols-2 gap-2">
                {specs.slice(0, 4).map(([k, v]) => (
                  <div key={k} className="rounded-2xl bg-[var(--muted)] px-3.5 py-2.5">
                    <dt className="text-[11px] text-[var(--muted-foreground)]">{k}</dt>
                    <dd className="mt-0.5 font-bold text-sm num">{faDigits(v)}</dd>
                  </div>
                ))}
              </dl>
            )}

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
                    <span className="h-8 px-3 rounded-lg bg-[var(--muted)] text-xs font-bold flex items-center gap-1 num shrink-0">
                      <Table2 className="w-3.5 h-3.5" />
                      {faDigits(summary.count)} نوع
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <MarketStatus market={board.market} />
                    {summary.updatedAt && (
                      <span className="flex items-center gap-1 text-xs text-[var(--muted-foreground)] num">
                        <CalendarClock className="w-3.5 h-3.5" />
                        آخرین تغییر: {priceTime(summary.updatedAt)}
                      </span>
                    )}
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

            <ul className="mt-5 grid grid-cols-3 gap-2">
              {[
                { icon: ShieldCheck, label: 'ضمانت اصالت کالا' },
                { icon: Truck, label: 'ارسال سراسر کشور' },
                { icon: Headphones, label: 'مشاوره فنی رایگان' },
              ].map(({ icon: Icon, label }) => (
                <li key={label} className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-[var(--card)] border border-[var(--border)] text-center">
                  <Icon className="w-5 h-5 text-[var(--accent-text)]" />
                  <span className="text-[11px] leading-tight text-[var(--muted-foreground)] font-semibold">{label}</span>
                </li>
              ))}
            </ul>
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
                <h2 id="price-table-title" className="text-xl sm:text-2xl font-black">جدول قیمت {faDigits(product.name)}</h2>
                <MarketStatus market={board.market} />
              </div>
              <LivePriceTable initial={initialBoard} productIds={[product.id]} caption={`قیمت ${product.name}`} toolbar />
            </section>
          )}

          {product.description && (
            <section id="overview" aria-labelledby="overview-title" className="scroll-mt-40">
              <h2 id="overview-title" className="text-xl sm:text-2xl font-black mb-4">معرفی {faDigits(product.name)}</h2>
              <div className="article-content" dangerouslySetInnerHTML={{ __html: product.description }} />
            </section>
          )}

          {specs.length > 0 && (
            <section id="specs" aria-labelledby="specs-title" className="scroll-mt-40">
              <h2 id="specs-title" className="text-xl sm:text-2xl font-black mb-4">مشخصات فنی</h2>
              <dl className="rounded-2xl border border-[var(--border)] overflow-hidden">
                {specs.map(([k, v], i) => (
                  <div key={k} className={cn('grid grid-cols-[40%_1fr] sm:grid-cols-[220px_1fr] text-sm', i > 0 && 'border-t border-[var(--border)]')}>
                    <dt className="px-4 py-3.5 bg-[var(--muted)] font-semibold text-[var(--muted-foreground)]">{k}</dt>
                    <dd className="px-4 py-3.5 font-bold num">{faDigits(v)}</dd>
                  </div>
                ))}
              </dl>
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
          <div className="rounded-3xl bg-[var(--ink)] text-white p-6 relative overflow-hidden">
            <div className="absolute inset-0 bp-grid opacity-60" />
            <div className="relative">
              <p className="eyebrow">کارشناسان فروش</p>
              <p className="mt-2 font-black text-lg leading-8">برای استعلام قیمت و خرید این محصول تماس بگیرید</p>
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
