'use client';

import { useSyncExternalStore } from 'react';
import Image from 'next/image';
import { CheckCircle2, Clock, Download, Factory, Mail, MapPin, MessageCircle, Phone, Printer } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { faDateLong } from '@/shared/lib/jalali';
import type { SiteSettings } from '@/shared/lib/site-settings';
import type { OrderLogEntry } from '@/shared/lib/order-status';
import { Link } from '@/shared/i18n/Link';
import type { Locale } from '@/shared/i18n/config';
import { digits, formatNumber } from '@/shared/i18n/format';
import { defineMessages, fill } from '@/shared/i18n/messages';
import { useLocale } from '@/shared/i18n/LocaleProvider';
import { OrderTimeline } from './OrderTimeline';

/**
 * سند پیش‌فاکتور: شرح ردیف‌ها و واحد (متر) در دیتابیس به فارسی ذخیره شده‌اند و همان‌طور نمایش داده می‌شوند؛
 * فقط متن‌های رابط (برچسب‌ها، وضعیت، توضیحات) به زبان صفحه است. PDF همیشه فارسی است.
 */
const messages = defineMessages({
  fa: {
    invoice: 'فاکتور فروش',
    proforma: 'پیش‌فاکتور فروش',
    invoiceShare: 'فاکتور {number}',
    proformaShare: 'پیش‌فاکتور {number}',
    pendingTitle: 'این پیش‌فاکتور هنوز توسط کارشناس تأیید نشده است.',
    pendingText: 'می‌توانید جزئیات و مبالغ را ببینید. پس از تأیید ادمین، فاکتور نهایی روی همین لینک جایگزین می‌شود و از طریق واتساپ/ایمیل برایتان ارسال می‌گردد.',
    issuedBy: 'این فاکتور توسط {role}، {name}، تأیید و صادر شده است.',
    expiredTitle: 'اعتبار این فاکتور به پایان رسیده است.',
    expiredText: 'قیمت‌ها روزانه تغییر می‌کنند؛ با قیمت روز پیش‌فاکتور جدید بسازید یا برای تمدید تماس بگیرید.',
    todayPrices: 'قیمت روز',
    orderStatus: 'وضعیت سفارش',
    print: 'چاپ',
    pdf: 'دانلود PDF',
    whatsapp: 'واتساپ',
    email: 'ایمیل',
    salesOffice: 'دفتر فروش',
    salesOfficeLine: 'دفتر فروش: {address}',
    issuedAt: 'تاریخ صدور',
    requestedAt: 'تاریخ درخواست',
    validUntil: 'اعتبار تا',
    expired: 'منقضی شده',
    approved: 'تأییدشده',
    awaiting: 'در انتظار تأیید',
    issuedNote: 'مبالغ به تومان — هزینه حمل جداگانه اعلام می‌شود',
    pendingNote: 'پیش‌فاکتور اولیه — مبالغ پس از تأیید کارشناس قطعی می‌شوند',
    buyer: 'مشخصات خریدار',
    name: 'نام: ',
    company: 'شرکت: ',
    mobile: 'موبایل: ',
    emailLabel: 'ایمیل: ',
    row: 'ردیف',
    description: 'شرح کالا',
    quantity: 'مقدار',
    unitPrice: 'فی (تومان)',
    amount: 'مبلغ (تومان)',
    subtotal: 'جمع کالا',
    vat: 'ارزش افزوده {rate}٪',
    total: 'جمع کل',
    toman: 'تومان',
    factory: 'کارخانه و انبار',
    viewMap: 'مشاهده روی نقشه',
    issuedFooter: 'این سند پس از تأیید کارشناس صادر شده است و فاکتور رسمی مالیاتی محسوب نمی‌شود. قیمت‌ها تا تاریخ اعتبار و به‌شرط موجودی معتبرند. هزینه حمل هنگام هماهنگی بارگیری اعلام می‌شود.',
    pendingFooter: 'این سند پیش‌فاکتور اولیه است و تا تأیید کارشناس فروش قطعی نیست. پس از تأیید، فاکتور نهایی روی همین لینک در دسترس قرار می‌گیرد.',
  },
  en: {
    invoice: 'Sales invoice',
    proforma: 'Pro forma invoice',
    invoiceShare: 'Invoice {number}',
    proformaShare: 'Quote {number}',
    pendingTitle: 'This quote has not yet been approved by our sales specialist.',
    pendingText: 'You can review the details and amounts. Once approved, the final invoice will replace it at this same link and be sent to you via WhatsApp or email.',
    issuedBy: 'This invoice has been approved and issued by {name}, {role}.',
    expiredTitle: 'This invoice has expired.',
    expiredText: 'Prices change daily; create a new quote at today’s prices or contact us to extend it.',
    todayPrices: 'Today’s prices',
    orderStatus: 'Order status',
    print: 'Print',
    pdf: 'Download PDF',
    whatsapp: 'WhatsApp',
    email: 'Email',
    salesOffice: 'Sales office',
    salesOfficeLine: 'Sales office: {address}',
    issuedAt: 'Issued',
    requestedAt: 'Requested',
    validUntil: 'Valid until',
    expired: 'Expired',
    approved: 'Approved',
    awaiting: 'Awaiting approval',
    issuedNote: 'Amounts in Toman — shipping is quoted separately',
    pendingNote: 'Preliminary quote — amounts become final once our specialist approves them',
    buyer: 'Buyer details',
    name: 'Name: ',
    company: 'Company: ',
    mobile: 'Mobile: ',
    emailLabel: 'Email: ',
    row: 'No.',
    description: 'Description',
    quantity: 'Qty',
    unitPrice: 'Unit price (Toman)',
    amount: 'Amount (Toman)',
    subtotal: 'Subtotal',
    vat: 'VAT {rate}%',
    total: 'Total',
    toman: 'Toman',
    factory: 'Factory and warehouse',
    viewMap: 'View on map',
    issuedFooter: 'This document was issued after approval by our sales specialist and is not an official tax invoice. Prices are valid until the expiry date, subject to stock availability. Shipping costs are confirmed when loading is arranged.',
    pendingFooter: 'This is a preliminary pro forma invoice and is not final until approved by our sales specialist. Once approved, the final invoice will be available at this same link.',
  },
});

