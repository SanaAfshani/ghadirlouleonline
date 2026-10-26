'use client';

import { useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import { AnimatePresence, m as motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { faDigits } from '@/shared/lib/utils';

/**
 * نمایش تمام‌صفحه عکس‌ها — RTL: «بعدی» سمت چپ است و با کشیدن به راست می‌آید.
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

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') go(1);
      else if (e.key === 'ArrowRight') go(-1);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, go]);

  return (
    <AnimatePresence>
      {index != null && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={`تصاویر ${name}`}
          className="fixed inset-0 z-[80] bg-black/90 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => {
            if (touchX.current == null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            touchX.current = null;
            if (Math.abs(dx) > 50) go(dx > 0 ? 1 : -1);
          }}
        >
          <button aria-label="بستن" onClick={onClose} className="absolute inset-0 cursor-zoom-out" />
          <div className="pointer-events-none absolute inset-4 sm:inset-12">
            <Image key={images[index]} src={images[index]} alt={`${name} — تصویر ${faDigits(index + 1)}`} fill sizes="100vw" quality={90} className="object-contain" />
          </div>
          <button onClick={onClose} aria-label="بستن" className="absolute top-4 left-4 grid place-items-center w-11 h-11 rounded-full bg-black/60 ring-1 ring-white/25 text-white hover:bg-black/80">
            <X className="w-5 h-5" />
          </button>
          {count > 1 && (
            <>
              <button onClick={() => go(-1)} aria-label="تصویر قبلی" className="absolute right-3 top-1/2 -translate-y-1/2 grid place-items-center w-11 h-11 rounded-full bg-black/60 ring-1 ring-white/25 text-white hover:bg-black/80">
                <ChevronRight className="w-6 h-6" />
              </button>
              <button onClick={() => go(1)} aria-label="تصویر بعدی" className="absolute left-3 top-1/2 -translate-y-1/2 grid place-items-center w-11 h-11 rounded-full bg-black/60 ring-1 ring-white/25 text-white hover:bg-black/80">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <span className="absolute bottom-5 inset-x-0 text-center text-sm text-white/80 num pointer-events-none">
                {faDigits(index + 1)} / {faDigits(count)}
              </span>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
