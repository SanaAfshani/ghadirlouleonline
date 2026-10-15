'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowDownLeft, ArrowUpLeft, ChartLine, Clock, FileSpreadsheet, Lock, MessageSquareText, Search, ShoppingBag } from 'lucide-react';
import { cn, faDigits, latinDigits } from '@/shared/lib/utils';
import { useConsult } from '@/features/consult/ConsultProvider';
import { useQuoteCart } from '@/features/quotes/QuoteCartProvider';
import type { PriceBoard } from '@/shared/lib/price-board-types';
import { findItems, useLiveBoard, type Flash } from './live-store';
import { PriceChartDialog, type ChartTarget } from './PriceChartDialog';

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
  /** نوار بالای جدول: آخرین تغییر قیمت + خروجی اکسل */
  toolbar?: boolean;
};

const tehranTime = new Intl.DateTimeFormat('fa-IR', { timeZone: 'Asia/Tehran', hour: '2-digit', minute: '2-digit' });
const tehranDay = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tehran' });
const faDate = new Intl.DateTimeFormat('fa-IR', { timeZone: 'Asia/Tehran', day: 'numeric', month: 'long' });

/** «امروز ۱۰:۲۵» برای تغییرات امروز، وگرنه «۵ مهر» */
export function priceTime(iso: string) {
  const d = new Date(iso);
  return tehranDay.format(d) === tehranDay.format(new Date()) ? `امروز ${tehranTime.format(d)}` : faDate.format(d);
}

function Change({ price, previous }: { price: number | null; previous: number | null }) {
  if (price == null || previous == null || previous === price) return null;
  const pct = ((price - previous) / previous) * 100;
  const up = pct > 0;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 h-5 px-1.5 rounded-md text-[11px] font-bold num',
        up ? 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/12 text-red-600 dark:text-red-400',
      )}
      title={`قیمت قبلی: ${previous.toLocaleString('fa-IR')} تومان`}
    >
      {up ? <ArrowUpLeft className="w-3 h-3" /> : <ArrowDownLeft className="w-3 h-3" />}
      {Math.abs(pct).toLocaleString('fa-IR', { maximumFractionDigits: 1 })}٪
    </span>
  );
}

function Price({ price, open }: { price: number | null; open: boolean }) {
  if (!open) {
    return (
      <span className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)]">
        <Lock className="w-3.5 h-3.5" /> استعلام
      </span>
    );
  }
  if (price == null) return <span className="text-sm text-[var(--muted-foreground)]">تماس بگیرید</span>;
  return (
    <span className="font-black text-[15px] num whitespace-nowrap">
      {price.toLocaleString('fa-IR')}
      <span className="text-[11px] font-medium text-[var(--muted-foreground)] ms-1">تومان</span>
    </span>
  );
}

