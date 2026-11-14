'use client';

import { m as motion } from 'framer-motion';
import { ArrowLeft, Check, Eye, Heart, Target } from 'lucide-react';
import { PageHero } from '@/shared/ui/PageHero';
import { IconTile, type IconTone } from '@/shared/ui/IconTile';
import { RichText } from '@/shared/ui/RichText';
import { Link } from '@/shared/i18n/Link';
import type { ContentOf } from '@/shared/content/types';
import type { aboutCta, aboutHero, aboutStats, aboutStory, aboutTeam, aboutValues } from '@/shared/content/pages/about';

const VALUE_ICONS = [Target, Eye, Heart];
const TONES: IconTone[] = ['accent', 'sky', 'emerald', 'violet', 'rose', 'slate'];

const reveal = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
};

type Props = {
  hero: ContentOf<typeof aboutHero>;
  stats: ContentOf<typeof aboutStats>;
  story: ContentOf<typeof aboutStory>;
  values: ContentOf<typeof aboutValues>;
  team: ContentOf<typeof aboutTeam>;
  cta: ContentOf<typeof aboutCta>;
};

/** متن‌ها از پنل «محتوای صفحات ← درباره ما» (shared/content/pages/about.ts) */
export function AboutContent({ hero, stats, story, values, team, cta }: Props) {
  return (
    <>
      <PageHero label={hero.label} title={hero.title} description={hero.description} />

      {/* آمار — یک ردیف آرام با جداکننده، نه کارت‌های رنگی */}
      {stats.items.length > 0 && (
        <section className="border-b border-[var(--border)]">
          <div className="container-main">
            <dl className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[var(--border)] border-x border-[var(--border)]">
              {stats.items.map((s, i) => (
                <motion.div key={s.id} {...reveal} transition={{ ...reveal.transition, delay: i * 0.06 }} className="py-8 sm:py-10 px-4 text-center bg-[var(--background)]">
                  <dd className="text-3xl sm:text-4xl font-black num tracking-tight">{s.value}</dd>
                  <dt className="mt-1 text-sm text-[var(--muted-foreground)]">{s.label}</dt>
                </motion.div>
              ))}
            </dl>
          </div>
        </section>
      )}

      {/* داستان */}
      <section className="section-padding">
        <div className="container-main grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-16 items-start">
          <motion.div {...reveal}>
            <span className="eyebrow">{story.eyebrow}</span>
            <h2 className="mt-3 text-2xl sm:text-[2rem] font-black leading-snug">{story.title}</h2>
            <RichText
              html={story.body}
              className="mt-5 space-y-4 text-[15px] leading-8 text-[var(--muted-foreground)] [&_a]:font-bold [&_a]:text-[var(--accent-text)] [&_a:hover]:underline"
            />
            <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
              {story.advantages.map((adv) => (
                <li key={adv.id} className="flex items-start gap-2.5 text-sm leading-7">
                  <span className="mt-1.5 grid place-items-center w-4 h-4 rounded-full bg-[var(--foreground)] text-[var(--background)] shrink-0">
                    <Check className="w-2.5 h-2.5" strokeWidth={3} />
                  </span>
                  {adv.text}
                </li>
              ))}
            </ul>
          </motion.div>

          <div className="space-y-3">
            {values.items.map(({ id, title, text }, i) => (
              <motion.div key={id} {...reveal} transition={{ ...reveal.transition, delay: i * 0.08 }} className="group flex gap-4 p-5 sm:p-6 rounded-3xl border border-[var(--border)] transition-colors hover:border-[var(--accent)]/40">
                <IconTile icon={VALUE_ICONS[i % VALUE_ICONS.length]} tone={TONES[i % TONES.length]} />
                <div>
                  <h3 className="font-bold">{title}</h3>
                  <p className="mt-1 text-sm leading-7 text-[var(--muted-foreground)]">{text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* تیم */}
      {team.members.length > 0 && (
        <section className="section-padding bg-[var(--card)] border-y border-[var(--border)]">
          <div className="container-main">
            <div className="mb-8">
              <span className="eyebrow">{team.eyebrow}</span>
              <h2 className="mt-2 text-2xl sm:text-3xl font-black">{team.title}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5">
              {team.members.map((m, i) => (
                <motion.div key={m.id} {...reveal} transition={{ ...reveal.transition, delay: i * 0.08 }} className="p-6 rounded-3xl bg-[var(--background)] border border-[var(--border)]">
                  <span className="grid place-items-center w-12 h-12 rounded-full bg-[var(--ink)] text-white font-black">
                    {m.name.replace(/^(مهندس|خانم|آقای|دکتر|Mr\.?|Mrs\.?|Ms\.?|Dr\.?|Eng\.?)\s+/i, '').charAt(0)}
                  </span>
                  <p className="mt-4 font-bold">{m.name}</p>
                  <p className="text-sm text-[var(--accent-text)] font-semibold">{m.role}</p>
                  <p className="mt-2 text-xs leading-6 text-[var(--muted-foreground)]">{m.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* دعوت به تماس */}
      <section className="section-padding-sm">
        <div className="container-main">
          <div className="rounded-[var(--radius-panel)] bg-[var(--ink)] text-white p-8 sm:p-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-black text-white">{cta.title}</h2>
              <p className="mt-2 text-slate-300">{cta.text}</p>
            </div>
            {cta.buttonLink && (
              <Link href={cta.buttonLink} className="shrink-0 inline-flex items-center justify-center gap-2 h-12 px-8 rounded-2xl bg-white text-[var(--ink)] font-bold">
                {cta.buttonLabel} <ArrowLeft className="w-4 h-4 ltr:rotate-180" />
              </Link>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
