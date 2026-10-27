/** صفحه یک پروژه. */
export const revalidate = 1800;

import { safeDecode } from '@/shared/lib/utils';
import { ensureProject } from '@/shared/lib/route-guards';
import type { Metadata } from 'next';
import { ProjectDetailView } from '@/features/projects/ProjectDetailView';
import { getProjectBySlug, getSitemapData } from '@/shared/lib/data';
import { siteConfig } from '@/shared/config/site';
import { JsonLd } from '@/shared/ui/JsonLd';
import { absoluteUrl, breadcrumbSchema, faqPageSchema, toMetaDescription } from '@/shared/lib/seo';

type Props = { params: Promise<{ slug: string }> };


/**
 * بدون این، سگمنت پارامتری در هر درخواست از نو رندر می‌شود و revalidate به‌تنهایی کاری نمی‌کند —
 * با هدر no-store دیده می‌شد. با فهرست‌کردن آدرس‌های موجود، همان‌ها موقع build ساخته و کش می‌شوند.
 * dynamicParams پیش‌فرض روشن است، پس محصول یا مقاله‌ای که بعداً اضافه شود هم کار می‌کند.
 */
export async function generateStaticParams() {
  const { projects } = await getSitemapData();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = safeDecode(rawSlug);
  const project = await getProjectBySlug(slug);
  if (!project) return { title: 'پروژه یافت نشد', robots: { index: false, follow: true } };

  const desc = toMetaDescription(
    project.metaDescription ||
      project.description ||
      project.content ||
      `پروژه ${project.title}${project.location ? ` در ${project.location}` : ''} — تامین لوله و اتصالات توسط ${siteConfig.name}.`
  );
  const canonical = `${siteConfig.url}/projects/${encodeURIComponent(slug)}`;
  const cover = project.images?.[0];
  const image = cover ? absoluteUrl(cover.url) : undefined;
  const ogTitle = project.ogTitle || project.metaTitle || `${project.title} | ${siteConfig.name}`;
  const ogDescription = toMetaDescription(project.ogDescription || desc);

  return {
    // metaTitle دقیقاً همان چیزی است که ادمین در پیش‌نمایش گوگل دیده — پس template سایت روی آن اعمال نمی‌شود
    title: project.metaTitle ? { absolute: project.metaTitle } : `${project.title} | پروژه‌ها`,
    description: desc,
    alternates: { canonical },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: canonical,
      type: 'article',
      ...(image ? { images: [{ url: image, alt: cover?.alt || project.title }] } : {}),
    },
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug: rawSlug } = await params;
  const slug = safeDecode(rawSlug);
  // ریدایرکت/۴۰۴ قبلاً در layout همین مسیر انجام شده
  const project = await ensureProject(slug);

  const canonical = `${siteConfig.url}/projects/${encodeURIComponent(slug)}`;
  const images = (project.images ?? []).map((image) => absoluteUrl(image.url));

  const projectSchema = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: toMetaDescription(project.metaDescription || project.description || project.content, 400),
    url: canonical,
    inLanguage: 'fa-IR',
    ...(images.length ? { image: images } : {}),
    ...(project.year ? { dateCreated: String(project.year) } : {}),
    ...(project.location ? { locationCreated: { '@type': 'Place', name: project.location } } : {}),
    creator: { '@type': 'Organization', name: siteConfig.name, url: siteConfig.url },
  };

  return (
    <>
      <JsonLd data={projectSchema} />
      {project.faqs.length > 0 && <JsonLd data={faqPageSchema(project.faqs)} />}
      <JsonLd
        data={breadcrumbSchema([
          { name: 'پروژه‌ها', path: '/projects' },
          { name: project.title, path: `/projects/${encodeURIComponent(slug)}` },
        ])}
      />
      <ProjectDetailView project={project} />
    </>
  );
}
