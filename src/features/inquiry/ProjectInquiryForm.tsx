'use client';

import { useState } from 'react';
import { CheckCircle2, Loader2, MessageCircle, Plus, Send, Trash2 } from 'lucide-react';
import { useSiteSettings } from '@/shared/providers/SiteSettingsProvider';
import { CORRUGATED_PIPE_DIMENSIONS } from '@/shared/lib/pipe-dimensions';
import { CORRUGATED_FITTINGS, SPIRAL_PIPE_SIZES } from '@/shared/config/product-lines';
import { cn, faDigits, latinDigits } from '@/shared/lib/utils';

/**
 * فرم استعلام خرید پروژه‌ای: چند سایز در یک درخواست، با کلاس SN، متراژ، شهر پروژه و زمان تحویل.
 * درخواست مثل فرم تماس در پیام‌های پنل ثبت می‌شود (موضوع «استعلام خرید پروژه‌ای») و بعد از ثبت،
 * همان متن با یک کلیک در واتس‌اپ فروش فرستاده می‌شود — پیامک سایت هنوز راه‌اندازی نشده.
 */

const PIPE_KINDS = [
  { id: 'corrugated', label: 'لوله کاروگیت', sizes: CORRUGATED_PIPE_DIMENSIONS.map((d) => d.size) },
  { id: 'spiral', label: 'لوله اسپیرال', sizes: [...SPIRAL_PIPE_SIZES] },
] as const;
const FITTING_SIZES = CORRUGATED_PIPE_DIMENSIONS.map((d) => d.size);

/** kind: corrugated | spiral | اسلاگ نوع اتصال */
export type InquiryRow = { kind: string; size: number; sn: string; qty: string };
type Row = InquiryRow;

const kindLabel = (kind: string) =>
  PIPE_KINDS.find((k) => k.id === kind)?.label ?? CORRUGATED_FITTINGS.find((f) => f.slug === kind)?.name ?? kind;
const isPipe = (kind: string) => PIPE_KINDS.some((k) => k.id === kind);
const sizesOf = (kind: string): readonly number[] => PIPE_KINDS.find((k) => k.id === kind)?.sizes ?? FITTING_SIZES;

const DELIVERY_OPTIONS = ['هرچه سریع‌تر (کمتر از یک هفته)', 'تا دو هفته', 'تا یک ماه', 'طبق زمان‌بندی پروژه (بیش از یک ماه)'];

