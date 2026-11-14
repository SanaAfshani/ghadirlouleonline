'use client';

import { useState } from 'react';
import { CheckCircle2, Loader2, MessageCircle, Plus, Send, Trash2 } from 'lucide-react';
import { useSiteSettings } from '@/shared/providers/SiteSettingsProvider';
import { CORRUGATED_PIPE_DIMENSIONS } from '@/shared/lib/pipe-dimensions';
import { CORRUGATED_FITTINGS, SPIRAL_PIPE_SIZES } from '@/shared/config/product-lines';
import { cn, faDigits, latinDigits } from '@/shared/lib/utils';
import { PROJECT_INQUIRY_SUBJECT } from '@/shared/lib/leads';
import { useLocale, useMessages } from '@/shared/i18n/LocaleProvider';
import { defineMessages, fill } from '@/shared/i18n/messages';
import { digits } from '@/shared/i18n/format';

/**
 * فرم استعلام خرید پروژه‌ای: چند سایز در یک درخواست، با کلاس SN، متراژ، شهر پروژه و زمان تحویل.
 * درخواست مثل فرم تماس در پیام‌های پنل ثبت می‌شود (موضوع «استعلام خرید پروژه‌ای») و بعد از ثبت،
 * همان متن با یک کلیک در واتس‌اپ فروش فرستاده می‌شود — پیامک سایت هنوز راه‌اندازی نشده.
 * متن پیام ثبت‌شده همیشه فارسی است (واحد فروش آن را می‌خواند)؛ فقط برچسب‌های فرم به زبان صفحه‌اند.
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

type FittingSlug = (typeof CORRUGATED_FITTINGS)[number]['slug'];

/** نام انگلیسی اتصالات فقط برای نمایش در فرم؛ متن پیام نام فارسی را دارد */
const FITTING_NAMES_EN: Record<FittingSlug, string> = {
  'corrugated-coupler': 'Corrugated pipe coupler',
  'corrugated-epdm-gasket': 'Corrugated pipe EPDM seal',
  'corrugated-elbow-45': '45° corrugated elbow',
  'corrugated-elbow-90': '90° corrugated elbow',
  'corrugated-elbow-90-single': '90° corrugated elbow, single coupler end',
  'corrugated-tee-45': '45° corrugated tee',
  'corrugated-tee-90': '90° corrugated tee',
  'corrugated-cross': 'Corrugated cross',
  'corrugated-reducer': 'Corrugated pipe reducer',
  'corrugated-end-cap': 'Corrugated pipe end cap',
};

