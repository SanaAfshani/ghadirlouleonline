'use client';

import { useState } from 'react';
import { FileText, Hash, Loader2, PackageSearch, Phone, Search, StickyNote } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { IconTile } from '@/shared/ui/IconTile';
import { ORDER_STEPS, orderStepText, type OrderLogEntry } from '@/shared/lib/order-status';
import { Link } from '@/shared/i18n/Link';
import type { Locale } from '@/shared/i18n/config';
import { digits, formatNumber } from '@/shared/i18n/format';
import { defineMessages, fill } from '@/shared/i18n/messages';
import { useLocale } from '@/shared/i18n/LocaleProvider';
import { OrderTimeline } from './OrderTimeline';

const messages = defineMessages({
  fa: {
    rejected: 'این پیش‌فاکتور تأیید نشد',
    expired: 'اعتبار پیش‌فاکتور تمام شده است',
    requested: 'در انتظار تأیید کارشناس فروش',
    issued: 'فاکتور صادر شد — آماده‌سازی به‌زودی آغاز می‌شود',
    serverError: 'خطا در ارتباط با سرور',
    invalid: 'شماره پیش‌فاکتور و موبایل را درست وارد کنید',
    notFound: 'سفارشی با این شماره و موبایل پیدا نشد',
    error: 'خطا',
    title: 'وضعیت سفارش خود را ببینید',
    text: 'شماره پیش‌فاکتور و موبایلی را که هنگام سفارش وارد کردید بنویسید.',
    number: 'شماره پیش‌فاکتور',
    mobile: 'موبایل',
    phonePlaceholder: '۰۹۱۲۰۰۰۰۰۰۰',
    submit: 'پیگیری',
    hint: 'شماره پیش‌فاکتور در پیامک یا لینک پیش‌فاکتور شما آمده است.',
    orderOf: 'سفارش {name}',
    items: '{n} قلم کالا',
    toman: 'تومان',
    viewInvoice: 'مشاهده فاکتور',
    viewQuote: 'مشاهده پیش‌فاکتور',
  },
  en: {
    rejected: 'This quote was not approved',
    expired: 'This quote has expired',
    requested: 'Awaiting approval by our sales specialist',
    issued: 'Invoice issued — preparation will start shortly',
    serverError: 'Could not reach the server',
    invalid: 'Please enter a valid quote number and mobile number',
    notFound: 'No order was found with this number and mobile',
    error: 'Something went wrong',
    title: 'Check your order status',
    text: 'Enter your quote number and the mobile number you used when ordering.',
    number: 'Quote number',
    mobile: 'Mobile',
    phonePlaceholder: '09120000000',
    submit: 'Track',
    hint: 'Your quote number is in the text message or quote link we sent you.',
    orderOf: 'Order {name}',
    items: '{n} items',
    toman: 'Toman',
    viewInvoice: 'View invoice',
    viewQuote: 'View quote',
  },
});

/** پیام خطای API فارسی است؛ نسخه انگلیسی از روی کد وضعیت پیام خودش را نشان می‌دهد */
function trackError(status: number, apiError: unknown, locale: Locale) {
  const t = messages[locale];
  if (locale === 'fa' && typeof apiError === 'string' && apiError) return apiError;
  if (status === 400) return t.invalid;
  if (status === 404) return t.notFound;
  return t.serverError;
}

type Result = {
  number: string;
  status: string;
  customerName: string;
  createdAt: string;
  issuedAt: string | null;
  validUntil: string | null;
  total: number;
  items: number;
  orderStatus: string;
  orderLog: OrderLogEntry[];
  trackingNote: string;
  url: string;
};

const inputCls =
  'w-full h-12 rounded-2xl border border-[var(--border)] bg-[var(--background)] text-[15px] font-bold num focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20';

