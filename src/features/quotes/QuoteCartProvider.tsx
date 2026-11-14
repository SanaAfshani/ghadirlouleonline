'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, m as motion } from 'framer-motion';
import { CheckCircle2, FileSpreadsheet, Loader2, MessageCircle, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn, latinDigits } from '@/shared/lib/utils';
import { DEFAULT_VAT_RATE } from '@/shared/lib/quote-constants';
import { IconTile } from '@/shared/ui/IconTile';
import { useSiteSettings } from '@/shared/providers/SiteSettingsProvider';
import { localizePath } from '@/shared/i18n/config';
import { digits, formatNumber } from '@/shared/i18n/format';
import { defineMessages, fill } from '@/shared/i18n/messages';
import { useLocale } from '@/shared/i18n/LocaleProvider';

const messages = defineMessages({
  fa: {
    added: 'به پیش‌فاکتور اضافه شد',
    quote: 'پیش‌فاکتور',
    whatsappText: 'سلام، درخواست پیش‌فاکتور {number} را ثبت کردم.\nنام: {name}\nموبایل: {phone}\n{url}',
    emptyError: 'سبد خالی است',
    nameRequired: 'نام را وارد کنید',
    invalidPhone: 'شماره موبایل معتبر نیست',
    sendFailed: 'ارسال ناموفق بود',
    sendError: 'خطا در ارسال',
    panelLabel: 'سبد پیش‌فاکتور',
    rows: '{n} ردیف',
    emptyCart: 'سبد خالی',
    close: 'بستن',
    doneTitle: 'پیش‌فاکتور آماده است',
    doneText: 'الان می‌توانید پیش‌فاکتور را ببینید. پس از تأیید کارشناس، روی همان لینک فاکتور نهایی نمایش داده می‌شود.',
    whatsappCta: 'ارسال به واتس‌اپ فروش برای پیگیری سریع‌تر',
    viewQuote: 'مشاهده پیش‌فاکتور',
    emptyHint: 'از جدول قیمت، ردیف‌ها را با دکمه «سفارش» اضافه کنید.',
    remove: 'حذف',
    decrease: 'کم',
    quantity: 'متراژ',
    increase: 'زیاد',
    unit: 'متر',
    toman: 'تومان',
    subtotal: 'جمع کالا',
    vat: 'ارزش افزوده {rate}٪',
    total: 'جمع کل',
    namePlaceholder: 'نام و نام خانوادگی',
    phonePlaceholder: 'موبایل',
    messagePlaceholder: 'توضیحات (اختیاری)',
    submit: 'درخواست پیش‌فاکتور',
    footnote: 'بلافاصله پیش‌فاکتور را می‌بینید؛ فاکتور نهایی بعد از تأیید کارشناس صادر می‌شود.',
  },
  en: {
    added: 'Added to your quote',
    quote: 'Quote',
    whatsappText: 'Hello, I have submitted quote request {number}.\nName: {name}\nMobile: {phone}\n{url}',
    emptyError: 'Your quote is empty',
    nameRequired: 'Please enter your name',
    invalidPhone: 'Please enter a valid mobile number',
    sendFailed: 'Your request could not be sent',
    sendError: 'Something went wrong while sending',
    panelLabel: 'Quote cart',
    rows: '{n} items',
    emptyCart: 'Empty',
    close: 'Close',
    doneTitle: 'Your quote is ready',
    doneText: 'You can view your quote now. Once our sales specialist approves it, the final invoice will appear at the same link.',
    whatsappCta: 'Send to sales on WhatsApp for faster follow-up',
    viewQuote: 'View quote',
    emptyHint: 'Add rows from the price list using the “Order” button.',
    remove: 'Remove',
    decrease: 'Decrease',
    quantity: 'Length in metres',
    increase: 'Increase',
    unit: 'm',
    toman: 'Toman',
    subtotal: 'Subtotal',
    vat: 'VAT {rate}%',
    total: 'Total',
    namePlaceholder: 'Full name',
    phonePlaceholder: 'Mobile',
    messagePlaceholder: 'Notes (optional)',
    submit: 'Request a quote',
    footnote: 'You will see your quote right away; the final invoice is issued once our specialist approves it.',
  },
});

