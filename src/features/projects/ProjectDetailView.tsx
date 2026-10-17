'use client';

import Image from 'next/image';
import { m as motion } from 'framer-motion';
import Link from 'next/link';
import { MapPin, Calendar, Building2, ArrowRight } from 'lucide-react';
import type { Project } from '@/shared/types';
import { faDigits } from '@/shared/lib/utils';

type Props = {
  project: Project;
};

export function ProjectDetailView({ project }: Props) {
  const heroImage = project.images[0];

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="container-main py-10 max-w-4xl">
        <nav className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] mb-8 flex-wrap">
          <Link href="/" className="hover:text-[var(--accent-text)] transition-colors">
            خانه
          </Link>
          <span>/</span>
          <Link href="/projects" className="hover:text-[var(--accent-text)] transition-colors">
            پروژه‌ها
          </Link>
          <span>/</span>
          <span className="text-[var(--foreground)] truncate">{project.title}</span>
        </nav>

        <motion.article>
          {heroImage && (
            <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden mb-8">
              <Image src={heroImage} alt={project.title} fill className="object-cover" priority />
            </div>
          )}

          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-black text-[var(--foreground)] mb-5 leading-tight">
              {project.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--muted-foreground)]">
              {project.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {project.location}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                سال {faDigits(project.year)}
              </span>
              {project.client && (
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4" />
                  {project.client}
                </span>
              )}
            </div>
          </div>

          {project.description && (
            <p className="text-lg text-[var(--muted-foreground)] leading-relaxed mb-8">
              {project.description}
            </p>
          )}

          {project.content && (
            <div
              className="prose prose-lg max-w-none text-[var(--foreground)] leading-relaxed [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-4 [&_p]:mb-4"
              dangerouslySetInnerHTML={{ __html: project.content }}
            />
          )}

          {project.images.length > 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-10">
              {project.images.slice(1).map((src) => (
                <div key={src} className="relative h-48 rounded-xl overflow-hidden">
                  <Image src={src} alt={project.title} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}

          <div className="mt-12 pt-8 border-t border-[var(--border)]">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 text-[var(--accent-text)] font-semibold hover:gap-3 transition-all"
            >
              <ArrowRight className="w-4 h-4" />
              بازگشت به پروژه‌ها
            </Link>
          </div>
        </motion.article>
      </div>
    </div>
  );
}
