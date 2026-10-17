'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  AlertTriangle, ArrowDownLeft, ArrowDownUp, ArrowUpLeft, Check, ChevronDown, ChevronUp, ClipboardPaste, ExternalLink, Layers,
  Loader2, Package, Percent, Plus, Power, Scale, Search, Tags, Trash2, TrendingUp, X,
} from 'lucide-react';
import { WEEK_ORDER, WEEKDAY_LABEL, type MarketMode, type MarketSchedule, type MarketStatus } from '@/shared/lib/market';
import { cn, formatPersianNumber, latinDigits } from '@/shared/lib/utils';
import { toWeight } from '@/shared/lib/price-admin';
import { GRADES, compareItems, itemLabel, type SortDir, type SortKey } from '@/shared/lib/price-item';
import { useConfirm } from '@/shared/ui/ConfirmDialog';
import { Skeleton } from '@/shared/ui/Skeleton';
import { Select } from '@/shared/ui/Select';
import { IconTile } from '@/shared/ui/IconTile';

type Item = {
  id: string; productId: string; title: string; size: string; grade: string; spec: string; dimensions: string;
  price: number | null; previousPrice: number | null; weight: string; note: string; sortOrder: number; priceChangedAt: string;
};
type ProductRow = {
  id: string; name: string; slug: string; published: boolean; pricePerKg: number | null;
  category: { slug: string; name: string };
  priceItems: Item[];
};
type Market = { mode: MarketMode; schedule: MarketSchedule; status: MarketStatus };

const card = 'bg-[var(--card)] border border-[var(--border)] rounded-2xl';
const inputCls = 'h-10 bg-[var(--muted)] border border-[var(--border)] rounded-xl px-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--accent)]';

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, headers: { 'Content-Type': 'application/json', ...init?.headers } });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.success) throw new Error(json.error || 'خطا در ارتباط با سرور');
  return json.data as T;
}

const fmt = (n: number | null) => (n == null ? '' : n.toLocaleString('fa-IR'));
const parse = (v: string) => {
  const n = Number(latinDigits(v).replace(/[^\d]/g, ''));
  return n > 0 ? n : null;
};

/* ─────────────────────────── بازار ─────────────────────────── */