/** وضعیت خلاصه بالای نتیجه */
function headline(r: Result, locale: Locale) {
  const t = messages[locale];
  if (r.status === 'REJECTED') return { text: t.rejected, tone: 'bg-red-500/10 text-red-700 dark:text-red-300' };
  if (r.status === 'EXPIRED') return { text: t.expired, tone: 'bg-amber-500/10 text-amber-800 dark:text-amber-300' };
  if (r.status === 'REQUESTED') return { text: t.requested, tone: 'bg-amber-500/10 text-amber-800 dark:text-amber-300' };
  const step = ORDER_STEPS.find((s) => s.key === r.orderStatus);
  return { text: step ? orderStepText(step, locale).label : t.issued, tone: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' };
}

export function TrackOrder({ initialNumber = '' }: { initialNumber?: string }) {
  const [number, setNumber] = useState(initialNumber);
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const locale = useLocale();
  const t = messages[locale];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/quotes/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number, phone }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) throw new Error(trackError(res.status, json.error, locale));
      setResult(json.data);
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : t.error);
    } finally {
      setBusy(false);
    }
  };

  const head = result && headline(result, locale);
  // ورودی‌ها dir=ltr دارند (کلاس منطقی ps/pe همیشه چپ می‌شد)؛ فاصله و تراز از سمت آیکن — ابتدای سطر هر زبان
  const inputAlign = locale === 'fa' ? 'pr-11 pl-4 text-right placeholder:text-right' : 'pl-11 pr-4 text-left placeholder:text-left';

  return (
    <div className="container-main section-padding-sm max-w-4xl">
      <form onSubmit={submit} className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5 sm:p-7">
        <div className="flex items-center gap-3">
          <IconTile icon={PackageSearch} size="lg" />
          <div>
            <h2 className="font-black text-lg">{t.title}</h2>
            <p className="text-sm leading-7 text-[var(--muted-foreground)]">{t.text}</p>
          </div>
        </div>
        <div className="mt-5 grid sm:grid-cols-[1fr_1fr_auto] gap-3">
          <label className="relative block">
            <span className="sr-only">{t.number}</span>
            <Hash className="absolute start-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[var(--muted-foreground)]" />
            <input value={number} onChange={(e) => setNumber(e.target.value)} required dir="ltr" placeholder="Q-1405-0003" className={cn(inputCls, inputAlign)} />
          </label>
          <label className="relative block">
            <span className="sr-only">{t.mobile}</span>
            <Phone className="absolute start-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[var(--muted-foreground)]" />
            <input value={phone} onChange={(e) => setPhone(e.target.value)} required inputMode="tel" dir="ltr" placeholder={t.phonePlaceholder} className={cn(inputCls, inputAlign)} />
          </label>
          <button disabled={busy} className="h-12 px-6 rounded-2xl bg-[var(--accent)] text-[var(--accent-foreground)] font-black flex items-center justify-center gap-2 disabled:opacity-60 shadow-accent">
            {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            {t.submit}
          </button>
        </div>
        {error && <p role="alert" className="mt-3 text-sm font-bold text-red-700 dark:text-red-400">{error}</p>}
        <p className="mt-3 text-xs text-[var(--muted-foreground)]">{t.hint}</p>
      </form>

      {result && head && (
        <section aria-live="polite" className="mt-6 rounded-3xl border border-[var(--border)] bg-[var(--background)] p-5 sm:p-7 page-enter">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs text-[var(--muted-foreground)]">{fill(t.orderOf, { name: result.customerName ? `${result.customerName} — ` : '' })}<span className="num font-bold">{result.number}</span></p>
              <p className={cn('mt-2 inline-flex items-center h-9 px-4 rounded-xl text-sm font-black', head.tone)}>{head.text}</p>
            </div>
            <div className="text-end num">
              <p className="text-xs text-[var(--muted-foreground)]">{fill(t.items, { n: digits(result.items, locale) })}</p>
              <p className="font-black text-lg">{formatNumber(result.total, locale)} <span className="text-xs font-medium text-[var(--muted-foreground)]">{t.toman}</span></p>
            </div>
          </div>

          {result.status !== 'REJECTED' && result.status !== 'EXPIRED' && (
            <div className="mt-7">
              <OrderTimeline status={result.status} createdAt={result.createdAt} issuedAt={result.issuedAt} orderStatus={result.orderStatus} orderLog={result.orderLog} />
            </div>
          )}

          {result.trackingNote && (
            <p className="mt-6 flex items-start gap-2 rounded-2xl bg-[var(--muted)] px-4 py-3 text-sm leading-7">
              <StickyNote className="w-4.5 h-4.5 mt-1 shrink-0 text-[var(--accent-text)]" />
              <span className="num">{digits(result.trackingNote, locale)}</span>
            </p>
          )}

          <Link href={result.url} className="mt-6 inline-flex items-center gap-2 h-11 px-5 rounded-xl border border-[var(--border)] font-bold text-sm hover:border-[var(--accent)] transition-colors">
            <FileText className="w-4.5 h-4.5" />
            {result.status === 'ISSUED' ? t.viewInvoice : t.viewQuote}
          </Link>
        </section>
      )}
    </div>
  );
}
