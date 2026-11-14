'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { Link } from '@/shared/i18n/Link';
import { m as motion } from 'framer-motion';
import {
  BookOpen, Check, ChevronLeft, Clock, Download, FileText, Headphones, ListChecks, MessageCircle, Phone, Table2,
} from 'lucide-react';
import type { Product } from '@/shared/types';
import type { ProductListItem } from '@/shared/lib/serializers';
import type { NavItem } from '@/shared/lib/data';
import { formatProductPrice } from '@/shared/lib/serializers';
import { useSiteSettings } from '@/shared/providers/SiteSettingsProvider';
import { useConsult } from '@/features/consult/ConsultProvider';
import { FaqAccordion } from '@/shared/ui/FaqAccordion';
import { LivePriceTable } from '@/features/prices/LivePriceTable';
import { MarketStatus } from '@/features/prices/MarketStatus';
import { useLiveBoard } from '@/features/prices/live-store';
import { isPriceFresh, summarizeLine, type PriceBoard } from '@/shared/lib/price-board-types';
import { ProductCard } from '@/features/products/ProductCard';
import { CategoryThumb } from '@/widgets/header/Header';
import { siteConfig } from '@/shared/config/site';
import { SIZE_SPEC_KEY } from '@/shared/config/product-lines';
import { supplyStatusLabel, type SupplyStatus } from '@/shared/lib/supply-status';
import { IconTile } from '@/shared/ui/IconTile';
import { LtrCodes } from '@/shared/ui/LtrCodes';
import { RubikaIcon } from '@/shared/ui/RubikaIcon';
import { RubikaButton, rubikaMessage } from '@/shared/ui/RubikaButton';
import { SpecCards, specMeta, withDerivedSpecs, type SpecEntry } from '@/features/products/SpecCards';
import { ProductCatalogs } from '@/features/products/ProductCatalogs';
import { DimensionTable } from '@/features/products/DimensionTable';
import { pipeDimensionsFor } from '@/shared/lib/pipe-dimensions';
import { subjectFor } from '@/features/products/SpecIllustration';
import { CertificateStrip } from '@/features/certificates/Certificates';
import { ImageLightbox } from '@/shared/ui/ImageLightbox';
import { cn } from '@/shared/lib/utils';
import { useLocale, useMessages } from '@/shared/i18n/LocaleProvider';
import { defineMessages, fill } from '@/shared/i18n/messages';
import { digits, formatDate, formatNumber } from '@/shared/i18n/format';
import type { ContentOf } from '@/shared/content/types';
import type { productDetailCopy } from '@/shared/content/pages/products';

type Section = { id: string; label: string };