function MarketPanel({ market, onChange }: { market: Market; onChange: (m: Market) => void }) {
  const [schedule, setSchedule] = useState<MarketSchedule>(market.schedule);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const save = async (patch: Partial<Pick<Market, 'mode' | 'schedule'>>) => {
    setSaving(true);
    try {
      onChange(await api<Market>('/api/admin/market', { method: 'PUT', body: JSON.stringify(patch) }));
      toast.success('ذخیره شد — سایت در چند ثانیه به‌روز می‌شود');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'خطا');
    } finally {
      setSaving(false);
    }
  };

  const s = market.status;
  const MODES: { key: MarketMode; label: string; hint: string }[] = [
    { key: 'auto', label: 'خودکار', hint: 'طبق ساعت کاری' },
    { key: 'open', label: 'باز', hint: 'دستی' },
    { key: 'closed', label: 'بسته', hint: 'تعطیل / دستی' },
  ];

  return (
    <div className={cn(card, 'overflow-hidden')}>
      <div className="p-5 flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
        <div className="flex items-center gap-4">
          <IconTile icon={Power} tone={s.open ? 'emerald' : 'slate'} size="lg" />
          <div>
            <p className="text-[var(--foreground)] font-black text-lg">{s.open ? 'فروش باز است' : 'فروش بسته است'}</p>
            <p className="text-[var(--muted-foreground)] text-xs mt-0.5">
              {s.open
                ? s.nextChangeLabel ? `قیمت‌ها نمایش داده می‌شوند · بسته شدن خودکار ساعت ${s.nextChangeLabel}` : 'قیمت‌ها نمایش داده می‌شوند'
                : s.nextOpenDay ? `در سایت «استعلام قیمت» نمایش داده می‌شود · بازگشایی ${s.nextOpenDay} ${s.nextChangeLabel}` : 'در سایت «استعلام قیمت» نمایش داده می‌شود'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 min-[400px]:grid-cols-[1fr_auto] lg:flex items-center gap-2">
          <div className="grid grid-cols-3 bg-[var(--muted)] rounded-xl p-1 gap-1 min-w-0">
            {MODES.map((m) => (
              <button
                key={m.key}
                disabled={saving}
                onClick={() => market.mode !== m.key && save({ mode: m.key })}
                className={cn('px-2 sm:px-4 py-1.5 rounded-lg text-sm font-bold leading-tight', market.mode === m.key ? 'bg-[var(--accent)] text-[var(--accent-foreground)] shadow-sm' : 'text-[var(--foreground)] hover:bg-[var(--background)]')}
              >
                {m.label}
                <span className={cn('block text-[10px] font-normal', market.mode === m.key ? 'text-[var(--accent-foreground)]/70' : 'text-[var(--muted-foreground)]')}>{m.hint}</span>
              </button>
            ))}
          </div>
          <button onClick={() => setOpen((o) => !o)} className="h-12 px-3 justify-center rounded-xl bg-[var(--muted)] text-[var(--foreground)] text-xs whitespace-nowrap hover:text-[var(--foreground)] flex items-center gap-1">
            ساعت کاری <ChevronDown className={cn('w-4 h-4 transition-transform', open && 'rotate-180')} />
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-[var(--border)] p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {WEEK_ORDER.map((d) => {
              const slot = schedule[d];
              return (
                <div key={d} className={cn('rounded-xl border p-3', slot ? 'border-[var(--border)] bg-[var(--muted)]/50' : 'border-[var(--border)]')}>
                  <label className="flex items-center justify-between gap-2 cursor-pointer">
                    <span className="text-sm font-bold text-[var(--foreground)]">{WEEKDAY_LABEL[d]}</span>
                    <input
                      type="checkbox"
                      checked={!!slot}
                      onChange={(e) => setSchedule((sc) => ({ ...sc, [d]: e.target.checked ? ['09:00', '17:00'] : undefined }))}
                      className="w-4 h-4 accent-[var(--accent)]"
                    />
                  </label>
                  {slot ? (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]" dir="ltr">
                      <input type="time" value={slot[0]} onChange={(e) => setSchedule((sc) => ({ ...sc, [d]: [e.target.value, slot[1]] }))} className={cn(inputCls, 'h-9 px-2 flex-1')} />
                      <span>–</span>
                      <input type="time" value={slot[1]} onChange={(e) => setSchedule((sc) => ({ ...sc, [d]: [slot[0], e.target.value] }))} className={cn(inputCls, 'h-9 px-2 flex-1')} />
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-[var(--muted-foreground)]">تعطیل</p>
                  )}
                </div>
              );
            })}
          </div>
          <button disabled={saving} onClick={() => save({ schedule })} className="mt-4 h-10 px-5 rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] text-sm font-bold disabled:opacity-50">
            ذخیره ساعت کاری
          </button>
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">ساعت‌ها به وقت تهران است. در حالت «خودکار» فروش طبق این برنامه باز و بسته می‌شود.</p>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────── درصد تغییر ─────────────────────────── */

type Pct = { amount: string; up: boolean };
const emptyPct: Pct = { amount: '', up: true };

/** درصد علامت‌دار: مقدار همیشه مثبت تایپ می‌شود، جهت با دکمه افزایش/کاهش — «۵»، «2.5»، «۲٫۵» */
function signedPct(p: Pct) {
  const n = Number(latinDigits(p.amount).replace(/[٫,/]/g, '.').replace(/[^\d.]/g, ''));
  return Number.isFinite(n) && n > 0 ? (p.up ? n : -n) : 0;
}

/**
 * ورودی درصد خوانا: دکمه افزایش/کاهش + عدد با علامت ٪ + مثال زنده («۱۰۰٬۰۰۰ ← ۱۰۵٬۰۰۰ تومان»)
 * — به جای «+3 / -2» که معلوم نبود منفی را چطور باید نوشت.
 */
function PercentControl({ value, onChange, roundTo, dark = false, label }: {
  value: Pct;
  onChange: (p: Pct) => void;
  roundTo: number;
  dark?: boolean;
  label: string;
}) {
  const n = signedPct(value);
  const example = n ? Math.max(roundTo, Math.round((100000 * (1 + n / 100)) / roundTo) * roundTo) : null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className={cn('flex items-center gap-1 rounded-xl p-1', dark ? 'bg-white/10' : 'bg-[var(--muted)]')} role="radiogroup" aria-label="جهت تغییر">
        {([[true, 'افزایش', ArrowUpLeft], [false, 'کاهش', ArrowDownLeft]] as const).map(([up, text, Icon]) => {
          const on = value.up === up;
          return (
            <button
              key={text}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onChange({ ...value, up })}
              className={cn(
                'h-8 px-2.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors',
                on
                  ? up ? 'bg-emerald-500 text-white shadow-sm' : 'bg-red-500 text-white shadow-sm'
                  : dark ? 'text-white/70 hover:text-white' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]',
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {text}
            </button>
          );
        })}
      </div>
      <div className="relative">
        <input
          value={value.amount}
          onChange={(e) => onChange({ ...value, amount: e.target.value })}
          inputMode="decimal"
          dir="ltr"
          placeholder="مثلاً ۵"
          aria-label={label}
          className={cn(
            'h-10 w-28 rounded-xl border pl-8 pr-3 text-left text-sm font-bold num focus:outline-none',
            dark
              ? 'bg-white/10 border-white/20 text-white placeholder:text-white/50 placeholder:font-normal focus:border-[var(--accent)]'
              : 'bg-[var(--background)] border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] placeholder:font-normal focus:border-[var(--accent)]',
          )}
        />
        <span className={cn('pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold', dark ? 'text-white/60' : 'text-[var(--muted-foreground)]')}>٪</span>
      </div>
      <span className={cn('text-[11px] num', dark ? 'text-white/60' : 'text-[var(--muted-foreground)]')}>
        {example != null ? (
          <>مثال: ۱۰۰٬۰۰۰ ← <b className={n > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>{example.toLocaleString('fa-IR')}</b> تومان</>
        ) : (
          'عدد درصد را بنویسید'
        )}
      </span>
    </div>
  );
}

/* ─────────────────────────── سلول قیمت ─────────────────────────── */

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

/** فیلد با برچسب کوچک داخل کادر — بعد از پر شدن هم معلوم است کدام ستون است */
function Labeled({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={cn('relative block min-w-0', className)}>
      {/* در حالت جدولی (پنل پهن) سرستون نام فیلد را نشان می‌دهد */}
      <span className="pointer-events-none absolute top-1.5 right-3 z-10 text-[10px] leading-none text-[var(--muted-foreground)] @[60rem]:sr-only">{label}</span>
      {children}
    </label>
  );
}

/**
 * پنل باریک: کادر با برچسب داخلی. پنل پهن (۶۰rem به بالا): سلول صفحه‌گسترده — کادر کوتاه‌تر، برچسب در سرستون.
 * @[60rem] کوئری کانتینر روی کارت محصول است نه عرض صفحه.
 */
const fieldCls = cn(
  inputCls,
  'w-full h-11 pt-4',
  // کادر همیشه پیداست تا معلوم باشد هر سلول قابل ویرایش است
  '@[60rem]:h-9 @[60rem]:pt-0 @[60rem]:rounded-lg @[60rem]:bg-[var(--background)] @[60rem]:border-[var(--border)] @[60rem]:hover:border-[var(--accent)]/50 @[60rem]:focus:border-[var(--accent)] @[60rem]:focus:ring-2 @[60rem]:focus:ring-[var(--accent)]/15',
  // نمونه‌های راهنما («شاخه ۶ متری»...) در جدول شلوغی می‌سازند — فقط در ردیف جدید دیده می‌شوند
  '@[60rem]:placeholder:text-transparent',
);
/** ستون‌های حالت جدولی: انتخاب، مدل، سایز، کلاس، مشخصات، ابعاد، وزن، قیمت، توضیحات، ترتیب/حذف */
const TABLE_COLS = '@[60rem]:grid-cols-[28px_minmax(0,1.3fr)_96px_108px_minmax(0,1fr)_minmax(0,0.8fr)_84px_160px_minmax(0,0.9fr)_92px]';

/** چک‌باکس انتخاب ردیف */
const checkCls = 'w-4.5 h-4.5 rounded-md accent-[var(--accent)] cursor-pointer';

/** ردیف جدید در حالت جدولی هم کادر دارد تا معلوم باشد جای تایپ است */
const draftCls = cn(fieldCls, '@[60rem]:bg-[var(--background)] @[60rem]:border-[var(--border)] @[60rem]:placeholder:text-[var(--muted-foreground)]');

function PriceInput({ item, locked, onSaved, onEnter, inputRef }: {
  item: Item;
  /** قیمت از فرمول وزن × قیمت روز می‌آید و دستی ویرایش نمی‌شود */
  locked: boolean;
  onSaved: (i: Item) => void;
  onEnter: () => void;
  inputRef: (el: HTMLInputElement | null) => void;
}) {
  const [value, setValue] = useState(fmt(item.price));
  const [saved, setSaved] = useState(item.price);
  const [focused, setFocused] = useState(false);
  const [state, setState] = useState<SaveState>('idle');

  // قیمت از بیرون عوض شد (مثلاً تغییر درصدی گروهی) — اگر ادمین وسط تایپ نیست، نمایش همگام شود
  if (item.price !== saved && !focused) {
    setSaved(item.price);
    setValue(fmt(item.price));
  }

  const commit = async () => {
    setFocused(false);
    const next = parse(value);
    setValue(fmt(next));
    if (next === saved) return;
    setState('saving');
    try {
      const updated = await api<Item>(`/api/admin/prices/${item.id}`, { method: 'PATCH', body: JSON.stringify({ price: next }) });
      setSaved(updated.price);
      onSaved(updated);
      setState('saved');
      setTimeout(() => setState('idle'), 1600);
    } catch (e) {
      setState('error');
      toast.error(e instanceof Error ? e.message : 'ذخیره نشد');
    }
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        value={value}
        inputMode="numeric"
        dir="ltr"
        readOnly={locked}
        title={locked ? 'وزن × قیمت روز هر کیلو — برای تغییر، قیمت روز یا وزن را عوض کنید' : undefined}
        onChange={(e) => setValue(fmt(parse(e.target.value)))}
        onFocus={(e) => {
          setFocused(true);
          e.target.select();
        }}
        onBlur={locked ? () => setFocused(false) : commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            if (!locked) commit();
            onEnter();
          }
          if (e.key === 'Escape') setValue(fmt(saved));
        }}
        placeholder="استعلام"
        aria-label={`قیمت ${item.title}`}
        className={cn(
          fieldCls,
          'text-left font-bold text-base pl-9 num @[60rem]:placeholder:text-[var(--muted-foreground)]',
          // قیمت فرمولی (وزن × قیمت روز) قابل تایپ نیست — کادر خط‌چین و زمینه کم‌رنگ
          locked && 'bg-transparent cursor-default border-dashed @[60rem]:bg-[var(--muted)]/60 @[60rem]:border-dashed @[60rem]:hover:border-[var(--border)]',
          state === 'saved' && 'border-emerald-500 @[60rem]:border-emerald-500',
          state === 'error' && 'border-red-500 @[60rem]:border-red-500',
        )}
      />
      <span className="absolute left-3 top-1/2 -translate-y-1/2">
        {state === 'saving' && <Loader2 className="w-4 h-4 animate-spin text-[var(--muted-foreground)]" />}
        {state === 'saved' && <Check className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />}
        {state === 'error' && <X className="w-4 h-4 text-red-700 dark:text-red-400" />}
      </span>
    </div>
  );
}