export type CartLine = {
  priceItemId: string;
  productId: string;
  productName: string;
  title: string;
  unitPrice: number;
  quantity: number;
  note: string;
};

type QuoteCartContext = {
  lines: CartLine[];
  count: number;
  /** افزودن به سبد؛ اگر ردیف بود، یک متر اضافه می‌شود و پنل باز می‌شود */
  add: (line: Omit<CartLine, 'quantity'> & { quantity?: number }) => void;
  open: () => void;
};

const Ctx = createContext<QuoteCartContext>({ lines: [], count: 0, add: () => {}, open: () => {} });
export const useQuoteCart = () => useContext(Ctx);

const STORAGE_KEY = 'quote-cart-v1';
const fieldCls =
  'w-full h-11 rounded-xl bg-[var(--muted)] border border-[var(--border)] px-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--accent)]';

function loadCart(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartLine[];
    return Array.isArray(parsed) ? parsed.filter((l) => l.priceItemId && l.unitPrice > 0) : [];
  } catch {
    return [];
  }
}

export function QuoteCartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [panelOpen, setPanelOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const locale = useLocale();
  const t = messages[locale];

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setLines(loadCart());
      setHydrated(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  const add = useCallback((line: Omit<CartLine, 'quantity'> & { quantity?: number }) => {
    setLines((prev) => {
      const i = prev.findIndex((l) => l.priceItemId === line.priceItemId);
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i], quantity: next[i].quantity + (line.quantity ?? 1) };
        return next;
      }
      return [...prev, { ...line, quantity: line.quantity ?? 1 }];
    });
    setPanelOpen(true);
    toast.success(t.added);
  }, [t]);

  const value = useMemo(
    () => ({ lines, count: lines.reduce((s, l) => s + l.quantity, 0), add, open: () => setPanelOpen(true) }),
    [lines, add],
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      {hydrated && lines.length > 0 && !panelOpen && (
        <button
          onClick={() => setPanelOpen(true)}
          className="fixed z-40 bottom-24 end-4 sm:bottom-8 sm:end-8 h-14 pe-4 ps-5 rounded-2xl bg-[var(--accent)] text-[var(--accent-foreground)] shadow-lg flex items-center gap-2.5 font-bold text-sm print:hidden"
        >
          <ShoppingBag className="w-5 h-5 shrink-0" />
          <span>{t.quote}</span>
          <span className="grid place-items-center min-w-6 h-6 px-1.5 rounded-lg bg-black/15 text-xs num leading-none">
            {formatNumber(Math.round(value.count), locale)}
          </span>
        </button>
      )}
      <QuoteCartPanel open={panelOpen} lines={lines} setLines={setLines} onClose={() => setPanelOpen(false)} />
    </Ctx.Provider>
  );
}

