'use client';

import Image from 'next/image';
import { m as motion } from 'framer-motion';
import { MapPin, Calendar } from 'lucide-react';
import { PageHero } from '@/shared/ui/PageHero';
import type { Project } from '@/shared/types';
import { Link } from '@/shared/i18n/Link';
import { useLocale } from '@/shared/i18n/LocaleProvider';
import { digits } from '@/shared/i18n/format';
import type { ContentOf } from '@/shared/content/types';
import type { projectsHero } from '@/shared/content/pages/projects';
import { projectYear } from './localize';

type Props = {
  projects: Project[];
  hero: ContentOf<typeof projectsHero>;
};

/** پروژه‌ها از قبل در سرور به زبان صفحه برگردانده شده‌اند (localizeProject)؛ سربرگ از پنل «محتوای صفحات ← پروژه‌ها» */
export function ProjectsPageClient({ projects, hero }: Props) {
  const locale = useLocale();
  return (
    <>
      <PageHero label={hero.label} title={hero.title} description={hero.description} />

      <section className="section-padding">
        <div className="container-main">
          {projects.length === 0 ? (
            <p className="text-center text-[var(--muted-foreground)] py-16">{hero.emptyText}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
              {projects.map((project, i) => (
                <motion.article
                  key={project.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (i % 3) * 0.06 }}
                >
                  <Link href={`/projects/${project.slug}`} className="group block">
                    <div className="relative aspect-[16/10] rounded-3xl overflow-hidden bg-[var(--ink-2)]">
                      {project.images[0] ? (
                        <Image src={project.images[0].url} alt={project.images[0].alt || project.title} fill sizes="(max-width:640px) 100vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                      ) : (
                        <span className="absolute inset-0 bp-grid" aria-hidden />
                      )}
                      {project.client && (
                        <span className="absolute top-3 start-3 h-7 px-3 rounded-lg bg-white/90 text-[var(--ink)] text-xs font-bold flex items-center">
                          {project.client}
                        </span>
                      )}
                    </div>
                    <div className="mt-4 flex items-center gap-3 text-xs text-[var(--muted-foreground)] num">
                      {project.location && (
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{project.location}</span>
                      )}
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{digits(projectYear(project.year, locale), locale)}</span>
                    </div>
                    <h3 className="mt-2 font-black text-[17px] leading-8 line-clamp-2 group-hover:text-[var(--accent-text)] transition-colors">{project.title}</h3>
                    {project.description && (
                      <p className="mt-1.5 text-sm leading-7 text-[var(--muted-foreground)] line-clamp-2">{project.description}</p>
                    )}
                  </Link>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
