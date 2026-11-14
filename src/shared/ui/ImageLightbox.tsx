'use client';

import { useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import { AnimatePresence, m as motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useLocale, useMessages } from '@/shared/i18n/LocaleProvider';
import { defineMessages, fill } from '@/shared/i18n/messages';
import { digits } from '@/shared/i18n/format';
import { localeDir } from '@/shared/i18n/config';

const messages = defineMessages({
  fa: { gallery: 'تصاویر {name}', image: '{name} — تصویر {n}', close: 'بستن', prev: 'تصویر قبلی', next: 'تصویر بعدی' },
  en: { gallery: '{name} images', image: '{name} — image {n}', close: 'Close', prev: 'Previous image', next: 'Next image' },
});

/**
 * نمایش تمام‌صفحه عکس‌ها — «بعدی» در لبه پایان است (چپ در فارسی، راست در انگلیسی) و با کشیدن به سمت شروع می‌آید.
 * عکس با object-contain نشان داده می‌شود، پس هر چه در گالری بریده شده بود اینجا کامل دیده می‌شود.
 * قبلاً فقط داخل صفحه محصول بود؛ صفحه پروژه‌ها هم همین را لازم داشت.
 */
export function ImageLightbox({
  images,
  name,
  index,
  onIndex,
  onClose,
}: {
  images: string[];
  name: string;
  /** null یعنی بسته */
  index: number | null;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const isOpen = index != null;
  const count = images.length;
  const go = useCallback(
    (delta: number) => index != null && onIndex((index + delta + count) % count),
    [index, count, onIndex],
  );
  const touchX = useRef<number | null>(null);
  const locale = useLocale();
  const t = useMessages(messages);
  // جهت «بعدی» روی صفحه: در RTL به چپ (کلید ArrowLeft، کشیدن به راست)، در LTR برعکس
  const forward = localeDir[locale] === 'rtl' ? 1 : -1;

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') go(forward);
      else if (e.key === 'ArrowRight') go(-forward);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, go, forward]);

  return (
    <AnimatePresence>
      {index != null && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={fill(t.gallery, { name })}
          className="fixed inset-0 z-[80] bg-black/90 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => {
            if (touchX.current == null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            touchX.current = null;
            if (Math.abs(dx) > 50) go(dx > 0 ? forward : -forward);
          }}
        >
          <button aria-label={t.close} onClick={onClose} className="absolute inset-0 cursor-zoom-out" />
          <div className="pointer-events-none absolute inset-4 sm:inset-12">
            <Image key={images[index]} src={images[index]} alt={fill(t.image, { name, n: digits(index + 1, locale) })} fill sizes="100vw" quality={90} className="object-contain" />
          </div>
          <button onClick={onClose} aria-label={t.close} className="absolute top-4 end-4 grid place-items-center w-11 h-11 rounded-full bg-black/60 ring-1 ring-white/25 text-white hover:bg-black/80">
            <X className="w-5 h-5" />
          </button>
          {count > 1 && (
            <>
              <button onClick={() => go(-1)} aria-label={t.prev} className="absolute start-3 top-1/2 -translate-y-1/2 grid place-items-center w-11 h-11 rounded-full bg-black/60 ring-1 ring-white/25 text-white hover:bg-black/80">
                <ChevronRight className="w-6 h-6 ltr:rotate-180" />
              </button>
              <button onClick={() => go(1)} aria-label={t.next} className="absolute end-3 top-1/2 -translate-y-1/2 grid place-items-center w-11 h-11 rounded-full bg-black/60 ring-1 ring-white/25 text-white hover:bg-black/80">
                <ChevronLeft className="w-6 h-6 ltr:rotate-180" />
              </button>
              <span className="absolute bottom-5 inset-x-0 text-center text-sm text-white/80 num pointer-events-none">
                {digits(index + 1, locale)} / {digits(count, locale)}
              </span>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
