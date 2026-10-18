'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Clock, Minus, Plus } from 'lucide-react';
import { cn, faDigits } from '@/shared/lib/utils';
import { faDateLong, fromJalali, jalaliMonthDays, jalaliParts, JALALI_MONTHS } from '@/shared/lib/jalali';

const HOUR = 3600_000;
/** وقت تهران UTC+۳:۳۰ است — گرد کردن به ساعت کامل باید به وقت تهران باشد، نه UTC (وگرنه :۳۰ می‌شد) */
const TEHRAN = 210 * 60_000;
const nowMs = () => Date.now();
const hoursFromNow = (hours: number) => new Date(Math.ceil((Date.now() + hours * HOUR + TEHRAN) / HOUR) * HOUR - TEHRAN);

const WEEKDAYS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
const PRESETS = [
  { label: '۲۴ ساعت', hours: 24 },
  { label: '۴۸ ساعت', hours: 48 },
  { label: '۳ روز', hours: 72 },
  { label: '۷ روز', hours: 168 },
];
/** ساعت پیش‌فرض وقتی فقط روز انتخاب شده — پایان ساعت فروش */
const DEFAULT_HOUR = 17;
const fa2 = (n: number) => faDigits(String(n).padStart(2, '0'));

/** ستون روز هفته (شنبه = ۰) برای روز شمسی */
function weekdayIndex(year: number, month: number, day: number) {
  const d = fromJalali(year, month, day, 12);
  return d ? (d.getUTCDay() + 1) % 7 : 0;
}

/**
 * «اعتبار تا» با تقویم شمسی واقعی: جدول ماه با روزهای هفته، ماه قبل/بعد، امروز و روز انتخاب‌شده،
 * روزهای گذشته غیرفعال، ساعت با +/− نیم‌ساعتی و دکمه‌های سریع. فهرست با portal بیرون از کارت (overflow-hidden) باز می‌شود.
 */
