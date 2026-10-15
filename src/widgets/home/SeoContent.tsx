'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

/**
 * متن سئوی صفحه اصلی. متن کامل در HTML سرور رندر می‌شود (برای خزنده گوگل)
 * و فقط از نظر بصری با «ادامه مطلب» جمع می‌شود.
 */
export function SeoContent({ html }: { html: string }) {
  const [open, setOpen] = useState(false);
  if (!html.trim()) return null;

  return (
    <section className="section-padding-sm" aria-label="درباره فروشگاه">
      <div className="container-main">
        <div className="relative rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5 sm:p-8">
          <div className={cn('relative overflow-hidden transition-[max-height] duration-500', open ? 'max-h-[4000px]' : 'max-h-56')}>
            <div className="article-content text-[15px]" dangerouslySetInnerHTML={{ __html: html }} />
            {!open && <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[var(--card)] to-transparent" />}
          </div>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="mt-3 mx-auto flex items-center gap-1.5 h-10 px-5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm font-bold hover:border-[var(--accent)] hover:text-[var(--accent-text)]"
          >
            {open ? 'بستن' : 'ادامه مطلب'}
            <ChevronDown className={cn('w-4 h-4 transition-transform', open && 'rotate-180')} />
          </button>
        </div>
      </div>
    </section>
  );
}
