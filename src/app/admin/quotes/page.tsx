'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Check, Copy, ExternalLink, FileSpreadsheet, Loader2, Mail, MessageCircle, Plus, Trash2, Truck, X,
} from 'lucide-react';
import { cn, faDigits, formatPersianNumber, latinDigits } from '@/shared/lib/utils';
import { DEFAULT_VAT_RATE, statusLabel } from '@/shared/lib/quote-constants';
import { useConfirm } from '@/shared/ui/ConfirmDialog';
import { siteConfig } from '@/shared/config/site';
import { ORDER_STEPS, type OrderLogEntry } from '@/shared/lib/order-status';
import { IconTile } from '@/shared/ui/IconTile';
import { whatsappFromMobile } from '@/shared/lib/site-settings';

type Item = {
  id?: string;
  priceItemId: string | null;
  productId: string | null;
  title: string;
  unitPrice: number;
  quantity: number;
  unit: string;
  lineTotal: number;
  note: string;
  sortOrder: number;
};

type Quote = {
  id: string;
  number: string;
  token: string;
  status: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerCompany: string;
  customerMessage: string;
  adminNote: string;
  sourcePath: string | null;
  vatRate: number;
  subtotal: number;
  vatAmount: number;
  total: number;
  validUntil: string | null;
  issuedAt: string | null;
  createdAt: string;
  publicUrl: string;
  orderStatus: string;
  orderLog: OrderLogEntry[];
  trackingNote: string;
  items: Item[];
};

const card = 'bg-[var(--card)] border border-[var(--border)] rounded-2xl';
const inputCls = 'h-10 bg-[var(--muted)] border border-[var(--border)] rounded-xl px-3 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]';
const FILTERS = [
  { key: '', label: 'همه' },
  { key: 'REQUESTED', label: 'درخواست‌شده' },
  { key: 'ISSUED', label: 'صادرشده' },
  { key: 'REJECTED', label: 'ردشده' },
] as const;

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, headers: { 'Content-Type': 'application/json', ...init?.headers } });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.success) throw new Error(json.error || 'خطا');
  return json.data as T;
}

const money = (n: number) => n.toLocaleString('fa-IR');