function QuoteCartPanel({
  open,
  lines,
  setLines,
  onClose,
}: {
  open: boolean;
  lines: CartLine[];
  setLines: React.Dispatch<React.SetStateAction<CartLine[]>>;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');
  const [doneHref, setDoneHref] = useState('');
  const [doneNumber, setDoneNumber] = useState('');
  const { whatsappUrl } = useSiteSettings();
  const locale = useLocale();
  const t = messages[locale];
  // بدون پنل پیامک: مشتری با یک کلیک درخواست را در واتس‌اپ فروش می‌فرستد تا فروش همان لحظه خبردار شود
  const whatsappDone = doneHref && whatsappUrl
    ? `${whatsappUrl}?text=${encodeURIComponent(
        fill(t.whatsappText, {
          number: doneNumber,
          name,
          phone,
          url: typeof window !== 'undefined' ? new URL(doneHref, window.location.origin).href : doneHref,
        }),
      )}`
    : '';

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  const subtotal = lines.reduce((s, l) => s + Math.round(l.unitPrice * l.quantity), 0);
  const vatAmount = Math.round(subtotal * (DEFAULT_VAT_RATE / 100));
  const total = subtotal + vatAmount;

  const setQty = (id: string, quantity: number) => {
    if (quantity <= 0) setLines((prev) => prev.filter((l) => l.priceItemId !== id));
    else setLines((prev) => prev.map((l) => (l.priceItemId === id ? { ...l, quantity } : l)));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lines.length) return setError(t.emptyError);
    const phoneDigits = latinDigits(phone).replace(/\D/g, '');
    if (!name.trim()) return setError(t.nameRequired);
    if (!/^0?9\d{9}$/.test(phoneDigits)) return setError(t.invalidPhone);

    setStatus('sending');
    setError('');
    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name.trim(),
          customerPhone: phoneDigits.startsWith('0') ? phoneDigits : `0${phoneDigits}`,
          customerMessage: message.trim(),
          sourcePath: typeof window !== 'undefined' ? window.location.pathname : '',
          items: lines.map((l) => ({
            priceItemId: l.priceItemId,
            productId: l.productId,
            title: l.title,
            unitPrice: l.unitPrice,
            quantity: l.quantity,
            note: l.note,
          })),
        }),
      });
      const json = await res.json().catch(() => ({}));
      // پیام خطای API فارسی است؛ نسخه انگلیسی پیام کلی خودش را نشان می‌دهد
      if (!res.ok || !json.success) throw new Error((locale === 'fa' && json.error) || t.sendFailed);
      setLines([]);
      localStorage.removeItem(STORAGE_KEY);
      setDoneHref(localizePath(String(json.data?.publicUrl || `/q/${json.data?.token || ''}`), locale));
      setDoneNumber(String(json.data?.number || ''));
      setStatus('done');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : t.sendError);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50" onClick={onClose} />
          {/* پنل از لبه انتهایی صفحه (چپِ فارسی، راستِ انگلیسی) باز می‌شود */}
          <motion.aside
            initial={{ x: locale === 'fa' ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: locale === 'fa' ? '-100%' : '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 340 }}
            className="fixed z-50 inset-y-0 end-0 w-full max-w-[26rem] bg-[var(--background)] border-e border-[var(--border)] shadow-2xl flex flex-col"
            role="dialog"
            aria-label={t.panelLabel}
          >
            {/* هدر تراز */}
            <div className="h-16 shrink-0 px-5 border-b border-[var(--border)] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <IconTile icon={FileSpreadsheet} size="sm" />
                <div className="min-w-0">
                  <h2 className="font-black text-base leading-none">{t.quote}</h2>
                  <p className="text-[11px] text-[var(--muted-foreground)] mt-1 num leading-none">
                    {lines.length ? fill(t.rows, { n: formatNumber(lines.length, locale) }) : t.emptyCart}
                  </p>
                </div>
              </div>
              <button onClick={onClose} aria-label={t.close} className="w-10 h-10 grid place-items-center rounded-xl hover:bg-[var(--muted)] shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>

            {status === 'done' ? (
              <div className="flex-1 grid place-items-center p-8 text-center">
                <div className="max-w-xs">
                  <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto mb-4" />
                  <p className="font-black text-lg">{t.doneTitle}</p>
                  {doneNumber && <p className="mt-1 text-xs text-[var(--muted-foreground)] num">{doneNumber}</p>}
                  <p className="mt-2 text-sm text-[var(--muted-foreground)] leading-7">
                    {t.doneText}
                  </p>
                  <div className="mt-6 flex flex-col gap-2">
                    {whatsappDone && (
                      <a
                        href={whatsappDone}
                        target="_blank"
                        rel="noopener"
                        className="h-11 px-6 rounded-xl bg-emerald-600 text-white font-bold text-sm flex items-center justify-center gap-2"
                      >
                        <MessageCircle className="w-4 h-4" />
                        {t.whatsappCta}
                      </a>
                    )}
                    {doneHref && (
                      <a
                        href={doneHref}
                        className="h-11 px-6 rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] font-bold text-sm grid place-items-center"
                      >
                        {t.viewQuote}
                      </a>
                    )}
                    <button onClick={onClose} className="h-11 px-6 rounded-xl bg-[var(--muted)] font-bold text-sm">
                      {t.close}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto">
                  {!lines.length ? (
                    <p className="px-5 py-16 text-center text-sm text-[var(--muted-foreground)] leading-7">
                      {t.emptyHint}
                    </p>
                  ) : (
                    <ul className="divide-y divide-[var(--border)]">
                      {lines.map((l) => {
                        const lineTotal = Math.round(l.unitPrice * l.quantity);
                        return (
                          <li key={l.priceItemId} className="px-5 py-4">
                            <div className="flex items-start gap-3">
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-bold leading-6">{digits(l.title, locale)}</p>
                                <p className="text-[11px] text-[var(--muted-foreground)] mt-1">{l.productName}</p>
                              </div>
                              <button
                                onClick={() => setQty(l.priceItemId, 0)}
                                aria-label={t.remove}
                                className="w-9 h-9 grid place-items-center rounded-xl text-[var(--muted-foreground)] hover:text-red-600 hover:bg-red-500/10 shrink-0"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="mt-3 grid grid-cols-[auto_1fr] items-center gap-3">
                              <div className="flex items-center gap-1.5" dir="ltr">
                                <button
                                  type="button"
                                  onClick={() => setQty(l.priceItemId, l.quantity - 1)}
                                  className="w-9 h-9 grid place-items-center rounded-xl bg-[var(--muted)] border border-[var(--border)]"
                                  aria-label={t.decrease}
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <input
                                  value={digits(String(l.quantity), locale)}
                                  onChange={(e) => {
                                    const n = Number(latinDigits(e.target.value).replace(/[^\d.]/g, ''));
                                    if (Number.isFinite(n) && n > 0) setQty(l.priceItemId, n);
                                  }}
                                  className="w-14 h-9 text-center rounded-xl border border-[var(--border)] bg-[var(--muted)] text-sm font-bold num"
                                  aria-label={t.quantity}
                                />
                                <button
                                  type="button"
                                  onClick={() => setQty(l.priceItemId, l.quantity + 1)}
                                  className="w-9 h-9 grid place-items-center rounded-xl bg-[var(--muted)] border border-[var(--border)]"
                                  aria-label={t.increase}
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                                <span className="text-xs text-[var(--muted-foreground)] ms-1">{t.unit}</span>
                              </div>
                              {/* dir=ltr برای ترتیب «عدد تومان»؛ تراز به انتهای ردیف هر زبان */}
                              <p className={cn('text-sm font-black num whitespace-nowrap', locale === 'fa' ? 'text-left' : 'text-right')} dir="ltr">
                                {formatNumber(lineTotal, locale)}
                                <span className="text-[11px] font-medium text-[var(--muted-foreground)] ms-1">{t.toman}</span>
                              </p>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                <form onSubmit={submit} className="shrink-0 border-t border-[var(--border)] bg-[var(--card)]">
                  <div className="px-5 py-3 space-y-1.5 text-sm num border-b border-[var(--border)]">
                    {DEFAULT_VAT_RATE > 0 && (
                      <>
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-[var(--muted-foreground)]">{t.subtotal}</span>
                          <span>{formatNumber(subtotal, locale)} {t.toman}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-[var(--muted-foreground)]">{fill(t.vat, { rate: digits(DEFAULT_VAT_RATE, locale) })}</span>
                          <span>{formatNumber(vatAmount, locale)} {t.toman}</span>
                        </div>
                      </>
                    )}
                    <div className={cn('flex items-center justify-between gap-3 font-black', DEFAULT_VAT_RATE > 0 && 'pt-1')}>
                      <span>{t.total}</span>
                      <span>{formatNumber(total, locale)} {t.toman}</span>
                    </div>
                  </div>

                  <div className="px-5 py-4 space-y-2.5">
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t.namePlaceholder} className={fieldCls} />
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t.phonePlaceholder} inputMode="tel" dir="ltr" className={cn(fieldCls, 'text-left')} />
                    <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder={t.messagePlaceholder} rows={2} className={cn(fieldCls, 'h-auto py-2.5 resize-none')} />
                    {error && <p className="text-xs text-red-600">{error}</p>}
                    <button
                      disabled={!lines.length || status === 'sending'}
                      className="w-full h-12 rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] font-bold text-sm disabled:opacity-40 flex items-center justify-center gap-2"
                    >
                      {status === 'sending' ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      {t.submit}
                    </button>
                    <p className="text-[11px] text-[var(--muted-foreground)] leading-5 text-center">
                      {t.footnote}
                    </p>
                  </div>
                </form>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
