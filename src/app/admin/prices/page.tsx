'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  ArrowDownLeft, ArrowUpLeft, Check, ChevronDown, ChevronUp, ClipboardPaste, ExternalLink, Loader2, Percent, Plus,
  Power, Search, Trash2, X,
} from 'lucide-react';
import { WEEK_ORDER, WEEKDAY_LABEL, type MarketMode, type MarketSchedule, type MarketStatus } from '@/shared/lib/market';
import { cn, formatPersianNumber, latinDigits } from '@/shared/lib/utils';
import { toWeight } from '@/shared/lib/price-admin';
import { useConfirm } from '@/shared/ui/ConfirmDialog';

type Item = {
  id: string; productId: string; title: string; price: number | null; previousPrice: number | null;
  weight: string; note: string; sortOrder: number; priceChangedAt: string;
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
          <span className={cn('grid place-items-center w-12 h-12 rounded-2xl', s.open ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400' : 'bg-[var(--muted)] text-[var(--muted-foreground)]')}>
            <Power className="w-6 h-6" />
          </span>
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
                className={cn('px-2 sm:px-4 py-1.5 rounded-lg text-sm font-bold leading-tight', market.mode === m.key ? 'bg-[var(--accent)] text-[var(--accent-foreground)]' : 'text-[var(--foreground)] hover:text-white')}
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

/* ─────────────────────────── سلول قیمت ─────────────────────────── */

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

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
          inputCls,
          'w-full text-left font-bold text-base pl-9 num',
          locked && 'bg-transparent cursor-default',
          state === 'saved' && 'border-emerald-500',
          state === 'error' && 'border-red-500',
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

function PricePerKgPanel({ product, onApplied }: { product: ProductRow; onApplied: () => Promise<void> }) {
  const confirm = useConfirm();
  const [value, setValue] = useState(fmt(product.pricePerKg));
  const [busy, setBusy] = useState(false);
  const [synced, setSynced] = useState(product.pricePerKg);
  const weighted = product.priceItems.filter((i) => toWeight(i.weight) != null).length;

  // قیمت روز از بیرون عوض شد (مثلاً تغییر درصدی گروهی)
  if (product.pricePerKg !== synced) {
    setSynced(product.pricePerKg);
    setValue(fmt(product.pricePerKg));
  }

  const apply = async (e: React.FormEvent) => {
    e.preventDefault();
    const next = parse(value);
    if (next === product.pricePerKg) return;
    const ok = await confirm(
      next
        ? { title: `قیمت روز هر کیلو ${fmt(next)} تومان شود؟`, message: `قیمت ${formatPersianNumber(weighted)} ردیف وزن‌دار با فرمول «وزن × قیمت روز» دوباره حساب می‌شود.`, tone: 'default', confirmLabel: 'اعمال' }
        : { title: 'فرمول قیمت روز خاموش شود؟', message: 'قیمت فعلی ردیف‌ها می‌ماند و از این به بعد هر قیمت دستی وارد می‌شود.', tone: 'default', confirmLabel: 'خاموش کردن' },
    );
    if (!ok) return;
    setBusy(true);
    try {
      const r = await api<{ updated: number }>('/api/admin/prices/per-kg', { method: 'PUT', body: JSON.stringify({ productId: product.id, pricePerKg: next }) });
      await onApplied();
      toast.success(next ? `${formatPersianNumber(r.updated)} قیمت به‌روز شد` : 'قیمت‌گذاری دستی شد');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'خطا');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={apply} className="px-5 py-3 border-b border-[var(--border)] flex flex-wrap items-center gap-x-3 gap-y-2">
      <label htmlFor={`perkg-${product.id}`} className="text-sm font-bold text-[var(--foreground)]">قیمت روز هر کیلو</label>
      <div className="relative">
        <input
          id={`perkg-${product.id}`}
          value={value}
          onChange={(e) => setValue(fmt(parse(e.target.value)))}
          inputMode="numeric"
          dir="ltr"
          placeholder="خاموش"
          className={cn(inputCls, 'w-40 text-left font-bold num pl-14')}
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-[var(--muted-foreground)]">تومان</span>
      </div>
      <button disabled={busy || parse(value) === product.pricePerKg} className="h-10 px-4 rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] text-sm font-bold disabled:opacity-40 flex items-center gap-1.5">
        {busy && <Loader2 className="w-4 h-4 animate-spin" />}اعمال
      </button>
      <p className="basis-full text-xs text-[var(--muted-foreground)] leading-6">
        {product.pricePerKg
          ? 'قیمت هر متر = وزن هر متر (کیلوگرم) × قیمت روز هر کیلو. قیمت ردیف‌های وزن‌دار خودکار حساب می‌شود؛ برای تغییر، قیمت روز یا وزن ردیف را عوض کنید.'
          : 'با وارد کردن قیمت روز، قیمت هر ردیف از «وزن × قیمت روز» حساب می‌شود و دیگر لازم نیست ردیف‌ها را تک‌تک قیمت بزنید.'}
      </p>
    </form>
  );
}

/* ─────────────────────────── جدول یک محصول ─────────────────────────── */

function ProductBoard({ product, onChange }: { product: ProductRow; onChange: (patch: Partial<ProductRow>) => void }) {
  const confirm = useConfirm();

  const items = product.priceItems;
  const setItems = (next: Item[]) => onChange({ priceItems: next });
  const isLocked = (i: Item) => !!product.pricePerKg && toWeight(i.weight) != null;
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const [q, setQ] = useState('');
  const [pct, setPct] = useState('');
  const [roundTo, setRoundTo] = useState(1000);
  const [busy, setBusy] = useState(false);
  const [paste, setPaste] = useState<string | null>(null);
  const [draft, setDraft] = useState({ title: '', price: '', weight: '', note: '' });

  const shown = useMemo(() => {
    const t = latinDigits(q.trim());
    return t ? items.filter((i) => latinDigits(i.title).includes(t)) : items;
  }, [items, q]);

  const replaceItem = (u: Item) => setItems(items.map((i) => (i.id === u.id ? u : i)));

  const patchField = async (i: Item, field: 'title' | 'weight' | 'note', value: string) => {
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

  const remove = async (i: Item) => {
    if (!(await confirm({ title: `ردیف «${i.title}» حذف شود؟` }))) return;
    setItems(items.filter((x) => x.id !== i.id));
    await api(`/api/admin/prices/${i.id}`, { method: 'DELETE' }).catch((e) => toast.error(e.message));
  };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.title.trim()) return;
    try {
      const item = await api<Item>('/api/admin/prices', { method: 'POST', body: JSON.stringify({ productId: product.id, ...draft, price: parse(draft.price) }) });
      setItems([...items, item]);
      setDraft({ title: '', price: '', weight: '', note: '' });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'خطا');
    }
  };

  const reload = async () => {
    const fresh = (await api<ProductRow[]>('/api/admin/prices')).find((p) => p.id === product.id);
    onChange({ priceItems: fresh?.priceItems ?? [], pricePerKg: fresh?.pricePerKg ?? null });
  };

  const bulk = async () => {
    const n = Number(latinDigits(pct).replace(/[^\d.-]/g, ''));
    if (!n) return toast.error('درصد را وارد کنید، مثلاً ۳ یا -۲');
    const target = product.pricePerKg ? `قیمت روز هر کیلوی «${product.name}»` : `همه قیمت‌های «${product.name}»`;
    if (!(await confirm({ title: `${target} ${formatPersianNumber(Math.abs(n))}٪ ${n > 0 ? 'افزایش' : 'کاهش'} پیدا کند؟`, tone: 'default', confirmLabel: 'اعمال' }))) return;
    setBusy(true);
    try {
      const r = await api<{ updated: number }>('/api/admin/prices/bulk', { method: 'POST', body: JSON.stringify({ productId: product.id, percent: n, roundTo }) });
      await reload();
      setPct('');
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
      .map(([title, price = '', weight = '', note = '']) => ({ title, price, weight, note }));
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

  return (
    // @container: چیدمان ردیف‌ها به عرض همین پنل بستگی دارد نه عرض صفحه — در لپ‌تاپ ۱۰۲۴ پیکسلی، منو و فهرست محصول جا را می‌گیرند
    <div className={cn(card, 'overflow-hidden @container')}>
      <div className="p-5 border-b border-[var(--border)] flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs text-[var(--muted-foreground)]">{product.category.name}</p>
          <h2 className="text-[var(--foreground)] font-black text-lg">{product.name}</h2>
        </div>
        <div className="flex items-center gap-2">
          <a href={`/products/${product.category.slug}/${product.slug}`} target="_blank" rel="noopener" className="h-9 px-3 rounded-lg bg-[var(--muted)] text-[var(--foreground)] text-xs flex items-center gap-1.5 hover:text-[var(--foreground)]">
            <ExternalLink className="w-3.5 h-3.5" /> صفحه محصول
          </a>
          <button onClick={() => setPaste('')} className="h-9 px-3 rounded-lg bg-[var(--muted)] text-[var(--foreground)] text-xs flex items-center gap-1.5 hover:text-[var(--foreground)]">
            <ClipboardPaste className="w-3.5 h-3.5" /> پیست از اکسل
          </button>
        </div>
      </div>

      <PricePerKgPanel product={product} onApplied={reload} />

      {/* ابزار گروهی */}
      <div className="px-5 py-3 border-b border-[var(--border)] flex flex-wrap items-center gap-2 bg-[var(--background)]/40">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="جستجوی ردیف…" className={cn(inputCls, 'w-full pr-9')} />
        </div>
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 w-full sm:w-auto">
          <div className="relative shrink-0">
            <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--muted-foreground)]" />
            <input value={pct} onChange={(e) => setPct(e.target.value)} dir="ltr" placeholder="+3 / -2" className={cn(inputCls, 'w-24 text-left pl-8')} aria-label="درصد تغییر" />
          </div>
          <select value={roundTo} onChange={(e) => setRoundTo(Number(e.target.value))} className={cn(inputCls, 'min-w-0 flex-1 sm:flex-none sm:w-32')} aria-label="گرد کردن">
            <option value={1}>بدون گرد کردن</option>
            <option value={100}>گرد به ۱۰۰</option>
            <option value={1000}>گرد به ۱٬۰۰۰</option>
          </select>
          <button disabled={busy || !pct} onClick={bulk} className="h-10 px-4 w-full sm:w-auto rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] text-sm font-bold whitespace-nowrap disabled:opacity-40">
            اعمال روی همه
          </button>
        </div>
      </div>

      {paste !== null && (
        <div className="p-5 border-b border-[var(--border)] space-y-2">
          <p className="text-xs text-[var(--muted-foreground)] leading-6">در اکسل ستون‌های «عنوان، قیمت، وزن، توضیحات» را انتخاب و کپی کنید و اینجا پیست کنید. هر خط یک ردیف.</p>
          <textarea value={paste} onChange={(e) => setPaste(e.target.value)} rows={6} dir="auto" autoFocus className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl p-3 text-xs text-[var(--foreground)] font-mono focus:outline-none focus:border-[var(--accent)]" />
          <div className="flex flex-wrap gap-2">
            <button disabled={busy} onClick={() => importPaste(false)} className="h-9 px-4 rounded-xl bg-emerald-500 text-black text-sm font-bold">افزودن به انتهای جدول</button>
            <button disabled={busy} onClick={() => importPaste(true)} className="h-9 px-4 rounded-xl bg-[var(--muted)] text-red-700 dark:text-red-300 text-sm">جایگزینی کل جدول</button>
            <button onClick={() => setPaste(null)} className="h-9 px-4 rounded-xl bg-[var(--muted)] text-[var(--foreground)] text-sm">انصراف</button>
          </div>
        </div>
      )}

      <div className="divide-y divide-[var(--border)]">
        {shown.map((i) => {
          const idx = items.indexOf(i);
          const change = i.price != null && i.previousPrice ? ((i.price - i.previousPrice) / i.previousPrice) * 100 : 0;
          return (
            <div key={i.id} className="p-3 sm:px-5 grid grid-cols-2 @3xl:grid-cols-[minmax(0,1.4fr)_180px_100px_minmax(0,1fr)_auto] gap-2 items-start">
              <input
                defaultValue={i.title}
                onBlur={(e) => patchField(i, 'title', e.target.value.trim())}
                className={cn(inputCls, 'w-full col-span-2 @3xl:col-span-1')}
                aria-label="عنوان"
              />
              {/* پنل باریک: عنوان / قیمت + دکمه‌ها / وزن + توضیحات — با order، چون ترتیب DOM مال چیدمان پهن است */}
              <div className="min-w-0 order-1 @3xl:order-none">
                <PriceInput
                  item={i}
                  locked={isLocked(i)}
                  onSaved={replaceItem}
                  inputRef={(el) => { refs.current[idx] = el; }}
                  onEnter={() => refs.current[idx + 1]?.focus()}
                />
                {i.previousPrice != null && i.previousPrice !== i.price && (
                  <p className="mt-1 h-4 text-[11px] text-[var(--muted-foreground)] flex items-center gap-1 num">
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
              <input defaultValue={i.weight} onBlur={(e) => patchField(i, 'weight', e.target.value.trim())} placeholder="وزن (کیلو)" className={cn(inputCls, 'w-full order-3 @3xl:order-none')} aria-label="وزن هر متر (کیلوگرم)" />
              <input defaultValue={i.note} onBlur={(e) => patchField(i, 'note', e.target.value.trim())} placeholder="توضیحات" className={cn(inputCls, 'w-full order-4 @3xl:order-none')} aria-label="توضیحات" />
              <div className="flex items-center justify-end order-2 @3xl:order-none">
                <button onClick={() => move(idx, -1)} disabled={idx === 0 || !!q} aria-label="بالا" className="w-8 h-10 grid place-items-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] disabled:opacity-20"><ChevronUp className="w-4 h-4" /></button>
                <button onClick={() => move(idx, 1)} disabled={idx === items.length - 1 || !!q} aria-label="پایین" className="w-8 h-10 grid place-items-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] disabled:opacity-20"><ChevronDown className="w-4 h-4" /></button>
                <button onClick={() => remove(i)} aria-label="حذف" className="w-8 h-10 grid place-items-center text-[var(--muted-foreground)] hover:text-red-700 dark:hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          );
        })}
        {!shown.length && <p className="p-8 text-center text-sm text-[var(--muted-foreground)]">{q ? 'ردیفی پیدا نشد' : 'هنوز ردیفی ندارد — از فرم زیر یا «پیست از اکسل» اضافه کنید'}</p>}
      </div>

      <form onSubmit={add} className="p-3 sm:px-5 border-t border-[var(--border)] bg-[var(--background)]/40 grid grid-cols-2 @3xl:grid-cols-[minmax(0,1.4fr)_180px_100px_minmax(0,1fr)_auto] gap-2">
        <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="ردیف جدید — عنوان" className={cn(inputCls, 'col-span-2 @3xl:col-span-1')} />
        <input
          value={product.pricePerKg && toWeight(draft.weight) ? fmt(Math.round(toWeight(draft.weight)! * product.pricePerKg)) : draft.price}
          onChange={(e) => setDraft({ ...draft, price: fmt(parse(e.target.value)) })}
          readOnly={!!product.pricePerKg && toWeight(draft.weight) != null}
          placeholder={product.pricePerKg ? 'وزن × قیمت روز' : 'قیمت (تومان)'}
          dir="ltr"
          inputMode="numeric"
          className={cn(inputCls, 'text-left')}
        />
        <input value={draft.weight} onChange={(e) => setDraft({ ...draft, weight: e.target.value })} placeholder="وزن (کیلو)" className={inputCls} />
        <input value={draft.note} onChange={(e) => setDraft({ ...draft, note: e.target.value })} placeholder="توضیحات" className={cn(inputCls, 'col-span-2 @3xl:col-span-1')} />
        <button className="h-10 px-4 rounded-xl bg-emerald-500 text-black text-sm font-bold flex items-center justify-center gap-1.5 col-span-2 @3xl:col-span-1"><Plus className="w-4 h-4" />افزودن</button>
      </form>
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

  const select = useCallback((id: string) => router.replace(`/admin/prices?product=${id}`, { scroll: false }), [router]);

  const list = useMemo(() => (products ?? []).filter((p) => !filter || p.name.includes(filter)), [products, filter]);
  const selected = products?.find((p) => p.id === selectedId) ?? products?.find((p) => p.priceItems.length) ?? products?.[0];

  if (!products || !market) {
    return <div className="flex items-center justify-center py-24 text-[var(--muted-foreground)] gap-2"><Loader2 className="w-6 h-6 animate-spin" />بارگذاری تابلوی قیمت…</div>;
  }

  return (
    <div className="max-w-7xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">تابلوی قیمت</h1>
        <p className="text-[var(--muted-foreground)] text-sm">هر قیمت با Enter یا خروج از فیلد ذخیره می‌شود و در کمتر از ۱۰ ثانیه روی سایت نمایش داده می‌شود. Enter به قیمت ردیف بعد می‌رود.</p>
      </div>

      <MarketPanel market={market} onChange={setMarket} />

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-5 items-start">
        <aside className={cn(card, 'p-3 lg:sticky lg:top-20')}>
          <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="جستجوی محصول…" className={cn(inputCls, 'w-full mb-2')} />
          <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible lg:max-h-[70vh] lg:overflow-y-auto">
            {list.map((p) => (
              <button
                key={p.id}
                onClick={() => select(p.id)}
                className={cn(
                  'shrink-0 text-right rounded-xl px-3 py-2.5 transition-colors',
                  selected?.id === p.id ? 'bg-[var(--accent)] text-[var(--accent-foreground)]' : 'text-[var(--foreground)] hover:bg-[var(--muted)]',
                )}
              >
                <span className="block text-sm font-bold whitespace-nowrap lg:whitespace-normal">{p.name}</span>
                <span className={cn('block text-[11px]', selected?.id === p.id ? 'text-[var(--accent-foreground)]/70' : 'text-[var(--muted-foreground)]')}>
                  {p.priceItems.length ? `${formatPersianNumber(p.priceItems.length)} قیمت` : 'بدون جدول قیمت'}
                </span>
              </button>
            ))}
          </div>
        </aside>

        {selected && (
          <ProductBoard
            key={selected.id}
            product={selected}
            onChange={(patch) => setProducts((all) => all!.map((p) => (p.id === selected.id ? { ...p, ...patch } : p)))}
          />
        )}
      </div>

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