export default function AdminQuotesPage() {
  const confirm = useConfirm();
  const [filter, setFilter] = useState('REQUESTED');
  const [quotes, setQuotes] = useState<Quote[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const q = filter ? `?status=${filter}` : '';
    const data = await api<{ quotes: Quote[] }>(`/api/admin/quotes${q}`);
    setQuotes(data.quotes);
    setSelectedId((id) => (id && data.quotes.some((x) => x.id === id) ? id : data.quotes[0]?.id ?? null));
  }, [filter]);

  useEffect(() => {
    let alive = true;
    const q = filter ? `?status=${filter}` : '';
    api<{ quotes: Quote[] }>(`/api/admin/quotes${q}`)
      .then((data) => {
        if (!alive) return;
        setQuotes(data.quotes);
        setSelectedId((id) => (id && data.quotes.some((x) => x.id === id) ? id : data.quotes[0]?.id ?? null));
      })
      .catch((e) => {
        if (alive) toast.error(e instanceof Error ? e.message : 'بارگذاری ناموفق');
      });
    return () => { alive = false; };
  }, [filter]);

  const selected = quotes?.find((q) => q.id === selectedId) ?? null;

  const save = async (patch: Record<string, unknown>, okMsg = 'ذخیره شد') => {
    if (!selected) return;
    setBusy(true);
    try {
      const updated = await api<Quote>(`/api/admin/quotes/${selected.id}`, { method: 'PATCH', body: JSON.stringify(patch) });
      setQuotes((all) => all!.map((q) => (q.id === updated.id ? updated : q)));
      toast.success(okMsg);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'خطا');
    } finally {
      setBusy(false);
    }
  };

  const issue = async () => {
    if (!selected) return;
    if (!(await confirm({ title: `پیش‌فاکتور ${selected.number} صادر شود؟`, message: 'پس از صدور، لینک عمومی فعال می‌شود و ردیف‌ها دیگر از اینجا قابل ویرایش نیستند.', confirmLabel: 'صدور' }))) return;
    await save({ action: 'issue', items: selected.items, vatRate: selected.vatRate, adminNote: selected.adminNote, customerName: selected.customerName, customerPhone: selected.customerPhone, customerEmail: selected.customerEmail, customerCompany: selected.customerCompany, validUntil: selected.validUntil }, 'صادر شد');
    await load();
  };

  const reject = async () => {
    if (!selected) return;
    if (!(await confirm({ title: 'این درخواست رد شود؟', tone: 'danger', confirmLabel: 'رد' }))) return;
    await save({ action: 'reject', adminNote: selected.adminNote }, 'رد شد');
    await load();
  };

  const remove = async () => {
    if (!selected) return;
    if (!(await confirm({ title: `پیش‌فاکتور ${selected.number} حذف شود؟`, tone: 'danger', confirmLabel: 'حذف' }))) return;
    setBusy(true);
    try {
      await api(`/api/admin/quotes/${selected.id}`, { method: 'DELETE' });
      toast.success('حذف شد');
      setSelectedId(null);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'خطا');
    } finally {
      setBusy(false);
    }
  };

  const copyLink = async () => {
    if (!selected) return;
    await navigator.clipboard.writeText(selected.publicUrl);
    toast.success('لینک کپی شد');
  };

  const issuedDoc = selected?.status === 'ISSUED';
  const docWord = issuedDoc ? 'فاکتور' : 'پیش‌فاکتور';
  const waHref = selected
    ? `https://wa.me/98${selected.customerPhone.replace(/^0/, '')}?text=${encodeURIComponent(
        `سلام ${selected.customerName} عزیز،\n${docWord} ${selected.number} آماده است:\n${selected.publicUrl}\n\n${siteConfig.name}`,
      )}`
    : '#';

  const mailHref = selected
    ? `mailto:${selected.customerEmail || ''}?subject=${encodeURIComponent(`${docWord} ${selected.number}`)}&body=${encodeURIComponent(
        `سلام ${selected.customerName} عزیز،\n\n${docWord} شما آماده است:\n${selected.publicUrl}\n\n${siteConfig.name}`,
      )}`
    : '#';

  if (!quotes) {
    return <div className="flex items-center justify-center py-24 text-[var(--muted-foreground)] gap-2"><Loader2 className="w-6 h-6 animate-spin" />بارگذاری…</div>;
  }

  return (
    <div className="max-w-7xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)] flex items-center gap-2">
          <FileSpreadsheet className="w-6 h-6 text-[var(--accent-text)]" />
          پیش‌فاکتورها
        </h1>
        <p className="text-[var(--muted-foreground)] text-sm mt-1">درخواست مشتری را بررسی کنید، در صورت نیاز اصلاح کنید و صادر کنید.</p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.key || 'all'}
            onClick={() => setFilter(f.key)}
            className={cn('h-9 px-3 rounded-xl text-sm font-bold', filter === f.key ? 'bg-[var(--accent)] text-[var(--accent-foreground)]' : 'bg-[var(--muted)] text-[var(--foreground)]')}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5 items-start">
        <aside className={cn(card, 'p-2 max-h-[70vh] overflow-y-auto')}>
          {!quotes.length && <p className="p-6 text-center text-sm text-[var(--muted-foreground)]">موردی نیست</p>}
          {quotes.map((q) => (
            <button
              key={q.id}
              onClick={() => setSelectedId(q.id)}
              className={cn('w-full text-right rounded-xl px-3 py-2.5 mb-1', selectedId === q.id ? 'bg-[var(--accent)] text-[var(--accent-foreground)]' : 'hover:bg-[var(--muted)]')}
            >
              <span className="block text-sm font-bold num">{q.number}</span>
              <span className={cn('block text-xs mt-0.5', selectedId === q.id ? 'text-[var(--accent-foreground)]/80' : 'text-[var(--muted-foreground)]')}>
                {q.customerName} · {statusLabel(q.status)}
              </span>
            </button>
          ))}
        </aside>

        {selected && (
          <QuoteEditor
            key={selected.id}
            quote={selected}
            busy={busy}
            onChange={(q) => setQuotes((all) => all!.map((x) => (x.id === q.id ? q : x)))}
            onSaveDraft={() => save({ items: selected.items, vatRate: selected.vatRate, adminNote: selected.adminNote, customerName: selected.customerName, customerPhone: selected.customerPhone, customerEmail: selected.customerEmail, customerCompany: selected.customerCompany, customerMessage: selected.customerMessage, validUntil: selected.validUntil })}
            onIssue={issue}
            onReject={reject}
            onDelete={remove}
            onCopyLink={copyLink}
            waHref={waHref}
            mailHref={mailHref}
          />
        )}
      </div>
    </div>
  );
}

