'use client';

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, type LucideIcon } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export type SelectOption = { value: string; label: string; hint?: string };

type Props = {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  /** کلاس دکمه (اندازه، زمینه، کادر) — هم‌شکل inputهای همان فرم */
  className?: string;
  /** آیکون سمت راست دکمه */
  icon?: LucideIcon;
  disabled?: boolean;
  /** برای فرم‌ها: input مخفی با required تا اعتبارسنجی مرورگر کار کند */
  required?: boolean;
  name?: string;
  'aria-label'?: string;
};

/**
 * منوی انتخاب سفارشی به جای select بومی — فهرست باز شده‌ی select مرورگر قابل استایل نیست.
 * فهرست در portal با موقعیت fixed باز می‌شود تا داخل کارت/جدول بریده نشود؛ کیبورد: ↑↓ Home End Enter Esc و تایپ حرف اول.
 */
export function Select({ value, onChange, options, placeholder = 'انتخاب کنید', className, icon: Icon, disabled, required, name, ...rest }: Props) {
  const id = useId();
  const btnRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [pos, setPos] = useState<{ top: number; left: number; width: number; up: boolean } | null>(null);
  const selected = options.find((o) => o.value === value);

  const place = useCallback(() => {
    const r = btnRef.current?.getBoundingClientRect();
    if (!r) return;
    const listH = Math.min(352, options.length * 44 + 14);
    const up = r.bottom + listH + 8 > window.innerHeight && r.top > listH + 8;
    const width = Math.max(r.width, 176);
    // RTL: لبه راست فهرست با لبه راست دکمه هم‌تراز؛ از صفحه بیرون نزند
    const left = Math.min(Math.max(8, r.right - width), window.innerWidth - width - 8);
    setPos({ top: up ? r.top - listH - 6 : r.bottom + 6, left, width, up });
  }, [options.length]);

  const openList = () => {
    if (disabled) return;
    setActive(Math.max(0, options.findIndex((o) => o.value === value)));
    setOpen(true);
  };
  const close = (focusButton = true) => {
    setOpen(false);
    if (focusButton) btnRef.current?.focus();
  };
  const choose = (i: number) => {
    const o = options[i];
    if (o) onChange(o.value);
    close();
  };

  useLayoutEffect(() => {
    if (open) place();
  }, [open, place]);

  // فوکوس بعد از اولین رندر فهرست (pos تازه ست شده) — برای کیبورد و صفحه‌خوان
  const rendered = open && pos != null;
  useEffect(() => {
    if (rendered) listRef.current?.focus({ preventScroll: true });
  }, [rendered]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!btnRef.current?.contains(t) && !listRef.current?.contains(t)) close(false);
    };
    const onMove = () => place();
    document.addEventListener('mousedown', onDown);
    window.addEventListener('resize', onMove);
    window.addEventListener('scroll', onMove, true);
    return () => {
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('resize', onMove);
      window.removeEventListener('scroll', onMove, true);
    };
  }, [open, place]);

  // گزینه فعال در دید بماند
  useEffect(() => {
    if (open) listRef.current?.querySelector<HTMLElement>(`[data-i="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  const onListKey = (e: React.KeyboardEvent) => {
    const last = options.length - 1;
    if (e.key === 'ArrowDown') setActive((a) => Math.min(last, a + 1));
    else if (e.key === 'ArrowUp') setActive((a) => Math.max(0, a - 1));
    else if (e.key === 'Home') setActive(0);
    else if (e.key === 'End') setActive(last);
    else if (e.key === 'Enter' || e.key === ' ') choose(active);
    else if (e.key === 'Escape' || e.key === 'Tab') close(e.key === 'Escape');
    else if (e.key.length === 1) {
      const i = options.findIndex((o, k) => k > active && o.label.startsWith(e.key));
      const j = i >= 0 ? i : options.findIndex((o) => o.label.startsWith(e.key));
      if (j >= 0) setActive(j);
      return;
    } else return;
    e.preventDefault();
  };

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? `${id}-list` : undefined}
        aria-label={rest['aria-label']}
        onClick={() => (open ? close() : openList())}
        onKeyDown={(e) => {
          if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
            e.preventDefault();
            openList();
          }
        }}
        className={cn(
          'relative flex items-center gap-2 text-right transition-[border-color,box-shadow] cursor-pointer',
          'hover:border-[var(--accent)]/50 focus:outline-none focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]/20',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          open && 'border-[var(--accent)] ring-2 ring-[var(--accent)]/20',
          className,
        )}
      >
        {Icon && <Icon className="w-4 h-4 shrink-0 text-[var(--muted-foreground)]" />}
        <span className={cn('flex-1 min-w-0 truncate', !selected && 'text-[var(--muted-foreground)]')}>{selected?.label ?? placeholder}</span>
        <ChevronDown className={cn('w-4 h-4 shrink-0 text-[var(--muted-foreground)] transition-transform duration-200', open && 'rotate-180')} />
      </button>
      {(required || name) && (
        <input tabIndex={-1} aria-hidden name={name} required={required} value={value} onChange={() => {}} className="sr-only" />
      )}
      {open && pos &&
        createPortal(
          // .site: متغیرهای رنگ سایت/پنل به فهرستی که بیرون از درخت صفحه رندر می‌شود هم برسد
          <div className="site contents" dir="rtl">
            <ul
              ref={listRef}
              id={`${id}-list`}
              role="listbox"
              tabIndex={-1}
              aria-activedescendant={`${id}-o${active}`}
              onKeyDown={onListKey}
              style={{ top: pos.top, left: pos.left, width: pos.width }}
              className={cn(
                'fixed z-[90] max-h-[22rem] overflow-y-auto overscroll-contain no-scrollbar rounded-2xl border border-[var(--border)] bg-[var(--background)] p-1.5 shadow-2xl focus:outline-none',
                pos.up ? 'origin-bottom' : 'origin-top',
                'animate-[select-pop_0.14s_cubic-bezier(0.22,1,0.36,1)]',
              )}
            >
              {options.map((o, i) => {
                const isSel = o.value === value;
                return (
                  <li
                    key={o.value}
                    id={`${id}-o${i}`}
                    data-i={i}
                    role="option"
                    aria-selected={isSel}
                    onMouseEnter={() => setActive(i)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => choose(i)}
                    className={cn(
                      'flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm cursor-pointer select-none',
                      i === active && 'bg-[var(--muted)]',
                      isSel ? 'font-bold text-[var(--accent-text)]' : 'text-[var(--foreground)]',
                    )}
                  >
                    <span className="flex-1 min-w-0">
                      <span className="block truncate">{o.label}</span>
                      {o.hint && <span className="block text-[11px] font-normal text-[var(--muted-foreground)]">{o.hint}</span>}
                    </span>
                    {isSel && <Check className="w-4 h-4 shrink-0" />}
                  </li>
                );
              })}
            </ul>
          </div>,
          document.body,
        )}
    </>
  );
}