export function ProjectInquiryForm({ initial }: { initial: Row }) {
  const { whatsappUrl } = useSiteSettings();
  const [rows, setRows] = useState<Row[]>([initial]);
  const [city, setCity] = useState('');
  const [delivery, setDelivery] = useState(DELIVERY_OPTIONS[1]);
  const [name, setName] = useState('');
  const [tel, setTel] = useState('');
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle');
  const [error, setError] = useState('');
  const [sentText, setSentText] = useState('');

  const update = (i: number, patch: Partial<Row>) =>
    setRows((rs) =>
      rs.map((r, j) => {
        if (j !== i) return r;
        const next = { ...r, ...patch };
        // با عوض شدن نوع محصول، سایز باید در فهرست همان نوع باشد
        if (patch.kind && !sizesOf(next.kind).includes(next.size)) next.size = sizesOf(next.kind)[0];
        if (patch.kind && !isPipe(next.kind)) next.sn = '';
        return next;
      }),
    );

  const message = () =>
    [
      'استعلام خرید پروژه‌ای',
      ...rows.map((r, i) => {
        const unit = isPipe(r.kind) ? 'متر' : 'عدد';
        const sn = isPipe(r.kind) ? ` — ${r.sn || 'کلاس SN: نیاز به مشاوره'}` : '';
        return `${faDigits(i + 1)}) ${kindLabel(r.kind)} ${faDigits(r.size)} میلی‌متر${sn} — ${faDigits(latinDigits(r.qty))} ${unit}`;
      }),
      `شهر پروژه: ${city.trim()}`,
      `زمان تحویل: ${delivery}`,
      ...(note.trim() ? [`توضیحات: ${note.trim()}`] : []),
    ].join('\n');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const digits = latinDigits(tel).replace(/\D/g, '');
    if (rows.some((r) => !(Number(latinDigits(r.qty)) > 0))) return setError('مقدار هر ردیف را وارد کنید');
    if (!city.trim()) return setError('شهر پروژه را وارد کنید');
    if (!name.trim()) return setError('نام را وارد کنید');
    if (!/^0?9\d{9}$/.test(digits)) return setError('شماره موبایل معتبر نیست');

    const text = message();
    setStatus('sending');
    setError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: digits,
          subject: 'استعلام خرید پروژه‌ای',
          message: text,
          sourcePath: window.location.pathname,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) throw new Error(json.error || 'ارسال ناموفق بود');
      setSentText(`${text}\nنام: ${name.trim()}\nموبایل: ${digits}`);
      setStatus('done');
    } catch (err) {
      setStatus('idle');
      setError(err instanceof Error ? err.message : 'ارسال ناموفق بود');
    }
  };

  const field =
    'w-full h-11 rounded-[var(--radius-control)] bg-[var(--background)] border border-[var(--border)] px-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--accent)] focus:outline-none';
  const label = 'block text-xs font-bold text-[var(--muted-foreground)] mb-1';

  if (status === 'done') {
    return (
      <div className="rounded-[var(--radius-sheet)] border border-emerald-500/30 bg-emerald-500/5 p-6 text-center" role="status">
        <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-600" />
        <p className="mt-3 text-lg font-black">درخواست شما ثبت شد</p>
        <p className="mt-1 text-sm leading-7 text-[var(--muted-foreground)]">
          کارشناس فروش عمده با شما تماس می‌گیرد. برای پاسخ سریع‌تر، همین درخواست را در واتس‌اپ هم بفرستید.
        </p>
        {whatsappUrl && (
          <a
            href={`${whatsappUrl}?text=${encodeURIComponent(sentText)}`}
            target="_blank"
            rel="noopener"
            className="mt-4 inline-flex items-center gap-2 h-12 px-6 rounded-[var(--radius-control)] bg-[#128C7E] text-white font-bold"
          >
            <MessageCircle className="w-5 h-5" /> ارسال همین درخواست در واتس‌اپ فروش
          </a>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-[var(--radius-sheet)] border border-[var(--border)] bg-[var(--card)] p-4 sm:p-6 space-y-5" noValidate>
      <fieldset className="space-y-3">
        <legend className="text-sm font-black mb-2">اقلام موردنیاز</legend>
        {rows.map((r, i) => (
          <div key={i} className="grid grid-cols-2 sm:grid-cols-[1.4fr_1fr_1fr_1fr_auto] gap-2 items-end rounded-[var(--radius-control)] bg-[var(--muted)]/50 p-3">
            <label className="col-span-2 sm:col-span-1">
              <span className={label}>محصول</span>
              <select value={r.kind} onChange={(e) => update(i, { kind: e.target.value })} className={field}>
                {PIPE_KINDS.map((k) => <option key={k.id} value={k.id}>{k.label}</option>)}
                <optgroup label="اتصالات کاروگیت">
                  {CORRUGATED_FITTINGS.map((f) => <option key={f.slug} value={f.slug}>{f.name}</option>)}
                </optgroup>
              </select>
            </label>
            <label>
              <span className={label}>سایز (میلی‌متر)</span>
              <select value={r.size} onChange={(e) => update(i, { size: Number(e.target.value) })} className={cn(field, 'num')}>
                {sizesOf(r.kind).map((s) => <option key={s} value={s}>{faDigits(s)}</option>)}
              </select>
            </label>
            <label>
              <span className={label}>کلاس SN</span>
              <select value={r.sn} onChange={(e) => update(i, { sn: e.target.value })} disabled={!isPipe(r.kind)} className={cn(field, 'disabled:opacity-50')}>
                <option value="">نیاز به مشاوره</option>
                <option value="SN4">SN4</option>
                <option value="SN8">SN8</option>
              </select>
            </label>
            <label>
              <span className={label}>{isPipe(r.kind) ? 'متراژ (متر)' : 'تعداد'}</span>
              <input value={r.qty} onChange={(e) => update(i, { qty: e.target.value })} inputMode="numeric" dir="ltr" placeholder="مثلاً ۱۲۰" className={cn(field, 'text-right num')} />
            </label>
            <button
              type="button"
              onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))}
              disabled={rows.length === 1}
              aria-label={`حذف ردیف ${faDigits(i + 1)}`}
              className="h-11 w-11 grid place-items-center rounded-[var(--radius-control)] border border-[var(--border)] text-[var(--muted-foreground)] hover:text-red-600 disabled:opacity-30"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setRows((rs) => [...rs, { ...rs[rs.length - 1], qty: '' }])}
          className="inline-flex items-center gap-1.5 h-10 px-4 rounded-[var(--radius-control)] border border-dashed border-[var(--accent)] text-[var(--accent-text)] text-sm font-bold"
        >
          <Plus className="w-4 h-4" /> سایز یا محصول دیگر
        </button>
      </fieldset>

      <div className="grid sm:grid-cols-2 gap-3">
        <label>
          <span className={label}>شهر پروژه</span>
          <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="مثلاً اصفهان" className={field} />
        </label>
        <label>
          <span className={label}>زمان تحویل</span>
          <select value={delivery} onChange={(e) => setDelivery(e.target.value)} className={field}>
            {DELIVERY_OPTIONS.map((d) => <option key={d}>{d}</option>)}
          </select>
        </label>
        <label>
          <span className={label}>نام و نام خانوادگی / شرکت</span>
          <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={field} />
        </label>
        <label>
          <span className={label}>شماره موبایل</span>
          <input value={tel} onChange={(e) => setTel(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="۰۹۱۲۱۲۳۴۵۶۷" className={cn(field, 'ltr-field num')} />
        </label>
        <label className="sm:col-span-2">
          <span className={label}>توضیحات پروژه (اختیاری)</span>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="نوع پروژه، عمق دفن، نیاز به اتصالات…" className={cn(field, 'h-auto py-2.5 leading-7')} />
        </label>
      </div>

      {error && <p role="alert" className="text-sm font-bold text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full h-12 rounded-[var(--radius-control)] bg-[var(--accent)] text-[var(--accent-foreground)] font-black flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {status === 'sending' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        ارسال به واحد فروش عمده
      </button>
    </form>
  );
}
