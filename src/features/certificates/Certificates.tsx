'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, m as motion } from 'framer-motion';
import { BadgeCheck, ChevronLeft, X } from 'lucide-react';
import type { Certificate } from '@/shared/lib/site-settings';
import { cn } from '@/shared/lib/utils';
import { Link } from '@/shared/i18n/Link';
import type { Locale } from '@/shared/i18n/config';
import { digits } from '@/shared/i18n/format';
import { defineMessages, fill } from '@/shared/i18n/messages';
import { useLocale, useMessages } from '@/shared/i18n/LocaleProvider';

/** آنچه کارت گواهی نمایش می‌دهد — title همان عنوانِ به زبان صفحه است (mergeSiteSettings) */
type CertificateCard = Pick<Certificate, 'title' | 'code' | 'image'>;

const messages = defineMessages({
  fa: {
    close: 'بستن',
    allCertificates: 'همه گواهی‌ها',
    stripTitle: 'گواهینامه‌ها و استانداردها',
    view: 'مشاهده {title}',
  },
  en: {
    close: 'Close',
    allCertificates: 'All certificates',
    stripTitle: 'Certificates and standards',
    view: 'View {title}',
  },
});

/** کد استاندارد لاتین (ISO 9001، ISIRI 9116-3) با ارقام لاتین می‌ماند — همین شکل جستجو می‌شود؛ فقط کد تمام‌فارسی ارقام فارسی می‌گیرد */
const codeText = (code: string, locale: Locale) => (/[A-Za-z]/.test(code) ? code : digits(code, locale));

/** نمایش بزرگ عکس گواهی */
function CertificateViewer({ cert, onClose }: { cert: CertificateCard | null; onClose: () => void }) {
  const locale = useLocale();
  const t = useMessages(messages);
  useEffect(() => {
    if (!cert) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [cert, onClose]);

  return (
    <AnimatePresence>
      {cert && (
        <motion.div role="dialog" aria-modal="true" aria-label={cert.title} className="fixed inset-0 z-[80] bg-black/85 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button aria-label={t.close} onClick={onClose} className="absolute inset-0 cursor-zoom-out" />
          <div className="pointer-events-none absolute inset-x-4 top-16 bottom-20 sm:inset-x-12">
            <Image src={cert.image} alt={cert.title} fill sizes="100vw" quality={90} className="object-contain" />
          </div>
          <p className="absolute bottom-6 inset-x-0 text-center text-white font-bold px-4">
            {cert.title}
            {cert.code && <span dir="ltr" className="block text-sm font-normal text-white/70">{codeText(cert.code, locale)}</span>}
          </p>
          <button onClick={onClose} aria-label={t.close} className="absolute top-4 end-4 grid place-items-center w-11 h-11 rounded-full bg-black/60 ring-1 ring-white/25 text-white"><X className="w-5 h-5" /></button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function useViewer() {
  const [open, setOpen] = useState<CertificateCard | null>(null);
  const close = useCallback(() => setOpen(null), []);
  return { open, setOpen, close };
}

/** شبکه کامل گواهی‌ها برای صفحه /certificates */
/** columns="single": یک سند تنها (مثل گواهی نمایندگی کنار توضیحش) تمام عرض ستون خودش را می‌گیرد */
export function CertificatesGrid({ certificates, columns = 'grid' }: { certificates: CertificateCard[]; columns?: 'grid' | 'single' }) {
  const locale = useLocale();
  const { open, setOpen, close } = useViewer();
  return (
    <>
      <div className={columns === 'single' ? 'grid gap-4' : 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6'}>
        {certificates.map((c) => (
          <button key={c.image} onClick={() => setOpen(c)} className="group text-start rounded-3xl border border-[var(--border)] bg-[var(--card)] p-3 transition-all hover:-translate-y-1 hover:shadow-xl hover:border-[var(--accent)]/40">
            <span className="relative block aspect-[3/4] rounded-2xl overflow-hidden bg-white">
              <Image src={c.image} alt={c.title} fill sizes="(min-width: 1024px) 280px, 50vw" className="object-contain p-2 transition-transform duration-500 group-hover:scale-105" />
            </span>
            <span className="mt-3 flex items-start gap-1.5 font-black text-sm leading-6"><BadgeCheck className="w-4.5 h-4.5 mt-0.5 shrink-0 text-emerald-600" />{c.title}</span>
            {c.code && (
              <span className="block text-xs text-[var(--muted-foreground)]">
                <span dir="ltr">{codeText(c.code, locale)}</span>
              </span>
            )}
          </button>
        ))}
      </div>
      <CertificateViewer cert={open} onClose={close} />
    </>
  );
}

/**
 * نوار نشان‌ها: استانداردهای محصول (از مشخصات) + بندانگشتی گواهی‌های واقعی.
 * tone=dark برای فوتر. بدون هیچ گواهی و استانداردی چیزی نمایش داده نمی‌شود.
 */
export function CertificateStrip({ certificates, standards = [], tone = 'light', title }: {
  certificates: CertificateCard[];
  standards?: string[];
  tone?: 'light' | 'dark';
  title?: string;
}) {
  const locale = useLocale();
  const t = useMessages(messages);
  const { open, setOpen, close } = useViewer();
  if (!certificates.length && !standards.length) return null;
  const dark = tone === 'dark';
  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-3">
        <p className={cn('flex items-center gap-2 font-black text-sm', dark ? 'text-white' : 'text-[var(--foreground)]')}>
          <BadgeCheck className="w-5 h-5 text-emerald-500" />
          {title ?? t.stripTitle}
        </p>
        {certificates.length > 0 && (
          <Link href="/certificates" className={cn('text-xs font-bold flex items-center gap-0.5', dark ? 'text-slate-300 hover:text-white' : 'text-[var(--accent-text)]')}>
            {t.allCertificates} <ChevronLeft className="w-3.5 h-3.5 ltr:rotate-180" />
          </Link>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2.5">
        {standards.map((s) => (
          <span key={s} className={cn('h-9 px-3 rounded-xl text-xs font-black flex items-center gap-1.5 num border', dark ? 'border-white/15 bg-white/5 text-white' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300')}>
            <BadgeCheck className="w-4 h-4" />
            {codeText(s, locale)}
          </span>
        ))}
        {certificates.slice(0, 6).map((c) => (
          <button
            key={c.image}
            onClick={() => setOpen(c)}
            title={c.title}
            aria-label={fill(t.view, { title: c.title })}
            className={cn('group relative w-14 h-[4.5rem] rounded-xl overflow-hidden bg-white border transition-transform hover:-translate-y-0.5', dark ? 'border-white/15' : 'border-[var(--border)]')}
          >
            <Image src={c.image} alt={c.title} fill sizes="56px" className="object-contain p-1" />
          </button>
        ))}
      </div>
      <CertificateViewer cert={open} onClose={close} />
    </div>
  );
}
