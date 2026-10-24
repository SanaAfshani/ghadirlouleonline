import type { MetadataRoute } from 'next';
import { getPublishedBlogPosts, getPublishedCategories, getSitemapData } from '@/shared/lib/data';
import { siteConfig } from '@/shared/config/site';
import { getSiteSettingsMap } from '@/shared/lib/site-settings-store';
import { parseCertificates } from '@/shared/lib/site-settings';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;

  // سایت‌مپ تصاویر: عکس‌های هر صفحه برای جستجوی تصویری گوگل — آدرس مطلق
  const abs = (u: string | null | undefined) => (u ? (u.startsWith('http') ? u : `${baseUrl}${u.startsWith('/') ? '' : '/'}${u}`) : null);
  const imgs = (list: (string | null | undefined)[]) => list.map(abs).filter((u): u is string => !!u);

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
    { url: baseUrl, lastModified: pricesModified, changeFrequency: 'daily', priority: 1, images: imgs(['/images/site/hero-v2-wm.webp', '/images/site/factory-aerial-wm.webp']) },
    { url: `${baseUrl}/products`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/prices`, lastModified: pricesModified, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/categories`, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${baseUrl}/about`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/contact`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/blog`, lastModified: latestPost, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/services`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/faq`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/terms`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
  ];

  const categoryPages: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${baseUrl}/products/${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
    images: imgs([c.image]),
  }));

  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${baseUrl}/products/${encodeURIComponent(p.categorySlug)}/${encodeURIComponent(p.slug)}`,
    lastModified: p.lastModified,
    changeFrequency: 'weekly',
    priority: 0.75,
    images: imgs(p.images),
  }));

  const blogPages: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${baseUrl}/blog/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.7,
    images: imgs([p.coverImage]),
  }));

  const projectPages: MetadataRoute.Sitemap = projects.map((p) => ({
    url: `${baseUrl}/projects/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.65,
    images: imgs(p.images),
  }));

  // /search (noindex) در سایت‌مپ نیست؛ /projects فقط وقتی پروژه‌ای ثبت شده باشد
  const projectsIndex: MetadataRoute.Sitemap = projects.length
    ? [{ url: `${baseUrl}/projects`, changeFrequency: 'monthly', priority: 0.6 }]
    : [];

  // /certificates بدون گواهی ۴۰۴ است؛ جایگاه «نماینده انحصاری» برای سئو مهم است — اولویت بالاتر از صفحات قوانین
  const certificates = parseCertificates(settings.certificates);
  const certificatesPage: MetadataRoute.Sitemap = certificates.length
    ? [{ url: `${baseUrl}/certificates`, changeFrequency: 'monthly', priority: 0.75, images: imgs(certificates.map((c) => c.image)) }]
    : [];

  return [...staticPages, ...categoryPages, ...productPages, ...blogPages, ...projectsIndex, ...projectPages, ...certificatesPage];
}
