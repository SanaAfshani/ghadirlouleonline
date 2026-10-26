'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import type { HeroSlide } from '@/shared/lib/site-settings';

const INTERVAL = 6000;

/**
 * پس‌زمینه هرو: یک عکس ثابت یا اسلایدر محو‌شونده.
 *
 * عکس اول همان تصویر LCP صفحه است، پس دقیقاً مثل قبل preload و fetchPriority بالا می‌گیرد.
 * عکس‌های بعدی فقط وقتی به آن‌ها می‌رسیم رندر می‌شوند، پس سرِ بارگذاری اول با LCP رقابت نمی‌کنند.
 * با یک عکس، هیچ تایمر و هیچ لایه اضافه‌ای ساخته نمی‌شود و رفتار صفحه عیناً حالت قبل است.
 */
export function HeroSlides({ slides }: { slides: HeroSlide[] }) {
  const [active, setActive] = useState(0);
  /**
   * بالاترین اسلایدی که تا حالا نشان داده شده. عکس‌های بعد از آن اصلاً رندر نمی‌شوند، پس سرِ
   * بارگذاری اول فقط عکس اولِ LCP دانلود می‌شود. عکس‌های دیده‌شده mount می‌مانند تا محوشدن
   * بین دو تصویر کار کند.
   */
  const [seen, setSeen] = useState(0);
  const [paused, setPaused] = useState(false);

  const many = slides.length > 1;
  const go = (i: number) => {
    setActive(i);
    setSeen((s) => Math.max(s, i));
  };

  useEffect(() => {
    if (!many || paused) return;
    // کاربری که انیمیشن کمتر خواسته، اسلاید خودکار نمی‌بیند؛ نقطه‌ها دستی کار می‌کنند
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => {
      setActive((i) => {
        const next = (i + 1) % slides.length;
        setSeen((s) => Math.max(s, next));
        return next;
      });
    }, INTERVAL);
    return () => clearInterval(id);
  }, [many, paused, slides.length]);

  return (
    <>
      {slides.map((slide, i) => {
        const first = i === 0;
        if (i > seen) return null;
        return (
          <Image
            key={`${i}-${slide.image}`}
            src={slide.image}
            alt={slide.alt}
            fill
            {...(first
              ? { preload: true, fetchPriority: 'high' as const }
              : { loading: 'lazy' as const })}
            quality={90}
            sizes="100vw"
            style={{ objectPosition: `${slide.focusX}% ${slide.focusY}%` }}
            className={`object-cover -z-20 transition-opacity duration-700 motion-reduce:transition-none ${
              i === active ? 'opacity-100' : 'opacity-0'
            }`}
          />
        );
      })}

      {many && (
        <div
          className="absolute bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {slides.map((slide, i) => (
            <button
              key={`${i}-${slide.image}`}
              type="button"
              onClick={() => go(i)}
              onFocus={() => setPaused(true)}
              onBlur={() => setPaused(false)}
              aria-label={`عکس ${i + 1} از ${slides.length}`}
              aria-current={i === active}
              className={`h-2.5 rounded-full transition-all ${
                i === active ? 'w-7 bg-[var(--accent)]' : 'w-2.5 bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      )}
    </>
  );
}
