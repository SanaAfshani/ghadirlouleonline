'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowDownLeft, ArrowUpLeft, Lock } from 'lucide-react';
import { cn, faDigits } from '@/shared/lib/utils';
import type { PriceBoard } from '@/shared/lib/price-board-types';
import { GRADES } from '@/shared/lib/price-item';
import { useLiveBoard } from './live-store';
import { MarketStatus, marketDetail } from './MarketStatus';

/** رنگ کلاس وزنی روی زمینه همیشه تیره هیرو */
const gradeTone: Record<string, string> = {
  سبک: 'bg-sky-400/15 text-sky-300',
  'نیمه‌سنگین': 'bg-amber-400/15 text-amber-300',
  سنگین: 'bg-rose-400/15 text-rose-300',
};

/** کارت «قیمت لحظه‌ای» داخل هیرو — قیمت‌ها از همان اولین نگاه در صفحه اول */
export function HeroBoard({ initial, rows = 5 }: { initial: PriceBoard; rows?: number }) {
  const { board, flashes } = useLiveBoard(initial);
  const [active, setActive] = useState(board.lines[0]?.productId);
  const [grade, setGrade] = useState('');
  if (!board.lines.length) return null;

  const line = board.lines.find((l) => l.productId === active) ?? board.lines[0];
  const open = board.market.open;
  const grades = GRADES.filter((g) => line.items.some((i) => i.grade === g));
  const items = grade ? line.items.filter((i) => i.grade === grade) : line.items;

  return (
    <div className="corner-marks rounded-[var(--radius-panel)] border border-white/10 bg-[var(--ink-2)]/75 backdrop-blur-md shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)] overflow-hidden">
      <div className="px-4 sm:px-5 pt-4 sm:pt-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-white font-black">قیمت لحظه‌ای</p>
          <p className="text-[11px] text-slate-400 mt-0.5 sm:hidden">{marketDetail(board.market)}</p>
        </div>
        <MarketStatus market={board.market} tone="dark" />
      </div>

      <div role="tablist" aria-label="خط محصول" className="snap-row gap-1.5 px-4 sm:px-5 mt-4">
        {board.lines.map((l) => (
          <button
            key={l.productId}
            role="tab"
            aria-selected={l.productId === line.productId}
            onClick={() => {
              setActive(l.productId);
              setGrade('');
            }}
            className={cn(
              'h-8 px-3 rounded-lg text-xs font-bold whitespace-nowrap transition-colors',
              l.productId === line.productId ? 'bg-white text-[var(--ink)]' : 'text-slate-300 bg-white/5 hover:bg-white/10',
            )}
          >
            {l.productName}
          </button>
        ))}
      </div>

      {/* تفکیک سبک / سنگین — فقط وقتی محصول بیش از یک کلاس دارد */}
      {grades.length > 1 && (
        <div aria-label="کلاس وزنی" className="flex gap-1 px-4 sm:px-5 mt-3">
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
              {g || 'همه کلاس‌ها'}
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
                  <span className="text-[13px] font-bold text-white leading-6 truncate num">{faDigits(i.size || i.title)}</span>
                  {i.grade && <span className={cn('shrink-0 h-5 px-1.5 rounded text-[10px] font-bold leading-5', gradeTone[i.grade])}>{i.grade}</span>}
                </span>
                {/* مدل و مشخصات در خط دوم — نام بلند دیگر بریده نمی‌شود */}
                {i.size && (
                  <span className="block text-[11px] text-slate-400 leading-5 truncate num">
                    {faDigits([i.title, i.spec, i.dimensions].filter(Boolean).join(' · '))}
                  </span>
                )}
              </span>
              <span className="shrink-0 flex items-center gap-2">
                {pct !== 0 && (
                  <span className={cn('flex items-center text-[11px] font-bold num', pct > 0 ? 'text-emerald-400' : 'text-red-400')}>
                    {pct > 0 ? <ArrowUpLeft className="w-3 h-3" /> : <ArrowDownLeft className="w-3 h-3" />}
                    {Math.abs(pct).toLocaleString('fa-IR', { maximumFractionDigits: 1 })}٪
                  </span>
                )}
                {open && i.price != null ? (
                  <span className="text-white font-black num text-sm">{i.price.toLocaleString('fa-IR')}</span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-slate-400"><Lock className="w-3 h-3" />استعلام</span>
                )}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="px-4 sm:px-5 py-3.5 border-t border-white/[0.06] flex items-center justify-between gap-3 text-xs">
        <Link href={line.href} className="flex items-center gap-1 font-bold text-[var(--accent-text)]">
          جدول کامل {line.productName} <span className="text-slate-500 num">({faDigits(line.items.length)})</span>
        </Link>
        <Link href="/prices" className="flex items-center gap-1 text-slate-300 hover:text-white">
          همه قیمت‌ها <ArrowLeft className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
