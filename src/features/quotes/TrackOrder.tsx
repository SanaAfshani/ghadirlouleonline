'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FileText, Hash, Loader2, PackageSearch, Phone, Search, StickyNote } from 'lucide-react';
import { cn, faDigits } from '@/shared/lib/utils';
import { IconTile } from '@/shared/ui/IconTile';
import { ORDER_STEPS, type OrderLogEntry } from '@/shared/lib/order-status';
import { OrderTimeline } from './OrderTimeline';

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
  'w-full h-12 rounded-2xl border border-[var(--border)] bg-[var(--background)] pr-11 pl-4 text-[15px] font-bold num focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20';

/** وضعیت خلاصه بالای نتیجه */
function headline(r: Result) {
  if (r.status === 'REJECTED') return { text: 'این پیش‌فاکتور تأیید نشد', tone: 'bg-red-500/10 text-red-700 dark:text-red-300' };
  if (r.status === 'EXPIRED') return { text: 'اعتبار پیش‌فاکتور تمام شده است', tone: 'bg-amber-500/10 text-amber-800 dark:text-amber-300' };
  if (r.status === 'REQUESTED') return { text: 'در انتظار تأیید کارشناس فروش', tone: 'bg-amber-500/10 text-amber-800 dark:text-amber-300' };
  const step = ORDER_STEPS.find((s) => s.key === r.orderStatus);
  return { text: step ? step.label : 'فاکتور صادر شد — آماده‌سازی به‌زودی آغاز می‌شود', tone: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' };
}

export function TrackOrder({ initialNumber = '' }: { initialNumber?: string }) {
  const [number, setNumber] = useState(initialNumber);
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<Result | null>(null);

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
      if (!res.ok || !json.success) throw new Error(json.error || 'خطا در ارتباط با سرور');
      setResult(json.data);
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : 'خطا');
    } finally {
      setBusy(false);
    }
  };

  const head = result && headline(result);

  return (
    <div className="container-main section-padding-sm max-w-4xl">
      <form onSubmit={submit} className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5 sm:p-7">
        <div className="flex items-center gap-3">
          <IconTile icon={PackageSearch} size="lg" />
          <div>
            <h2 className="font-black text-lg">وضعیت سفارش خود را ببینید</h2>
            <p className="text-sm leading-7 text-[var(--muted-foreground)]">شماره پیش‌فاکتور و موبایلی را که هنگام سفارش وارد کردید بنویسید.</p>
          </div>
        </div>
        <div className="mt-5 grid sm:grid-cols-[1fr_1fr_auto] gap-3">
          <label className="relative block">
            <span className="sr-only">شماره پیش‌فاکتور</span>
            <Hash className="absolute right-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[var(--muted-foreground)]" />
            <input value={number} onChange={(e) => setNumber(e.target.value)} required dir="ltr" placeholder="Q-1405-0003" className={cn(inputCls, 'text-right placeholder:text-right')} />
          </label>
          <label className="relative block">
            <span className="sr-only">موبایل</span>
            <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[var(--muted-foreground)]" />
            <input value={phone} onChange={(e) => setPhone(e.target.value)} required inputMode="tel" dir="ltr" placeholder="۰۹۱۲۰۰۰۰۰۰۰" className={cn(inputCls, 'text-right placeholder:text-right')} />
          </label>
          <button disabled={busy} className="h-12 px-6 rounded-2xl bg-[var(--accent)] text-[var(--accent-foreground)] font-black flex items-center justify-center gap-2 disabled:opacity-60 shadow-accent">
            {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            پیگیری
          </button>
        </div>
        {error && <p role="alert" className="mt-3 text-sm font-bold text-red-700 dark:text-red-400">{error}</p>}
        <p className="mt-3 text-xs text-[var(--muted-foreground)]">شماره پیش‌فاکتور در پیامک یا لینک پیش‌فاکتور شما آمده است.</p>
      </form>

      {result && head && (
        <section aria-live="polite" className="mt-6 rounded-3xl border border-[var(--border)] bg-[var(--background)] p-5 sm:p-7 page-enter">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs text-[var(--muted-foreground)]">سفارش {result.customerName ? `${result.customerName} — ` : ''}<span className="num font-bold">{result.number}</span></p>
              <p className={cn('mt-2 inline-flex items-center h-9 px-4 rounded-xl text-sm font-black', head.tone)}>{head.text}</p>
            </div>
            <div className="text-left num">
              <p className="text-xs text-[var(--muted-foreground)]">{faDigits(result.items)} قلم کالا</p>
              <p className="font-black text-lg">{result.total.toLocaleString('fa-IR')} <span className="text-xs font-medium text-[var(--muted-foreground)]">تومان</span></p>
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
              <span className="num">{faDigits(result.trackingNote)}</span>
            </p>
          )}

          <Link href={result.url} className="mt-6 inline-flex items-center gap-2 h-11 px-5 rounded-xl border border-[var(--border)] font-bold text-sm hover:border-[var(--accent)] transition-colors">
            <FileText className="w-4.5 h-4.5" />
            مشاهده {result.status === 'ISSUED' ? 'فاکتور' : 'پیش‌فاکتور'}
          </Link>
        </section>
      )}
    </div>
  );
}
