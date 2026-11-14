'use client';

import { m as motion } from 'framer-motion';
import { FileText, Headphones, MessageCircle, Phone, Scissors, ShieldCheck, Truck, type LucideIcon } from 'lucide-react';
import { useSiteSettings } from '@/shared/providers/SiteSettingsProvider';
import { useConsult } from '@/features/consult/ConsultProvider';
import { useLocale } from '@/shared/i18n/LocaleProvider';
import { defineMessages } from '@/shared/i18n/messages';
import { digits } from '@/shared/i18n/format';
import type { ContentOf } from '@/shared/content/types';
import type { homeServices } from '@/shared/content/pages/home';
import { IconTile, type IconTone } from '@/shared/ui/IconTile';
import { RubikaButton } from '@/shared/ui/RubikaButton';
import { RubikaIcon } from '@/shared/ui/RubikaIcon';

const messages = defineMessages({
  fa: { whatsapp: 'واتس‌اپ', rubika: 'روبیکا' },
  en: { whatsapp: 'WhatsApp', rubika: 'Rubika' },
});

/** آیکن هر خدمت بر اساس شناسه آن در پنل؛ خدمت تازه آیکن پیش‌فرض می‌گیرد */
const SERVICE_ICONS: Record<string, LucideIcon> = {
  consult: Headphones,
  delivery: Truck,
  certificates: FileText,
  authenticity: ShieldCheck,
  cutting: Scissors,
};

const TONES: IconTone[] = ['accent', 'sky', 'emerald', 'violet', 'rose', 'slate'];

/** متن‌ها و فهرست خدمات از پنل «محتوای صفحات ← صفحه اصلی» (shared/content/pages/home.ts) */
export function ServicesSection({ content }: { content: ContentOf<typeof homeServices> }) {
  const { phone, phoneHref, whatsappUrl } = useSiteSettings();
  const { open } = useConsult();
  const locale = useLocale();
  const t = messages[locale];
  const services = content.items;

  return (
    <section className="section-padding" aria-labelledby="why-title">
      <div className="container-main">
        <div className="relative overflow-hidden rounded-[var(--radius-panel)] bg-[var(--ink)] text-white">
          <div className="absolute inset-0 bp-grid opacity-70" />

          <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-8 lg:gap-12 p-6 sm:p-10 lg:p-14">
            <div className="flex flex-col min-w-0">
              <span className="eyebrow">{content.eyebrow}</span>
              <h2 id="why-title" className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-black leading-snug text-white">
                {content.title}
              </h2>
              <p className="mt-4 text-slate-300 leading-8">
                {content.text}
              </p>
              <div className="mt-7 space-y-3 w-full max-w-md">
                <button
                  onClick={() => open()}
                  className="w-full min-h-13 py-3 px-6 rounded-2xl bg-[var(--accent)] text-[var(--accent-foreground)] font-black flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <Headphones className="w-5 h-5 shrink-0" />
                  {content.ctaLabel}
                </button>
                <div className="grid grid-cols-2 min-[400px]:grid-cols-[1.3fr_1fr_1fr] gap-3 [&>:first-child]:max-[399px]:col-span-2">
                  <a href={phoneHref} className="min-w-0 h-12 px-3 rounded-2xl border border-white/15 bg-white/5 font-bold flex items-center justify-center gap-2 hover:bg-white/10">
                    <Phone className="w-4 h-4 shrink-0 text-[var(--accent-text)]" />
                    <span dir="ltr" className="num text-sm truncate">{digits(phone, locale)}</span>
                  </a>
                  <a href={whatsappUrl} target="_blank" rel="noopener" className="min-w-0 h-12 px-3 rounded-2xl border border-white/15 bg-white/5 font-bold flex items-center justify-center gap-2 hover:bg-[#128C7E] hover:border-transparent">
                    <MessageCircle className="w-4 h-4 shrink-0" />
                    <span className="text-sm">{t.whatsapp}</span>
                  </a>
                  <RubikaButton className="min-w-0 h-12 px-3 rounded-2xl border border-white/15 bg-white/5 font-bold flex items-center justify-center gap-2 hover:bg-white/10">
                    <RubikaIcon className="w-4 shrink-0" />
                    <span className="text-sm">{t.rubika}</span>
                  </RubikaButton>
                </div>
              </div>
            </div>

            <ul className="grid grid-cols-2 gap-2.5 sm:gap-3">
              {services.map(({ id, title, desc }, i) => (
                <motion.li
                  key={id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className={`group rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur p-3.5 sm:p-5 transition-colors hover:bg-white/[0.07] hover:border-white/20 ${i === services.length - 1 && services.length % 2 === 1 ? 'col-span-2' : ''}`}
                >
                  <IconTile icon={SERVICE_ICONS[id] ?? ShieldCheck} tone={TONES[i % TONES.length]} />
                  <h3 className="mt-2.5 sm:mt-3 font-bold text-[14px] sm:text-base text-white leading-6">{title}</h3>
                  <p className="mt-1 text-xs sm:text-sm text-slate-400 leading-6 sm:leading-7">{desc}</p>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