const messages = defineMessages({
  fa: {
    kinds: { corrugated: 'لوله کاروگیت', spiral: 'لوله اسپیرال' },
    deliveryOptions: DELIVERY_OPTIONS,
    errQty: 'مقدار هر ردیف را وارد کنید',
    errCity: 'شهر پروژه را وارد کنید',
    errName: 'نام را وارد کنید',
    errPhone: 'شماره موبایل معتبر نیست',
    sendFailed: 'ارسال ناموفق بود',
    doneTitle: 'درخواست شما ثبت شد',
    doneText: 'کارشناس فروش عمده با شما تماس می‌گیرد. برای پاسخ سریع‌تر، همین درخواست را در واتس‌اپ هم بفرستید.',
    doneWhatsapp: 'ارسال همین درخواست در واتس‌اپ فروش',
    itemsLegend: 'اقلام موردنیاز',
    product: 'محصول',
    fittingsGroup: 'اتصالات کاروگیت',
    size: 'سایز (میلی‌متر)',
    snClass: 'کلاس SN',
    snAdvice: 'نیاز به مشاوره',
    length: 'متراژ (متر)',
    count: 'تعداد',
    qtyPlaceholder: 'مثلاً ۱۲۰',
    removeRow: 'حذف ردیف {n}',
    addRow: 'سایز یا محصول دیگر',
    city: 'شهر پروژه',
    cityPlaceholder: 'مثلاً اصفهان',
    delivery: 'زمان تحویل',
    name: 'نام و نام خانوادگی / شرکت',
    mobile: 'شماره موبایل',
    mobilePlaceholder: '۰۹۱۲۱۲۳۴۵۶۷',
    note: 'توضیحات پروژه (اختیاری)',
    notePlaceholder: 'نوع پروژه، عمق دفن، نیاز به اتصالات…',
    submit: 'ارسال به واحد فروش عمده',
  },
  en: {
    kinds: { corrugated: 'Corrugated pipe', spiral: 'Spiral pipe' },
    deliveryOptions: ['As soon as possible (under a week)', 'Within two weeks', 'Within a month', 'Per project schedule (over a month)'],
    errQty: 'Enter a quantity for every row',
    errCity: 'Enter the project city',
    errName: 'Enter your name',
    errPhone: 'Enter a valid mobile number',
    sendFailed: 'Sending failed',
    doneTitle: 'Your request has been received',
    doneText: 'A bulk sales specialist will contact you. For a faster reply, send the same request on WhatsApp too.',
    doneWhatsapp: 'Send this request to sales on WhatsApp',
    itemsLegend: 'Items required',
    product: 'Product',
    fittingsGroup: 'Corrugated pipe fittings',
    size: 'Size (mm)',
    snClass: 'SN class',
    snAdvice: 'Need advice',
    length: 'Length (m)',
    count: 'Quantity',
    qtyPlaceholder: 'e.g. 120',
    removeRow: 'Remove row {n}',
    addRow: 'Another size or product',
    city: 'Project city',
    cityPlaceholder: 'e.g. Isfahan',
    delivery: 'Delivery time',
    name: 'Full name / company',
    mobile: 'Mobile number',
    mobilePlaceholder: '09121234567',
    note: 'Project notes (optional)',
    notePlaceholder: 'Project type, burial depth, fittings needed…',
    submit: 'Send to bulk sales',
  },
});

