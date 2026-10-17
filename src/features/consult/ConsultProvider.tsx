'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { AnimatePresence, m as motion } from 'framer-motion';
import Image from 'next/image';
import { CheckCircle2, Loader2, X } from 'lucide-react';
import { useSiteSettings } from '@/shared/providers/SiteSettingsProvider';
import { faDigits } from '@/shared/lib/utils';
import { siteConfig } from '@/shared/config/site';

type ConsultContext = { open: (product?: string) => void };

const Ctx = createContext<ConsultContext>({ open: () => {} });

export const useConsult = () => useContext(Ctx);

/**
 * فرم «درخواست مشاوره و خرید» سراسری — از هدر، نوار پایین موبایل، هیرو و صفحه محصول باز می‌شود.
 * در موبایل به صورت bottom sheet و در دسکتاپ به صورت پنجره وسط صفحه.
 * درخواست در همان جدول پیام‌های تماس (ContactMessage) ثبت می‌شود و در پنل «پیام‌ها» دیده می‌شود.
 */
export function ConsultProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const [product, setProduct] = useState('');
  // هر بار باز شدن فرم را از نو mount می‌کند تا state قبلی (پیام موفقیت، خطا) پاک شود
  const [session, setSession] = useState(0);

  const open = (p?: string) => {
    setProduct(p ?? '');
    setSession((n) => n + 1);
    setOpen(true);
  };

  return (
    <Ctx.Provider value={{ open }}>
      {children}
      <ConsultSheet key={session} open={isOpen} product={product} onClose={() => setOpen(false)} />
    </Ctx.Provider>
  );
}

function ConsultSheet({ open, product, onClose }: { open: boolean; product: string; onClose: () => void }) {
  const { phone, phoneHref } = useSiteSettings();
  const [name, setName] = useState('');
  const [tel, setTel] = useState('');
  const [message, setMessage] = useState(product ? `درخواست قیمت و مشاوره برای «${product}»` : '');
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');

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

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const digits = tel.replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).replace(/\D/g, '');
    if (!name.trim()) return setError('نام را وارد کنید');
    if (!/^0?9\d{9}$/.test(digits)) return setError('شماره موبایل معتبر نیست');

    setStatus('sending');
    setError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: digits,
          subject: product ? `مشاوره خرید: ${product}` : 'درخواست مشاوره',
          message: message.trim() || 'درخواست تماس برای مشاوره',
          sourcePath: window.location.pathname,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) throw new Error(json.error || 'ارسال ناموفق بود');
      setStatus('done');
      setName('');
      setTel('');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'ارسال ناموفق بود');
    }
  };

  const field =
    'w-full h-12 rounded-2xl bg-[var(--muted)] border border-[var(--border)] px-4 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--accent)] transition-colors';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button aria-label="بستن" onClick={onClose} className="absolute inset-0 bg-black/55 backdrop-blur-sm" />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="consult-title"
            className="relative w-full sm:max-w-md bg-[var(--background)] rounded-t-[var(--radius-sheet)] sm:rounded-3xl shadow-2xl safe-pb"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
          >
            <div className="sm:hidden mx-auto mt-3 h-1.5 w-12 rounded-full bg-[var(--border)]" />
            <div className="flex items-start justify-between gap-4 px-6 pt-5">
              <div className="flex items-center gap-3">
                <Image
                  src="/images/site/sales-expert-avatar.webp"
                  alt={siteConfig.salesExpert.name}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-2xl object-cover ring-2 ring-[var(--accent)] shrink-0"
                />
                <div>
                  <h2 id="consult-title" className="text-lg font-black">درخواست مشاوره و خرید</h2>
                  <p className="text-xs text-[var(--muted-foreground)] flex items-center gap-1.5">
                    <span className="live-dot" />
                    {siteConfig.salesExpert.name}، {siteConfig.salesExpert.role}، در کمترین زمان تماس می‌گیرد
                  </p>
                </div>
              </div>
              <button onClick={onClose} aria-label="بستن" className="grid place-items-center w-9 h-9 rounded-xl hover:bg-[var(--muted)]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {status === 'done' ? (
              <div className="px-6 py-10 text-center">
                <CheckCircle2 className="w-14 h-14 mx-auto text-emerald-500" />
                <p className="mt-4 font-bold">درخواست شما ثبت شد</p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">به‌زودی با شما تماس می‌گیریم.</p>
                <button onClick={onClose} className="mt-6 h-11 px-8 rounded-2xl bg-[var(--foreground)] text-[var(--background)] font-bold">
                  بستن
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="px-6 pt-5 pb-6 space-y-3">
                <input className={field} placeholder="نام و نام خانوادگی" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
                <input
                  className={`${field} ltr-field`}
                  type="tel"
                  inputMode="tel"
                  placeholder="شماره موبایل — مثلاً ۰۹۱۲۱۲۳۴۵۶۷"
                  aria-label="شماره موبایل"
                  value={tel}
                  onChange={(e) => setTel(faDigits(e.target.value))}
                  autoComplete="tel"
                />
                <textarea
                  className={`${field} h-24 py-3 resize-none`}
                  placeholder="محصول یا پروژه مورد نظر (اختیاری)"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                {error && <p className="text-sm text-red-500">{error}</p>}
                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="w-full h-12 rounded-2xl bg-[var(--accent)] text-[var(--accent-foreground)] font-black shadow-accent disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {status === 'sending' && <Loader2 className="w-5 h-5 animate-spin" />}
                  ثبت درخواست
                </button>
                <a href={phoneHref} className="block text-center text-sm text-[var(--muted-foreground)] pt-1">
                  یا تماس مستقیم: <span dir="ltr" className="font-bold text-[var(--foreground)] num">{faDigits(phone)}</span>
                </a>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
