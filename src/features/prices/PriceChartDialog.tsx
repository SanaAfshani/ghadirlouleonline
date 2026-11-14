'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, m as motion } from 'framer-motion';
import { Loader2, X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { HistoryPoint, HistoryRange } from '@/shared/lib/price-board-types';
import { localeDir, localeTag, type Locale } from '@/shared/i18n/config';
import { digits, formatNumber } from '@/shared/i18n/format';
import { defineMessages, fill } from '@/shared/i18n/messages';
import { useLocale } from '@/shared/i18n/LocaleProvider';

export type ChartTarget = { id: string; title: string; productName: string; price: number };

const messages = defineMessages({
  fa: {
    ranges: { 7: 'یک هفته', 30: 'یک ماه', 90: 'سه ماه', 365: 'یک سال' },
    close: 'بستن',
    eyebrow: 'نوسان قیمت · {product}',
    rangeLabel: 'بازه زمانی',
    loadError: 'خطا در دریافت نمودار',
    networkError: 'خطا در ارتباط با سرور',
    closed: 'فروش بسته است؛ نمودار قیمت در ساعت کاری نمایش داده می‌شود.',
    inquiry: 'قیمت این ردیف استعلامی است.',
    empty: 'هنوز قیمتی برای این بازه ثبت نشده است.',
    last: 'آخرین قیمت',
    min: 'کمترین',
    max: 'بیشترین',
    change: 'تغییر بازه',
    noChange: 'بدون تغییر',
    percent: '٪',
    toman: 'تومان',
    flat: 'از {date} تاکنون قیمت این ردیف تغییری نکرده است.',
  },
  en: {
    ranges: { 7: '1 week', 30: '1 month', 90: '3 months', 365: '1 year' },
    close: 'Close',
    eyebrow: 'Price trend · {product}',
    rangeLabel: 'Time range',
    loadError: 'Could not load the chart',
    networkError: 'Could not reach the server',
    closed: 'Sales are closed; the price chart is shown during business hours.',
    inquiry: 'This row is priced on request.',
    empty: 'No prices have been recorded for this period yet.',
    last: 'Last price',
    min: 'Low',
    max: 'High',
    change: 'Change',
    noChange: 'No change',
    percent: '%',
    toman: 'Toman',
    flat: 'The price of this row has not changed since {date}.',
  },
});

const RANGES: HistoryRange[] = [7, 30, 90, 365];

type Result = { points: HistoryPoint[] } | { closed: true } | { inquiry: true } | { error: string };

/** فارسی تقویم شمسی، انگلیسی میلادی — هر دو به وقت تهران */
const calendar = (locale: Locale) => (locale === 'fa' ? 'fa-IR-u-ca-persian' : 'en-US');
const dayLabel = (locale: Locale) => new Intl.DateTimeFormat(calendar(locale), { timeZone: 'Asia/Tehran', day: 'numeric', month: 'short' });
const dayFull = (locale: Locale) => new Intl.DateTimeFormat(calendar(locale), { timeZone: 'Asia/Tehran', day: 'numeric', month: 'long', year: 'numeric' });
/** کلید روز تهران → تاریخ (ظهر همان روز تا مرز روز جابه‌جا نشود) */
const toDate = (day: string) => new Date(`${day}T12:00:00+03:30`);

/** نمودار نوسان قیمت یک ردیف — موبایل bottom sheet، دسکتاپ پنجره وسط صفحه */
export function PriceChartDialog({ target, onClose }: { target: ChartTarget | null; onClose: () => void }) {
  const locale = useLocale();
  const isOpen = target != null;
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {target && (
        <motion.div className="fixed inset-0 z-[70] flex items-end md:items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button aria-label={messages[locale].close} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="chart-title"
            className="relative w-full md:max-w-2xl bg-[var(--background)] rounded-t-[var(--radius-sheet)] md:rounded-[var(--radius-panel)] shadow-2xl safe-pb border-t-4 md:border-t-0 border-[var(--accent)] overflow-hidden"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
          >
            <ChartBody key={target.id} target={target} onClose={onClose} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ChartBody({ target, onClose }: { target: ChartTarget; onClose: () => void }) {
  const locale = useLocale();
  const t = messages[locale];
  const [range, setRange] = useState<HistoryRange>(30);
  const [results, setResults] = useState<Record<string, Result>>({});
  // قیمت در کلید: اگر قیمت لحظه‌ای عوض شد، نمودار همان بازه از نو گرفته می‌شود
  const cacheKey = `${range}:${target.price}`;
  const result = results[cacheKey];

  useEffect(() => {
    if (results[cacheKey]) return;
    const ctrl = new AbortController();
    fetch(`/api/prices/history/${encodeURIComponent(target.id)}?range=${range}`, { signal: ctrl.signal, cache: 'no-store' })
      .then((r) => r.json())
      // پیام خطای API فارسی است؛ نسخه انگلیسی پیام خودش را نشان می‌دهد
      .then((json) => setResults((s) => ({ ...s, [cacheKey]: json.success ? json.data : { error: (locale === 'fa' && json.error) || t.loadError } })))
      .catch((e) => e.name !== 'AbortError' && setResults((s) => ({ ...s, [cacheKey]: { error: t.networkError } })));
    return () => ctrl.abort();
  }, [cacheKey, range, results, target.id, locale, t]);

  return (
    <>
      <div className="md:hidden mx-auto mt-3 h-1.5 w-12 rounded-full bg-[var(--border)]" />
      <div className="flex items-start justify-between gap-4 px-5 sm:px-7 pt-5">
        <div className="min-w-0">
          <p className="tech-label">{fill(t.eyebrow, { product: target.productName })}</p>
          <h2 id="chart-title" className="mt-1.5 text-lg sm:text-xl font-black leading-8">{digits(target.title, locale)}</h2>
        </div>
        <button onClick={onClose} aria-label={t.close} className="grid place-items-center w-10 h-10 -me-2 rounded-[var(--radius-control)] hover:bg-[var(--muted)] shrink-0">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div role="tablist" aria-label={t.rangeLabel} className="mx-5 sm:mx-7 mt-4 grid grid-cols-4 p-1 rounded-[var(--radius-control)] bg-[var(--muted)]">
        {RANGES.map((r) => (
          <button
            key={r}
            role="tab"
            aria-selected={range === r}
            onClick={() => setRange(r)}
            className={cn(
              'h-9 rounded-[calc(var(--radius-control)-4px)] text-[13px] font-bold transition-colors',
              range === r ? 'bg-[var(--background)] text-[var(--foreground)] shadow-sm' : 'text-[var(--muted-foreground)]',
            )}
          >
            {t.ranges[r]}
          </button>
        ))}
      </div>

      <div className="px-5 sm:px-7 pt-4 pb-6 min-h-[360px]">
        {!result ? (
          <div className="h-[340px] grid place-items-center text-[var(--muted-foreground)]"><Loader2 className="w-6 h-6 animate-spin" /></div>
        ) : 'points' in result && result.points.length ? (
          <Chart points={result.points} locale={locale} />
        ) : (
          <p className="h-[340px] grid place-items-center text-center text-sm text-[var(--muted-foreground)] leading-7">
            {'closed' in result
              ? t.closed
              : 'inquiry' in result
                ? t.inquiry
                : 'error' in result
                  ? result.error
                  : t.empty}
          </p>
        )}
      </div>
    </>
  );
}

function Stat({ label, value, tone }: { label: string; value: React.ReactNode; tone?: 'up' | 'down' }) {
  return (
    <div className="px-3 py-2.5 border-s first:border-s-0 border-[var(--border)] min-w-0">
      <p className="text-[11px] text-[var(--muted-foreground)]">{label}</p>
      <p className={cn('mt-0.5 font-black text-[13px] sm:text-sm num truncate', tone === 'up' && 'text-emerald-600 dark:text-emerald-400', tone === 'down' && 'text-red-600 dark:text-red-400')}>
        {value}
      </p>
    </div>
  );
}

function Chart({ points, locale }: { points: HistoryPoint[]; locale: Locale }) {
  const t = messages[locale];
  const num = (n: number) => formatNumber(n, locale);
  const [hover, setHover] = useState<number | null>(null);
  const prices = points.map((p) => p.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const first = prices[0];
  const last = prices.at(-1)!;
  const pct = first ? ((last - first) / first) * 100 : 0;
  const flat = min === max;

  // حاشیه عمودی تا خط به لبه‌ها نچسبد؛ قیمت ثابت وسط نمودار
  const pad = flat ? Math.max(1, max * 0.02) : (max - min) * 0.15;
  const lo = min - pad;
  const hi = max + pad;
  const n = points.length;
  const x = (i: number) => (n === 1 ? 100 : (i / (n - 1)) * 100);
  const y = (p: number) => 100 - ((p - lo) / (hi - lo)) * 100;

  const coords = n === 1 ? [[0, y(prices[0])], [100, y(prices[0])]] : points.map((p, i) => [x(i), y(p.price)]);
  const line = coords.map(([cx, cy], i) => `${i ? 'L' : 'M'}${cx},${cy}`).join(' ');
  const area = `${line} L100,100 L0,100 Z`;
  // سه خط راهنما با اعداد گرد (۴۹۲٬۰۰۰ به جای ۴۹۲٬۴۸۷)
  const step = 10 ** Math.max(0, Math.floor(Math.log10(hi - lo)) - 1);
  const ticks = [...new Set([hi - (hi - lo) * 0.15, (hi + lo) / 2, lo + (hi - lo) * 0.15].map((t) => Math.round(t / step) * step))];
  const labelIdx = n === 1 ? [0] : [...new Set([0, Math.round((n - 1) / 2), n - 1])];
  const active = hover ?? n - 1;
  const ax = x(active);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    const f = Math.min(1, Math.max(0, (e.clientX - box.left) / box.width));
    setHover(n === 1 ? 0 : Math.round(f * (n - 1)));
  };

  return (
    <div>
      <div className="grid grid-cols-4 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--card)]">
        <Stat label={t.last} value={num(last)} />
        <Stat label={t.min} value={num(min)} />
        <Stat label={t.max} value={num(max)} />
        <Stat
          label={t.change}
          value={flat ? t.noChange : `${pct > 0 ? '▲' : pct < 0 ? '▼' : ''} ${Math.abs(pct).toLocaleString(localeTag[locale], { maximumFractionDigits: 1 })}${t.percent}`}
          tone={pct > 0 ? 'up' : pct < 0 ? 'down' : undefined}
        />
      </div>

      {/* محور زمان چپ به راست (قدیم ← جدید) مثل همه نمودارهای قیمت */}
      <div dir="ltr" className="mt-4">
        <div
          className="relative h-56 sm:h-64 touch-none select-none cursor-crosshair"
          onPointerMove={onMove}
          onPointerDown={onMove}
          onPointerLeave={() => setHover(null)}
        >
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full overflow-visible" aria-hidden>
            <defs>
              <linearGradient id="chart-fill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="var(--accent)" stopOpacity="0.28" />
                <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
              </linearGradient>
            </defs>
            {ticks.map((tick) => (
              <line key={tick} x1="0" x2="100" y1={y(tick)} y2={y(tick)} stroke="var(--border)" strokeDasharray="2 3" vectorEffect="non-scaling-stroke" />
            ))}
            <path d={area} fill="url(#chart-fill)" />
            <path d={line} fill="none" stroke="var(--accent)" strokeWidth="2.25" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          </svg>

          {ticks.map((tick) => (
            <span key={tick} className="absolute left-0 -translate-y-full pb-0.5 text-[10px] text-[var(--muted-foreground)] num" style={{ top: `${y(tick)}%` }}>
              {num(tick)}
            </span>
          ))}

          {/* خط راهنما + نقطه + برچسب نقطه فعال */}
          <span className="absolute inset-y-0 w-px bg-[var(--foreground)]/25" style={{ left: `${ax}%` }} />
          <span
            className="absolute w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent)] ring-4 ring-[var(--background)]"
            style={{ left: `${ax}%`, top: `${y(points[active].price)}%` }}
          />
          <div
            dir={localeDir[locale]}
            className="absolute top-1 px-2.5 py-1.5 rounded-[var(--radius-control)] bg-[var(--ink)] text-white text-xs shadow-lg pointer-events-none whitespace-nowrap"
            style={{ left: `${ax}%`, transform: ax > 60 ? 'translateX(calc(-100% - 8px))' : 'translateX(8px)' }}
          >
            <span className="block text-[10px] text-slate-300 num">{dayFull(locale).format(toDate(points[active].day))}</span>
            <span className="block font-black num">{num(points[active].price)} <span className="font-medium text-slate-300">{t.toman}</span></span>
          </div>
        </div>

        <div className="relative h-5 mt-2 text-[10px] text-[var(--muted-foreground)] num">
          {labelIdx.map((i) => (
            <span
              key={i}
              className="absolute top-0 whitespace-nowrap"
              style={{ left: `${x(i)}%`, transform: `translateX(${i === n - 1 ? '-100%' : i === 0 ? '0' : '-50%'})` }}
            >
              {dayLabel(locale).format(toDate(points[i].day))}
            </span>
          ))}
        </div>
      </div>

      {flat && (
        <p className="mt-3 text-xs text-[var(--muted-foreground)] leading-6">
          {fill(t.flat, { date: dayFull(locale).format(toDate(points[0].day)) })}
        </p>
      )}
    </div>
  );
}
