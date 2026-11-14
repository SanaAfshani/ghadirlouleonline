'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  ArrowDownLeft, ArrowDownWideNarrow, ArrowUpLeft, ArrowUpNarrowWide, ChartLine, ChevronsUpDown, FileSpreadsheet, Lock,
  MessageSquareText, Search, ShoppingBag,
} from 'lucide-react';
import { cn, latinDigits } from '@/shared/lib/utils';
import { GRADES, compareItems, gradeLabel, itemLabel, unitsLabel, type SortDir, type SortKey } from '@/shared/lib/price-item';
import { Select } from '@/shared/ui/Select';
import { useConsult } from '@/features/consult/ConsultProvider';
import { useQuoteCart } from '@/features/quotes/QuoteCartProvider';
import { isPriceFresh, type PriceBoard } from '@/shared/lib/price-board-types';
import { Link } from '@/shared/i18n/Link';
import { localeTag, type Locale } from '@/shared/i18n/config';
import { digits, formatDate, formatNumber } from '@/shared/i18n/format';
import { defineMessages, fill } from '@/shared/i18n/messages';
import { useLocale } from '@/shared/i18n/LocaleProvider';
import { pricesClosedNotice } from '@/shared/content/pages/prices';
import { findItems, useLiveBoard, type Flash } from './live-store';
import { PriceChartDialog, type ChartTarget } from './PriceChartDialog';

const messages = defineMessages({
  fa: {
    previousPrice: 'قیمت قبلی: {price} تومان',
    percent: '٪',
    inquiry: 'استعلام',
    toman: 'تومان',
    lastRecorded: 'آخرین قیمت ثبت‌شده · {date}',
    callUs: 'تماس بگیرید',
    csvHeaders: ['مدل', 'سایز', 'کلاس', 'مشخصات', 'ابعاد', 'محصول', 'قیمت (تومان)', 'توضیحات'],
    csvName: 'لیست قیمت',
    sort: {
      'default:asc': 'ترتیب پیش‌فرض',
      'grade:asc': 'سبک به سنگین',
      'grade:desc': 'سنگین به سبک',
      'size:asc': 'سایز: کوچک به بزرگ',
      'size:desc': 'سایز: بزرگ به کوچک',
      'price:asc': 'قیمت: کم به زیاد',
      'price:desc': 'قیمت: زیاد به کم',
    },
    requestPrice: 'استعلام قیمت',
    gradeTabs: 'کلاس وزنی',
    all: 'همه',
    filterPlaceholder: 'فیلتر سایز، فشار یا مدل…',
    sortLabel: 'مرتب‌سازی',
    excel: 'خروجی اکسل',
    model: 'مدل',
    title: 'عنوان',
    size: 'سایز',
    grade: 'کلاس',
    spec: 'مشخصات',
    dimensions: 'ابعاد',
    product: 'محصول',
    price: 'قیمت',
    notes: 'توضیحات',
    chart: 'نمودار',
    action: 'اقدام',
    chartAria: 'نمودار قیمت {item}',
    chartTitle: 'نمودار نوسان قیمت',
    order: 'سفارش',
    noMatchFor: 'موردی با «{q}» پیدا نشد.',
    noMatch: 'موردی پیدا نشد.',
  },
  en: {
    previousPrice: 'Previous price: {price} Toman',
    percent: '%',
    inquiry: 'On request',
    toman: 'Toman',
    lastRecorded: 'Last recorded price · {date}',
    callUs: 'Call us',
    csvHeaders: ['Model', 'Size', 'Class', 'Specification', 'Dimensions', 'Product', 'Price (Toman)', 'Notes'],
    csvName: 'Price list',
    sort: {
      'default:asc': 'Default order',
      'grade:asc': 'Light to heavy',
      'grade:desc': 'Heavy to light',
      'size:asc': 'Size: small to large',
      'size:desc': 'Size: large to small',
      'price:asc': 'Price: low to high',
      'price:desc': 'Price: high to low',
    },
    requestPrice: 'Request a price',
    gradeTabs: 'Weight class',
    all: 'All',
    filterPlaceholder: 'Filter by size, class or model…',
    sortLabel: 'Sort',
    excel: 'Export to Excel',
    model: 'Model',
    title: 'Item',
    size: 'Size',
    grade: 'Class',
    spec: 'Specification',
    dimensions: 'Dimensions',
    product: 'Product',
    price: 'Price',
    notes: 'Notes',
    chart: 'Chart',
    action: 'Action',
    chartAria: 'Price chart for {item}',
    chartTitle: 'Price trend chart',
    order: 'Order',
    noMatchFor: 'No results for “{q}”.',
    noMatch: 'No results.',
  },
});

