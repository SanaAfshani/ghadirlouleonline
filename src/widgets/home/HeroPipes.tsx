'use client';

import { useEffect, useRef } from 'react';

/**
 * یک لوله کاروگیت از نما: دو خط بدنه، شیارهای عرضی، ته بسته سمت چپ و دهانه باز سمت راست.
 * فقط خط است و هیچ پرکننده‌ای ندارد تا در پس‌زمینه سنگینی نکند.
 */
function Pipe({ className }: { className?: string }) {
  const RIBS = [46, 74, 102, 130, 158];
  return (
    <svg viewBox="0 0 200 80" fill="none" className={className} aria-hidden>
      {/* بدنه */}
      <path d="M18 10H180M18 70H180" stroke="currentColor" strokeWidth="1.5" />
      {/* ته لوله — فقط نیمه‌ای از بیضی که از این زاویه دیده می‌شود */}
      <path d="M18 10A10 30 0 0 0 18 70" stroke="currentColor" strokeWidth="1.5" />
      {/* شیارهای کاروگیت */}
      {RIBS.map((x) => (
        <path key={x} d={`M${x} 10A10 30 0 0 0 ${x} 70`} stroke="currentColor" strokeWidth="1" opacity="0.55" />
      ))}
      {/* دهانه باز */}
      <ellipse cx="180" cy="40" rx="10" ry="30" stroke="currentColor" strokeWidth="1.5" />
      <ellipse cx="180" cy="40" rx="5" ry="17" stroke="currentColor" strokeWidth="1" opacity="0.7" />
    </svg>
  );
}

/**
 * چیدمان ثابت لوله‌ها. `depth` فقط میزان جابه‌جایی با موس را تعیین می‌کند — لوله نزدیک‌تر بیشتر
 * تکان می‌خورد و همین اختلاف، حس عمق می‌دهد. جای لوله‌ها طوری است که زیر ستون متن نیفتند.
 */
const PIPES = [
  { left: '2%', top: '6%', w: 230, rot: -16, depth: 1, opacity: 0.22 },
  { left: '26%', top: '62%', w: 300, rot: 9, depth: 0.85, opacity: 0.18 },
  { left: '56%', top: '-4%', w: 190, rot: 22, depth: 0.5, opacity: 0.14 },
  { left: '74%', top: '70%', w: 260, rot: -8, depth: 0.7, opacity: 0.17 },
  { left: '88%', top: '22%', w: 170, rot: 32, depth: 0.4, opacity: 0.12 },
  { left: '44%', top: '28%', w: 140, rot: -28, depth: 0.3, opacity: 0.1 },
];

/**
 * پس‌زمینه هرو: چند لوله کم‌رنگ که با حرکت موس جابه‌جا می‌شوند.
 *
 * شش لوله بیشتر نیست و همه فقط خط‌اند، پس پس‌زمینه شلوغ نمی‌شود و متن رویش خوانا می‌ماند.
 * جابه‌جایی روی transform انجام می‌شود (نه left/top) تا layout دوباره محاسبه نشود، و مقدارش با
 * lerp نرم می‌شود تا حرکت تکان‌دار نباشد. با prefers-reduced-motion اصلاً listener ثبت نمی‌شود.
 */
export function HeroPipes() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    const section = el?.parentElement;
    if (!el || !section) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const items = Array.from(el.children) as HTMLElement[];
    // از مرکز بخش: ‎-0.5‎ تا ‎0.5‎
    const at = { x: 0, y: 0 };
    const to = { x: 0, y: 0 };
    let raf = 0;

    const move = (e: PointerEvent) => {
      const r = section.getBoundingClientRect();
      to.x = (e.clientX - r.left) / r.width - 0.5;
      to.y = (e.clientY - r.top) / r.height - 0.5;
    };

    const tick = () => {
      at.x += (to.x - at.x) * 0.05;
      at.y += (to.y - at.y) * 0.05;
      items.forEach((item, i) => {
        const { depth, rot } = PIPES[i];
        const dx = -at.x * 70 * depth;
        const dy = -at.y * 46 * depth;
        item.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0) rotate(${(rot + at.x * 6 * depth).toFixed(2)}deg)`;
      });
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', move, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', move);
    };
  }, []);

  return (
    <div ref={root} aria-hidden className="absolute inset-0 overflow-hidden text-slate-300">
      {PIPES.map((p, i) => (
        <div
          key={i}
          className="absolute will-change-transform"
          style={{
            left: p.left,
            top: p.top,
            width: p.w,
            opacity: p.opacity,
            transform: `rotate(${p.rot}deg)`,
          }}
        >
          <Pipe className="w-full h-auto" />
        </div>
      ))}
    </div>
  );
}
