'use client';

import Link from 'next/link';
import { m as motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface SectionHeadingProps {
  /** id تیتر — برای aria-labelledby بخش والد */
  id?: string;
  label?: string;
  title: string;
  description?: string;
  className?: string;
  align?: 'center' | 'right' | 'left';
  /** لینک «مشاهده همه» در سمت مقابل تیتر (فقط با align=right) */
  action?: { href: string; label: string };
}

export function SectionHeading({ id, label, title, description, className, align = 'center', action }: SectionHeadingProps) {
  const alignClass = {
    center: 'text-center mx-auto items-center',
    right: 'text-right items-start',
    left: 'text-left items-end',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn('mb-6 sm:mb-8 md:mb-10 w-full flex items-end justify-between gap-4', className)}
    >
      <div className={cn('flex flex-col max-w-2xl', alignClass[align])}>
        {label && <span className="eyebrow mb-2">{label}</span>}
        <h2 id={id} className="text-[1.35rem] sm:text-2xl md:text-3xl lg:text-[2.1rem] font-black text-[var(--foreground)] leading-snug">
          {title}
        </h2>
        {description && (
          <p className="mt-2 text-[var(--muted-foreground)] text-sm sm:text-base leading-7">{description}</p>
        )}
      </div>
      {action && (
        <Link
          href={action.href}
          className="shrink-0 flex items-center gap-1.5 h-10 px-4 rounded-lg border border-[var(--border)] text-sm font-bold hover:border-[var(--accent)] hover:text-[var(--accent-text)] transition-colors"
        >
          <span className="hidden sm:inline">{action.label}</span>
          <span className="sm:hidden">همه</span>
          <ArrowLeft className="w-4 h-4" />
        </Link>
      )}
    </motion.div>
  );
}
