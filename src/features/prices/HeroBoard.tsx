'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowDownLeft, ArrowUpLeft, Lock } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { groupLinesByCategory, type PriceBoard } from '@/shared/lib/price-board-types';
import { GRADES, gradeLabel, unitsLabel } from '@/shared/lib/price-item';
import { Link } from '@/shared/i18n/Link';
import { useLocale } from '@/shared/i18n/LocaleProvider';
import { defineMessages, fill } from '@/shared/i18n/messages';
import { digits, formatNumber } from '@/shared/i18n/format';
import { useLiveBoard } from './live-store';
import { MarketStatus, marketDetail } from './MarketStatus';

/** رنگ کلاس وزنی روی زمینه همیشه تیره هیرو */
const gradeTone: Record<string, string> = {
  سبک: 'bg-sky-400/15 text-sky-300',
  'نیمه‌سنگین': 'bg-amber-400/15 text-amber-300',
  سنگین: 'bg-rose-400/15 text-rose-300',
};

const messages = defineMessages({
  fa: {
    title: 'قیمت لحظه‌ای',
    lines: 'خط محصول',
    grades: 'کلاس وزنی',
    allGrades: 'همه کلاس‌ها',
    percent: '{n}٪',
    onRequest: 'استعلام',
    fullTable: 'جدول کامل {name}',
    allPrices: 'همه قیمت‌ها',
  },
  en: {
    title: 'Live prices',
    lines: 'Product line',
    grades: 'Weight class',
    allGrades: 'All classes',
    percent: '{n}%',
    onRequest: 'On request',
    fullTable: 'Full {name} table',
    allPrices: 'All prices',
  },
});

/** کارت «قیمت لحظه‌ای» داخل هیرو — قیمت‌ها از همان اولین نگاه در صفحه اول */
export function HeroBoard({ initial, rows = 5 }: { initial: PriceBoard; rows?: number }) {
  const { board, flashes } = useLiveBoard(initial);
  const groups = groupLinesByCategory(board.lines);
  const [active, setActive] = useState(groups[0]?.categorySlug);
  const [grade, setGrade] = useState('');
  const locale = useLocale();
  const t = messages[locale];
  if (!groups.length) return null;

  const line = groups.find((g) => g.categorySlug === active) ?? groups[0];
  const open = board.market.open;
  const grades = GRADES.filter((g) => line.items.some((i) => i.grade === g));
  const items = grade ? line.items.filter((i) => i.grade === grade) : line.items;

  return (
    <div className="corner-marks rounded-[var(--radius-panel)] border border-white/10 bg-[var(--ink-2)]/75 backdrop-blur-md shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)] overflow-hidden">
      <div className="px-4 sm:px-5 pt-4 sm:pt-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-white font-black">{t.title}</p>
          <p className="text-[11px] text-slate-400 mt-0.5 sm:hidden">{marketDetail(board.market, locale)}</p>
        </div>
        <MarketStatus market={board.market} tone="dark" />
      </div>

      <div role="tablist" aria-label={t.lines} className="snap-row gap-1.5 px-4 sm:px-5 mt-4">
        {groups.map((g) => (
          <button
            key={g.categorySlug}
            role="tab"
            aria-selected={g.categorySlug === line.categorySlug}
            onClick={() => {
              setActive(g.categorySlug);
              setGrade('');
            }}
            className={cn(
              'h-8 px-3 rounded-lg text-xs font-bold whitespace-nowrap transition-colors',
              g.categorySlug === line.categorySlug ? 'bg-white text-[var(--ink)]' : 'text-slate-300 bg-white/5 hover:bg-white/10',
            )}
          >
            {g.categoryName}
          </button>
        ))}
      </div>

      {/* تفکیک سبک / سنگین — فقط وقتی محصول بیش از یک کلاس دارد */}
      {grades.length > 1 && (
        <div aria-label={t.grades} className="flex gap-1 px-4 sm:px-5 mt-3">
          {['', ...grades].map((g) => (
            <button
              key={g || 'all'}
              aria-pressed={grade === g}
              onClick={() => setGrade(g)}
              className={cn(
                'h-7 px-2.5 rounded-md text-[11px] font-bold transition-colors',
                grade === g ? 'bg-[var(--accent)] text-[var(--accent-foreground)]' : 'text-slate-300 bg-white/5 hover:bg-white/10',
              )}
            >
              {g ? gradeLabel(g, locale) : t.allGrades}
            </button>
          ))}
        </div>
      )}

      <ul className="mt-3 divide-y divide-white/[0.06]" role="tabpanel">
        {items.slice(0, rows).map((i) => {
          const flash = flashes.get(i.id);
          const pct = open && i.price != null && i.previousPrice ? ((i.price - i.previousPrice) / i.previousPrice) * 100 : 0;
          return (
            <li key={i.id} className={cn('px-4 sm:px-5 py-3 flex items-center justify-between gap-4 transition-colors duration-700', flash === 'up' && 'bg-emerald-500/10', flash === 'down' && 'bg-red-500/10')}>
              <span className="min-w-0">
                <span className="flex items-center gap-1.5">
                  <span className="text-[13px] font-bold text-white leading-6 truncate num">{digits(unitsLabel(i.size, locale) || i.title, locale)}</span>
                  {i.grade && <span className={cn('shrink-0 h-5 px-1.5 rounded text-[10px] font-bold leading-5', gradeTone[i.grade])}>{gradeLabel(i.grade, locale)}</span>}
                </span>
                {/* مدل و مشخصات در خط دوم — نام بلند دیگر بریده نمی‌شود */}
                {i.size && (
                  <span className="block text-[11px] text-slate-400 leading-5 truncate num">
                    {digits([i.title, i.spec, unitsLabel(i.dimensions, locale)].filter(Boolean).join(' · '), locale)}
                  </span>
                )}
              </span>
              <span className="shrink-0 flex items-center gap-2">
                {pct !== 0 && (
                  <span className={cn('flex items-center text-[11px] font-bold num', pct > 0 ? 'text-emerald-400' : 'text-red-400')}>
                    {pct > 0 ? <ArrowUpLeft className="w-3 h-3 ltr:-scale-x-100" /> : <ArrowDownLeft className="w-3 h-3 ltr:-scale-x-100" />}
                    {fill(t.percent, { n: formatNumber(Math.round(Math.abs(pct) * 10) / 10, locale) })}
                  </span>
                )}
                {open && i.price != null ? (
                  <span className="text-white font-black num text-sm">{formatNumber(i.price, locale)}</span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-slate-400"><Lock className="w-3 h-3" />{t.onRequest}</span>
                )}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="px-4 sm:px-5 py-3.5 border-t border-white/[0.06] flex items-center justify-between gap-3 text-xs">
        <Link href={line.href} className="flex items-center gap-1 font-bold text-[var(--accent-text)]">
          {fill(t.fullTable, { name: line.categoryName })} <span className="text-slate-500 num">({digits(line.items.length, locale)})</span>
        </Link>
        <Link href="/prices" className="flex items-center gap-1 text-slate-300 hover:text-white">
          {t.allPrices} <ArrowLeft className="w-3.5 h-3.5 ltr:rotate-180" />
        </Link>
      </div>
    </div>
  );
}
