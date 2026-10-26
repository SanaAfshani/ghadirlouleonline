'use client';

import { Fragment, useEffect, useState } from 'react';
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
        const priority = first
          ? { preload: true, fetchPriority: 'high' as const }
          : { loading: 'lazy' as const };
        const fade = `-z-20 transition-opacity duration-700 motion-reduce:transition-none ${
          i === active ? 'opacity-100' : 'opacity-0'
        }`;
        // بزرگ‌نمایی آرام فقط روی اسلاید فعال؛ با عوض‌شدن key انیمیشن از اول شروع می‌شود
        const motion = i === active ? 'hero-kenburns' : 'scale-[1.06]';

        // contain: کل عکس دیده می‌شود، و جای خالی دو طرفش با نسخه بزرگ و محوِ همان عکس پر
        // می‌شود تا به‌جای نوار خالی، ادامه رنگی خود تصویر باشد.
        return (
          <Fragment key={`${i}-${slide.image}`}>
            {slide.fit === 'contain' && (
              <Image
                src={slide.image}
                alt=""
                aria-hidden
                fill
                loading="lazy"
                quality={40}
                sizes="100vw"
                className={`object-cover scale-110 blur-2xl brightness-75 ${fade}`}
              />
            )}
            <Image
              src={slide.image}
              alt={slide.alt}
              fill
              {...priority}
              quality={95}
              sizes="100vw"
              style={slide.fit === 'contain' ? undefined : { objectPosition: `${slide.focusX}% ${slide.focusY}%` }}
              className={`${slide.fit === 'contain' ? 'object-contain' : 'object-cover'} ${motion} ${fade}`}
            />
          </Fragment>
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