/** مرحله سفارش برای صفحه «پیگیری سفارش» مشتری — هر کلیک فوراً ذخیره می‌شود */
function OrderTrackingPanel({ quote, onChange }: { quote: Quote; onChange: (q: Quote) => void }) {
  const [note, setNote] = useState(quote.trackingNote);
  const [saving, setSaving] = useState(false);

  const save = async (patch: { orderStatus?: string; trackingNote?: string }) => {
    setSaving(true);
    try {
      const q = await api<Quote>(`/api/admin/quotes/${quote.id}/order`, {
        method: 'PUT',
        body: JSON.stringify({ orderStatus: quote.orderStatus, trackingNote: note, ...patch }),
      });
      onChange(q);
      toast.success('وضعیت سفارش ذخیره شد — مشتری در صفحه پیگیری می‌بیند');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'خطا');
    } finally {
      setSaving(false);
    }
  };

  const at = (key: string) => quote.orderLog.find((e) => e.status === key)?.at;
  // بدون پنل پیامک: مرحله فعلی با یک کلیک از واتس‌اپ خود فروش برای مشتری می‌رود
  const step = ORDER_STEPS.find((s) => s.key === quote.orderStatus);
  const customerWa = whatsappFromMobile(quote.customerPhone);
  const stepWaHref = step && customerWa
    ? `${customerWa}?text=${encodeURIComponent(
        [
          `سلام ${quote.customerName} عزیز،`,
          `سفارش ${quote.number}: ${step.label}`,
          step.desc,
          ...(quote.trackingNote ? [quote.trackingNote] : []),
          `پیگیری سفارش: ${siteConfig.url}/track?n=${quote.number}`,
          '',
          siteConfig.name,
        ].join('\n'),
      )}`
    : '';
  return (
    <div className="p-5 border-b border-[var(--border)] bg-emerald-500/[0.04]">
      <div className="flex items-center gap-2.5 mb-3">
        <IconTile icon={Truck} tone="emerald" size="sm" />
        <p className="font-black text-sm">پیگیری سفارش</p>
        {saving && <Loader2 className="w-4 h-4 animate-spin text-[var(--muted-foreground)]" />}
        <a href={`/track?n=${quote.number}`} target="_blank" rel="noopener" className="ms-auto text-xs font-bold text-[var(--accent-text)] flex items-center gap-1">
          صفحه پیگیری مشتری <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {ORDER_STEPS.map((s) => {
          const on = quote.orderStatus === s.key;
          const when = at(s.key);
          return (
            <button
              key={s.key}
              type="button"
              disabled={saving}
              onClick={() => save({ orderStatus: on ? '' : s.key })}
              aria-pressed={on}
              className={cn(
                'rounded-xl border px-3 py-2.5 text-right transition-colors disabled:opacity-60',
                on ? 'bg-emerald-500 border-transparent text-white' : 'border-[var(--border)] bg-[var(--background)] hover:border-emerald-500/60',
              )}
            >
              <span className="block text-sm font-black">{s.label}</span>
              <span className={cn('block text-[10px] num', on ? 'text-white/80' : 'text-[var(--muted-foreground)]')}>
                {when ? new Date(when).toLocaleString('fa-IR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'ثبت نشده'}
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="توضیح برای مشتری (اختیاری) — مثلاً پلاک خودرو یا شماره راننده"
          className={cn(inputCls, 'flex-1 min-w-[220px] bg-[var(--background)]')}
        />
        <button type="button" disabled={saving || note === quote.trackingNote} onClick={() => save({ trackingNote: note })} className="h-10 px-4 rounded-xl bg-[var(--foreground)] text-[var(--background)] text-xs font-bold disabled:opacity-40">
          ذخیره توضیح
        </button>
      </div>
      {stepWaHref && (
        <a
          href={stepWaHref}
          target="_blank"
          rel="noopener"
          className="mt-3 h-10 px-4 rounded-xl bg-emerald-600 text-white text-xs font-bold inline-flex items-center gap-2"
        >
          <MessageCircle className="w-4 h-4" />
          ارسال «{step?.label}» به مشتری در واتس‌اپ
        </a>
      )}
      <p className="mt-2 text-[11px] text-[var(--muted-foreground)]">با کلیک روی هر مرحله، همان مرحله و زمانش برای مشتری ثبت می‌شود. کلیک دوباره، مرحله را برمی‌دارد. بعد با دکمه سبز، همان مرحله را در واتس‌اپ برای مشتری بفرستید.</p>
    </div>
  );
}

function QuoteEditor({
  quote, busy, onChange, onSaveDraft, onIssue, onReject, onDelete, onCopyLink, waHref, mailHref,
}: {
  quote: Quote;
  busy: boolean;
  onChange: (q: Quote) => void;
  onSaveDraft: () => void;
  onIssue: () => void;
  onReject: () => void;
  onDelete: () => void;
  onCopyLink: () => void;
  waHref: string;
  mailHref: string;
}) {
  const locked = quote.status === 'ISSUED';
  const set = (patch: Partial<Quote>) => onChange({ ...quote, ...patch });

  const items = quote.items;
  const totals = useMemo(() => {
    const subtotal = items.reduce((s, i) => s + Math.round(i.unitPrice * i.quantity), 0);
    const vatAmount = Math.round(subtotal * (quote.vatRate / 100));
    return { subtotal, vatAmount, total: subtotal + vatAmount };
  }, [items, quote.vatRate]);

  const updateItem = (idx: number, patch: Partial<Item>) => {
    const next = items.map((it, i) => {
      if (i !== idx) return it;
      const merged = { ...it, ...patch };
      return { ...merged, lineTotal: Math.round(merged.unitPrice * merged.quantity) };
    });
    set({ items: next, ...calcFrom(next, quote.vatRate) });
  };

  return (
    <div className={cn(card, 'overflow-hidden')}>
      <div className="p-5 border-b border-[var(--border)] flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs text-[var(--muted-foreground)]">{statusLabel(quote.status)} · {new Date(quote.createdAt).toLocaleString('fa-IR')}</p>
          <h2 className="text-xl font-black num mt-1">{quote.number}</h2>
          {quote.sourcePath && <p className="text-xs text-[var(--muted-foreground)] mt-1">از صفحه: {quote.sourcePath}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          {quote.status === 'ISSUED' && (
            <>
              <button onClick={onCopyLink} className="h-9 px-3 rounded-xl bg-[var(--muted)] text-xs font-bold flex items-center gap-1.5"><Copy className="w-3.5 h-3.5" />کپی لینک</button>
              <a href={quote.publicUrl} target="_blank" rel="noopener" className="h-9 px-3 rounded-xl bg-[var(--muted)] text-xs font-bold flex items-center gap-1.5"><ExternalLink className="w-3.5 h-3.5" />مشاهده</a>
              <a href={waHref} target="_blank" rel="noopener" className="h-9 px-3 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-1.5"><MessageCircle className="w-3.5 h-3.5" />واتساپ</a>
              <a href={mailHref} className="h-9 px-3 rounded-xl bg-[var(--muted)] text-xs font-bold flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />ایمیل</a>
            </>
          )}
        </div>
      </div>

      {quote.status === 'ISSUED' && <OrderTrackingPanel quote={quote} onChange={onChange} />}

      <div className="p-5 grid sm:grid-cols-2 gap-3 border-b border-[var(--border)]">
        <Field label="نام مشتری"><input disabled={locked} value={quote.customerName} onChange={(e) => set({ customerName: e.target.value })} className={cn(inputCls, 'w-full')} /></Field>
        <Field label="موبایل"><input disabled={locked} value={quote.customerPhone} onChange={(e) => set({ customerPhone: e.target.value })} dir="ltr" className={cn(inputCls, 'w-full text-left')} /></Field>
        <Field label="ایمیل"><input disabled={locked} value={quote.customerEmail} onChange={(e) => set({ customerEmail: e.target.value })} dir="ltr" className={cn(inputCls, 'w-full text-left')} /></Field>
        <Field label="شرکت"><input disabled={locked} value={quote.customerCompany} onChange={(e) => set({ customerCompany: e.target.value })} className={cn(inputCls, 'w-full')} /></Field>
        <Field label="پیام مشتری" className="sm:col-span-2"><textarea disabled={locked} value={quote.customerMessage} onChange={(e) => set({ customerMessage: e.target.value })} rows={2} className={cn(inputCls, 'w-full h-auto py-2')} /></Field>
        <Field label="یادداشت داخلی" className="sm:col-span-2"><textarea value={quote.adminNote} onChange={(e) => set({ adminNote: e.target.value })} rows={2} className={cn(inputCls, 'w-full h-auto py-2')} /></Field>
        <Field label={`ارزش افزوده (٪)`}>
          <input
            disabled={locked}
            value={faDigits(String(quote.vatRate))}
            onChange={(e) => {
              const vatRate = Number(latinDigits(e.target.value).replace(/[^\d.]/g, '')) || 0;
              set({ vatRate, ...calcFrom(items, vatRate) });
            }}
            dir="ltr"
            className={cn(inputCls, 'w-full text-left')}
          />
        </Field>
        <Field label="اعتبار تا (خالی = ۴۸ ساعت بعد از صدور)">
          <input
            disabled={locked}
            type="datetime-local"
            value={quote.validUntil ? toLocalInput(quote.validUntil) : ''}
            onChange={(e) => set({ validUntil: e.target.value ? new Date(e.target.value).toISOString() : null })}
            className={cn(inputCls, 'w-full')}
          />
        </Field>
      </div>

      <div className="divide-y divide-[var(--border)]">
        {items.map((it, idx) => (
          <div key={it.id ?? idx} className="p-4 grid grid-cols-1 sm:grid-cols-[1fr_120px_100px_auto] gap-2 items-start">
            <input disabled={locked} value={it.title} onChange={(e) => updateItem(idx, { title: e.target.value })} className={cn(inputCls, 'w-full')} />
            <input
              disabled={locked}
              value={money(it.unitPrice)}
              onChange={(e) => updateItem(idx, { unitPrice: Number(latinDigits(e.target.value).replace(/\D/g, '')) || 0 })}
              dir="ltr"
              className={cn(inputCls, 'w-full text-left font-bold')}
              aria-label="قیمت واحد"
            />
            <div className="flex items-center gap-1">
              <input
                disabled={locked}
                value={faDigits(String(it.quantity))}
                onChange={(e) => updateItem(idx, { quantity: Number(latinDigits(e.target.value).replace(/[^\d.]/g, '')) || 0 })}
                dir="ltr"
                className={cn(inputCls, 'w-full text-left')}
                aria-label="متراژ"
              />
              <span className="text-xs text-[var(--muted-foreground)] shrink-0">{it.unit}</span>
            </div>
            {!locked && (
              <button onClick={() => set({ items: items.filter((_, i) => i !== idx), ...calcFrom(items.filter((_, i) => i !== idx), quote.vatRate) })} className="w-10 h-10 grid place-items-center text-[var(--muted-foreground)] hover:text-red-600" aria-label="حذف ردیف">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <p className="sm:col-span-full text-xs text-[var(--muted-foreground)] num">جمع ردیف: {money(it.lineTotal)} تومان</p>
          </div>
        ))}
      </div>

      {!locked && (
        <div className="px-4 py-3 border-t border-[var(--border)]">
          <button
            onClick={() => set({ items: [...items, { priceItemId: null, productId: null, title: '', unitPrice: 0, quantity: 1, unit: 'متر', lineTotal: 0, note: '', sortOrder: items.length }] })}
            className="h-9 px-3 rounded-xl bg-[var(--muted)] text-xs font-bold inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />ردیف جدید
          </button>
        </div>
      )}

      <div className="p-5 border-t border-[var(--border)] bg-[var(--muted)]/30 space-y-1 text-sm num">
        <div className="flex justify-between"><span className="text-[var(--muted-foreground)]">جمع کالا</span><span>{money(totals.subtotal)} تومان</span></div>
        <div className="flex justify-between"><span className="text-[var(--muted-foreground)]">ارزش افزوده {faDigits(String(quote.vatRate))}٪</span><span>{money(totals.vatAmount)} تومان</span></div>
        <div className="flex justify-between font-black text-base pt-1"><span>جمع کل</span><span>{money(totals.total)} تومان</span></div>
        <p className="text-[11px] text-[var(--muted-foreground)] pt-2">نرخ پیش‌فرض ارزش افزوده {formatPersianNumber(DEFAULT_VAT_RATE)}٪ است. هزینه حمل در این پیش‌فاکتور لحاظ نشده.</p>
      </div>

      <div className="p-4 border-t border-[var(--border)] flex flex-wrap gap-2">
        {!locked && (
          <>
            <button disabled={busy} onClick={onSaveDraft} className="h-10 px-4 rounded-xl bg-[var(--muted)] text-sm font-bold disabled:opacity-40">ذخیره تغییرات</button>
            <button disabled={busy || !items.length} onClick={onIssue} className="h-10 px-4 rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] text-sm font-bold inline-flex items-center gap-1.5 disabled:opacity-40">
              <Check className="w-4 h-4" />تأیید و صدور
            </button>
            {quote.status === 'REQUESTED' && (
              <button disabled={busy} onClick={onReject} className="h-10 px-4 rounded-xl bg-red-500/10 text-red-700 dark:text-red-400 text-sm font-bold inline-flex items-center gap-1.5">
                <X className="w-4 h-4" />رد
              </button>
            )}
          </>
        )}
        <button disabled={busy} onClick={onDelete} className="h-10 px-4 rounded-xl bg-[var(--muted)] text-red-700 dark:text-red-400 text-sm ms-auto">حذف</button>
      </div>
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn('block space-y-1', className)}>
      <span className="text-xs text-[var(--muted-foreground)]">{label}</span>
      {children}
    </label>
  );
}

function calcFrom(items: Item[], vatRate: number) {
  const subtotal = items.reduce((s, i) => s + Math.round(i.unitPrice * i.quantity), 0);
  const vatAmount = Math.round(subtotal * (vatRate / 100));
  return { subtotal, vatAmount, total: subtotal + vatAmount };
}

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