/* ─────────────────────────── قیمت روز هر کیلو ─────────────────────────── */

function PricePerKgPanel({ product, onApplied, onShowMissing }: { product: ProductRow; onApplied: () => Promise<void>; onShowMissing: () => void }) {
  const confirm = useConfirm();
  const [value, setValue] = useState(fmt(product.pricePerKg));
  const [busy, setBusy] = useState(false);
  const [synced, setSynced] = useState(product.pricePerKg);
  const weighted = product.priceItems.filter((i) => toWeight(i.weight) != null).length;
  const missing = product.priceItems.length - weighted;

  // قیمت روز از بیرون عوض شد (مثلاً تغییر درصدی گروهی)
  if (product.pricePerKg !== synced) {
    setSynced(product.pricePerKg);
    setValue(fmt(product.pricePerKg));
  }

  const apply = async (e: React.FormEvent) => {
    e.preventDefault();
    const next = parse(value);
    if (next === product.pricePerKg) return;
    if (next && !weighted) {
      toast.error('هیچ ردیفی وزن ندارد — اول ستون «وزن هر متر» ردیف‌ها را پر کنید، بعد قیمت روز را اعمال کنید');
      onShowMissing();
      return;
    }
    const ok = await confirm(
      next
        ? {
            title: `قیمت روز هر کیلو ${fmt(next)} تومان شود؟`,
            message: `قیمت ${formatPersianNumber(weighted)} ردیف وزن‌دار با فرمول «وزن × قیمت روز» دوباره حساب می‌شود.${missing ? ` ${formatPersianNumber(missing)} ردیف بدون وزن دست نمی‌خورد.` : ''}`,
            tone: 'default',
            confirmLabel: 'اعمال',
          }
        : { title: 'فرمول قیمت روز خاموش شود؟', message: 'قیمت فعلی ردیف‌ها می‌ماند و از این به بعد هر قیمت دستی وارد می‌شود.', tone: 'default', confirmLabel: 'خاموش کردن' },
    );
    if (!ok) return;
    setBusy(true);
    try {
      const r = await api<{ updated: number; missingWeight: number }>('/api/admin/prices/per-kg', { method: 'PUT', body: JSON.stringify({ productId: product.id, pricePerKg: next }) });
      await onApplied();
      if (!next) toast.success('قیمت‌گذاری دستی شد');
      else if (r.updated) toast.success(`${formatPersianNumber(r.updated)} قیمت به‌روز شد`);
      else toast.success('قیمت روز ذخیره شد — قیمت ردیف‌ها از قبل با همین قیمت روز برابر بود');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'خطا');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={apply} className="mx-4 sm:mx-5 mt-4 rounded-2xl border border-[var(--accent)]/25 bg-[var(--accent)]/[0.06] px-4 py-3 flex flex-wrap items-center gap-x-3 gap-y-2">
      <IconTile icon={Scale} size="sm" />
      <label htmlFor={`perkg-${product.id}`} className="text-sm font-black text-[var(--foreground)]">قیمت روز هر کیلو</label>
      <div className="relative">
        <input
          id={`perkg-${product.id}`}
          value={value}
          onChange={(e) => setValue(fmt(parse(e.target.value)))}
          inputMode="numeric"
          dir="ltr"
          placeholder="خاموش"
          className={cn(inputCls, 'w-40 text-left font-bold num pl-14 bg-[var(--background)]')}
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-[var(--muted-foreground)]">تومان</span>
      </div>
      <button disabled={busy || parse(value) === product.pricePerKg} className="h-10 px-4 rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] text-sm font-bold disabled:opacity-40 flex items-center gap-1.5">
        {busy && <Loader2 className="w-4 h-4 animate-spin" />}اعمال
      </button>
      {/* وزن فقط وقتی مهم است که قیمت روز روشن باشد */}
      {product.pricePerKg != null && missing > 0 && (
        <button
          type="button"
          onClick={onShowMissing}
          className="h-8 px-3 rounded-lg bg-amber-500/12 text-amber-800 dark:text-amber-300 text-xs font-bold flex items-center gap-1.5"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          {formatPersianNumber(missing)} ردیف وزن ندارد
        </button>
      )}
      <p className="basis-full text-xs text-[var(--muted-foreground)] leading-6">
        {product.pricePerKg
          ? 'قیمت هر متر = وزن هر متر (کیلوگرم) × قیمت روز هر کیلو. قیمت ردیف‌های وزن‌دار خودکار حساب می‌شود؛ ردیف بدون وزن قیمت دستی دارد.'
          : 'با وارد کردن قیمت روز، قیمت هر ردیف وزن‌دار از «وزن × قیمت روز» حساب می‌شود و دیگر لازم نیست ردیف‌ها را تک‌تک قیمت بزنید.'}
      </p>
    </form>
  );
}

/* ─────────────────────────── جدول یک محصول ─────────────────────────── */

type TextField = 'title' | 'size' | 'grade' | 'spec' | 'dimensions' | 'weight' | 'note';
const emptyDraft = { title: '', size: '', grade: '', spec: '', dimensions: '', weight: '', price: '', note: '' };

const ROUND_OPTIONS = [
  { value: '1', label: 'بدون گرد کردن' },
  { value: '100', label: 'گرد به ۱۰۰', hint: 'مثلاً ۴۲۳٬۵۶۰ ← ۴۲۳٬۶۰۰' },
  { value: '1000', label: 'گرد به ۱٬۰۰۰', hint: 'مثلاً ۴۲۳٬۵۶۰ ← ۴۲۴٬۰۰۰' },
];

const ADMIN_SORTS: { value: string; label: string }[] = [
  { value: 'default:asc', label: 'ترتیب فعلی (دستی)' },
  { value: 'grade:asc', label: 'سبک به سنگین' },
  { value: 'grade:desc', label: 'سنگین به سبک' },
  { value: 'size:asc', label: 'سایز: کوچک به بزرگ' },
  { value: 'size:desc', label: 'سایز: بزرگ به کوچک' },
  { value: 'price:asc', label: 'قیمت: کم به زیاد' },
  { value: 'price:desc', label: 'قیمت: زیاد به کم' },
];

function GradeSelect({ value, onChange, className }: { value: string; onChange: (v: string) => void; className?: string }) {
  return (
    <Select
      value={value}
      onChange={onChange}
      options={[{ value: '', label: '—' }, ...GRADES.map((g) => ({ value: g, label: g }))]}
      aria-label="کلاس"
      className={cn(fieldCls, 'pl-2.5', className)}
    />
  );
}

