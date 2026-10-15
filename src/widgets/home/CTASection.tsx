'use client';

import { m as motion } from 'framer-motion';
import Link from 'next/link';
import { Phone, MessageCircle } from 'lucide-react';
import { useSiteSettings } from '@/shared/providers/SiteSettingsProvider';

export function CTASection() {
  const { phone, phoneHref } = useSiteSettings();

  return (
    <section className="surface-dark home-section bg-[var(--foreground)] dark:bg-[#0A1120] relative overflow-hidden text-white">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-32 -right-32 w-96 h-96 border border-[var(--accent)]/10 rounded-full"
        />
        <motion.div
          animate={{ rotate: [360, 0] }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          className="absolute -bottom-32 -left-32 w-96 h-96 border border-[var(--accent)]/20 rounded-full"
        />
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '30px 30px',
          }}
        />
      </div>

      <div className="container-main relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <span className="inline-block text-[var(--accent-text)] text-sm font-semibold uppercase tracking-widest mb-4">
            آماده همکاری هستیم
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-5 leading-tight">
            به لوله و اتصالات نیاز دارید؟
          </h2>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            تیم کارشناسان ما آماده پاسخگویی و ارائه مشاوره رایگان است. همین حالا با ما در تماس باشید.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/contact"
              className="flex items-center gap-3 h-14 px-10 rounded-2xl bg-[var(--accent)] text-[var(--accent-foreground)] text-base font-bold hover:bg-[var(--accent-hover)] transition-all duration-300 hover:-translate-y-1 shadow-xl shadow-accent"
            >
              <MessageCircle className="w-5 h-5" />
              درخواست مشاوره رایگان
            </Link>
            <a
              href={phoneHref}
              className="flex items-center gap-3 h-14 px-10 rounded-2xl border-2 border-slate-600 text-white text-base font-semibold hover:border-[var(--accent)] hover:text-[var(--accent-text)] transition-all duration-300 hover:-translate-y-1"
            >
              <Phone className="w-5 h-5" />
              {phone}
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
