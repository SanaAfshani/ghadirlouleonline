'use client';

import { Headphones, Table2 } from 'lucide-react';
import { useConsult } from '@/features/consult/ConsultProvider';
import { useMessages } from '@/shared/i18n/LocaleProvider';
import { defineMessages } from '@/shared/i18n/messages';

const messages = defineMessages({
  fa: {
    title: 'لیست قیمت در حال به‌روزرسانی است',
    text: 'برای دریافت قیمت روز هر محصول درخواست مشاوره ثبت کنید تا کارشناسان ما تماس بگیرند.',
    cta: 'استعلام قیمت',
  },
  en: {
    title: 'The price list is being updated',
    text: 'Submit an enquiry for today’s price of any product and our specialists will call you back.',
    cta: 'Request a price',
  },
});

/** تا وقتی هیچ محصولی جدول قیمت ندارد — به جای صفحه خالی، استعلام تلفنی پیشنهاد می‌شود */
export function PricesEmptyState() {
  const { open } = useConsult();
  const t = useMessages(messages);
  return (
    <div className="max-w-lg mx-auto text-center py-12">
      <span className="mx-auto grid place-items-center w-16 h-16 rounded-3xl bg-[var(--accent)]/12 text-[var(--accent-text)]">
        <Table2 className="w-8 h-8" />
      </span>
      <h2 className="mt-5 text-xl font-black">{t.title}</h2>
      <p className="mt-2 text-[var(--muted-foreground)] leading-8">{t.text}</p>
      <button onClick={() => open()} className="mt-6 h-12 px-7 rounded-2xl bg-[var(--accent)] text-[var(--accent-foreground)] font-black shadow-accent inline-flex items-center gap-2">
        <Headphones className="w-5 h-5" /> {t.cta}
      </button>
    </div>
  );
}
