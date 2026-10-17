import type { MetadataRoute } from 'next';
import { getPublishedBlogPosts, getPublishedCategories, getSitemapData } from '@/shared/lib/data';
import { siteConfig } from '@/shared/config/site';
import { getSiteSettingsMap } from '@/shared/lib/site-settings-store';
import { parseCertificates } from '@/shared/lib/site-settings';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;

  const [categories, { products, projects, pricesUpdatedAt }, posts, settings] = await Promise.all([
    getPublishedCategories(),
    getSitemapData(),
    getPublishedBlogPosts(),
    getSiteSettingsMap(),
  ]);

  // lastmod فقط وقتی تاریخ واقعی داریم؛ صفحات ثابت بدون lastmod (تاریخ ساختگی بدتر از نبودنش است)
  const pricesModified = pricesUpdatedAt ?? undefined;
  const latestPost = posts.reduce<Date | undefined>((a, p) => (!a || p.updatedAt > a ? p.updatedAt : a), undefined);

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: pricesModified, changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/products`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/prices`, lastModified: pricesModified, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/categories`, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${baseUrl}/about`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/contact`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/blog`, lastModified: latestPost, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/services`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/faq`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/track`, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${baseUrl}/terms`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
  ];

  const categoryPages: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${baseUrl}/products/${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${baseUrl}/products/${encodeURIComponent(p.categorySlug)}/${encodeURIComponent(p.slug)}`,
    lastModified: p.lastModified,
    changeFrequency: 'weekly',
    priority: 0.75,
  }));

  const blogPages: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${baseUrl}/blog/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const projectPages: MetadataRoute.Sitemap = projects.map((p) => ({
    url: `${baseUrl}/projects/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.65,
  }));

  // /search (noindex) در سایت‌مپ نیست؛ /projects فقط وقتی پروژه‌ای ثبت شده باشد
  const projectsIndex: MetadataRoute.Sitemap = projects.length
    ? [{ url: `${baseUrl}/projects`, changeFrequency: 'monthly', priority: 0.6 }]
    : [];

  // /certificates بدون گواهی ۴۰۴ است
  const certificatesPage: MetadataRoute.Sitemap = parseCertificates(settings.certificates).length
    ? [{ url: `${baseUrl}/certificates`, changeFrequency: 'yearly', priority: 0.5 }]
    : [];

  return [...staticPages, ...categoryPages, ...productPages, ...blogPages, ...projectsIndex, ...projectPages, ...certificatesPage];
}
