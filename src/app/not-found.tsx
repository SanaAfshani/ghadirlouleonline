'use client';

import Link from 'next/link';
import { m as motion } from 'framer-motion';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-6">
      <div className="text-center max-w-lg">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 20, delay: 0.1 }}
          className="text-[10rem] font-black text-[var(--accent-text)] leading-none mb-4 select-none"
        >
          ۴۰۴
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold text-[var(--foreground)] mb-3"
        >
          صفحه‌ای پیدا نشد
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-[var(--muted-foreground)] mb-8"
        >
          صفحه‌ای که دنبال آن می‌گردید وجود ندارد یا حذف شده است.
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
            بازگشت به خانه
          </Link>
          <Link
            href="/products"
            className="flex items-center gap-2 h-11 px-6 rounded-xl border border-[var(--border)] text-[var(--foreground)] font-medium hover:border-[var(--accent)] hover:text-[var(--accent-text)] transition-all"
          >
            <Search className="w-4 h-4" />
            مشاهده محصولات
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