export function ProjectInquiryForm({ initial }: { initial: Row }) {
  const { whatsappUrl } = useSiteSettings();
  const locale = useLocale();
  const t = useMessages(messages);
  const fittingName = (f: (typeof CORRUGATED_FITTINGS)[number]) => (locale === 'fa' ? f.name : FITTING_NAMES_EN[f.slug]);
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
      PROJECT_INQUIRY_SUBJECT,
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
    const phoneDigits = latinDigits(tel).replace(/\D/g, '');
    if (rows.some((r) => !(Number(latinDigits(r.qty)) > 0))) return setError(t.errQty);
    if (!city.trim()) return setError(t.errCity);
    if (!name.trim()) return setError(t.errName);
    if (!/^0?9\d{9}$/.test(phoneDigits)) return setError(t.errPhone);

    const text = message();
    setStatus('sending');
    setError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phoneDigits,
          subject: PROJECT_INQUIRY_SUBJECT,
          message: text,
          sourcePath: window.location.pathname,
        }),
      });
      const json = await res.json().catch(() => ({}));
      // پاسخ API فارسی است؛ در نسخه انگلیسی متن خود فرم
      if (!res.ok || !json.success) throw new Error((locale === 'fa' && json.error) || t.sendFailed);
      setSentText(`${text}\nنام: ${name.trim()}\nموبایل: ${phoneDigits}`);
      setStatus('done');
    } catch (err) {
      setStatus('idle');
      setError(err instanceof Error && err.message ? err.message : t.sendFailed);
    }
  };

  const field =
    'w-full h-11 rounded-[var(--radius-control)] bg-[var(--background)] border border-[var(--border)] px-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--accent)] focus:outline-none';
  const label = 'block text-xs font-bold text-[var(--muted-foreground)] mb-1';

  if (status === 'done') {
    return (
      <div className="rounded-[var(--radius-sheet)] border border-emerald-500/30 bg-emerald-500/5 p-6 text-center" role="status">
        <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-600" />
        <p className="mt-3 text-lg font-black">{t.doneTitle}</p>
        <p className="mt-1 text-sm leading-7 text-[var(--muted-foreground)]">{t.doneText}</p>
        {whatsappUrl && (
          <a
            href={`${whatsappUrl}?text=${encodeURIComponent(sentText)}`}
            target="_blank"
            rel="noopener"
            className="mt-4 inline-flex items-center gap-2 h-12 px-6 rounded-[var(--radius-control)] bg-[#128C7E] text-white font-bold"
          >
            <MessageCircle className="w-5 h-5" /> {t.doneWhatsapp}
          </a>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-[var(--radius-sheet)] border border-[var(--border)] bg-[var(--card)] p-4 sm:p-6 space-y-5" noValidate>
      <fieldset className="space-y-3">
        <legend className="text-sm font-black mb-2">{t.itemsLegend}</legend>
        {rows.map((r, i) => (
          <div key={i} className="grid grid-cols-2 sm:grid-cols-[1.4fr_1fr_1fr_1fr_auto] gap-2 items-end rounded-[var(--radius-control)] bg-[var(--muted)]/50 p-3">
            <label className="col-span-2 sm:col-span-1">
              <span className={label}>{t.product}</span>
              <select value={r.kind} onChange={(e) => update(i, { kind: e.target.value })} className={field}>
                {PIPE_KINDS.map((k) => <option key={k.id} value={k.id}>{t.kinds[k.id]}</option>)}
                <optgroup label={t.fittingsGroup}>
                  {CORRUGATED_FITTINGS.map((f) => <option key={f.slug} value={f.slug}>{fittingName(f)}</option>)}
                </optgroup>
              </select>
            </label>
            <label>
              <span className={label}>{t.size}</span>
              <select value={r.size} onChange={(e) => update(i, { size: Number(e.target.value) })} className={cn(field, 'num')}>
                {sizesOf(r.kind).map((s) => <option key={s} value={s}>{digits(s, locale)}</option>)}
              </select>
            </label>
            <label>
              <span className={label}>{t.snClass}</span>
              <select value={r.sn} onChange={(e) => update(i, { sn: e.target.value })} disabled={!isPipe(r.kind)} className={cn(field, 'disabled:opacity-50')}>
                <option value="">{t.snAdvice}</option>
                <option value="SN4">SN4</option>
                <option value="SN8">SN8</option>
              </select>
            </label>
            <label>
              <span className={label}>{isPipe(r.kind) ? t.length : t.count}</span>
              <input value={r.qty} onChange={(e) => update(i, { qty: e.target.value })} inputMode="numeric" dir="ltr" placeholder={t.qtyPlaceholder} className={cn(field, 'rtl:text-right num')} />
            </label>
            <button
              type="button"
              onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))}
              disabled={rows.length === 1}
              aria-label={fill(t.removeRow, { n: digits(i + 1, locale) })}
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
          <Plus className="w-4 h-4" /> {t.addRow}
        </button>
      </fieldset>

      <div className="grid sm:grid-cols-2 gap-3">
        <label>
          <span className={label}>{t.city}</span>
          <input value={city} onChange={(e) => setCity(e.target.value)} placeholder={t.cityPlaceholder} className={field} />
        </label>
        <label>
          <span className={label}>{t.delivery}</span>
          {/* مقدار ارسالی فارسی می‌ماند (متن پیام واحد فروش)؛ فقط برچسب گزینه ترجمه می‌شود */}
          <select value={delivery} onChange={(e) => setDelivery(e.target.value)} className={field}>
            {DELIVERY_OPTIONS.map((d, i) => <option key={d} value={d}>{t.deliveryOptions[i]}</option>)}
          </select>
        </label>
        <label>
          <span className={label}>{t.name}</span>
          <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={field} />
        </label>
        <label>
          <span className={label}>{t.mobile}</span>
          <input value={tel} onChange={(e) => setTel(e.target.value)} inputMode="tel" autoComplete="tel" placeholder={t.mobilePlaceholder} className={cn(field, 'ltr-field num')} />
        </label>
        <label className="sm:col-span-2">
          <span className={label}>{t.note}</span>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder={t.notePlaceholder} className={cn(field, 'h-auto py-2.5 leading-7')} />
        </label>
      </div>

      {error && <p role="alert" className="text-sm font-bold text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full h-12 rounded-[var(--radius-control)] bg-[var(--accent)] text-[var(--accent-foreground)] font-black flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {status === 'sending' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        {t.submit}
      </button>
    </form>
  );
}
