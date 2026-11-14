'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { RichText } from '@/shared/ui/RichText';
import { useMessages } from '@/shared/i18n/LocaleProvider';
import { defineMessages } from '@/shared/i18n/messages';

const messages = defineMessages({
  fa: { label: 'درباره فروشگاه', more: 'ادامه مطلب', less: 'بستن' },
  en: { label: 'About the store', more: 'Read more', less: 'Show less' },
});

/**
 * متن سئوی صفحه اصلی. متن کامل در HTML سرور رندر می‌شود (برای خزنده گوگل)
 * و فقط از نظر بصری با «ادامه مطلب» جمع می‌شود.
 */
export function SeoContent({ html }: { html: string }) {
  const [open, setOpen] = useState(false);
  const t = useMessages(messages);
  if (!html.trim()) return null;

  return (
    <section className="section-padding-sm" aria-label={t.label}>
      <div className="container-main">
        <div className="relative rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5 sm:p-8">
          <div className={cn('relative overflow-hidden transition-[max-height] duration-500', open ? 'max-h-[4000px]' : 'max-h-56')}>
            <RichText html={html} className="article-content text-[15px]" />
            {!open && <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[var(--card)] to-transparent" />}
          </div>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="mt-3 mx-auto flex items-center gap-1.5 h-10 px-5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm font-bold hover:border-[var(--accent)] hover:text-[var(--accent-text)]"
          >
            {open ? t.less : t.more}
            <ChevronDown className={cn('w-4 h-4 transition-transform', open && 'rotate-180')} />
          </button>
        </div>
      </div>
    </section>
  );
}
