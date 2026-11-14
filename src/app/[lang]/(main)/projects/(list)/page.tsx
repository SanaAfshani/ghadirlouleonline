/** پروژه‌ها به‌ندرت اضافه می‌شوند. */
export const revalidate = 1800;

import type { Metadata } from 'next';
import { ProjectsPageClient } from '@/features/projects/ProjectsPageClient';
import { getPublishedProjects } from '@/shared/lib/data';
import { JsonLd } from '@/shared/ui/JsonLd';
import { breadcrumbSchema } from '@/shared/lib/seo';
import { resolveLocale } from '@/shared/i18n/server';
import { defineMessages } from '@/shared/i18n/messages';
import { localizeProject } from '@/features/projects/localize';
import { getSection } from '@/shared/content/server';
import { staticPageMetadata } from '@/shared/content/metadata';
import { projectsHero, projectsSeo } from '@/shared/content/pages/projects';

type Props = { params: Promise<{ lang: string }> };

const messages = defineMessages({
  fa: { crumb: 'پروژه‌ها' },
  en: { crumb: 'Projects' },
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const [seo, projects] = await Promise.all([getSection(projectsSeo, locale), getPublishedProjects()]);
  return {
    ...staticPageMetadata(seo, '/projects', locale),
    // صفحه خالی «محتوای کم» حساب می‌شود؛ با ثبت اولین پروژه خودکار ایندکس‌پذیر می‌شود
    ...(projects.length > 0 ? {} : { robots: { index: false, follow: true } }),
  };
}

export default async function ProjectsPage({ params }: Props) {
  const locale = await resolveLocale(params);
  const [rawProjects, hero] = await Promise.all([getPublishedProjects(), getSection(projectsHero, locale)]);
  const projects = rawProjects.map((p) => localizeProject(p, locale));
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: messages[locale].crumb, path: '/projects' }], locale)} />
      <ProjectsPageClient projects={projects} hero={hero} />
    </>
  );
}
