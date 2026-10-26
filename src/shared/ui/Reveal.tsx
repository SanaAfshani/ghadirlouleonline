'use client';

import { m as motion } from 'framer-motion';
import { cn } from '@/shared/lib/utils';

/**
 * ظاهرشدن نرم هنگام اسکرول — همان حرکتی که SectionHeading و کارت‌های محصول از قبل دارند،
 * اینجا به‌صورت یک پوشش قابل استفاده برای بخش‌هایی که خودشان انیمیشن ندارند.
 *
 * `once` روشن است: هر بخش فقط بار اول ظاهر می‌شود و با اسکرول به بالا و پایین دوباره نمی‌پرد.
 * `margin` منفی یعنی کمی قبل از رسیدن بخش به کادر دید شروع شود، نه درست روی لبه.
 *
 * بخش‌های سرور هم می‌توانند داخلش قرار بگیرند؛ children از سرور می‌آید و فقط همین پوشش کلاینتی است.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  /** جهت ورود — پیش‌فرض از پایین */
  from = 'bottom',
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  from?: 'bottom' | 'right' | 'left' | 'none';
}) {
  const offset =
    from === 'bottom' ? { y: 26 } : from === 'right' ? { x: 26 } : from === 'left' ? { x: -26 } : {};

  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