const messages = defineMessages({
  fa: {
    zoomImage: 'بزرگ‌نمایی تصویر',
    zoomImageN: 'بزرگ‌نمایی تصویر {n}',
    imageN: 'تصویر {n}',
    imageAlt: '{name} — تصویر {n}',
    breadcrumb: 'مسیر صفحه',
    home: 'خانه',
    products: 'محصولات',
    comingSoon: 'به زودی',
    chooseFrom: 'انتخاب از {name}',
    chooseSize: 'انتخاب سایز (میلی‌متر)',
    typesOf: 'انواع {name}',
    fittingsLabel: 'اتصالات هم‌سایز',
    fittingsTitle: 'اتصالات همین سایز',
    call: 'تماس',
    whatsapp: 'واتس‌اپ',
    rubika: 'روبیکا',
    priceRangeToday: 'محدوده قیمت امروز',
    lastPrice: 'آخرین قیمت ثبت‌شده · {date}',
    price: 'قیمت',
    to: 'تا',
    toman: 'تومان',
    priceOnRequest: 'استعلام قیمت',
    typesCount: '{n} نوع',
    viewFullTable: 'مشاهده جدول کامل قیمت ←',
    projectInquiry: 'استعلام پروژه‌ای (متراژ و چند سایز) ←',
    catalogTitle: 'کاتالوگ و مدارک فنی',
    catalogFiles: '{n} فایل — جدول سایز، ابعاد و کد فنی',
    download: 'دانلود',
    consultComingSoon: 'استعلام و اطلاع از زمان عرضه',
    consultBuy: 'ثبت درخواست مشاوره و خرید',
    tabPriceTable: 'جدول قیمت',
    tabOverview: 'معرفی محصول',
    tabSpecs: 'مشخصات فنی',
    tabDimensions: 'جدول ابعاد',
    tabCatalog: 'کاتالوگ',
    tabFaq: 'سوالات متداول',
    priceTableTitle: 'جدول قیمت {name}',
    tableCaption: 'قیمت {name}',
    overviewTitle: 'معرفی {name}',
    specsTitle: 'مشخصات فنی',
    expertAlt: '{name}، {role}',
    whatsappChat: 'گفتگو در واتس‌اپ',
    rubikaChat: 'گفتگو در روبیکا',
    rubikaId: 'روبیکا:',
    consult: 'ثبت درخواست مشاوره',
    related: 'محصولات مرتبط',
    mobileConsult: 'مشاوره و خرید',
    certificates: 'گواهینامه‌ها و استانداردها',
  },
  en: {
    zoomImage: 'Enlarge image',
    zoomImageN: 'Enlarge image {n}',
    imageN: 'Image {n}',
    imageAlt: '{name}, image {n}',
    breadcrumb: 'Breadcrumb',
    home: 'Home',
    products: 'Products',
    comingSoon: 'Coming soon',
    chooseFrom: 'Choose from {name}',
    chooseSize: 'Choose a size (mm)',
    typesOf: '{name} types',
    fittingsLabel: 'Fittings in the same size',
    fittingsTitle: 'Fittings for this size',
    call: 'Call',
    whatsapp: 'WhatsApp',
    rubika: 'Rubika',
    priceRangeToday: 'Today’s price range',
    lastPrice: 'Last recorded price · {date}',
    price: 'Price',
    to: 'to',
    toman: 'Toman',
    priceOnRequest: 'Price on request',
    typesCount: '{n} types',
    viewFullTable: 'View the full price table →',
    projectInquiry: 'Project inquiry (quantities and several sizes) →',
    catalogTitle: 'Catalogue and technical documents',
    catalogFiles: '{n} files: size table, dimensions and technical codes',
    download: 'Download',
    consultComingSoon: 'Inquire and get notified at launch',
    consultBuy: 'Request advice and order',
    tabPriceTable: 'Price table',
    tabOverview: 'Overview',
    tabSpecs: 'Specifications',
    tabDimensions: 'Dimensions',
    tabCatalog: 'Catalogue',
    tabFaq: 'FAQ',
    priceTableTitle: '{name} price table',
    tableCaption: '{name} prices',
    overviewTitle: 'About {name}',
    specsTitle: 'Technical specifications',
    expertAlt: '{name}, {role}',
    whatsappChat: 'Chat on WhatsApp',
    rubikaChat: 'Chat on Rubika',
    rubikaId: 'Rubika:',
    consult: 'Request advice',
    related: 'Related products',
    mobileConsult: 'Advice and orders',
    certificates: 'Certificates and standards',
  },
});

const SUPPLY_TONE: Record<SupplyStatus, string> = {
  ready: 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400',
  inquiry: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  pending: 'bg-[var(--muted)] text-[var(--muted-foreground)]',
};

