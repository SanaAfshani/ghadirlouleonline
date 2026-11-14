'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { AnimatePresence, m as motion } from 'framer-motion';
import Image from 'next/image';
import { CheckCircle2, Loader2, X } from 'lucide-react';
import { useSiteSettings } from '@/shared/providers/SiteSettingsProvider';
import { RubikaButton } from '@/shared/ui/RubikaButton';
import { RubikaIcon } from '@/shared/ui/RubikaIcon';
import { useLocale, useMessages } from '@/shared/i18n/LocaleProvider';
import { defineMessages, fill } from '@/shared/i18n/messages';
import { digits } from '@/shared/i18n/format';

const messages = defineMessages({
  fa: {
    productMessage: 'درخواست قیمت و مشاوره برای «{product}»',
    nameRequired: 'نام را وارد کنید',
    invalidMobile: 'شماره موبایل معتبر نیست',
    failed: 'ارسال ناموفق بود',
    close: 'بستن',
    title: 'درخواست مشاوره و خرید',
    expertNote: '{name}، {role}، در کمترین زمان تماس می‌گیرد',
    doneTitle: 'درخواست شما ثبت شد',
    doneText: 'به‌زودی با شما تماس می‌گیریم.',
    name: 'نام و نام خانوادگی',
    mobile: 'شماره موبایل',
    mobilePlaceholder: 'شماره موبایل — مثلاً ۰۹۱۲۱۲۳۴۵۶۷',
    messagePlaceholder: 'محصول یا پروژه مورد نظر (اختیاری)',
    submit: 'ثبت درخواست',
    directCall: 'یا تماس مستقیم:',
    rubika: 'روبیکا:',
  },
  en: {
    productMessage: 'Price and advice request for “{product}”',
    nameRequired: 'Please enter your name',
    invalidMobile: 'Please enter a valid Iranian mobile number',
    failed: 'Sending failed',
    close: 'Close',
    title: 'Request advice and a quote',
    expertNote: '{name}, {role}, will call you back shortly',
    doneTitle: 'Your request has been received',
    doneText: 'We will contact you soon.',
    name: 'Full name',
    mobile: 'Mobile number',
    mobilePlaceholder: 'Mobile number, e.g. 09121234567',
    messagePlaceholder: 'Product or project you are interested in (optional)',
    submit: 'Send request',
    directCall: 'Or call us directly:',
    rubika: 'Rubika:',
  },
});

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
  const { phone, phoneHref, salesExpertName, salesExpertRole, rubikaId } = useSiteSettings();
  const locale = useLocale();
  const t = useMessages(messages);
  const [name, setName] = useState('');
  const [tel, setTel] = useState('');
  const [message, setMessage] = useState(product ? fill(t.productMessage, { product }) : '');
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
    const mobile = tel.replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).replace(/\D/g, '');
    if (!name.trim()) return setError(t.nameRequired);
    if (!/^0?9\d{9}$/.test(mobile)) return setError(t.invalidMobile);

    setStatus('sending');
    setError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: mobile,
          // موضوع و متن پیش‌فرض برای پنل ادمین است (فارسی) — زبان صفحه از sourcePath (/en/...) پیداست
          subject: product ? `مشاوره خرید: ${product}` : 'درخواست مشاوره',
          message: message.trim() || 'درخواست تماس برای مشاوره',
          sourcePath: window.location.pathname,
        }),
      });
      const json = await res.json().catch(() => ({}));
      // پیام خطای API فارسی است؛ در نسخه انگلیسی پیام عمومی
      if (!res.ok || !json.success) throw new Error((locale === 'fa' && json.error) || t.failed);
      setStatus('done');
      setName('');
      setTel('');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : t.failed);
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
          <button aria-label={t.close} onClick={onClose} className="absolute inset-0 bg-black/55 backdrop-blur-sm" />
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
                  alt={salesExpertName}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-2xl object-cover ring-2 ring-[var(--accent)] shrink-0"
                />
                <div>
                  <h2 id="consult-title" className="text-lg font-black">{t.title}</h2>
                  <p className="text-xs text-[var(--muted-foreground)] flex items-center gap-1.5">
                    <span className="live-dot" />
                    {fill(t.expertNote, { name: salesExpertName, role: salesExpertRole })}
                  </p>
                </div>
              </div>
              <button onClick={onClose} aria-label={t.close} className="grid place-items-center w-9 h-9 rounded-xl hover:bg-[var(--muted)]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {status === 'done' ? (
              <div className="px-6 py-10 text-center">
                <CheckCircle2 className="w-14 h-14 mx-auto text-emerald-500" />
                <p className="mt-4 font-bold">{t.doneTitle}</p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">{t.doneText}</p>
                <button onClick={onClose} className="mt-6 h-11 px-8 rounded-2xl bg-[var(--foreground)] text-[var(--background)] font-bold">
                  {t.close}
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="px-6 pt-5 pb-6 space-y-3">
                <input className={field} placeholder={t.name} aria-label={t.name} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
                <input
                  className={`${field} ltr-field`}
                  type="tel"
                  inputMode="tel"
                  placeholder={t.mobilePlaceholder}
                  aria-label={t.mobile}
                  value={tel}
                  onChange={(e) => setTel(digits(e.target.value, locale))}
                  autoComplete="tel"
                />
                <textarea
                  className={`${field} h-24 py-3 resize-none`}
                  placeholder={t.messagePlaceholder}
                  aria-label={t.messagePlaceholder}
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
                  {t.submit}
                </button>
                <a href={phoneHref} className="block text-center text-sm text-[var(--muted-foreground)] pt-1">
                  {t.directCall} <span dir="ltr" className="font-bold text-[var(--foreground)] num">{digits(phone, locale)}</span>
                </a>
                <RubikaButton className="mx-auto flex items-center justify-center gap-1.5 text-sm text-[var(--muted-foreground)]">
                  <RubikaIcon className="w-4" />
                  {t.rubika} <span dir="ltr" className="font-bold text-[var(--foreground)]">{rubikaId}</span>
                </RubikaButton>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
