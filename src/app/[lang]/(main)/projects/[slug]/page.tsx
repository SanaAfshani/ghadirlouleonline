/** صفحه یک پروژه. */
export const revalidate = 1800;

import { safeDecode } from '@/shared/lib/utils';
import { ensureProject } from '@/shared/lib/route-guards';
import type { Metadata } from 'next';
import { ProjectDetailView } from '@/features/projects/ProjectDetailView';
import { getProjectBySlug, getSiteSettingsMap, getSitemapData } from '@/shared/lib/data';
import { mergeSiteSettings } from '@/shared/lib/site-settings';
import { siteConfig } from '@/shared/config/site';
import { JsonLd } from '@/shared/ui/JsonLd';
import { absoluteUrl, breadcrumbSchema, faqPageSchema, toMetaDescription } from '@/shared/lib/seo';
import { localeTag, localizePath } from '@/shared/i18n/config';
import { defineMessages, fill } from '@/shared/i18n/messages';
import { localeAlternates, resolveLocale } from '@/shared/i18n/server';
import { localizeProject } from '@/features/projects/localize';

type Props = { params: Promise<{ lang: string; slug: string }> };

const messages = defineMessages({
  fa: {
    notFound: 'پروژه یافت نشد',
    crumb: 'پروژه‌ها',
    title: '{title} | پروژه‌ها',
    description: 'پروژه {title}{location} — تامین لوله و اتصالات توسط {site}.',
    location: ' در {location}',
  },
  en: {
    notFound: 'Project not found',
    crumb: 'Projects',
    title: '{title} | Projects',
    description: '{title} project{location} — pipes and fittings supplied by {site}.',
    location: ' in {location}',
  },
});


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
  const locale = await resolveLocale(params);
  const t = messages[locale];
  const { slug: rawSlug } = await params;
  const slug = safeDecode(rawSlug);
  const [found, raw] = await Promise.all([getProjectBySlug(slug), getSiteSettingsMap()]);
  if (!found) return { title: t.notFound, robots: { index: false, follow: true } };
  const project = localizeProject(found, locale);
  const siteName = mergeSiteSettings(raw, locale).siteName;

  const desc = toMetaDescription(
    project.metaDescription ||
      project.description ||
      project.content ||
      fill(t.description, {
        title: project.title,
        location: project.location ? fill(t.location, { location: project.location }) : '',
        site: siteName,
      })
  );
  const path = `/projects/${encodeURIComponent(slug)}`;
  const canonical = absoluteUrl(localizePath(path, locale));
  const cover = project.images?.[0];
  const image = cover ? absoluteUrl(cover.url) : undefined;
  const ogTitle = project.ogTitle || project.metaTitle || `${project.title} | ${siteName}`;
  const ogDescription = toMetaDescription(project.ogDescription || desc);

  return {
    // metaTitle دقیقاً همان چیزی است که ادمین در پیش‌نمایش گوگل دیده — پس template سایت روی آن اعمال نمی‌شود
    title: project.metaTitle ? { absolute: project.metaTitle } : fill(t.title, { title: project.title }),
    description: desc,
    // پروژه ترجمه‌نشده در /en فارسی نمایش داده می‌شود — noindex و بدون hreflang
    ...localeAlternates(path, locale, project.translated),
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
  const locale = await resolveLocale(params);
  const { slug: rawSlug } = await params;
  const slug = safeDecode(rawSlug);
  // ریدایرکت/۴۰۴ قبلاً در layout همین مسیر انجام شده
  const project = localizeProject(await ensureProject(slug, locale), locale);
  const siteName = mergeSiteSettings(await getSiteSettingsMap(), locale).siteName;

  const canonical = absoluteUrl(localizePath(`/projects/${encodeURIComponent(slug)}`, locale));
  const images = (project.images ?? []).map((image) => absoluteUrl(image.url));

  const projectSchema = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: toMetaDescription(project.metaDescription || project.description || project.content, 400),
    url: canonical,
    // پروژه ترجمه‌نشده در /en همان متن فارسی است
    inLanguage: localeTag[project.translated ? locale : 'fa'],
    ...(images.length ? { image: images } : {}),
    ...(project.year ? { dateCreated: String(project.year) } : {}),
    ...(project.location ? { locationCreated: { '@type': 'Place', name: project.location } } : {}),
    creator: { '@type': 'Organization', name: siteName, url: siteConfig.url },
  };

  return (
    <>
      <JsonLd data={projectSchema} />
      {project.faqs.length > 0 && <JsonLd data={faqPageSchema(project.faqs)} />}
      <JsonLd
        data={breadcrumbSchema(
          [
            { name: messages[locale].crumb, path: '/projects' },
            { name: project.title, path: `/projects/${encodeURIComponent(slug)}` },
          ],
          locale,
        )}
      />
      <ProjectDetailView project={project} />
    </>
  );
}
