import type { Metadata } from 'next';
import { BlogListClient } from '@/features/blog/BlogListClient';
import { getPublishedBlogPosts, getSiteSettingsMap } from '@/shared/lib/data';
import { mergeSiteSettings } from '@/shared/lib/site-settings';
import { siteConfig } from '@/shared/config/site';
import { JsonLd } from '@/shared/ui/JsonLd';
import { absoluteUrl, breadcrumbSchema } from '@/shared/lib/seo';
import { localeTag, localizePath } from '@/shared/i18n/config';
import { formatDate } from '@/shared/i18n/format';
import { defineMessages, fill } from '@/shared/i18n/messages';
import { resolveLocale } from '@/shared/i18n/server';
import { localizeRecord } from '@/shared/lib/translations';
import { getSection } from '@/shared/content/server';
import { staticPageMetadata } from '@/shared/content/metadata';
import { blogHero, blogSeo } from '@/shared/content/pages/blog';

/** با انتشار مقاله تازه عوض می‌شود. */
export const revalidate = 1800;

const messages = defineMessages({
  fa: { crumb: 'وبلاگ', blogName: 'وبلاگ {site}', defaultTag: 'مقاله' },
  en: { crumb: 'Blog', blogName: '{site} blog', defaultTag: 'Article' },
});

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await resolveLocale(params);
  return staticPageMetadata(await getSection(blogSeo, locale), '/blog', locale);
}

export default async function BlogPage({ params }: Props) {
  const locale = await resolveLocale(params);
  const t = messages[locale];
  const [rawPosts, hero, raw] = await Promise.all([getPublishedBlogPosts(), getSection(blogHero, locale), getSiteSettingsMap()]);
  const settings = mergeSiteSettings(raw, locale);
  const posts = rawPosts.map((p) => localizeRecord(p, locale, 'title'));

  const cards = posts.map((p) => ({
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    readTime: p.readTime,
    tag: p.tags[0] || t.defaultTag,
    date: formatDate(p.createdAt, locale),
    featured: p.featured,
    coverImage: p.coverImage || undefined,
  }));

  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: fill(t.blogName, { site: settings.siteName }),
    url: absoluteUrl(localizePath('/blog', locale)),
    inLanguage: localeTag[locale],
    publisher: { '@type': 'Organization', name: settings.siteName, url: siteConfig.url },
    blogPost: posts.slice(0, 20).map((p) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      url: absoluteUrl(localizePath(`/blog/${encodeURIComponent(p.slug)}`, locale)),
      datePublished: p.createdAt.toISOString(),
    })),
  };

  return (
    <>
      <JsonLd data={blogSchema} />
      <JsonLd data={breadcrumbSchema([{ name: t.crumb, path: '/blog' }], locale)} />
      <BlogListClient posts={cards} hero={hero} />
    </>
  );
}