type Props = {
  initial: PriceBoard;
  /** فقط ردیف‌های این محصولات؛ خالی = همه */
  productIds?: string[];
  limit?: number;
  /** ستون «محصول» — برای جدول ترکیبی صفحه اصلی و دسته */
  showProduct?: boolean;
  /** فیلتر جستجو از این تعداد ردیف به بعد */
  searchFrom?: number;
  caption?: string;
  /** نوار بالای جدول: خروجی اکسل */
  toolbar?: boolean;
  /** پیام بیرون از ساعت فروش از پنل محتوا (صفحه قیمت)؛ بقیه صفحه‌ها متن پیش‌فرض همان بخش را نشان می‌دهند */
  closedNotice?: { title: string; text: string };
};

const tehranDay = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tehran' });

function Change({ price, previous }: { price: number | null; previous: number | null }) {
  const locale = useLocale();
  const t = messages[locale];
  if (price == null || previous == null || previous === price) return null;
  const pct = ((price - previous) / previous) * 100;
  const up = pct > 0;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 h-5 px-1.5 rounded-md text-[11px] font-bold num',
        up ? 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/12 text-red-600 dark:text-red-400',
      )}
      title={fill(t.previousPrice, { price: formatNumber(previous, locale) })}
    >
      {up ? <ArrowUpLeft className="w-3 h-3 ltr:-scale-x-100" /> : <ArrowDownLeft className="w-3 h-3 ltr:-scale-x-100" />}
      {Math.abs(pct).toLocaleString(localeTag[locale], { maximumFractionDigits: 1 })}{t.percent}
    </span>
  );
}

/**
 * بیرون از ساعت فروش، عدد پنهان نمی‌شود — کم‌رنگ‌تر و با تاریخ ثبتش می‌آید.
 *
 * دلیلش هم خریدار است و هم موتور جستجو: کسی که ساعت ۱۱ شب دنبال قیمت لوله کاروگیت است باید
 * رقم تقریبی را ببیند، و خزنده گوگل که ساعت کاری نمی‌شناسد باید صفحه را با عدد ایندکس کند.
 * «قطعی نبودن» با برچسب تاریخ و دکمه استعلام منتقل می‌شود، نه با خالی‌گذاشتن ستون.
 */
function Price({ price, open, changedAt }: { price: number | null; open: boolean; changedAt?: string }) {
  const locale = useLocale();
  const t = messages[locale];
  // قیمت چندروزه در ساعت فروش هم «قیمت امروز» نیست؛ مثل بیرون ساعت فروش، با تاریخش نشان داده می‌شود
  if (!open || (changedAt && !isPriceFresh(changedAt))) {
    if (price == null) {
      return (
        <span className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)]">
          <Lock className="w-3.5 h-3.5" /> {t.inquiry}
        </span>
      );
    }
    return (
      <span className="inline-flex flex-col gap-0.5">
        <span className="font-bold text-[15px] num whitespace-nowrap text-[var(--muted-foreground)]">
          {digits(formatNumber(price, locale), locale)} <span className="text-xs font-normal">{t.toman}</span>
        </span>
        {changedAt && (
          <span className="text-[11px] leading-4 text-[var(--muted-foreground)]">
            {fill(t.lastRecorded, { date: formatDate(changedAt, locale) })}
          </span>
        )}
      </span>
    );
  }
  if (price == null) return <span className="text-sm text-[var(--muted-foreground)]">{t.callUs}</span>;
  return (
    <span className="font-black text-[15px] num whitespace-nowrap">
      {formatNumber(price, locale)}
      <span className="text-[11px] font-medium text-[var(--muted-foreground)] ms-1">{t.toman}</span>
    </span>
  );
}

