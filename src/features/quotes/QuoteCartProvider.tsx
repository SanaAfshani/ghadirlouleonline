'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, m as motion } from 'framer-motion';
import { CheckCircle2, FileSpreadsheet, Loader2, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn, faDigits, formatPersianNumber, latinDigits } from '@/shared/lib/utils';
import { DEFAULT_VAT_RATE } from '@/shared/lib/quote-constants';
import { IconTile } from '@/shared/ui/IconTile';

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
    toast.success('به پیش‌فاکتور اضافه شد');
  }, []);

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
          className="fixed z-40 bottom-24 left-4 sm:bottom-8 sm:left-8 h-14 pl-4 pr-5 rounded-2xl bg-[var(--accent)] text-[var(--accent-foreground)] shadow-lg flex items-center gap-2.5 font-bold text-sm print:hidden"
        >
          <ShoppingBag className="w-5 h-5 shrink-0" />
          <span>پیش‌فاکتور</span>
          <span className="grid place-items-center min-w-6 h-6 px-1.5 rounded-lg bg-black/15 text-xs num leading-none">
            {formatPersianNumber(Math.round(value.count))}
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
    if (!lines.length) return setError('سبد خالی است');
    const digits = latinDigits(phone).replace(/\D/g, '');
    if (!name.trim()) return setError('نام را وارد کنید');
    if (!/^0?9\d{9}$/.test(digits)) return setError('شماره موبایل معتبر نیست');

    setStatus('sending');
    setError('');
    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name.trim(),
          customerPhone: digits.startsWith('0') ? digits : `0${digits}`,
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
      if (!res.ok || !json.success) throw new Error(json.error || 'ارسال ناموفق بود');
      setLines([]);
      localStorage.removeItem(STORAGE_KEY);
      setDoneHref(String(json.data?.publicUrl || `/q/${json.data?.token || ''}`));
      setDoneNumber(String(json.data?.number || ''));
      setStatus('done');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'خطا در ارسال');
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50" onClick={onClose} />
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 340 }}
            className="fixed z-50 inset-y-0 left-0 w-full max-w-[26rem] bg-[var(--background)] border-l border-[var(--border)] shadow-2xl flex flex-col"
            role="dialog"
            aria-label="سبد پیش‌فاکتور"
          >
            {/* هدر تراز */}
            <div className="h-16 shrink-0 px-5 border-b border-[var(--border)] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <IconTile icon={FileSpreadsheet} size="sm" />
                <div className="min-w-0">
                  <h2 className="font-black text-base leading-none">پیش‌فاکتور</h2>
                  <p className="text-[11px] text-[var(--muted-foreground)] mt-1 num leading-none">
                    {lines.length ? `${formatPersianNumber(lines.length)} ردیف` : 'سبد خالی'}
                  </p>
                </div>
              </div>
              <button onClick={onClose} aria-label="بستن" className="w-10 h-10 grid place-items-center rounded-xl hover:bg-[var(--muted)] shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>

            {status === 'done' ? (
              <div className="flex-1 grid place-items-center p-8 text-center">
                <div className="max-w-xs">
                  <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto mb-4" />
                  <p className="font-black text-lg">پیش‌فاکتور آماده است</p>
                  {doneNumber && <p className="mt-1 text-xs text-[var(--muted-foreground)] num">{doneNumber}</p>}
                  <p className="mt-2 text-sm text-[var(--muted-foreground)] leading-7">
                    الان می‌توانید پیش‌فاکتور را ببینید. پس از تأیید کارشناس، روی همان لینک فاکتور نهایی نمایش داده می‌شود.
                  </p>
                  <div className="mt-6 flex flex-col gap-2">
                    {doneHref && (
                      <a
                        href={doneHref}
                        className="h-11 px-6 rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] font-bold text-sm grid place-items-center"
                      >
                        مشاهده پیش‌فاکتور
                      </a>
                    )}
                    <button onClick={onClose} className="h-11 px-6 rounded-xl bg-[var(--muted)] font-bold text-sm">
                      بستن
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto">
                  {!lines.length ? (
                    <p className="px-5 py-16 text-center text-sm text-[var(--muted-foreground)] leading-7">
                      از جدول قیمت، ردیف‌ها را با دکمه «سفارش» اضافه کنید.
                    </p>
                  ) : (
                    <ul className="divide-y divide-[var(--border)]">
                      {lines.map((l) => {
                        const lineTotal = Math.round(l.unitPrice * l.quantity);
                        return (
                          <li key={l.priceItemId} className="px-5 py-4">
                            <div className="flex items-start gap-3">
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-bold leading-6">{faDigits(l.title)}</p>
                                <p className="text-[11px] text-[var(--muted-foreground)] mt-1">{l.productName}</p>
                              </div>
                              <button
                                onClick={() => setQty(l.priceItemId, 0)}
                                aria-label="حذف"
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
                                  aria-label="کم"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <input
                                  value={faDigits(String(l.quantity))}
                                  onChange={(e) => {
                                    const n = Number(latinDigits(e.target.value).replace(/[^\d.]/g, ''));
                                    if (Number.isFinite(n) && n > 0) setQty(l.priceItemId, n);
                                  }}
                                  className="w-14 h-9 text-center rounded-xl border border-[var(--border)] bg-[var(--muted)] text-sm font-bold num"
                                  aria-label="متراژ"
                                />
                                <button
                                  type="button"
                                  onClick={() => setQty(l.priceItemId, l.quantity + 1)}
                                  className="w-9 h-9 grid place-items-center rounded-xl bg-[var(--muted)] border border-[var(--border)]"
                                  aria-label="زیاد"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                                <span className="text-xs text-[var(--muted-foreground)] ms-1">متر</span>
                              </div>
                              <p className="text-sm font-black num text-left whitespace-nowrap" dir="ltr">
                                {lineTotal.toLocaleString('fa-IR')}
                                <span className="text-[11px] font-medium text-[var(--muted-foreground)] ms-1">تومان</span>
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
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[var(--muted-foreground)]">جمع کالا</span>
                      <span>{subtotal.toLocaleString('fa-IR')} تومان</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[var(--muted-foreground)]">ارزش افزوده {faDigits(String(DEFAULT_VAT_RATE))}٪</span>
                      <span>{vatAmount.toLocaleString('fa-IR')} تومان</span>
                    </div>
                    <div className="flex items-center justify-between gap-3 font-black pt-1">
                      <span>جمع کل</span>
                      <span>{total.toLocaleString('fa-IR')} تومان</span>
                    </div>
                  </div>

                  <div className="px-5 py-4 space-y-2.5">
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="نام و نام خانوادگی" className={fieldCls} />
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="موبایل" inputMode="tel" dir="ltr" className={cn(fieldCls, 'text-left')} />
                    <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="توضیحات (اختیاری)" rows={2} className={cn(fieldCls, 'h-auto py-2.5 resize-none')} />
                    {error && <p className="text-xs text-red-600">{error}</p>}
                    <button
                      disabled={!lines.length || status === 'sending'}
                      className="w-full h-12 rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] font-bold text-sm disabled:opacity-40 flex items-center justify-center gap-2"
                    >
                      {status === 'sending' ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      درخواست پیش‌فاکتور
                    </button>
                    <p className="text-[11px] text-[var(--muted-foreground)] leading-5 text-center">
                      بلافاصله پیش‌فاکتور را می‌بینید؛ فاکتور نهایی بعد از تأیید کارشناس صادر می‌شود.
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
