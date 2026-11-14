'use client';

import { m as motion } from 'framer-motion';
import { BadgeCheck, Check, ChevronLeft, Factory, FileText, Headphones, Headset, Shield, ShieldCheck, Wrench } from 'lucide-react';
import { PageHero } from '@/shared/ui/PageHero';
import { useConsult } from '@/features/consult/ConsultProvider';
import { IconTile, type IconTone } from '@/shared/ui/IconTile';
import { useSiteSettings } from '@/shared/providers/SiteSettingsProvider';
import { CertificateStrip } from '@/features/certificates/Certificates';
import { LtrCodes } from '@/shared/ui/LtrCodes';
import { Link } from '@/shared/i18n/Link';
import { useLocale, useMessages } from '@/shared/i18n/LocaleProvider';
import { defineMessages, fill } from '@/shared/i18n/messages';
import { digits } from '@/shared/i18n/format';
import type { ContentOf } from '@/shared/content/types';
import type { servicesCta, servicesFactory, servicesHero, servicesList } from '@/shared/content/pages/services';

const SERVICE_ICONS = [Headphones, Wrench, FileText, Shield];

const messages = defineMessages({
  fa: { certificatesTitle: 'گواهینامه‌های {name}' },
  en: { certificatesTitle: '{name} certificates' },
});

const TONES: IconTone[] = ['accent', 'sky', 'emerald', 'violet', 'rose', 'slate'];

type Props = {
  hero: ContentOf<typeof servicesHero>;
  list: ContentOf<typeof servicesList>;
  factory: ContentOf<typeof servicesFactory>;
  cta: ContentOf<typeof servicesCta>;
};

/** متن‌ها از پنل «محتوای صفحات ← خدمات» (shared/content/pages/services.ts) */
export function ServicesContent({ hero, list, factory, cta }: Props) {
  const { open } = useConsult();
  const { certificates, legalName } = useSiteSettings();
  const locale = useLocale();
  const t = useMessages(messages);

  return (
    <>
      <PageHero label={hero.label} title={hero.title} description={hero.description} />

      <section className="section-padding">
        <div className="container-main">
          <ol className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-5">
            {list.items.map(({ id, title, desc, features }, i) => (
              <motion.li
                key={id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: i * 0.06, duration: 0.5 }}
                className="group relative p-6 sm:p-8 rounded-3xl border border-[var(--border)] bg-[var(--background)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-[var(--accent)]/40"
              >
                <div className="flex items-start justify-between gap-4">
                  <IconTile icon={SERVICE_ICONS[i % SERVICE_ICONS.length]} tone={TONES[i % TONES.length]} size="lg" />
                  <span className="text-4xl font-black text-[var(--border)] num leading-none">{digits(String(i + 1).padStart(2, '0'), locale)}</span>
                </div>
                <h2 className="mt-5 text-lg sm:text-xl font-black">{title}</h2>
                <p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">{desc}</p>
                <ul className="mt-5 pt-5 border-t border-[var(--border)] grid grid-cols-2 gap-y-2.5 gap-x-4">
                  {features.split('\n').map((f) => f.trim()).filter(Boolean).map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-[var(--accent-text)] shrink-0" strokeWidth={2.5} />
                      {f}
                    </li>
                  ))}
                </ul>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      {/* کارخانه‌ای که نماینده انحصاری آن هستیم + ارجاع به گواهینامه‌ها */}
      <section className="section-padding-sm" aria-labelledby="factory-title">
        <div className="container-main">
          <div className="rounded-[var(--radius-panel)] border-2 border-[var(--accent)]/40 bg-[var(--card)] overflow-hidden">
            <div className="p-6 sm:p-10 grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-start">
              <div>
                <p className="eyebrow">{factory.eyebrow}</p>
                <h2 id="factory-title" className="mt-2 flex items-center gap-3 text-xl sm:text-2xl font-black">
                  <IconTile icon={Factory} size="sm" />
                  {legalName}
                </h2>
                <p className="mt-4 text-sm sm:text-[15px] leading-8 text-[var(--muted-foreground)]">
                  <LtrCodes text={factory.body} />
                </p>
                <p className="mt-4 flex items-start gap-2.5 rounded-2xl bg-[var(--accent)]/10 border border-[var(--accent)]/30 p-4 text-sm sm:text-base leading-8">
                  <ShieldCheck className="w-6 h-6 mt-1 shrink-0 text-[var(--accent-text)]" />
                  <span>
                    <strong className="font-black">{factory.highlightTitle}</strong> {factory.highlightText}
                  </span>
                </p>
                <Link href={factory.buttonLink || '/certificates'} className="mt-5 inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-[var(--foreground)] text-[var(--background)] text-sm font-bold">
                  <BadgeCheck className="w-4 h-4" />
                  {factory.buttonLabel}
                  <ChevronLeft className="w-4 h-4 ltr:rotate-180" />
                </Link>
              </div>

              <div className="grid gap-3">
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {factory.facts.map((f) => (
                    <li key={f.id} className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4">
                      <p className="flex items-start gap-2 font-black text-sm leading-6 num">
                        <Check className="w-4 h-4 mt-1 shrink-0 text-[var(--accent-text)]" strokeWidth={2.5} />
                        <span><LtrCodes text={f.title} /></span>
                      </p>
                      <p className="mt-1 text-xs leading-6 text-[var(--muted-foreground)] num"><LtrCodes text={f.desc} /></p>
                    </li>
                  ))}
                </ul>
                {certificates.length > 0 && (
                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4">
                    <CertificateStrip certificates={certificates} title={fill(t.certificatesTitle, { name: legalName })} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding-sm">
        <div className="container-main">
          <div className="rounded-[var(--radius-panel)] bg-[var(--ink)] text-white p-8 sm:p-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <span className="hidden sm:grid place-items-center w-12 h-12 rounded-2xl bg-white/10 shrink-0"><Headset className="w-5 h-5" /></span>
              <div>
                <h2 className="text-2xl font-black text-white">{cta.title}</h2>
                <p className="mt-2 text-slate-300">{cta.text}</p>
              </div>
            </div>
            <button onClick={() => open()} className="shrink-0 h-12 px-8 rounded-2xl bg-white text-[var(--ink)] font-bold">
              {cta.buttonLabel}
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