const subscribeNoop = () => () => {};
// getSnapshot باید تا تغییر واقعی همان مقدار را برگرداند. Date.now خام هر میلی‌ثانیه عوض می‌شد: روی گوشی کند React بین
// دو خواندن مقدار تازه می‌دید، پشت سر هم دوباره رندر می‌کرد و با «Maximum update depth» صفحه خطای ۵۰۰ نشان می‌داد.
// گرد به دقیقه — برای «منقضی شده» کافی است و در طول یک رندر ثابت می‌ماند.
const clientNow = () => Math.floor(Date.now() / 60_000) * 60_000;
const serverNow = () => 0;

export type PublicQuote = {
  number: string;
  token: string;
  status: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerCompany: string;
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
  items: {
    title: string;
    unitPrice: number;
    quantity: number;
    unit: string;
    lineTotal: number;
    note: string;
  }[];
};

/** فارسی تاریخ شمسی با روز هفته و ساعت (مثل قبل)؛ انگلیسی میلادی، هر دو به وقت تهران */
const dateTime = (iso: string | null, locale: Locale) =>
  locale === 'fa'
    ? faDateLong(iso)
    : iso
      ? new Date(iso).toLocaleString('en-US', { timeZone: 'Asia/Tehran', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })
      : '—';

export function QuoteView({ quote, settings }: { quote: PublicQuote; settings: SiteSettings }) {
  const locale = useLocale();
  const t = messages[locale];
  const money = (n: number) => formatNumber(n, locale);
  const now = useSyncExternalStore(subscribeNoop, clientNow, serverNow);
  const issued = quote.status === 'ISSUED';
  const pending = quote.status === 'REQUESTED';
  const expired = Boolean(issued && quote.validUntil && now > 0 && new Date(quote.validUntil).getTime() < now);

  /** پیش‌فاکتور = قبل از تأیید؛ فاکتور = بعد از تأیید ادمین */
  const docTitle = issued ? t.invoice : t.proforma;
  const shareLabel = fill(issued ? t.invoiceShare : t.proformaShare, { number: quote.number });
  // dir=ltr برای شماره و ایمیل؛ تراز به سمت ستون همان زبان (موبایل ابتدای سطر، دسکتاپ ستون دوم)
  const phoneAlign = locale === 'fa' ? 'text-right sm:text-left' : 'text-left sm:text-right';
  const phones = [...new Set([settings.companyPhones[0], settings.phone, settings.mobile].filter(Boolean))].map((p) => digits(p!, locale)).join(' · ');
  const waText = encodeURIComponent(`${shareLabel}\n${quote.publicUrl}`);
  const mailHref = `mailto:?subject=${encodeURIComponent(shareLabel)}&body=${encodeURIComponent(quote.publicUrl)}`;

  return (
    <div className="container-main section-padding-sm max-w-4xl">
      {pending && (
        <div className="mb-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm flex items-start gap-3">
          <Clock className="w-5 h-5 shrink-0 mt-0.5 text-amber-700 dark:text-amber-400" />
          <div>
            <p className="font-bold">{t.pendingTitle}</p>
            <p className="mt-1 text-[var(--muted-foreground)] leading-6">{t.pendingText}</p>
          </div>
        </div>
      )}
      {issued && !expired && (
        <div className="mb-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-700 dark:text-emerald-400" />
          <p className="font-bold leading-6">{fill(t.issuedBy, { role: settings.salesExpertRole, name: settings.salesExpertName })}</p>
        </div>
      )}
      {expired && (
        <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-start gap-3">
            <Clock className="w-5 h-5 shrink-0 mt-0.5 text-red-700 dark:text-red-400" />
            <span>
              <span className="font-bold">{t.expiredTitle}</span>{' '}
              <span className="text-[var(--muted-foreground)]">{t.expiredText}</span>
            </span>
          </p>
          <Link href="/prices" className="print:hidden shrink-0 h-9 px-4 rounded-xl bg-[var(--foreground)] text-[var(--background)] text-xs font-bold inline-flex items-center">
            {t.todayPrices}
          </Link>
        </div>
      )}

      {/* پیگیری سفارش — بعد از صدور فاکتور */}
      {issued && (
        <section className="print:hidden mb-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-5">
          <p className="font-black text-sm mb-4">{t.orderStatus}</p>
          <OrderTimeline status={quote.status} createdAt={quote.createdAt} issuedAt={quote.issuedAt} orderStatus={quote.orderStatus} orderLog={quote.orderLog} />
          {quote.trackingNote && <p className="mt-4 rounded-xl bg-[var(--muted)] px-4 py-2.5 text-sm leading-7 num">{digits(quote.trackingNote, locale)}</p>}
        </section>
      )}

      <div className="print:hidden mb-5 flex flex-wrap gap-2">
        <button onClick={() => window.print()} className="h-10 px-4 rounded-xl bg-[var(--foreground)] text-[var(--background)] text-sm font-bold inline-flex items-center gap-1.5">
          <Printer className="w-4 h-4" />{t.print}
        </button>
        <a href={`/api/quotes/${quote.token}/pdf`} className="h-10 px-4 rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] text-sm font-bold inline-flex items-center gap-1.5">
          <Download className="w-4 h-4" />{t.pdf}
        </a>
        <a href={`https://wa.me/?text=${waText}`} target="_blank" rel="noopener" className="h-10 px-4 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-sm font-bold inline-flex items-center gap-1.5">
          <MessageCircle className="w-4 h-4" />{t.whatsapp}
        </a>
        <a href={mailHref} className="h-10 px-4 rounded-xl bg-[var(--muted)] text-sm font-bold inline-flex items-center gap-1.5">
          <Mail className="w-4 h-4" />{t.email}
        </a>
      </div>

      <article className="quote-sheet overflow-hidden rounded-2xl border border-[var(--border)] bg-white text-slate-900 shadow-sm print:border-0 print:rounded-none print:shadow-none dark:bg-[var(--background)] dark:text-[var(--foreground)]">
        <header className="border-b-2 border-slate-900/10 dark:border-[var(--border)] px-6 sm:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
            <div className="flex items-start gap-3 min-w-0">
              <div className="relative w-14 h-14 shrink-0 rounded-xl overflow-hidden border border-slate-200 dark:border-[var(--border)] bg-white">
                <Image src="/images/logo.png" alt={settings.siteName} fill className="object-contain p-1" sizes="56px" />
              </div>
              <div className="min-w-0">
                <p className="text-lg font-black leading-tight">{settings.siteName}</p>
                <p className="text-sm text-slate-500 dark:text-[var(--muted-foreground)] mt-0.5">{settings.legalName}</p>
                <div className="mt-2 text-xs leading-6 text-slate-500 dark:text-[var(--muted-foreground)] space-y-0.5">
                  {settings.address && (
                    <p className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      <span>{fill(t.salesOfficeLine, { address: settings.address })}</span>
                    </p>
                  )}
                  <p className="flex items-center gap-1.5" dir="ltr">
                    <Phone className="w-3.5 h-3.5 shrink-0" />
                    <span className="num">{phones}</span>
                  </p>
                  <p className="flex items-center gap-1.5" dir="ltr">
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    <span className="num">{settings.email}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="sm:text-end shrink-0 rounded-xl bg-slate-50 dark:bg-[var(--muted)] px-4 py-3 text-sm space-y-1.5 min-w-[11rem]">
              <p className="font-black text-base num">{quote.number}</p>
              <p className="text-xs text-slate-500 dark:text-[var(--muted-foreground)]">
                {issued ? t.issuedAt : t.requestedAt}:{' '}
                <span className="num">{dateTime(issued ? quote.issuedAt : quote.createdAt, locale)}</span>
              </p>
              {issued && (
                <p className="text-xs text-slate-500 dark:text-[var(--muted-foreground)]">
                  {t.validUntil}: <span className="num">{dateTime(quote.validUntil, locale)}</span>
                </p>
              )}
              <p className={`text-xs font-bold ${issued ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>
                {expired ? t.expired : issued ? t.approved : t.awaiting}
              </p>
            </div>
          </div>
        </header>

        <div className="px-6 sm:px-8 py-5 text-center border-b border-slate-200 dark:border-[var(--border)] bg-slate-50/70 dark:bg-[var(--muted)]/40">
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">{docTitle}</h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-[var(--muted-foreground)]">
            {issued ? t.issuedNote : t.pendingNote}
          </p>
        </div>

        <section className="px-6 sm:px-8 py-5 border-b border-slate-200 dark:border-[var(--border)]">
          <p className="text-[11px] font-bold text-slate-400 dark:text-[var(--muted-foreground)] mb-2">{t.buyer}</p>
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-1 text-sm">
            <p>
              <span className="text-slate-500 dark:text-[var(--muted-foreground)]">{t.name}</span>
              <span className="font-bold">{quote.customerName}</span>
            </p>
            {quote.customerCompany && (
              <p>
                <span className="text-slate-500 dark:text-[var(--muted-foreground)]">{t.company}</span>
                <span className="font-bold">{quote.customerCompany}</span>
              </p>
            )}
            <p dir="ltr" className={phoneAlign}>
              <span className="text-slate-500 dark:text-[var(--muted-foreground)]">{t.mobile}</span>
              <span className="font-bold num">{digits(quote.customerPhone, locale)}</span>
            </p>
            {quote.customerEmail && (
              <p dir="ltr" className={phoneAlign}>
                <span className="text-slate-500 dark:text-[var(--muted-foreground)]">{t.emailLabel}</span>
                <span className="font-bold num">{quote.customerEmail}</span>
              </p>
            )}
          </div>
        </section>

        <div className="overflow-x-auto px-6 sm:px-8 py-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-slate-900/15 dark:border-[var(--border)] text-[11px] text-slate-500 dark:text-[var(--muted-foreground)]">
                <th className="text-start font-bold py-3 w-12">{t.row}</th>
                <th className="text-start font-bold py-3">{t.description}</th>
                <th className="text-start font-bold py-3 whitespace-nowrap">{t.quantity}</th>
                <th className="text-start font-bold py-3 whitespace-nowrap">{t.unitPrice}</th>
                <th className="text-start font-bold py-3 whitespace-nowrap">{t.amount}</th>
              </tr>
            </thead>
            <tbody>
              {quote.items.map((it, i) => (
                <tr key={i} className="border-b border-slate-100 dark:border-[var(--border)]/70 align-top">
                  <td className="py-3.5 num">{digits(i + 1, locale)}</td>
                  <td className="py-3.5 pe-3">
                    <p className="font-semibold leading-6">{digits(it.title, locale)}</p>
                    {it.note && <p className="text-[11px] text-slate-500 dark:text-[var(--muted-foreground)] mt-1 leading-5">{digits(it.note, locale)}</p>}
                  </td>
                  <td className="py-3.5 num whitespace-nowrap">{digits(it.quantity, locale)} {it.unit}</td>
                  <td className="py-3.5 num whitespace-nowrap">{money(it.unitPrice)}</td>
                  <td className="py-3.5 num font-bold whitespace-nowrap">{money(it.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <section className="px-6 sm:px-8 py-5 border-t border-slate-200 dark:border-[var(--border)]">
          <div className="ms-auto max-w-xs space-y-1.5 text-sm num">
            {/* بدون ارزش افزوده، جمع کالا همان جمع کل است — ردیف تکراری نمایش داده نمی‌شود */}
            {quote.vatRate > 0 && (
              <>
                <div className="flex justify-between gap-8">
                  <span className="text-slate-500 dark:text-[var(--muted-foreground)]">{t.subtotal}</span>
                  <span>{money(quote.subtotal)}</span>
                </div>
                <div className="flex justify-between gap-8">
                  <span className="text-slate-500 dark:text-[var(--muted-foreground)]">{fill(t.vat, { rate: digits(quote.vatRate, locale) })}</span>
                  <span>{money(quote.vatAmount)}</span>
                </div>
              </>
            )}
            <div className={cn('flex justify-between gap-8 font-black text-base', quote.vatRate > 0 && 'pt-2 border-t border-slate-200 dark:border-[var(--border)]')}>
              <span>{t.total}</span>
              <span>{money(quote.total)} {t.toman}</span>
            </div>
          </div>
        </section>

        <footer className="px-6 sm:px-8 py-5 border-t-2 border-slate-900/10 dark:border-[var(--border)] bg-slate-50 dark:bg-[var(--muted)]/30 text-xs leading-6 text-slate-600 dark:text-[var(--muted-foreground)]">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="font-bold text-slate-800 dark:text-[var(--foreground)] flex items-center gap-1.5 mb-1">
                <Factory className="w-3.5 h-3.5" />
                {t.factory}
              </p>
              <p>{settings.factoryAddress}</p>
              {settings.mapUrl && (
                <a href={settings.mapUrl} target="_blank" rel="noopener" className="text-[var(--accent-text)] font-semibold print:hidden">
                  {t.viewMap}
                </a>
              )}
            </div>
            <div>
              <p className="font-bold text-slate-800 dark:text-[var(--foreground)] mb-1">{t.salesOffice}</p>
              <p>{settings.salesExpertRole}: {settings.salesExpertName}</p>
              <p>{settings.address}</p>
              <p className="num" dir="ltr">{phones}</p>
              <p className="num" dir="ltr">{settings.email}</p>
            </div>
          </div>
          <p className="mt-4 pt-3 border-t border-slate-200 dark:border-[var(--border)]">
            {issued ? t.issuedFooter : t.pendingFooter}
          </p>
          <p className="mt-1 font-semibold text-slate-700 dark:text-[var(--foreground)]">
            {settings.legalName} — {settings.siteName}
          </p>
        </footer>
      </article>
    </div>
  );
}