export function ValidUntilField({ value, onChange, allowEmpty = true }: { value: string | null; onChange: (iso: string | null) => void; allowEmpty?: boolean }) {
  const id = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; maxHeight: number } | null>(null);
  const [now, setNow] = useState(0);
  const [view, setView] = useState({ year: 0, month: 0 });

  const current = value ? jalaliParts(new Date(value)) : null;

  const openPanel = () => {
    const t = nowMs();
    const base = jalaliParts(value ? new Date(value) : new Date(t));
    setNow(t);
    setView({ year: base.year, month: base.month });
    place();
    setOpen(true);
  };

  /**
   * جای پنل کنار فیلد، همیشه داخل صفحه: زیر فیلد، اگر جا نبود بالا، و اگر صفحه از پنل کوتاه‌تر بود از بالای صفحه
   * با اسکرول داخلی — قبلاً پایین پنل (دکمه تأیید) بیرون صفحه می‌ماند و چون fixed است با اسکرول صفحه هم بالا نمی‌آمد.
   */
  const place = () => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const r = trigger.getBoundingClientRect();
    const width = 320;
    const gap = 6;
    const margin = 8;
    const maxHeight = window.innerHeight - margin * 2;
    const height = Math.min(panelRef.current?.scrollHeight ?? 470, maxHeight);
    let top = r.bottom + gap;
    if (top + height > window.innerHeight - margin) top = r.top - gap - height >= margin ? r.top - gap - height : window.innerHeight - margin - height;
    setPos({ top: Math.max(margin, top), left: Math.min(Math.max(margin, r.right - width), window.innerWidth - width - margin), maxHeight });
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!panelRef.current?.contains(e.target as Node) && !triggerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    // با اسکرول صفحه/پنل ادمین و تغییر اندازه، پنل کنار فیلد می‌ماند
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    // بعد از اولین رندر، ارتفاع واقعی پنل معلوم است
    const frame = requestAnimationFrame(place);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
      cancelAnimationFrame(frame);
    };
  }, [open]);

  const today = now ? jalaliParts(new Date(now)) : null;
  const hour = current?.hour ?? DEFAULT_HOUR;
  const minute = current?.minute ?? 0;

  const pick = (day: number) => {
    const d = fromJalali(view.year, view.month, day, hour, minute);
    if (d) onChange(d.toISOString());
  };
  const shiftMonth = (delta: number) =>
    setView((v) => {
      const m = v.month + delta;
      return m < 1 ? { year: v.year - 1, month: 12 } : m > 12 ? { year: v.year + 1, month: 1 } : { year: v.year, month: m };
    });
  const shiftTime = (minutes: number) => {
    if (!value) return;
    const next = new Date(new Date(value).getTime() + minutes * 60_000);
    if (next.getTime() > Date.now()) onChange(next.toISOString());
  };

  const days = view.month ? jalaliMonthDays(view.year, view.month) : 0;
  const offset = view.month ? weekdayIndex(view.year, view.month, 1) : 0;
  const isPast = (day: number) => (fromJalali(view.year, view.month, day, 23, 59)?.getTime() ?? 0) < now;
  const viewIsThisMonth = today && today.year === view.year && today.month === view.month;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? `${id}-cal` : undefined}
        onClick={() => (open ? setOpen(false) : openPanel())}
        className={cn(
          'w-full h-11 flex items-center gap-2.5 rounded-xl border border-[var(--border)] bg-[var(--muted)] px-3 text-sm text-right transition-[border-color,box-shadow]',
          'hover:border-[var(--accent)]/50 focus:outline-none focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]/20',
          open && 'border-[var(--accent)] ring-2 ring-[var(--accent)]/20',
        )}
      >
        <CalendarDays className="w-4 h-4 shrink-0 text-[var(--accent-text)]" />
        <span className={cn('flex-1 min-w-0 truncate num', value ? 'font-bold' : 'text-[var(--muted-foreground)]')}>
          {value ? faDateLong(value) : 'انتخاب تاریخ — خالی: ۴۸ ساعت بعد از صدور'}
        </span>
        <ChevronDown className={cn('w-4 h-4 shrink-0 text-[var(--muted-foreground)] transition-transform duration-200', open && 'rotate-180')} />
      </button>

      {open && pos &&
        createPortal(
          <div className="site contents" dir="rtl">
            <div
              ref={panelRef}
              id={`${id}-cal`}
              role="dialog"
              aria-label="انتخاب تاریخ اعتبار"
              style={{ top: pos.top, left: pos.left, width: 320, maxHeight: pos.maxHeight }}
              className="fixed z-[90] overflow-y-auto overscroll-contain rounded-2xl border border-[var(--border)] bg-[var(--background)] p-3 shadow-2xl origin-top animate-[select-pop_0.14s_cubic-bezier(0.22,1,0.36,1)]"
            >
              {/* ماه و سال */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <button type="button" onClick={() => shiftMonth(-1)} disabled={!!viewIsThisMonth} aria-label="ماه قبل" className="w-9 h-9 grid place-items-center rounded-xl hover:bg-[var(--muted)] disabled:opacity-30">
                  <ChevronRight className="w-4 h-4" />
                </button>
                <p className="font-black text-sm num">{JALALI_MONTHS[view.month - 1]} {faDigits(String(view.year))}</p>
                <button type="button" onClick={() => shiftMonth(1)} aria-label="ماه بعد" className="w-9 h-9 grid place-items-center rounded-xl hover:bg-[var(--muted)]">
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>

              {/* جدول روزها */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {WEEKDAYS.map((w, i) => (
                  <span key={w} className={cn('h-7 grid place-items-center text-[11px] font-bold', i === 6 ? 'text-red-500' : 'text-[var(--muted-foreground)]')}>{w}</span>
                ))}
                {Array.from({ length: offset }, (_, i) => <span key={`e${i}`} />)}
                {Array.from({ length: days }, (_, i) => {
                  const day = i + 1;
                  const selected = current && current.year === view.year && current.month === view.month && current.day === day;
                  const isToday = viewIsThisMonth && today!.day === day;
                  const past = isPast(day);
                  const friday = (offset + i) % 7 === 6;
                  return (
                    <button
                      key={day}
                      type="button"
                      disabled={past}
                      onClick={() => pick(day)}
                      aria-pressed={!!selected}
                      className={cn(
                        'h-9 rounded-xl text-sm num transition-colors',
                        selected
                          ? 'bg-[var(--accent)] text-[var(--accent-foreground)] font-black shadow-sm'
                          : past
                            ? 'text-[var(--muted-foreground)]/40 cursor-not-allowed'
                            : cn('hover:bg-[var(--muted)]', friday && 'text-red-500'),
                        isToday && !selected && 'ring-1 ring-[var(--accent)] font-bold',
                      )}
                    >
                      {faDigits(String(day))}
                    </button>
                  );
                })}
              </div>

              {/* ساعت */}
              <div className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-[var(--muted)] px-2 py-1.5">
                <span className="flex items-center gap-1.5 text-xs font-bold text-[var(--muted-foreground)]"><Clock className="w-3.5 h-3.5" />ساعت</span>
                <div className="flex items-center gap-1">
                  <button type="button" disabled={!value} onClick={() => shiftTime(-30)} aria-label="نیم ساعت زودتر" className="w-8 h-8 grid place-items-center rounded-lg hover:bg-[var(--background)] disabled:opacity-30"><Minus className="w-3.5 h-3.5" /></button>
                  <span className="w-14 text-center font-black text-sm num">{fa2(hour)}:{fa2(minute)}</span>
                  <button type="button" disabled={!value} onClick={() => shiftTime(30)} aria-label="نیم ساعت دیرتر" className="w-8 h-8 grid place-items-center rounded-lg hover:bg-[var(--background)] disabled:opacity-30"><Plus className="w-3.5 h-3.5" /></button>
                </div>
              </div>

              {/* سریع */}
              <div className="mt-3 grid grid-cols-4 gap-1.5">
                {PRESETS.map((p) => (
                  <button key={p.hours} type="button" onClick={() => onChange(hoursFromNow(p.hours).toISOString())} className="h-8 rounded-lg bg-[var(--muted)] text-[11px] font-bold hover:bg-[var(--accent)]/15">
                    {p.label}
                  </button>
                ))}
              </div>

              <div className="mt-3 pt-3 border-t border-[var(--border)] flex items-center justify-between gap-2">
                {allowEmpty && value ? (
                  <button type="button" onClick={() => { onChange(null); setOpen(false); }} className="text-xs font-bold text-[var(--muted-foreground)] hover:text-red-600">
                    پیش‌فرض (۴۸ ساعت بعد از صدور)
                  </button>
                ) : <span />}
                <button type="button" onClick={() => setOpen(false)} className="h-9 px-5 rounded-xl bg-[var(--foreground)] text-[var(--background)] text-xs font-bold">
                  تأیید
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
      {value && <p className="mt-1.5 text-xs text-[var(--muted-foreground)] num">مشتری می‌بیند: اعتبار تا {faDateLong(value)}</p>}
    </>
  );
}