/** خروجی CSV با BOM تا اکسل فارسی را درست نشان دهد */
function downloadCsv(name: string, rows: ReturnType<typeof findItems>, t: (typeof messages)[Locale], locale: Locale) {
  const cell = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const lines = [
    t.csvHeaders,
    ...rows.map((r) => [
      r.title, unitsLabel(r.size, locale), gradeLabel(r.grade, locale), r.spec, unitsLabel(r.dimensions, locale), r.productName, r.price ?? t.inquiry, r.note,
    ]),
  ];
  const blob = new Blob(['\uFEFF' + lines.map((l) => l.map(cell).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${name} - ${tehranDay.format(new Date())}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

const flashBg: Record<Flash, string> = {
  up: 'bg-emerald-500/10',
  down: 'bg-red-500/10',
};

/** رنگ هر کلاس وزنی — سبک روشن، سنگین پررنگ؛ کاربر با یک نگاه تفکیک را می‌بیند */
const gradeTone: Record<string, string> = {
  سبک: 'bg-sky-500/12 text-sky-700 dark:text-sky-300 ring-sky-500/25',
  'نیمه‌سنگین': 'bg-amber-500/12 text-amber-700 dark:text-amber-300 ring-amber-500/25',
  سنگین: 'bg-rose-500/12 text-rose-700 dark:text-rose-300 ring-rose-500/25',
};

function GradeBadge({ grade }: { grade: string }) {
  const locale = useLocale();
  if (!grade) return <span className="text-[var(--muted-foreground)]">—</span>;
  return (
    <span className={cn('inline-flex items-center h-6 px-2 rounded-md text-[11px] font-bold ring-1 ring-inset whitespace-nowrap', gradeTone[grade])}>
      {gradeLabel(grade, locale)}
    </span>
  );
}

type Sort = { key: SortKey; dir: SortDir };

const SORT_VALUES = ['default:asc', 'grade:asc', 'grade:desc', 'size:asc', 'size:desc', 'price:asc', 'price:desc'] as const;

/** سرستون قابل مرتب‌سازی — کلیک اول صعودی، دوم نزولی، سوم برگشت به ترتیب پیش‌فرض */
function SortHeader({ label, k, sort, onSort, className }: { label: string; k: SortKey; sort: Sort; onSort: (s: Sort) => void; className?: string }) {
  const active = sort.key === k;
  const next: Sort = !active ? { key: k, dir: 'asc' } : sort.dir === 'asc' ? { key: k, dir: 'desc' } : { key: 'default', dir: 'asc' };
  const Icon = !active ? ChevronsUpDown : sort.dir === 'asc' ? ArrowUpNarrowWide : ArrowDownWideNarrow;
  return (
    <th scope="col" aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'} className={cn('text-start font-bold px-4 py-3', className)}>
      <button onClick={() => onSort(next)} className={cn('inline-flex items-center gap-1 hover:text-[var(--foreground)] transition-colors', active && 'text-[var(--accent-text)]')}>
        {label}
        <Icon className="w-3.5 h-3.5" />
      </button>
    </th>
  );
}

export function LivePriceTable({ initial, productIds, limit, showProduct = false, searchFrom = 12, caption, toolbar = false, closedNotice }: Props) {
  const locale = useLocale();
  const t = messages[locale];
  const notice = closedNotice ?? pricesClosedNotice.defaults[locale];
  const { board, flashes } = useLiveBoard(initial);
  const { open: openConsult } = useConsult();
  const { add: addToQuote } = useQuoteCart();
  const [q, setQ] = useState('');
  const [grade, setGrade] = useState('');
  const [sort, setSort] = useState<Sort>({ key: 'default', dir: 'asc' });
  const [chart, setChart] = useState<ChartTarget | null>(null);
  const closeChart = useCallback(() => setChart(null), []);
  const open = board.market.open;

  const all = useMemo(() => findItems(board, productIds), [board, productIds]);
  // ستون‌ها فقط وقتی نمایش داده می‌شوند که دست‌کم یک ردیف مقدار داشته باشد
  const has = {
    size: all.some((r) => r.size),
    grade: all.some((r) => r.grade),
    spec: all.some((r) => r.spec),
    dimensions: all.some((r) => r.dimensions),
  };
  const grades = GRADES.filter((g) => all.some((r) => r.grade === g));
  const rows = useMemo(() => {
    const term = latinDigits(q.trim()).toLowerCase();
    let list = term
      ? all.filter((r) => latinDigits(`${itemLabel(r, locale)} ${r.note} ${r.productName}`).toLowerCase().includes(term))
      : all;
    if (grade) list = list.filter((r) => r.grade === grade);
    if (sort.key !== 'default') list = [...list].sort((a, b) => compareItems(a, b, sort.key, sort.dir));
    return limit ? list.slice(0, limit) : list;
  }, [all, q, grade, sort, limit, locale]);
  // قیمت نمودار از تابلوی زنده خوانده می‌شود؛ بسته شدن فروش یا استعلامی شدن ردیف، پنجره را می‌بندد
  const liveRow = chart && all.find((r) => r.id === chart.id);
  const chartTarget = chart && open && liveRow?.price != null ? { ...chart, price: liveRow.price } : null;

  if (!all.length) return null;

  const act = (r: (typeof rows)[number]) => {
    if (open && r.price != null) {
      addToQuote({
        priceItemId: r.id,
        productId: r.productId,
        productName: r.productName,
        title: itemLabel(r, locale),
        unitPrice: r.price,
        note: r.note,
      });
      return;
    }
    openConsult(digits(itemLabel(r, locale), locale));
  };
  const showChart = (r: (typeof rows)[number]) =>
    r.price != null && setChart({ id: r.id, title: itemLabel(r, locale), productName: r.productName, price: r.price });

  return (
    // @container: چیدمان جدول/کارت به عرض خود جدول بستگی دارد نه صفحه — در صفحه محصول کنار سایدبار ۳۲۰ پیکسلی است
    <div className="@container">
      {!open && (
        <div className="mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--muted)]/60 px-4 py-3">
          <p className="flex items-start gap-2 text-sm leading-6">
            <Lock className="w-4 h-4 mt-1 shrink-0 text-[var(--muted-foreground)]" />
            <span>
              <span className="font-bold">{notice.title}</span>{' '}
              <span className="text-[var(--muted-foreground)]">{notice.text}</span>
            </span>
          </p>
          <button onClick={() => openConsult()} className="shrink-0 h-10 px-5 rounded-xl bg-[var(--foreground)] text-[var(--background)] text-sm font-bold">
            {t.requestPrice}
          </button>
        </div>
      )}
      {grades.length > 1 && (
        <div role="tablist" aria-label={t.gradeTabs} className="mb-3 snap-row gap-1.5">
          {['', ...grades].map((g) => {
            const count = g ? all.filter((r) => r.grade === g).length : all.length;
            return (
              <button
                key={g || 'all'}
                role="tab"
                aria-selected={grade === g}
                onClick={() => setGrade(g)}
                className={cn(
                  'h-9 px-3.5 rounded-xl text-xs font-bold whitespace-nowrap inline-flex items-center gap-1.5 border transition-all',
                  grade === g
                    ? 'bg-[var(--foreground)] text-[var(--background)] border-transparent shadow-sm'
                    : 'border-[var(--border)] hover:border-[var(--foreground)]/40',
                )}
              >
                {g ? gradeLabel(g, locale) : t.all}
                <span className={cn('num text-[10px] font-medium', grade === g ? 'opacity-70' : 'text-[var(--muted-foreground)]')}>{digits(count, locale)}</span>
              </button>
            );
          })}
        </div>
      )}
      {(toolbar || all.length >= searchFrom || has.size || has.grade) && (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {all.length >= searchFrom && (
            <div className="relative flex-1 min-w-[12rem] max-w-sm">
              <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t.filterPlaceholder}
                className="w-full h-11 rounded-xl bg-[var(--muted)] border border-[var(--border)] ps-10 pe-3 text-sm focus:border-[var(--accent)]"
              />
            </div>
          )}
          {/* موبایل سرستون ندارد — مرتب‌سازی با منو */}
          {(has.size || has.grade) && (
            <div className="@3xl:hidden w-full sm:w-56">
              <Select
                value={`${sort.key}:${sort.dir}`}
                onChange={(v) => {
                  const [key, dir] = v.split(':') as [SortKey, SortDir];
                  setSort({ key, dir });
                }}
                options={SORT_VALUES.filter((v) => (has.size || !v.startsWith('size')) && (has.grade || !v.startsWith('grade'))).map((v) => ({ value: v, label: t.sort[v] }))}
                icon={ArrowDownWideNarrow}
                aria-label={t.sortLabel}
                className="w-full h-11 rounded-xl bg-[var(--muted)] border border-[var(--border)] px-3 text-sm"
              />
            </div>
          )}
          {toolbar && (
            <div className="ms-auto flex items-center gap-3">
              {open && (
                <button
                  onClick={() => downloadCsv(caption ?? t.csvName, all, t, locale)}
                  className="h-10 px-3.5 rounded-xl border border-[var(--border)] text-xs font-bold inline-flex items-center gap-1.5 hover:border-[var(--foreground)]/40 transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  {t.excel}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* دسکتاپ و تبلت */}
      <div className="hidden @3xl:block overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--background)]">
        <table className="w-full text-sm">
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead className="bg-[var(--muted)] text-[var(--muted-foreground)] text-xs">
            <tr>
              <th scope="col" className="text-start font-bold px-5 py-3">{has.size || has.grade ? t.model : t.title}</th>
              {has.size && <SortHeader label={t.size} k="size" sort={sort} onSort={setSort} />}
              {has.grade && <SortHeader label={t.grade} k="grade" sort={sort} onSort={setSort} />}
              {has.spec && <th scope="col" className="text-start font-bold px-4 py-3">{t.spec}</th>}
              {has.dimensions && <th scope="col" className="text-start font-bold px-4 py-3">{t.dimensions}</th>}
              {showProduct && <th scope="col" className="text-start font-bold px-4 py-3">{t.product}</th>}
              <SortHeader label={t.price} k="price" sort={sort} onSort={setSort} />
              <th scope="col" className="hidden @5xl:table-cell text-start font-bold px-4 py-3">{t.notes}</th>
              <th scope="col" className="text-center font-bold px-2 py-3">{t.chart}</th>
              <th scope="col" className="px-4 py-3"><span className="sr-only">{t.action}</span></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const flash = flashes.get(r.id);
              return (
                <tr key={r.id} className={cn('border-t border-[var(--border)] transition-colors duration-700', flash ? flashBg[flash] : 'hover:bg-[var(--muted)]/60')}>
                  <td className="px-5 py-3.5 font-semibold leading-7">
                    {digits(r.title, locale)}
                    {/* جدول باریک ستون توضیحات ندارد — توضیح زیر مدل */}
                    {r.note && <span className="@5xl:hidden block text-[11px] font-normal leading-5 text-[var(--muted-foreground)]">{digits(r.note, locale)}</span>}
                  </td>
                  {has.size && <td className="px-4 py-3.5 font-bold num whitespace-nowrap">{digits(unitsLabel(r.size, locale), locale) || '—'}</td>}
                  {has.grade && <td className="px-4 py-3.5"><GradeBadge grade={r.grade} /></td>}
                  {has.spec && <td className="px-4 py-3.5 text-xs num leading-6">{digits(r.spec, locale) || '—'}</td>}
                  {has.dimensions && <td className="px-4 py-3.5 text-xs num leading-6">{digits(unitsLabel(r.dimensions, locale), locale) || '—'}</td>}
                  {showProduct && (
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <Link href={r.href} className="text-[var(--accent-text)] font-semibold hover:underline">{r.productName}</Link>
                    </td>
                  )}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <Price price={r.price} open={open} changedAt={r.priceChangedAt} />
                      {open && <Change price={r.price} previous={r.previousPrice} />}
                    </div>
                  </td>
                  <td className="hidden @5xl:table-cell px-4 py-3.5 text-xs text-[var(--muted-foreground)] leading-6 max-w-[16rem]">{digits(r.note, locale) || '—'}</td>
                  <td className="px-2 py-3.5 text-center">
                    {open && r.price != null ? (
                      <button
                        onClick={() => showChart(r)}
                        aria-label={fill(t.chartAria, { item: itemLabel(r, locale) })}
                        title={t.chartTitle}
                        className="inline-grid place-items-center w-9 h-9 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--accent-text)] hover:bg-[var(--muted)] transition-colors"
                      >
                        <ChartLine className="w-4.5 h-4.5" />
                      </button>
                    ) : (
                      <span className="text-[var(--muted-foreground)]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-end">
                    <button
                      onClick={() => act(r)}
                      className="h-9 px-3.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap border border-[var(--border)] hover:border-[var(--foreground)] transition-colors"
                    >
                      {open && r.price != null ? <><ShoppingBag className="w-3.5 h-3.5" />{t.order}</> : <><MessageSquareText className="w-3.5 h-3.5" />{t.requestPrice}</>}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* موبایل: کارت با دکمه اقدام بزرگ */}
      <ul className="@3xl:hidden space-y-2">
        {rows.map((r) => {
          const flash = flashes.get(r.id);
          return (
            <li key={r.id} className={cn('rounded-2xl border border-[var(--border)] p-3.5 transition-colors duration-700', flash ? flashBg[flash] : 'bg-[var(--background)]')}>
              <div className="flex items-start justify-between gap-2">
                <p className="font-bold text-[14px] leading-7">
                  {digits(r.title, locale)}
                  {r.size && <span className="num"> {digits(unitsLabel(r.size, locale), locale)}</span>}
                </p>
                {r.grade && <GradeBadge grade={r.grade} />}
              </div>
              {(r.spec || r.dimensions) && (
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {[r.spec, unitsLabel(r.dimensions, locale)].filter(Boolean).map((text) => (
                    <span key={text} className="h-6 px-2 rounded-md bg-[var(--muted)] text-[11px] text-[var(--muted-foreground)] num inline-flex items-center">{digits(text, locale)}</span>
                  ))}
                </div>
              )}
              {showProduct && (
                <Link href={r.href} className="text-xs font-semibold text-[var(--accent-text)]">{r.productName}</Link>
              )}
              <div className="mt-2 flex items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Price price={r.price} open={open} changedAt={r.priceChangedAt} />
                  {open && <Change price={r.price} previous={r.previousPrice} />}
                </div>
                <div className="shrink-0 flex items-center gap-1.5">
                  {open && r.price != null && (
                    <button
                      onClick={() => showChart(r)}
                      aria-label={fill(t.chartAria, { item: itemLabel(r, locale) })}
                      className="grid place-items-center w-10 h-10 rounded-xl border border-[var(--border)] text-[var(--muted-foreground)] active:scale-95 transition-transform"
                    >
                      <ChartLine className="w-4.5 h-4.5" />
                    </button>
                  )}
                  <button
                    onClick={() => act(r)}
                    className="h-10 px-4 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 bg-[var(--muted)] active:scale-95 transition-transform"
                  >
                    {open && r.price != null ? t.order : t.requestPrice}
                  </button>
                </div>
              </div>
              {r.note && <p className="mt-2 text-[11px] leading-5 text-[var(--muted-foreground)] num">{digits(r.note, locale)}</p>}
            </li>
          );
        })}
      </ul>

      {(q || grade) && !rows.length && <p className="py-8 text-center text-sm text-[var(--muted-foreground)]">{q ? fill(t.noMatchFor, { q }) : t.noMatch}</p>}

      {/* اگر وسط تماشای نمودار فروش بسته شود، پنجره بسته می‌شود */}
      <PriceChartDialog target={chartTarget} onClose={closeChart} />
    </div>
  );
}
