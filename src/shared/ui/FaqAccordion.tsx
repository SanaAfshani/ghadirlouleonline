'use client';

import { useState } from 'react';
import { m as motion } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';
import type { FaqItem } from '@/shared/types';

/** آکاردئون سوالات متداول برای انتهای صفحه مقاله یا محصول */
export function FaqAccordion({ faqs }: { faqs: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!faqs.length) return null;

  return (
    <section className="mt-12 pt-8 border-t border-[var(--border)]">
      <h2 className="flex items-center gap-2.5 text-xl sm:text-2xl font-black text-[var(--foreground)] mb-6">
        <HelpCircle className="w-6 h-6 text-[var(--accent-text)]" />
        سوالات متداول
      </h2>

      <div className="space-y-3">
        {faqs.map((faq, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={i}
              className="border border-[var(--border)] rounded-2xl overflow-hidden bg-[var(--card)]"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="w-full flex items-center justify-between gap-4 p-5 text-right"
              >
                <span className="font-semibold text-[var(--foreground)]">{faq.question}</span>
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-shrink-0"
                >
                  <ChevronDown className="w-5 h-5 text-[var(--accent-text)]" />
                </motion.div>
              </button>
              {/* پاسخ همیشه در HTML است (برای خزنده گوگل)؛ فقط با grid-rows جمع/باز می‌شود */}
              <div
                inert={!isOpen}
                className={`grid transition-[grid-template-rows,opacity] duration-300 ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
              >
                <div className="overflow-hidden">
                  <div className="px-5 pb-5 text-[var(--muted-foreground)] text-sm leading-relaxed border-t border-[var(--border)] pt-4 whitespace-pre-line">
                    {faq.answer}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
