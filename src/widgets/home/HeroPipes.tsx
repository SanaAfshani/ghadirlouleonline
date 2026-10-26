'use client';

import { useEffect, useRef } from 'react';

/**
 * دو مسیر پیوسته‌ی لوله‌کشی که از یک لبه وارد و از لبه دیگر خارج می‌شوند — با زانویی‌های گرد،
 * درست مثل نقشه یک خط لوله. مختصات در فضای ۱۴۴۰×۸۰۰ است و با slice روی هر عرضی کشیده می‌شود.
 */
const RUNS = [
  {
    d: 'M-80 640H240Q300 640 300 580V300Q300 240 360 240H740Q800 240 800 300V520Q800 580 860 580H1520',
    width: 26,
    depth: 1,
    opacity: 0.3,
    /** محل فلنج‌ها روی همین مسیر — نقطه و زاویه بند */
    flanges: [
      { x: 170, y: 640, a: 90 },
      { x: 300, y: 420, a: 0 },
      { x: 560, y: 240, a: 90 },
      { x: 800, y: 430, a: 0 },
      { x: 1050, y: 580, a: 90 },
    ],
  },
  {
    d: 'M-80 110H470Q520 110 520 160V250Q520 300 570 300H1080Q1130 300 1130 250V70Q1130 20 1180 20H1520',
    width: 16,
    depth: 0.45,
    opacity: 0.16,
    flanges: [
      { x: 250, y: 110, a: 90 },
      { x: 520, y: 205, a: 0 },
      { x: 850, y: 300, a: 90 },
      { x: 1130, y: 150, a: 0 },
    ],
  },
];

/**
 * پس‌زمینه هرو: دو خط لوله پیوسته که با حرکت موس جابه‌جا می‌شوند.
 *
 * هر لوله با دو خط کشیده می‌شود — یک خط ضخیم روشن و روی آن یک خط باریک‌تر هم‌رنگ پس‌زمینه —
 * پس چیزی که می‌ماند دقیقاً دو جداره لوله است. داخلش یک خط‌چین کهربایی در جریان است (همان
 * کلاس flow-dash که از قبل در پروژه برای جریان آب تعریف شده).
 *
 * مسیرِ دورتر نصف مسیر نزدیک جابه‌جا می‌شود و همین اختلاف، حس عمق می‌دهد. حرکت فقط روی
 * transform است، پس هر فریم هیچ محاسبه layout ندارد. با prefers-reduced-motion هیچ listenerی
 * ثبت نمی‌شود و خط لوله ثابت می‌ماند.
 */
export function HeroPipes() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    const section = el?.closest('section');
    if (!el || !section) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const groups = Array.from(el.querySelectorAll<SVGGElement>('[data-depth]'));
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
      for (const g of groups) {
        const depth = Number(g.dataset.depth);
        g.style.transform = `translate(${(-at.x * 80 * depth).toFixed(1)}px, ${(-at.y * 50 * depth).toFixed(1)}px)`;
      }
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', move, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', move);
    };
  }, []);

  // روی موبایل قاب باریک است و slice فقط نوار وسط مسیر را بزرگ نشان می‌دهد؛ آن‌جا کم‌رنگ‌تر
  // می‌شود تا به‌جای غالب‌شدن روی صفحه، یک بافت ملایم بماند
  return (
    <div ref={root} aria-hidden className="absolute inset-0 overflow-hidden opacity-40 sm:opacity-65 lg:opacity-100">
      <svg
        viewBox="0 0 1440 800"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        className="w-full h-full text-slate-300"
      >
        {RUNS.map((run) => (
          <g key={run.d} data-depth={run.depth} style={{ willChange: 'transform' }}>
            {/* جداره بیرونی */}
            <path
              d={run.d}
              stroke="currentColor"
              strokeWidth={run.width}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={run.opacity}
            />
            {/* همان مسیر، باریک‌تر و هم‌رنگ پس‌زمینه — چیزی که می‌ماند دو خط جداره است */}
            <path
              d={run.d}
              stroke="var(--ink)"
              strokeWidth={run.width - 4}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* جریان داخل لوله */}
            <path
              d={run.d}
              stroke="var(--accent)"
              strokeWidth={Math.max(2, run.width * 0.14)}
              strokeLinecap="round"
              opacity={run.opacity * 0.9}
              className="flow-dash"
            />
            {/* فلنج‌های اتصال */}
            {run.flanges.map((f) => (
              <rect
                key={`${f.x}-${f.y}`}
                x={f.x - run.width * 0.14}
                y={f.y - run.width * 0.8}
                width={run.width * 0.28}
                height={run.width * 1.6}
                rx={run.width * 0.12}
                fill="currentColor"
                opacity={run.opacity * 0.75}
                transform={`rotate(${f.a} ${f.x} ${f.y})`}
              />
            ))}
          </g>
        ))}
      </svg>
    </div>
  );
}
