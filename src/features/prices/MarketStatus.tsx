'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { openDayLabel, type MarketStatus as Status } from '@/shared/lib/market';
import { cn } from '@/shared/lib/utils';
import { defaultLocale, type Locale } from '@/shared/i18n/config';
import { digits, formatNumber } from '@/shared/i18n/format';
import { defineMessages, fill } from '@/shared/i18n/messages';
import { useLocale } from '@/shared/i18n/LocaleProvider';

const messages = defineMessages({
  fa: {
    hoursMinutes: '{h} ساعت و {m} دقیقه',
    hours: '{h} ساعت',
    minutes: '{m} دقیقه',
    live: 'قیمت‌ها لحظه‌ای به‌روز می‌شوند',
    untilLeft: 'تا ساعت {time} · {left} دیگر',
    until: 'تا ساعت {time}',
    closedManual: 'تعطیل — استعلام قیمت فعال است',
    reopens: 'بازگشایی {day} ساعت {time}',
    inquiry: 'استعلام قیمت فعال است',
    open: 'فروش باز است',
    closed: 'فروش بسته است',
    openUntil: 'فروش تا ساعت {time}',
  },
  en: {
    hoursMinutes: '{h} h {m} min',
    hours: '{h} h',
    minutes: '{m} min',
    live: 'Prices update live',
    untilLeft: 'Until {time} · {left} left',
    until: 'Until {time}',
    closedManual: 'Closed — price requests are open',
    reopens: 'Reopens {day} at {time}',
    inquiry: 'Price requests are open',
    open: 'Sales open',
    closed: 'Sales closed',
    openUntil: 'Sales open until {time}',
  },
});

function remaining(iso: string | null, now: number, locale: Locale) {
  if (!iso) return null;
  const t = messages[locale];
  const mins = Math.max(0, Math.round((new Date(iso).getTime() - now) / 60000));
  if (mins > 24 * 60) return null;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const n = (v: number) => formatNumber(v, locale);
  if (h && m) return fill(t.hoursMinutes, { h: n(h), m: n(m) });
  if (h) return fill(t.hours, { h: n(h) });
  return fill(t.minutes, { m: n(Math.max(m, 1)) });
}

/** ساعت (به وقت تهران) و روز بازگشایی را سرور به فارسی می‌سازد؛ این‌جا به زبان صفحه برمی‌گردند */
const timeOf = (market: Status, locale: Locale) => digits(market.nextChangeLabel ?? '', locale);
const dayOf = (market: Status, locale: Locale) => openDayLabel(market.nextOpenDay ?? '', locale);

/** وضعیت بازار: «باز است · تا ۱۷:۰۰» یا «بسته است · بازگشایی فردا ۰۹:۰۰» */
export function MarketStatus({ market, tone = 'light', className }: { market: Status; tone?: 'light' | 'dark'; className?: string }) {
  const locale = useLocale();
  const t = messages[locale];
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);

  const left = remaining(market.nextChangeAt, now, locale);
  const dark = tone === 'dark';
  const time = timeOf(market, locale);

  const detail = market.open
    ? market.mode === 'open'
      ? t.live
      : left ? fill(t.untilLeft, { time, left }) : fill(t.until, { time })
    : market.mode === 'closed'
      ? t.closedManual
      : market.nextOpenDay
        ? fill(t.reopens, { day: dayOf(market, locale), time })
        : t.inquiry;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        // یک خط، همیشه: متن کوچک و بدون شکستن — در کارت‌های باریک (هیرو) دو خط می‌شد
        'inline-flex max-w-full items-center gap-1.5 rounded-full ps-2 pe-3 h-8 text-[11px] whitespace-nowrap border',
        dark ? 'bg-white/5 border-white/10 text-slate-200' : 'bg-[var(--background)] border-[var(--border)] text-[var(--muted-foreground)]',
        className,
      )}
    >
      <span className="relative flex w-2 h-2 shrink-0">
        {market.open && <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-60" />}
        <span className={cn('relative w-2 h-2 rounded-full', market.open ? 'bg-emerald-500' : 'bg-slate-400')} />
      </span>
      <span className={cn('font-bold shrink-0', market.open ? (dark ? 'text-emerald-300' : 'text-emerald-600 dark:text-emerald-400') : dark ? 'text-white' : 'text-[var(--foreground)]')}>
        {market.open ? t.open : t.closed}
      </span>
      <span className="hidden sm:inline-flex min-w-0 items-center gap-1 opacity-80 text-[10.5px]">
        <span aria-hidden className="opacity-50">·</span>
        <Clock className="w-3 h-3 shrink-0" />
        <span className="truncate">{detail}</span>
      </span>
    </div>
  );
}

/** همان توضیح، برای نمایش جدا زیر نشان در موبایل */
export function marketDetail(market: Status, locale: Locale = defaultLocale) {
  const t = messages[locale];
  const time = timeOf(market, locale);
  if (market.open) return market.nextChangeLabel ? fill(t.openUntil, { time }) : t.live;
  if (market.nextOpenDay) return fill(t.reopens, { day: dayOf(market, locale), time });
  return t.inquiry;
}