/** خروجی CSV با BOM تا اکسل فارسی را درست نشان دهد */
function downloadCsv(name: string, rows: ReturnType<typeof findItems>) {
  const cell = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const lines = [
    ['عنوان', 'محصول', 'قیمت (تومان)', 'توضیحات', 'آخرین تغییر'],
    ...rows.map((r) => [r.title, r.productName, r.price ?? 'استعلام', r.note, priceTime(r.priceChangedAt)]),
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

export function LivePriceTable({ initial, productIds, limit, showProduct = false, searchFrom = 12, caption, toolbar = false }: Props) {
  const { board, flashes } = useLiveBoard(initial);
  const { open: openConsult } = useConsult();
  const { add: addToQuote } = useQuoteCart();
  const [q, setQ] = useState('');
  const [chart, setChart] = useState<ChartTarget | null>(null);
  const closeChart = useCallback(() => setChart(null), []);
  const open = board.market.open;

  const all = useMemo(() => findItems(board, productIds), [board, productIds]);
  const rows = useMemo(() => {
    const term = latinDigits(q.trim()).toLowerCase();
    const list = term ? all.filter((r) => latinDigits(`${r.title} ${r.note} ${r.productName}`).toLowerCase().includes(term)) : all;
    return limit ? list.slice(0, limit) : list;
  }, [all, q, limit]);
  // قیمت نمودار از تابلوی زنده خوانده می‌شود؛ بسته شدن فروش یا استعلامی شدن ردیف، پنجره را می‌بندد
  const liveRow = chart && all.find((r) => r.id === chart.id);
  const chartTarget = chart && open && liveRow?.price != null ? { ...chart, price: liveRow.price } : null;
  const updatedAt = all.reduce<string | null>((a, r) => (!a || r.priceChangedAt > a ? r.priceChangedAt : a), null);

  if (!all.length) return null;

  const act = (r: (typeof rows)[number]) => {
    if (open && r.price != null) {
      addToQuote({
        priceItemId: r.id,
        productId: r.productId,
        productName: r.productName,
        title: r.title,
        unitPrice: r.price,
        note: r.note,
      });
      return;
    }
    openConsult(faDigits(r.title));
  };
  const showChart = (r: (typeof rows)[number]) =>
    r.price != null && setChart({ id: r.id, title: r.title, productName: r.productName, price: r.price });

  return (
    <div>
      {!open && (
        <div className="mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--muted)]/60 px-4 py-3">
          <p className="flex items-start gap-2 text-sm leading-6">
            <Lock className="w-4 h-4 mt-1 shrink-0 text-[var(--muted-foreground)]" />
            <span>
              <span className="font-bold">فروش بسته است.</span>{' '}
              <span className="text-[var(--muted-foreground)]">قیمت روز را استعلام بگیرید تا کارشناسان ما تماس بگیرند.</span>
            </span>
          </p>
          <button onClick={() => openConsult()} className="shrink-0 h-10 px-5 rounded-xl bg-[var(--foreground)] text-[var(--background)] text-sm font-bold">
            استعلام قیمت
          </button>
        </div>
      )}
      {(toolbar || all.length >= searchFrom) && (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {all.length >= searchFrom && (
            <div className="relative flex-1 min-w-[12rem] max-w-sm">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="فیلتر سایز، فشار یا مدل…"
                className="w-full h-11 rounded-xl bg-[var(--muted)] border border-[var(--border)] pr-10 pl-3 text-sm focus:border-[var(--accent)]"
              />
            </div>
          )}
          {toolbar && (
            <div className="ms-auto flex items-center gap-3">
              {updatedAt && (
                <span className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] num">
                  <Clock className="w-3.5 h-3.5" />
                  آخرین تغییر قیمت: {priceTime(updatedAt)}
                </span>
              )}
              {open && (
                <button
                  onClick={() => downloadCsv(caption ?? 'لیست قیمت', all)}
                  className="h-10 px-3.5 rounded-xl border border-[var(--border)] text-xs font-bold inline-flex items-center gap-1.5 hover:border-[var(--foreground)]/40 transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  خروجی اکسل
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* دسکتاپ و تبلت */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--background)]">
        <table className="w-full text-sm">
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead className="bg-[var(--muted)] text-[var(--muted-foreground)] text-xs">
            <tr>
              <th scope="col" className="text-right font-bold px-5 py-3">عنوان</th>
              {showProduct && <th scope="col" className="text-right font-bold px-4 py-3">محصول</th>}
              <th scope="col" className="text-right font-bold px-4 py-3">قیمت</th>
              <th scope="col" className="text-right font-bold px-4 py-3">توضیحات</th>
              <th scope="col" className="text-right font-bold px-4 py-3 whitespace-nowrap">آخرین تغییر</th>
              <th scope="col" className="text-center font-bold px-2 py-3">نمودار</th>
              <th scope="col" className="px-4 py-3"><span className="sr-only">اقدام</span></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const flash = flashes.get(r.id);
              return (
                <tr key={r.id} className={cn('border-t border-[var(--border)] transition-colors duration-700', flash ? flashBg[flash] : 'hover:bg-[var(--muted)]/60')}>
                  <td className="px-5 py-3.5 font-semibold leading-7">{faDigits(r.title)}</td>
                  {showProduct && (
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <Link href={r.href} className="text-[var(--accent-text)] font-semibold hover:underline">{r.productName}</Link>
                    </td>
                  )}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <Price price={r.price} open={open} />
                      {open && <Change price={r.price} previous={r.previousPrice} />}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-[var(--muted-foreground)] leading-6 max-w-[16rem]">{faDigits(r.note) || '—'}</td>
                  <td className="px-4 py-3.5 text-xs text-[var(--muted-foreground)] whitespace-nowrap num">{priceTime(r.priceChangedAt)}</td>
                  <td className="px-2 py-3.5 text-center">
                    {open && r.price != null ? (
                      <button
                        onClick={() => showChart(r)}
                        aria-label={`نمودار قیمت ${r.title}`}
                        title="نمودار نوسان قیمت"
                        className="inline-grid place-items-center w-9 h-9 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--accent-text)] hover:bg-[var(--muted)] transition-colors"
                      >
                        <ChartLine className="w-4.5 h-4.5" />
                      </button>
                    ) : (
                      <span className="text-[var(--muted-foreground)]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-left">
                    <button
                      onClick={() => act(r)}
                      className="h-9 px-3.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap border border-[var(--border)] hover:border-[var(--foreground)] transition-colors"
                    >
                      {open && r.price != null ? <><ShoppingBag className="w-3.5 h-3.5" />سفارش</> : <><MessageSquareText className="w-3.5 h-3.5" />استعلام قیمت</>}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* موبایل: کارت با دکمه اقدام بزرگ */}
      <ul className="md:hidden space-y-2">
        {rows.map((r) => {
          const flash = flashes.get(r.id);
          return (
            <li key={r.id} className={cn('rounded-2xl border border-[var(--border)] p-3.5 transition-colors duration-700', flash ? flashBg[flash] : 'bg-[var(--background)]')}>
              <p className="font-bold text-[14px] leading-7">{faDigits(r.title)}</p>
              {showProduct && (
                <Link href={r.href} className="text-xs font-semibold text-[var(--accent-text)]">{r.productName}</Link>
              )}
              <div className="mt-2 flex items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Price price={r.price} open={open} />
                  {open && <Change price={r.price} previous={r.previousPrice} />}
                </div>
                <div className="shrink-0 flex items-center gap-1.5">
                  {open && r.price != null && (
                    <button
                      onClick={() => showChart(r)}
                      aria-label={`نمودار قیمت ${r.title}`}
                      className="grid place-items-center w-10 h-10 rounded-xl border border-[var(--border)] text-[var(--muted-foreground)] active:scale-95 transition-transform"
                    >
                      <ChartLine className="w-4.5 h-4.5" />
                    </button>
                  )}
                  <button
                    onClick={() => act(r)}
                    className="h-10 px-4 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 bg-[var(--muted)] active:scale-95 transition-transform"
                  >
                    {open && r.price != null ? 'سفارش' : 'استعلام قیمت'}
                  </button>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-[var(--muted-foreground)] num">
                <span>{priceTime(r.priceChangedAt)}</span>
                {r.note && <span className="basis-full leading-5">{faDigits(r.note)}</span>}
              </div>
            </li>
          );
        })}
      </ul>

      {q && !rows.length && <p className="py-8 text-center text-sm text-[var(--muted-foreground)]">موردی با «{q}» پیدا نشد.</p>}

      {/* اگر وسط تماشای نمودار فروش بسته شود، پنجره بسته می‌شود */}
      <PriceChartDialog target={chartTarget} onClose={closeChart} />
    </div>
  );
}