function ProductBoard({ product, onChange }: { product: ProductRow; onChange: (patch: Partial<ProductRow>) => void }) {
  const confirm = useConfirm();

  const items = product.priceItems;
  const setItems = (next: Item[]) => onChange({ priceItems: next });
  const isLocked = (i: Item) => !!product.pricePerKg && toWeight(i.weight) != null;
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const [q, setQ] = useState('');
  const [grade, setGrade] = useState('');
  const [missingOnly, setMissingOnly] = useState(false);
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: 'default', dir: 'asc' });
  const [pct, setPct] = useState<Pct>(emptyPct);
  const [roundTo, setRoundTo] = useState(1000);
  const [busy, setBusy] = useState(false);
  const [paste, setPaste] = useState<string | null>(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [picked, setPicked] = useState<Set<string>>(() => new Set());
  const [pickPct, setPickPct] = useState<Pct>(emptyPct);

  const sorted = useMemo(
    () => (sort.key === 'default' ? items : [...items].sort((a, b) => compareItems(a, b, sort.key, sort.dir))),
    [items, sort],
  );
  const shown = useMemo(() => {
    const t = latinDigits(q.trim());
    return sorted.filter((i) =>
      (!t || latinDigits(itemLabel(i)).includes(t)) && (!grade || i.grade === grade) && (!missingOnly || toWeight(i.weight) == null),
    );
  }, [sorted, q, grade, missingOnly]);
  // جابه‌جایی دستی فقط روی کل جدول با ترتیب ذخیره‌شده معنا دارد
  const manual = !q && !grade && !missingOnly && sort.key === 'default';

  const replaceItem = (u: Item) => setItems(items.map((i) => (i.id === u.id ? u : i)));

  const patchField = async (i: Item, field: TextField, value: string) => {
    if (value === i[field]) return;
    try {
      replaceItem(await api<Item>(`/api/admin/prices/${i.id}`, { method: 'PATCH', body: JSON.stringify({ [field]: value }) }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'ذخیره نشد');
    }
  };

  const move = async (idx: number, dir: -1 | 1) => {
    const j = idx + dir;
    if (j < 0 || j >= items.length) return;
    const a = items[idx], b = items[j];
    const next = [...items];
    next[idx] = { ...b, sortOrder: a.sortOrder };
    next[j] = { ...a, sortOrder: b.sortOrder };
    setItems(next);
    await Promise.all([
      api(`/api/admin/prices/${a.id}`, { method: 'PATCH', body: JSON.stringify({ sortOrder: b.sortOrder }) }),
      api(`/api/admin/prices/${b.id}`, { method: 'PATCH', body: JSON.stringify({ sortOrder: a.sortOrder }) }),
    ]).catch((e) => toast.error(e.message));
  };

  /** ترتیب مرتب‌شده فعلی، ترتیب پیش‌فرض جدول سایت می‌شود */
  const saveOrder = async () => {
    setBusy(true);
    try {
      await api('/api/admin/prices/reorder', { method: 'POST', body: JSON.stringify({ productId: product.id, ids: sorted.map((i) => i.id) }) });
      setItems(sorted.map((i, sortOrder) => ({ ...i, sortOrder })));
      setSort({ key: 'default', dir: 'asc' });
      toast.success('ترتیب جدید ذخیره شد — جدول سایت هم به همین ترتیب نمایش داده می‌شود');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'خطا');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (i: Item) => {
    if (!(await confirm({ title: `ردیف «${itemLabel(i)}» حذف شود؟` }))) return;
    setItems(items.filter((x) => x.id !== i.id));
    await api(`/api/admin/prices/${i.id}`, { method: 'DELETE' }).catch((e) => toast.error(e.message));
  };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.title.trim()) return toast.error('مدل را وارد کنید');
    try {
      const item = await api<Item>('/api/admin/prices', { method: 'POST', body: JSON.stringify({ productId: product.id, ...draft, price: parse(draft.price) }) });
      setItems([...items, item]);
      // مدل و کلاس معمولاً برای ردیف بعدی هم همان است — فقط سایز و وزن عوض می‌شود
      setDraft({ ...emptyDraft, title: draft.title, grade: draft.grade, spec: draft.spec, dimensions: draft.dimensions });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'خطا');
    }
  };

  const reload = async () => {
    const fresh = (await api<ProductRow[]>('/api/admin/prices')).find((p) => p.id === product.id);
    onChange({ priceItems: fresh?.priceItems ?? [], pricePerKg: fresh?.pricePerKg ?? null });
  };

  const bulk = async () => {
    const n = signedPct(pct);
    if (!n) return toast.error('درصد را وارد کنید، مثلاً ۵');
    const target = product.pricePerKg ? `قیمت روز هر کیلوی «${product.name}»` : `همه قیمت‌های «${product.name}»`;
    if (!(await confirm({ title: `${target} ${formatPersianNumber(Math.abs(n))}٪ ${n > 0 ? 'افزایش' : 'کاهش'} پیدا کند؟`, tone: 'default', confirmLabel: 'اعمال' }))) return;
    setBusy(true);
    try {
      const r = await api<{ updated: number }>('/api/admin/prices/bulk', { method: 'POST', body: JSON.stringify({ productId: product.id, percent: n, roundTo }) });
      await reload();
      setPct(emptyPct);
      toast.success(`${formatPersianNumber(r.updated)} قیمت به‌روز شد`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'خطا');
    } finally {
      setBusy(false);
    }
  };

  const importPaste = async (replace: boolean) => {
    const rows = (paste ?? '')
      .split(/\r?\n/)
      .map((l) => l.split('\t').map((c) => c.trim()))
      .filter((c) => c[0])
      .map(([title, size = '', grade = '', spec = '', dimensions = '', weight = '', price = '', note = '']) => ({ title, size, grade, spec, dimensions, weight, price, note }));
    if (!rows.length) return toast.error('ردیفی پیدا نشد — ستون‌ها را از اکسل کپی کنید');
    if (replace && !(await confirm({ title: 'جدول فعلی این محصول کامل جایگزین شود؟', message: 'همه ردیف‌های فعلی حذف و ردیف‌های پیست‌شده جایگزین می‌شوند.', confirmLabel: 'جایگزینی' }))) return;
    setBusy(true);
    try {
      await api('/api/admin/prices/import', { method: 'POST', body: JSON.stringify({ productId: product.id, rows, replace }) });
      await reload();
      setPaste(null);
      toast.success(`${formatPersianNumber(rows.length)} ردیف وارد شد`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'خطا');
    } finally {
      setBusy(false);
    }
  };

  const shownIds = shown.map((i) => i.id);
  const allPicked = shownIds.length > 0 && shownIds.every((id) => picked.has(id));
  const somePicked = shownIds.some((id) => picked.has(id));
  const togglePick = (id: string) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  // «همه» یعنی ردیف‌های همین نمای فیلترشده (مثلاً فقط سنگین‌ها)
  const togglePickAll = () =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (allPicked) shownIds.forEach((id) => next.delete(id));
      else shownIds.forEach((id) => next.add(id));
      return next;
    });

  const bulkPicked = async () => {
    const n = signedPct(pickPct);
    if (!n) return toast.error('درصد را وارد کنید، مثلاً ۵');
    const ids = [...picked];
    if (!(await confirm({ title: `قیمت ${formatPersianNumber(ids.length)} ردیف انتخاب‌شده ${formatPersianNumber(Math.abs(n))}٪ ${n > 0 ? 'افزایش' : 'کاهش'} پیدا کند؟`, tone: 'default', confirmLabel: 'اعمال' }))) return;
    setBusy(true);
    try {
      const r = await api<{ updated: number; skippedFormula: number }>('/api/admin/prices/bulk-items', { method: 'POST', body: JSON.stringify({ ids, percent: n, roundTo }) });
      await reload();
      setPickPct(emptyPct);
      setPicked(new Set());
      toast.success(
        `${formatPersianNumber(r.updated)} قیمت به‌روز شد` +
          (r.skippedFormula ? ` — ${formatPersianNumber(r.skippedFormula)} ردیف وزن‌دار از قیمت روز حساب می‌شود و تغییر نکرد` : ''),
        { duration: 6000 },
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'خطا');
    } finally {
      setBusy(false);
    }
  };

  const grades = GRADES.filter((g) => items.some((i) => i.grade === g));
  const draftFormula = product.pricePerKg && toWeight(draft.weight) ? Math.round(toWeight(draft.weight)! * product.pricePerKg) : null;

  return (
    // @container: چیدمان ردیف‌ها به عرض همین پنل بستگی دارد نه عرض صفحه — در لپ‌تاپ ۱۰۲۴ پیکسلی، منو و فهرست محصول جا را می‌گیرند
    // بدون overflow-hidden: وگرنه نوار چسبان ردیف‌های انتخاب‌شده به پایین صفحه نمی‌چسبد
    <div className={cn(card, '@container')}>
      <div className="p-4 sm:p-5 border-b border-[var(--border)] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <IconTile icon={Package} tone="sky" size="lg" />
          <div className="min-w-0">
            <p className="text-xs text-[var(--muted-foreground)]">{product.category.name}</p>
            <h2 className="text-[var(--foreground)] font-black text-xl leading-8 truncate">{product.name}</h2>
            <div className="mt-1 flex flex-wrap gap-1.5 text-[11px] font-bold">
              <span className="h-6 px-2 rounded-md bg-[var(--muted)] text-[var(--foreground)] inline-flex items-center num">{formatPersianNumber(items.length)} ردیف</span>
              {product.pricePerKg ? (
                <span className="h-6 px-2 rounded-md bg-[var(--accent)]/12 text-[var(--accent-text)] inline-flex items-center num">قیمت روز {fmt(product.pricePerKg)}</span>
              ) : (
                <span className="h-6 px-2 rounded-md bg-[var(--muted)] text-[var(--muted-foreground)] inline-flex items-center">قیمت دستی</span>
              )}
              {!product.published && <span className="h-6 px-2 rounded-md bg-red-500/10 text-red-700 dark:text-red-300 inline-flex items-center">منتشر نشده</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a href={`/products/${product.category.slug}/${product.slug}`} target="_blank" rel="noopener" className="h-10 px-3.5 rounded-xl border border-[var(--border)] text-[var(--foreground)] text-xs font-bold flex items-center gap-1.5 hover:border-[var(--accent)] transition-colors">
            <ExternalLink className="w-4 h-4" /> صفحه محصول
          </a>
          <button onClick={() => setPaste('')} className="h-10 px-3.5 rounded-xl border border-[var(--border)] text-[var(--foreground)] text-xs font-bold flex items-center gap-1.5 hover:border-[var(--accent)] transition-colors">
            <ClipboardPaste className="w-4 h-4 text-emerald-600" /> پیست از اکسل
          </button>
        </div>
      </div>

      <PricePerKgPanel product={product} onApplied={reload} onShowMissing={() => setMissingOnly(true)} />

      {/* جستجو، مرتب‌سازی و تفکیک کلاس */}
      <div className="px-4 sm:px-5 pt-4 pb-3 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="جستجوی مدل، سایز یا مشخصات…" className={cn(inputCls, 'w-full pr-9')} />
        </div>
        <Select
          value={`${sort.key}:${sort.dir}`}
          onChange={(v) => {
            const [key, dir] = v.split(':') as [SortKey, SortDir];
            setSort({ key, dir });
          }}
          options={ADMIN_SORTS}
          icon={ArrowDownUp}
          aria-label="مرتب‌سازی"
          className={cn(inputCls, 'w-52')}
        />
        {sort.key !== 'default' && (
          <button disabled={busy} onClick={saveOrder} className="h-10 px-3.5 rounded-xl bg-[var(--foreground)] text-[var(--background)] text-xs font-bold disabled:opacity-40">
            ذخیره به عنوان ترتیب سایت
          </button>
        )}
        {grades.length > 0 && (
          <div className="flex items-center gap-1 rounded-xl bg-[var(--muted)] p-1">
            {['', ...grades].map((g) => (
              <button
                key={g || 'all'}
                onClick={() => setGrade(g)}
                className={cn('h-8 px-3 rounded-lg text-xs font-bold transition-colors', grade === g ? 'bg-[var(--background)] text-[var(--foreground)] shadow-sm' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]')}
              >
                {g || 'همه'}
              </button>
            ))}
          </div>
        )}
        {missingOnly && (
          <button onClick={() => setMissingOnly(false)} className="h-10 px-3 rounded-xl text-xs font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300 flex items-center gap-1">
            فقط بدون وزن <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* تغییر درصدی گروهی */}
      <div className="mx-4 sm:mx-5 mb-4 rounded-2xl border border-[var(--border)] bg-[var(--background)]/50 px-3 py-3 flex flex-wrap items-center gap-x-3 gap-y-2.5">
        <span className="flex items-center gap-2 text-xs font-bold text-[var(--foreground)] basis-full xl:basis-auto xl:me-auto">
          <IconTile icon={Percent} tone="violet" size="sm" />
          {product.pricePerKg ? 'تغییر درصدی قیمت روز این محصول' : 'تغییر درصدی همه قیمت‌های این محصول'}
        </span>
        <PercentControl value={pct} onChange={setPct} roundTo={roundTo} label="درصد تغییر قیمت‌های این محصول" />
        <Select value={String(roundTo)} onChange={(v) => setRoundTo(Number(v))} options={ROUND_OPTIONS} aria-label="گرد کردن" className={cn(inputCls, 'w-40')} />
        <button disabled={busy || !signedPct(pct)} onClick={bulk} className="h-10 px-4 rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] text-xs font-bold whitespace-nowrap disabled:opacity-40">
          اعمال روی همه
        </button>
      </div>

      {paste !== null && (
        <div className="p-5 border-b border-[var(--border)] space-y-2">
          <p className="text-xs text-[var(--muted-foreground)] leading-6">
            در اکسل ستون‌ها را به این ترتیب انتخاب و کپی کنید و اینجا پیست کنید (هر خط یک ردیف، ستون‌های خالی مجاز است):
            <span className="block font-bold text-[var(--foreground)]">مدل، سایز، کلاس (سبک/نیمه‌سنگین/سنگین)، مشخصات، ابعاد، وزن هر متر، قیمت، توضیحات</span>
          </p>
          <textarea value={paste} onChange={(e) => setPaste(e.target.value)} rows={6} dir="auto" autoFocus className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl p-3 text-xs text-[var(--foreground)] font-mono focus:outline-none focus:border-[var(--accent)]" />
          <div className="flex flex-wrap gap-2">
            <button disabled={busy} onClick={() => importPaste(false)} className="h-9 px-4 rounded-xl bg-emerald-500 text-black text-sm font-bold">افزودن به انتهای جدول</button>
            <button disabled={busy} onClick={() => importPaste(true)} className="h-9 px-4 rounded-xl bg-[var(--muted)] text-red-700 dark:text-red-300 text-sm">جایگزینی کل جدول</button>
            <button onClick={() => setPaste(null)} className="h-9 px-4 rounded-xl bg-[var(--muted)] text-[var(--foreground)] text-sm">انصراف</button>
          </div>
        </div>
      )}

      {/* سرستون حالت جدولی */}
      <div className={cn('hidden @[60rem]:grid items-center gap-2 px-4 sm:px-5 py-2 border-y border-[var(--border)] bg-[var(--muted)]/60 text-[11px] font-bold text-[var(--muted-foreground)]', TABLE_COLS)}>
        <span className="grid place-items-center">
          <input
            type="checkbox"
            aria-label="انتخاب همه ردیف‌های نمایش‌داده‌شده"
            checked={allPicked}
            ref={(el) => { if (el) el.indeterminate = somePicked && !allPicked; }}
            onChange={() => togglePickAll()}
            className={checkCls}
          />
        </span>
        <span className="px-3">مدل</span>
        <span className="px-3">سایز</span>
        <span className="px-3">کلاس</span>
        <span className="px-3">مشخصات</span>
        <span className="px-3">ابعاد</span>
        <span className="px-3">وزن (kg)</span>
        <span className="px-3">قیمت (تومان)</span>
        <span className="px-3">توضیحات</span>
        <span className="sr-only">ترتیب و حذف</span>
      </div>

      <div className="divide-y divide-[var(--border)] border-t border-[var(--border)] @[60rem]:border-t-0">
        {shown.map((i, pos) => {
          const idx = items.indexOf(i);
          const change = i.price != null && i.previousPrice ? ((i.price - i.previousPrice) / i.previousPrice) * 100 : 0;
          const noWeight = !!product.pricePerKg && toWeight(i.weight) == null;
          return (
            <div
              key={i.id}
              className={cn(
                // پنل پهن: یک ردیف صفحه‌گسترده (دو گروه داخلی با display:contents در همین grid می‌نشینند)
                'group/row relative py-3 pl-12 pr-4 sm:pr-5 space-y-2 transition-colors hover:bg-[var(--muted)]/40',
                '@[60rem]:pl-5',
                picked.has(i.id) && 'bg-[var(--accent)]/[0.07] hover:bg-[var(--accent)]/10',
                '@[60rem]:space-y-0 @[60rem]:grid @[60rem]:gap-2 @[60rem]:items-start @[60rem]:py-1.5',
                TABLE_COLS,
                noWeight && 'before:absolute before:inset-y-0 before:right-0 before:w-1 before:bg-amber-500',
              )}
            >
              {/* انتخاب ردیف — پنل باریک: گوشه کارت؛ پنل پهن: ستون اول جدول */}
              <span className="absolute top-4 left-4 @[60rem]:static @[60rem]:grid @[60rem]:place-items-center @[60rem]:h-9">
                <input type="checkbox" aria-label={`انتخاب ${itemLabel(i)}`} checked={picked.has(i.id)} onChange={() => togglePick(i.id)} className={checkCls} />
              </span>
              {/* خط اول: مشخصات ردیف */}
              <div className="grid grid-cols-2 @2xl:grid-cols-[minmax(0,1.5fr)_120px_130px_minmax(0,1fr)_minmax(0,1fr)] gap-2 @[60rem]:contents">
                <Labeled label="مدل" className="col-span-2 @2xl:col-span-1">
                  <input defaultValue={i.title} onBlur={(e) => patchField(i, 'title', e.target.value.trim())} className={fieldCls} />
                </Labeled>
                <Labeled label="سایز">
                  <input defaultValue={i.size} onBlur={(e) => patchField(i, 'size', e.target.value.trim())} placeholder="۱۶۰ میلیمتر" className={fieldCls} />
                </Labeled>
                <Labeled label="کلاس">
                  <GradeSelect value={i.grade} onChange={(v) => patchField(i, 'grade', v)} />
                </Labeled>
                <Labeled label="مشخصات">
                  <input defaultValue={i.spec} onBlur={(e) => patchField(i, 'spec', e.target.value.trim())} placeholder="SN4 / ۱۰ بار" className={fieldCls} />
                </Labeled>
                <Labeled label="ابعاد">
                  <input defaultValue={i.dimensions} onBlur={(e) => patchField(i, 'dimensions', e.target.value.trim())} placeholder="شاخه ۶ متری" className={fieldCls} />
                </Labeled>
              </div>
              {/* خط دوم: وزن، قیمت، توضیحات */}
              <div className="grid grid-cols-2 @2xl:grid-cols-[110px_190px_minmax(0,1fr)_auto] gap-2 items-start @[60rem]:contents">
                <Labeled label="وزن هر متر (kg)">
                  <input
                    defaultValue={i.weight}
                    onBlur={(e) => patchField(i, 'weight', e.target.value.trim())}
                    dir="ltr"
                    inputMode="decimal"
                    placeholder={noWeight ? 'وزن؟' : undefined}
                    className={cn(fieldCls, 'text-left num', noWeight && 'border-amber-500 bg-amber-500/5 @[60rem]:border-amber-500/70 @[60rem]:bg-amber-500/5 @[60rem]:placeholder:text-amber-600')}
                    title={noWeight ? 'بدون وزن، قیمت این ردیف با قیمت روز حساب نمی‌شود' : undefined}
                  />
                </Labeled>
                <div className="min-w-0">
                  <Labeled label={isLocked(i) ? 'قیمت (وزن × قیمت روز)' : 'قیمت (تومان)'}>
                    <PriceInput
                      item={i}
                      locked={isLocked(i)}
                      onSaved={replaceItem}
                      inputRef={(el) => { refs.current[pos] = el; }}
                      onEnter={() => refs.current[pos + 1]?.focus()}
                    />
                  </Labeled>
                  {i.previousPrice != null && i.previousPrice !== i.price && (
                    <p className="mt-1 @[60rem]:mt-0 @[60rem]:px-3 h-4 text-[11px] text-[var(--muted-foreground)] flex items-center gap-1 num">
                      {change !== 0 && (
                        <span className={cn('flex items-center font-bold', change > 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400')}>
                          {change > 0 ? <ArrowUpLeft className="w-3 h-3" /> : <ArrowDownLeft className="w-3 h-3" />}
                          {Math.abs(change).toLocaleString('fa-IR', { maximumFractionDigits: 1 })}٪
                        </span>
                      )}
                      <span>قبلی: {fmt(i.previousPrice)}</span>
                    </p>
                  )}
                </div>
                <Labeled label="توضیحات" className="col-span-2 @2xl:col-span-1">
                  <input defaultValue={i.note} onBlur={(e) => patchField(i, 'note', e.target.value.trim())} className={fieldCls} />
                </Labeled>
                <div className="flex items-center justify-end col-span-2 @2xl:col-span-1 @[60rem]:opacity-40 @[60rem]:group-hover/row:opacity-100 @[60rem]:focus-within:opacity-100 transition-opacity">
                  <button onClick={() => move(idx, -1)} disabled={idx === 0 || !manual} aria-label="بالا" className="w-8 h-11 @[60rem]:h-9 grid place-items-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] disabled:opacity-20"><ChevronUp className="w-4 h-4" /></button>
                  <button onClick={() => move(idx, 1)} disabled={idx === items.length - 1 || !manual} aria-label="پایین" className="w-8 h-11 @[60rem]:h-9 grid place-items-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] disabled:opacity-20"><ChevronDown className="w-4 h-4" /></button>
                  <button onClick={() => remove(i)} aria-label="حذف" className="w-8 h-11 @[60rem]:h-9 grid place-items-center text-[var(--muted-foreground)] hover:text-red-700 dark:hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          );
        })}
        {!shown.length && <p className="p-8 text-center text-sm text-[var(--muted-foreground)]">{items.length ? 'ردیفی پیدا نشد' : 'هنوز ردیفی ندارد — از فرم زیر یا «پیست از اکسل» اضافه کنید'}</p>}
      </div>

      <form onSubmit={add} className="rounded-b-2xl py-3 px-4 sm:px-5 border-t-2 border-dashed border-[var(--border)] bg-emerald-500/[0.04] space-y-2">
        <p className="text-xs font-black text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" />ردیف جدید</p>
        <div className={cn('space-y-2 @[60rem]:space-y-0 @[60rem]:grid @[60rem]:gap-2', TABLE_COLS)}>
        <span aria-hidden className="hidden @[60rem]:block" />
        <div className="grid grid-cols-2 @2xl:grid-cols-[minmax(0,1.5fr)_120px_130px_minmax(0,1fr)_minmax(0,1fr)] gap-2 @[60rem]:contents">
          <Labeled label="مدل" className="col-span-2 @2xl:col-span-1">
            <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="لوله کاروگیت" className={draftCls} />
          </Labeled>
          <Labeled label="سایز">
            <input value={draft.size} onChange={(e) => setDraft({ ...draft, size: e.target.value })} placeholder="۱۶۰ میلیمتر" className={draftCls} />
          </Labeled>
          <Labeled label="کلاس">
            <GradeSelect value={draft.grade} onChange={(grade) => setDraft({ ...draft, grade })} className="@[60rem]:bg-[var(--background)] @[60rem]:border-[var(--border)]" />
          </Labeled>
          <Labeled label="مشخصات">
            <input value={draft.spec} onChange={(e) => setDraft({ ...draft, spec: e.target.value })} placeholder="SN4 / ۱۰ بار" className={draftCls} />
          </Labeled>
          <Labeled label="ابعاد">
            <input value={draft.dimensions} onChange={(e) => setDraft({ ...draft, dimensions: e.target.value })} placeholder="شاخه ۶ متری" className={draftCls} />
          </Labeled>
        </div>
        <div className="grid grid-cols-2 @2xl:grid-cols-[110px_190px_minmax(0,1fr)_auto] gap-2 @[60rem]:contents">
          <Labeled label="وزن هر متر (kg)">
            <input value={draft.weight} onChange={(e) => setDraft({ ...draft, weight: e.target.value })} dir="ltr" inputMode="decimal" className={cn(draftCls, 'text-left')} />
          </Labeled>
          <Labeled label={draftFormula != null ? 'قیمت (وزن × قیمت روز)' : 'قیمت (تومان)'}>
            <input
              value={draftFormula != null ? fmt(draftFormula) : draft.price}
              onChange={(e) => setDraft({ ...draft, price: fmt(parse(e.target.value)) })}
              readOnly={draftFormula != null}
              placeholder={product.pricePerKg ? 'وزن را وارد کنید' : 'استعلام'}
              dir="ltr"
              inputMode="numeric"
              className={cn(draftCls, 'text-left font-bold')}
            />
          </Labeled>
          <Labeled label="توضیحات" className="col-span-2 @2xl:col-span-1">
            <input value={draft.note} onChange={(e) => setDraft({ ...draft, note: e.target.value })} className={draftCls} />
          </Labeled>
          <button className="h-11 @[60rem]:h-9 px-5 @[60rem]:px-2 rounded-xl bg-emerald-500 text-black text-sm font-bold flex items-center justify-center gap-1.5 col-span-2 @2xl:col-span-1"><Plus className="w-4 h-4" />افزودن</button>
        </div>
        </div>
      </form>
      {/* نوار ردیف‌های انتخاب‌شده — چسبان پایین صفحه تا هنگام اسکرول جدول در دسترس باشد */}
      {picked.size > 0 && (
        <div className="sticky bottom-4 z-20 mx-4 sm:mx-5 my-4 rounded-2xl bg-[var(--ink)] text-white shadow-2xl px-4 py-3 flex flex-wrap items-center gap-2">
          <span className="text-sm font-black me-auto flex items-center gap-2">
            <span className="grid place-items-center min-w-7 h-7 px-1.5 rounded-lg bg-[var(--accent)] text-[var(--accent-foreground)] text-xs num">{formatPersianNumber(picked.size)}</span>
            ردیف انتخاب شد
          </span>
          <PercentControl value={pickPct} onChange={setPickPct} roundTo={roundTo} dark label="درصد تغییر ردیف‌های انتخاب‌شده" />
          <button disabled={busy || !signedPct(pickPct)} onClick={bulkPicked} className="h-10 px-4 rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] text-xs font-bold disabled:opacity-40">
            اعمال روی انتخاب‌شده‌ها
          </button>
          <button onClick={() => setPicked(new Set())} className="h-10 px-3 rounded-xl bg-white/10 text-xs font-bold hover:bg-white/15">
            لغو انتخاب
          </button>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────── تغییر قیمت همه محصولات ─────────────────────────── */

/** اعلام افزایش/کاهش قیمت کارخانه: یک درصد روی همه محصولات (یا محصولات انتخاب‌شده) با هم */
function AllProductsBulk({ products, onDone }: { products: ProductRow[]; onDone: () => Promise<void> }) {
  const confirm = useConfirm();
  const priced = products.filter((p) => p.priceItems.length);
  const [pct, setPct] = useState<Pct>(emptyPct);
  const [roundTo, setRoundTo] = useState(1000);
  const [scope, setScope] = useState<'all' | 'some'>('all');
  const [chosen, setChosen] = useState<Set<string>>(() => new Set());
  const [busy, setBusy] = useState(false);

  const targets = scope === 'all' ? priced : priced.filter((p) => chosen.has(p.id));
  const rows = targets.reduce((n, p) => n + p.priceItems.length, 0);

  const apply = async () => {
    const n = signedPct(pct);
    if (!n) return toast.error('درصد را وارد کنید، مثلاً ۵');
    if (!targets.length) return toast.error('محصولی انتخاب نشده است');
    const ok = await confirm({
      title: `قیمت ${scope === 'all' ? 'همه' : formatPersianNumber(targets.length)} محصول ${formatPersianNumber(Math.abs(n))}٪ ${n > 0 ? 'افزایش' : 'کاهش'} پیدا کند؟`,
      message: `${formatPersianNumber(rows)} ردیف قیمت تغییر می‌کند. برای محصولاتی که قیمت روز هر کیلو دارند، درصد روی قیمت روز اعمال می‌شود. قیمت قبلی هر ردیف نگه داشته می‌شود.`,
      tone: 'default',
      confirmLabel: 'اعمال روی همه',
    });
    if (!ok) return;
    setBusy(true);
    try {
      const r = await api<{ updated: number; products: number }>('/api/admin/prices/bulk-all', {
        method: 'POST',
        body: JSON.stringify({ percent: n, roundTo, productIds: scope === 'all' ? [] : targets.map((p) => p.id) }),
      });
      await onDone();
      setPct(emptyPct);
      toast.success(`${formatPersianNumber(r.updated)} قیمت در ${formatPersianNumber(r.products)} محصول به‌روز شد`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'خطا');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={cn(card, 'p-4 sm:p-5')}>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-3 me-auto min-w-0">
          <IconTile icon={TrendingUp} tone="rose" />
          <div className="min-w-0">
            <p className="font-black text-[var(--foreground)]">تغییر قیمت همه محصولات</p>
            <p className="text-xs leading-6 text-[var(--muted-foreground)]">برای اعلام افزایش یا کاهش قیمت کارخانه — یک درصد روی همه جدول‌ها با هم</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-xl bg-[var(--muted)] p-1">
            {([['all', `همه (${formatPersianNumber(priced.length)})`], ['some', 'انتخاب محصولات']] as const).map(([k, label]) => (
              <button
                key={k}
                onClick={() => setScope(k)}
                className={cn('h-8 px-3 rounded-lg text-xs font-bold transition-colors', scope === k ? 'bg-[var(--background)] text-[var(--foreground)] shadow-sm' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]')}
              >
                {label}
              </button>
            ))}
          </div>
          <PercentControl value={pct} onChange={setPct} roundTo={roundTo} label="درصد تغییر قیمت همه محصولات" />
          <Select value={String(roundTo)} onChange={(v) => setRoundTo(Number(v))} options={ROUND_OPTIONS} aria-label="گرد کردن" className={cn(inputCls, 'w-40')} />
          <button disabled={busy || !signedPct(pct) || !targets.length} onClick={apply} className="h-10 px-4 rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] text-sm font-bold whitespace-nowrap disabled:opacity-40 flex items-center gap-1.5">
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}
            اعمال
          </button>
        </div>
      </div>
      {scope === 'some' && (
        <div className="mt-4 pt-4 border-t border-[var(--border)] flex flex-wrap gap-2">
          {priced.map((p) => {
            const on = chosen.has(p.id);
            return (
              <button
                key={p.id}
                onClick={() => setChosen((prev) => { const next = new Set(prev); if (on) next.delete(p.id); else next.add(p.id); return next; })}
                aria-pressed={on}
                className={cn('h-9 px-3 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors', on ? 'bg-[var(--accent)]/12 border-[var(--accent)] text-[var(--accent-text)]' : 'border-[var(--border)] text-[var(--foreground)] hover:border-[var(--accent)]/50')}
              >
                {on && <Check className="w-3.5 h-3.5" />}
                {p.name}
                <span className="text-[10px] font-medium opacity-70 num">{formatPersianNumber(p.priceItems.length)}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────── صفحه ─────────────────────────── */

function PriceBoardPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [products, setProducts] = useState<ProductRow[] | null>(null);
  const [market, setMarket] = useState<Market | null>(null);
  const [filter, setFilter] = useState('');
  const selectedId = params.get('product');

  useEffect(() => {
    let alive = true;
    Promise.all([api<ProductRow[]>('/api/admin/prices'), api<Market>('/api/admin/market')])
      .then(([p, m]) => {
        if (!alive) return;
        setProducts(p);
        setMarket(m);
      })
      .catch((e) => toast.error(e instanceof Error ? e.message : 'بارگذاری ناموفق بود'));
    return () => {
      alive = false;
    };
  }, []);

  const reloadAll = useCallback(async () => setProducts(await api<ProductRow[]>('/api/admin/prices')), []);
  const select = useCallback((id: string) => router.replace(`/admin/prices?product=${id}`, { scroll: false }), [router]);

  const list = useMemo(() => (products ?? []).filter((p) => !filter || p.name.includes(filter)), [products, filter]);
  const selected = products?.find((p) => p.id === selectedId) ?? products?.find((p) => p.priceItems.length) ?? products?.[0];

  if (!products || !market) {
    return (
      <div role="status" aria-label="بارگذاری تابلوی قیمت" className="max-w-7xl space-y-5">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-20 rounded-2xl" />
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">{Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}</div>
        <Skeleton className="h-24 rounded-2xl" />
        <div className="space-y-2">{Array.from({ length: 8 }, (_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)}</div>
      </div>
    );
  }

  const priced = products.filter((p) => p.priceItems.length);
  const totalRows = priced.reduce((n, p) => n + p.priceItems.length, 0);
  const perKgProducts = products.filter((p) => p.pricePerKg).length;
  const missingWeight = products.filter((p) => p.pricePerKg).reduce((n, p) => n + p.priceItems.filter((i) => toWeight(i.weight) == null).length, 0);
  const stats = [
    { icon: Package, tone: 'sky', label: 'محصول با جدول قیمت', value: priced.length },
    { icon: Layers, tone: 'violet', label: 'ردیف قیمت', value: totalRows },
    { icon: Scale, tone: 'accent', label: 'محصول با قیمت روز', value: perKgProducts },
    { icon: AlertTriangle, tone: missingWeight ? 'rose' : 'emerald', label: 'ردیف بدون وزن', value: missingWeight },
  ] as const;

  return (
    <div className="max-w-[90rem] space-y-5">
      <div className="flex items-start gap-3">
        <IconTile icon={Tags} size="lg" />
        <div>
          <h1 className="text-2xl font-black text-[var(--foreground)]">تابلوی قیمت</h1>
          <p className="text-[var(--muted-foreground)] text-sm leading-7">هر قیمت با Enter یا خروج از فیلد ذخیره می‌شود و در کمتر از ۱۰ ثانیه روی سایت نمایش داده می‌شود. Enter به قیمت ردیف بعد می‌رود.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {stats.map((st) => (
          <div key={st.label} className={cn(card, 'group p-4 flex items-center gap-3')}>
            <IconTile icon={st.icon} tone={st.tone} />
            <div className="min-w-0">
              <p className="text-2xl font-black num leading-8 text-[var(--foreground)]">{formatPersianNumber(st.value)}</p>
              <p className="text-xs leading-5 text-[var(--muted-foreground)]">{st.label}</p>
            </div>
          </div>
        ))}
      </div>

      <MarketPanel market={market} onChange={setMarket} />

      <AllProductsBulk products={products} onDone={reloadAll} />

      {/* انتخاب محصول — نوار افقی بالای جدول تا جدول تمام عرض را داشته باشد */}
      <div className={cn(card, 'p-3')}>
        <div className="flex flex-wrap items-center gap-2 mb-2.5">
          <p className="text-sm font-black text-[var(--foreground)] me-auto">محصول</p>
          <div className="relative w-full sm:w-64">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
            <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="جستجوی محصول…" className={cn(inputCls, 'w-full h-9 pr-9')} />
          </div>
        </div>
        <div className="snap-row gap-2">
          {list.map((p) => {
            const active = selected?.id === p.id;
            return (
              <button
                key={p.id}
                onClick={() => select(p.id)}
                className={cn(
                  'text-right rounded-xl border px-3.5 py-2 transition-all',
                  active
                    ? 'bg-[var(--accent)] border-transparent text-[var(--accent-foreground)] shadow-accent'
                    : 'border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:border-[var(--accent)]/50',
                )}
              >
                <span className="flex items-center gap-1.5 text-sm font-bold whitespace-nowrap">
                  {p.pricePerKg != null && <Scale className={cn('w-3.5 h-3.5', active ? '' : 'text-[var(--accent-text)]')} aria-label="قیمت روز" />}
                  {p.name}
                </span>
                <span className={cn('block text-[11px] num', active ? 'text-[var(--accent-foreground)]/75' : 'text-[var(--muted-foreground)]')}>
                  {p.priceItems.length ? `${formatPersianNumber(p.priceItems.length)} ردیف` : 'بدون جدول قیمت'}
                </span>
              </button>
            );
          })}
          {!list.length && <p className="py-2 text-sm text-[var(--muted-foreground)]">محصولی پیدا نشد</p>}
        </div>
      </div>

      {selected && (
        <ProductBoard
          key={selected.id}
          product={selected}
          onChange={(patch) => setProducts((all) => all!.map((p) => (p.id === selected.id ? { ...p, ...patch } : p)))}
        />
      )}

      <p className="text-xs text-[var(--muted-foreground)]">
        محصول جدید را از <Link href="/admin/products/new" className="text-[var(--accent-text)]">افزودن محصول</Link> بسازید و سپس جدول قیمتش را اینجا وارد کنید.
      </p>
    </div>
  );
}

export default function Page() {
  // useSearchParams به Suspense نیاز دارد
  return (
    <Suspense>
      <PriceBoardPage />
    </Suspense>
  );
}