function Gallery({ images, name }: { images: string[]; name: string }) {
  const locale = useLocale();
  const t = useMessages(messages);
  const n = (i: number) => digits(i + 1, locale);
  const alt = (i: number) => (i === 0 ? name : fill(t.imageAlt, { name, n: n(i) }));
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
            <button key={src} type="button" onClick={() => setZoom(i)} aria-label={fill(t.zoomImageN, { n: n(i) })} className="relative block w-full aspect-[4/3] bg-[var(--muted)] cursor-zoom-in">
              <Image src={src} alt={alt(i)} fill sizes="100vw" quality={90} className="object-cover" priority={i === 0} />
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
        <button type="button" onClick={() => setZoom(active)} aria-label={t.zoomImage} className="relative block w-full aspect-[4/3] rounded-3xl overflow-hidden bg-[var(--muted)] border border-[var(--border)] cursor-zoom-in">
          {/* همه عکس‌ها روی هم و از اول بارگذاری می‌شوند؛ کلیک روی بندانگشتی فقط عکس آماده را نشان می‌دهد —
              قبلاً با هر کلیک آدرس عکس عوض می‌شد و تا ساخت نسخه جدید روی سرور منتظر می‌ماند */}
          {images.map((src, i) => (
            <Image
              key={src}
              src={src}
              // alt برای همه: گوگل تصویرها را از همین تگ‌ها ایندکس می‌کند و alt خالی یعنی «تزئینی»؛ aria-hidden
              // همچنان صفحه‌خوان را فقط به عکس فعال محدود می‌کند
              alt={alt(i)}
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
                aria-label={fill(t.imageN, { n: n(i) })}
                className={cn('relative w-20 xl:w-24 aspect-square rounded-2xl overflow-hidden border-2 transition-colors', i === active ? 'border-[var(--accent)]' : 'border-transparent opacity-70 hover:opacity-100')}
              >
                <Image src={src} alt={fill(t.imageAlt, { name, n: n(i) })} fill sizes="10vw" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <ImageLightbox images={images} name={name} index={zoom} onIndex={setZoom} onClose={closeZoom} />
    </div>
  );
}

type Props = {
  /** محصول به زبان صفحه (نام، توضیحات، سوالات، نام دسته و عنوان کاتالوگ‌ها) */
  product: Product;
  /** مشخصات فنی: کلید فارسی برای منطق، برچسب و مقدار به زبان صفحه */
  specs: SpecEntry[];
  /** متن‌های ثابت صفحه محصول از پنل محتوا */
  copy: ContentOf<typeof productDetailCopy>;
  /** توضیح کلاس SN زیر جدول قیمت */
  snNote: string;
  related?: ProductListItem[];
  /** همه محصولات همین دسته (سایزهای دیگر یا انواع دیگر) — مثل انتخاب تنوع در دیجی‌کالا */
  variants?: ProductListItem[];
  /** اتصالات کاروگیت موجود در سایز همین لوله */
  fittings?: NavItem[];
  board: PriceBoard;
  /** دسته فعلاً فروش ندارد — بدون قیمت، با برچسب «به زودی» */
  comingSoon?: boolean;
};

export function ProductDetailView({ product, specs, copy, snNote, related = [], variants = [], fittings = [], board: initialBoard, comingSoon = false }: Props) {
  const {
    phone, phoneHref, whatsappUrl, mobile, mobileHref, certificates, salesExpertName, salesExpertRole, workingHours, rubikaId,
  } = useSiteSettings();
  const { open } = useConsult();
  const locale = useLocale();
  const t = useMessages(messages);

  const images = product.images.length ? product.images : product.category.image ? [product.category.image] : [];
  const dimensions = pipeDimensionsFor(product.slug);
  const catalogs = product.catalogs ?? [];
  const showCertificates = siteConfig.certificateCategorySlugs.includes(product.category.slug);
  const { board } = useLiveBoard(initialBoard);
  const line = board.lines.find((l) => l.productId === product.id);
  const summary = summarizeLine(line?.items ?? []);
  const subject = subjectFor(product.category.slug, product.slug);
  const cardSpecs = withDerivedSpecs(specs, line?.items ?? [], subject, locale).slice(0, 4);
  const marketOpen = board.market.open;
  const liveSummary = marketOpen && isPriceFresh(summary.updatedAt);
  const legacyPrice = product.price ? formatProductPrice(product.price, locale) : null;

  const bySize = variants.length > 0 && variants.every((v) => v.specs[SIZE_SPEC_KEY]);

  const sections: Section[] = [
    ...(summary.count ? [{ id: 'price-table', label: t.tabPriceTable }] : []),
    ...(product.description ? [{ id: 'overview', label: t.tabOverview }] : []),
    ...(specs.length ? [{ id: 'specs', label: t.tabSpecs }] : []),
    ...(dimensions.length ? [{ id: 'dimensions', label: t.tabDimensions }] : []),
    ...(catalogs.length ? [{ id: 'catalog', label: t.tabCatalog }] : []),
    ...(product.faqs.length ? [{ id: 'faq', label: t.tabFaq }] : []),
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
        <nav aria-label={t.breadcrumb} className="container-main h-11 flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] overflow-x-auto no-scrollbar whitespace-nowrap">
          <Link href="/" className="hover:text-[var(--accent-text)]">{t.home}</Link>
          <ChevronLeft className="w-3 h-3 shrink-0 ltr:rotate-180" />
          <Link href="/products" className="hover:text-[var(--accent-text)]">{t.products}</Link>
          <ChevronLeft className="w-3 h-3 shrink-0 ltr:rotate-180" />
          <Link href={`/products/${product.category.slug}`} className="hover:text-[var(--accent-text)]">{product.category.name}</Link>
          <ChevronLeft className="w-3 h-3 shrink-0 ltr:rotate-180" />
          <span className="text-[var(--foreground)] font-semibold">{digits(product.name, locale)}</span>
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
                <span className="h-7 px-3 rounded-lg text-xs font-bold flex items-center bg-[var(--accent)] text-[var(--accent-foreground)]">{t.comingSoon}</span>
              ) : (
                <span className={cn('h-7 px-3 rounded-lg text-xs font-bold flex items-center gap-1', SUPPLY_TONE[product.supplyStatus])}>
                  {product.supplyStatus === 'ready' ? <Check className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                  {supplyStatusLabel(product.supplyStatus, locale)}
                </span>
              )}
            </div>

            <h1 className="mt-3 text-2xl sm:text-3xl lg:text-[2.1rem] font-black leading-[1.45]">{digits(product.name, locale)}</h1>
            {product.shortDescription && (
              <p className="mt-3 text-[15px] leading-8 text-[var(--muted-foreground)]">{digits(product.shortDescription, locale)}</p>
            )}

            {/* هر سایز صفحه خودش را دارد؛ جابه‌جایی بین سایزها یک کلیک است */}
            {variants.length > 1 && (
              <nav aria-label={fill(t.chooseFrom, { name: product.category.name })} className="mt-5">
                <p className="text-sm font-bold mb-2">
                  {bySize ? t.chooseSize : fill(t.typesOf, { name: product.category.name })}
                </p>
                <ul className="flex flex-wrap gap-2">
                  {variants.map((v) => {
                    // واحد در عنوان آمده؛ روی گوشی دوازده دکمه «… میلی‌متر» پنج ردیف می‌شد
                    const label = digits(bySize ? v.specs[SIZE_SPEC_KEY].replace(/\s*میلی‌متر$/, '') : v.name, locale);
                    const cls = 'h-9 px-3.5 rounded-xl border text-sm font-bold flex items-center num transition-colors';
                    return (
                      <li key={v.id}>
                        {v.slug === product.slug ? (
                          <span aria-current="page" className={cn(cls, 'border-[var(--accent)] bg-[var(--accent)]/12 text-[var(--accent-text)]')}>{label}</span>
                        ) : (
                          <Link href={`/products/${v.category}/${v.slug}`} className={cn(cls, 'border-[var(--border)] hover:border-[var(--foreground)]/40')}>{label}</Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </nav>
            )}

            {fittings.length > 0 && (
              <nav aria-label={t.fittingsLabel} className="mt-4">
                <p className="text-sm font-bold mb-2">{t.fittingsTitle}</p>
                <ul className="flex flex-wrap gap-2">
                  {fittings.map((f) => (
                    <li key={f.slug}>
                      <Link
                        href={`/products/corrugated-fittings/${f.slug}`}
                        className="h-9 px-3.5 rounded-xl border border-dashed border-[var(--border)] text-sm font-bold flex items-center hover:border-[var(--accent)] hover:text-[var(--accent-text)] transition-colors"
                      >
                        {f.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            )}

            <SpecCards specs={cardSpecs} subject={subject} locale={locale} />

            {/* فقط عکس گواهی‌های واقعی — نام استانداردها همین حالا در جدول مشخصات فنی هست و تکرارش شلوغ می‌کرد.
                فقط روی دسته‌هایی که این پروانه‌ها واقعاً برایشان صادر شده (کاروگیت و دیواره ساختمند) */}
            {showCertificates && (
              <div className="mt-4 rounded-3xl border border-[var(--border)] bg-[var(--card)] p-4 empty:hidden">
                <CertificateStrip certificates={certificates} title={t.certificates} />
              </div>
            )}

            {/* کارشناس فروش — موبایل (در دسکتاپ سایدبار همین کار را می‌کند) */}
            <div className="lg:hidden mt-4 flex items-center gap-3 rounded-3xl border border-[var(--border)] bg-[var(--card)] p-3">
              <span className="relative shrink-0">
                <Image src="/images/site/sales-expert-avatar.webp" alt={salesExpertName} width={56} height={56} className="w-14 h-14 rounded-2xl object-cover ring-2 ring-[var(--accent)]" />
                <span className="live-dot absolute -bottom-0.5 -end-0.5 ring-2 ring-[var(--card)]" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-black text-[15px] leading-6">{salesExpertName}</p>
                <p className="text-[11px] text-[var(--muted-foreground)]">{salesExpertRole} · {copy.salesTagline}</p>
              </div>
              <a href={phoneHref} aria-label={t.call} className="w-11 h-11 rounded-2xl bg-[var(--ink)] text-white grid place-items-center shrink-0"><Phone className="w-5 h-5" /></a>
              <a href={whatsappUrl} target="_blank" rel="noopener" aria-label={t.whatsapp} className="w-11 h-11 rounded-2xl bg-[#128C7E] text-white grid place-items-center shrink-0"><MessageCircle className="w-5 h-5" /></a>
              <RubikaButton message={rubikaMessage(product.name)} label={t.rubika} className="w-11 h-11 rounded-2xl bg-white border border-[var(--border)] grid place-items-center shrink-0"><RubikaIcon className="w-6" /></RubikaButton>
            </div>

            {/* خلاصه قیمت — زنده */}
            <div className="mt-5 rounded-3xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-5">
              {summary.count > 0 ? (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      {/* قیمت امروز فقط در ساعت فروش و با قیمت تازه؛ وگرنه آخرین قیمت با تاریخش — نه «استعلام» خالی */}
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {liveSummary ? t.priceRangeToday : summary.minPrice != null && summary.updatedAt ? fill(t.lastPrice, { date: formatDate(summary.updatedAt, locale) }) : t.price}
                      </p>
                      <p className="mt-1 text-lg sm:text-xl font-black num">
                        {summary.minPrice != null ? (
                          <>
                            {formatNumber(summary.minPrice, locale)}
                            {summary.maxPrice !== summary.minPrice && summary.maxPrice != null && <> {t.to} {formatNumber(summary.maxPrice, locale)}</>}
                            <span className="text-xs font-medium text-[var(--muted-foreground)] ms-1">{t.toman}</span>
                          </>
                        ) : (
                          t.priceOnRequest
                        )}
                      </p>
                    </div>
                    <span className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-bold num">{fill(t.typesCount, { n: digits(summary.count, locale) })}</span>
                      <IconTile icon={Table2} size="sm" />
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <MarketStatus market={board.market} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
                    <button onClick={() => scrollTo('price-table')} className="text-sm font-bold text-[var(--accent-text)] hover:underline">
                      {t.viewFullTable}
                    </button>
                    <Link href={`/project-inquiry?product=${product.slug}`} className="text-sm font-bold text-[var(--accent-text)] hover:underline">
                      {t.projectInquiry}
                    </Link>
                  </div>
                </>
              ) : comingSoon ? (
                <div>
                  <p className="text-xs text-[var(--muted-foreground)]">{t.price}</p>
                  <p className="mt-1 text-xl font-black">{t.comingSoon}</p>
                  <p className="mt-1 text-xs leading-6 text-[var(--muted-foreground)]">
                    {copy.comingSoonNote}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-xs text-[var(--muted-foreground)]">{t.price}</p>
                  <p className="mt-1 text-xl font-black num">
                    {legacyPrice && legacyPrice !== '۰' && legacyPrice !== '0' ? <>{legacyPrice} <span className="text-xs font-medium text-[var(--muted-foreground)]">{t.toman}</span></> : t.priceOnRequest}
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">{copy.noPriceHint}</p>
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
                  <p className="text-sm font-bold leading-6">{t.catalogTitle}</p>
                  <p className="text-xs text-[var(--muted-foreground)] num">
                    {fill(t.catalogFiles, { n: digits(catalogs.length, locale) })}
                  </p>
                </div>
                <button
                  onClick={() => scrollTo('catalog')}
                  className="h-10 px-4 rounded-xl border border-[var(--border)] text-sm font-bold flex items-center gap-1.5 shrink-0 hover:border-[var(--accent)] transition-colors"
                >
                  <Download className="w-4 h-4 text-[var(--accent-text)]" />
                  {t.download}
                </button>
              </div>
            )}

            {/* دکمه‌ها — در موبایل نوار پایین همین کار را می‌کند */}
            <div className="hidden lg:flex gap-3 mt-5">
              <button onClick={() => open(product.name)} className="flex-1 h-13 rounded-2xl bg-[var(--accent)] text-[var(--accent-foreground)] font-black shadow-accent flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-transform">
                <Headphones className="w-5 h-5" />
                {comingSoon ? t.consultComingSoon : t.consultBuy}
              </button>
              <a href={phoneHref} className="h-13 px-5 rounded-2xl border border-[var(--border)] font-bold flex items-center gap-2 hover:border-[var(--accent)]">
                <Phone className="w-4.5 h-4.5 text-[var(--accent-text)]" />
                <span dir="ltr" className="num">{digits(phone, locale)}</span>
              </a>
              <a href={whatsappUrl} target="_blank" rel="noopener" aria-label={t.whatsapp} className="h-13 w-13 rounded-2xl bg-[#128C7E] text-white grid place-items-center">
                <MessageCircle className="w-5 h-5" />
              </a>
              <RubikaButton message={rubikaMessage(product.name)} label={t.rubika} className="h-13 w-13 rounded-2xl bg-white border border-[var(--border)] grid place-items-center">
                <RubikaIcon className="w-6" />
              </RubikaButton>
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
                <h2 id="price-table-title" className="text-xl sm:text-2xl font-black flex items-center gap-3"><IconTile icon={Table2} size="sm" />{fill(t.priceTableTitle, { name: digits(product.name, locale) })}</h2>
                <MarketStatus market={board.market} />
              </div>
              <LivePriceTable initial={initialBoard} productIds={[product.id]} caption={fill(t.tableCaption, { name: product.name })} toolbar />
              {/* «SN4 (۱۶ کیلونیوتن)» در ردیف‌ها دو استاندارد را کنار هم دارد و بدون توضیح متناقض به نظر می‌رسید */}
              {line?.items.some((i) => /کیلونیوتن/.test(i.spec)) && (
                <p className="mt-3 text-xs leading-6 text-[var(--muted-foreground)] num">
                  <LtrCodes text={snNote} />
                </p>
              )}
            </section>
          )}

          {product.description && (
            <section id="overview" aria-labelledby="overview-title" className="scroll-mt-40">
              <h2 id="overview-title" className="text-xl sm:text-2xl font-black mb-4 flex items-center gap-3"><IconTile icon={FileText} tone="sky" size="sm" />{fill(t.overviewTitle, { name: digits(product.name, locale) })}</h2>
              <div className="article-content" dangerouslySetInnerHTML={{ __html: product.description }} />
            </section>
          )}

          {specs.length > 0 && (
            <section id="specs" aria-labelledby="specs-title" className="scroll-mt-40">
              <h2 id="specs-title" className="text-xl sm:text-2xl font-black mb-4 flex items-center gap-3"><IconTile icon={ListChecks} tone="emerald" size="sm" />{t.specsTitle}</h2>
              <dl className="rounded-2xl border border-[var(--border)] overflow-hidden">
                {specs.map((spec, i) => {
                  const SpecIcon = specMeta(spec.key).icon;
                  return (
                  <div key={spec.key} className={cn('grid grid-cols-[40%_1fr] sm:grid-cols-[220px_1fr] text-sm transition-colors hover:bg-[var(--muted)]/40', i > 0 && 'border-t border-[var(--border)]')}>
                    <dt className="px-4 py-3.5 bg-[var(--muted)] font-semibold text-[var(--muted-foreground)] flex items-center gap-2"><SpecIcon className="w-4 h-4 shrink-0 text-[var(--accent-text)]" />{spec.label}</dt>
                    <dd className="px-4 py-3.5 font-bold num">{digits(spec.value, locale)}</dd>
                  </div>
                  );
                })}
              </dl>
            </section>
          )}

          <DimensionTable rows={dimensions} productName={product.name} locale={locale} />

          {catalogs.length > 0 && (
            <section id="catalog" aria-labelledby="catalog-title" className="scroll-mt-40">
              <h2 id="catalog-title" className="text-xl sm:text-2xl font-black mb-2 flex items-center gap-3"><IconTile icon={BookOpen} tone="sky" size="sm" />{t.catalogTitle}</h2>
              <p className="mb-4 text-sm leading-7 text-[var(--muted-foreground)]">
                {copy.catalogIntro}
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
                alt={fill(t.expertAlt, { name: salesExpertName, role: salesExpertRole })}
                fill
                sizes="320px"
                quality={90}
                className="object-cover object-[50%_20%] transition-transform duration-700 group-hover:scale-105"
              />
              <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-[var(--ink)] via-[var(--ink)]/20 to-transparent" />
              <div className="text-legible absolute inset-x-0 bottom-0 px-6 pb-3">
                <p className="text-[11px] text-white/85 flex items-center gap-1.5"><span className="live-dot" />{salesExpertRole} · {copy.salesStatus}</p>
                <p className="font-black text-xl leading-8 text-white">{salesExpertName}</p>
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 top-[60%] bp-grid opacity-60 pointer-events-none" />
            <div className="relative px-6 pb-6">
              <p className="mt-2 text-sm text-slate-300 leading-7">{copy.salesPrompt}</p>
              <div className="mt-5 space-y-2">
                <a href={phoneHref} className="flex items-center justify-between h-12 px-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10">
                  <Phone className="w-4.5 h-4.5 text-[var(--accent-text)]" />
                  <span dir="ltr" className="num font-bold">{digits(phone, locale)}</span>
                </a>
                {mobile && mobile !== phone && (
                  <a href={mobileHref} className="flex items-center justify-between h-12 px-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10">
                    <Phone className="w-4.5 h-4.5 text-[var(--accent-text)]" />
                    <span dir="ltr" className="num font-bold">{digits(mobile, locale)}</span>
                  </a>
                )}
                <a href={whatsappUrl} target="_blank" rel="noopener" className="flex items-center justify-center gap-2 h-12 rounded-2xl bg-[#128C7E] font-bold">
                  <MessageCircle className="w-5 h-5" /> {t.whatsappChat}
                </a>
                <RubikaButton message={rubikaMessage(product.name)} label={t.rubikaChat} className="flex items-center justify-center gap-2 h-12 rounded-2xl bg-white text-[#0F172A] font-bold">
                  <RubikaIcon /> {t.rubikaId} <span dir="ltr">{rubikaId}</span>
                </RubikaButton>
              </div>
              <p className="mt-4 flex items-center gap-1.5 text-xs text-slate-400"><Clock className="w-3.5 h-3.5" />{workingHours}</p>
            </div>
          </div>
          <button onClick={() => open(product.name)} className="mt-3 w-full h-12 rounded-2xl border-2 border-[var(--accent)] text-[var(--accent-text)] font-black hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors">
            {t.consult}
          </button>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="section-padding" aria-labelledby="related-title">
          <div className="container-main">
            <h2 id="related-title" className="text-xl sm:text-2xl font-black mb-5">{t.related}</h2>
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
            {comingSoon ? t.priceOnRequest : t.mobileConsult}
          </button>
          <a href={phoneHref} aria-label={t.call} className="w-12 h-12 rounded-2xl bg-[var(--ink)] text-white grid place-items-center"><Phone className="w-5 h-5" /></a>
          <a href={whatsappUrl} target="_blank" rel="noopener" aria-label={t.whatsapp} className="w-12 h-12 rounded-2xl bg-[#128C7E] text-white grid place-items-center"><MessageCircle className="w-5 h-5" /></a>
          <RubikaButton message={rubikaMessage(product.name)} label={t.rubika} className="w-12 h-12 rounded-2xl bg-white border border-[var(--border)] grid place-items-center"><RubikaIcon className="w-6" /></RubikaButton>
        </div>
      </div>
    </div>
  );
}
