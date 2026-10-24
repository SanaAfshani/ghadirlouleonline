'use client';

import Image from 'next/image';
import { m as motion } from 'framer-motion';
import Link from 'next/link';
import { MapPin, Calendar } from 'lucide-react';
import { PageHero } from '@/shared/ui/PageHero';
import type { Project } from '@/shared/types';
import { faDigits } from '@/shared/lib/utils';

type Props = {
  projects: Project[];
};

export function ProjectsPageClient({ projects }: Props) {
  return (
    <>
      <PageHero
        label="پورتفوی"
        title="پروژه‌های اجرا شده"
        description="نگاهی به بزرگ‌ترین پروژه‌های تامین لوله آب و فاضلاب در سراسر کشور"
      />

      <section className="section-padding">
        <div className="container-main">
          {projects.length === 0 ? (
            <p className="text-center text-[var(--muted-foreground)] py-16">پروژه‌ای ثبت نشده است.</p>
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
                        <span className="absolute top-3 right-3 h-7 px-3 rounded-lg bg-white/90 text-[var(--ink)] text-xs font-bold flex items-center">
                          {project.client}
                        </span>
                      )}
                    </div>
                    <div className="mt-4 flex items-center gap-3 text-xs text-[var(--muted-foreground)] num">
                      {project.location && (
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{project.location}</span>
                      )}
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{faDigits(project.year)}</span>
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
