'use client';

import { m as motion } from 'framer-motion';
import { Home, Search } from 'lucide-react';
import { Link } from '@/shared/i18n/Link';
import { useLocale, useMessages } from '@/shared/i18n/LocaleProvider';
import { digits } from '@/shared/i18n/format';
import { defineMessages } from '@/shared/i18n/messages';

const messages = defineMessages({
  fa: {
    title: 'صفحه‌ای پیدا نشد',
    text: 'صفحه‌ای که دنبال آن می‌گردید وجود ندارد یا حذف شده است.',
    home: 'بازگشت به خانه',
    products: 'مشاهده محصولات',
  },
  en: {
    title: 'Page not found',
    text: 'The page you are looking for does not exist or has been removed.',
    home: 'Back to home',
    products: 'View products',
  },
});

export default function NotFound() {
  const t = useMessages(messages);
  const locale = useLocale();
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-6">
      <div className="text-center max-w-lg">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 20, delay: 0.1 }}
          className="text-[10rem] font-black text-[var(--accent-text)] leading-none mb-4 select-none"
        >
          {digits(404, locale)}
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold text-[var(--foreground)] mb-3"
        >
          {t.title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-[var(--muted-foreground)] mb-8"
        >
          {t.text}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            href="/"
            className="flex items-center gap-2 h-11 px-6 rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] font-medium hover:bg-[var(--accent-hover)] transition-all hover:-translate-y-0.5"
          >
            <Home className="w-4 h-4" />
            {t.home}
          </Link>
          <Link
            href="/products"
            className="flex items-center gap-2 h-11 px-6 rounded-xl border border-[var(--border)] text-[var(--foreground)] font-medium hover:border-[var(--accent)] hover:text-[var(--accent-text)] transition-all"
          >
            <Search className="w-4 h-4" />
            {t.products}
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
