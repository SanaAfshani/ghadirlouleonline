import type { MetadataRoute } from 'next';
import { getPublishedBlogPosts, getPublishedCategories, getSitemapData } from '@/shared/lib/data';
import { siteConfig } from '@/shared/config/site';
import { getSiteSettingsMap } from '@/shared/lib/site-settings-store';
import { parseCertificates } from '@/shared/lib/site-settings';
import { isTranslated } from '@/shared/lib/translations';
import { getSection } from '@/shared/content/server';
import { factoryGallery } from '@/shared/content/pages/factory';
import { localeTag, localizePath, locales, type Locale } from '@/shared/i18n/config';

export const dynamic = 'force-dynamic';

type Entry = MetadataRoute.Sitemap[number];

/**
 * هر صفحه به ازای هر زبانِ موجود یک ردیف می‌گیرد و نسخه‌های دیگر را با hreflang معرفی می‌کند.
 * محتوای دیتابیسِ ترجمه‌نشده فقط نسخه فارسی دارد — صفحه انگلیسی‌اش noindex است و در سایت‌مپ نمی‌آید.
 */
function localized(baseUrl: string, path: string, entry: Omit<Entry, 'url'>, translated = true): MetadataRoute.Sitemap {
  const available: Locale[] = translated ? [...locales] : ['fa'];
  const url = (l: Locale) => `${baseUrl}${localizePath(path, l) === '/' ? '' : localizePath(path, l)}`;
  const alternates =
    available.length > 1
      ? { languages: { ...Object.fromEntries(available.map((l) => [localeTag[l], url(l)])), 'x-default': url('fa') } }
      : undefined;
  return available.map((l) => ({ ...entry, url: url(l), ...(alternates ? { alternates } : {}) }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;

  // سایت‌مپ تصاویر: عکس‌های هر صفحه برای جستجوی تصویری گوگل — آدرس مطلق
  const abs = (u: string | null | undefined) => (u ? (u.startsWith('http') ? u : `${baseUrl}${u.startsWith('/') ? '' : '/'}${u}`) : null);
  const imgs = (list: (string | null | undefined)[]) => list.map(abs).filter((u): u is string => !!u);

  const [categories, { products, projects, pricesUpdatedAt }, posts, settings, gallery] = await Promise.all([
    getPublishedCategories(),
    getSitemapData(),
    getPublishedBlogPosts(),
    getSiteSettingsMap(),
    getSection(factoryGallery, 'fa'),
  ]);

  // lastmod فقط وقتی تاریخ واقعی داریم؛ صفحات ثابت بدون lastmod (تاریخ ساختگی بدتر از نبودنش است)
  const pricesModified = pricesUpdatedAt ?? undefined;
  const latestPost = posts.reduce<Date | undefined>((a, p) => (!a || p.updatedAt > a ? p.updatedAt : a), undefined);
  // صفحه /products فهرست همین محصولات است؛ تازه‌ترین تغییر محصول تاریخ واقعی آن است
  const latestProduct = products.reduce<Date | undefined>((a, p) => (!a || p.lastModified > a ? p.lastModified : a), undefined);

  const staticPages: MetadataRoute.Sitemap = [
    ...localized(baseUrl, '/', { lastModified: pricesModified, changeFrequency: 'daily', priority: 1, images: imgs(['/images/site/hero-v3-wm.webp', '/images/site/factory-aerial-wm.webp', '/images/site/factory-entrance-wm.webp']) }),
    ...localized(baseUrl, '/products', { lastModified: latestProduct, changeFrequency: 'daily', priority: 0.9 }),
    ...localized(baseUrl, '/prices', { lastModified: pricesModified, changeFrequency: 'daily', priority: 0.9 }),
    ...localized(baseUrl, '/about', { changeFrequency: 'monthly', priority: 0.7 }),
    // جایگاه «نماینده رسمی» برای سئوی برند مهم است
    ...localized(baseUrl, '/official-representative', { changeFrequency: 'yearly', priority: 0.8, images: imgs(['/images/site/representation-certificate.webp']) }),
    ...localized(baseUrl, '/project-inquiry', { changeFrequency: 'yearly', priority: 0.7 }),
    ...localized(baseUrl, '/factory', { changeFrequency: 'monthly', priority: 0.75, images: imgs(gallery.groups.flatMap((g) => g.photos.map((p) => p.image))) }),
    ...localized(baseUrl, '/contact', { changeFrequency: 'monthly', priority: 0.8 }),
    ...localized(baseUrl, '/blog', { lastModified: latestPost, changeFrequency: 'weekly', priority: 0.8 }),
    ...localized(baseUrl, '/services', { changeFrequency: 'monthly', priority: 0.7 }),
    ...localized(baseUrl, '/faq', { changeFrequency: 'monthly', priority: 0.6 }),
    ...localized(baseUrl, '/terms', { changeFrequency: 'yearly', priority: 0.3 }),
    ...localized(baseUrl, '/privacy', { changeFrequency: 'yearly', priority: 0.3 }),
  ];

  const categoryPages = categories.flatMap((c) =>
    localized(baseUrl, `/products/${c.slug}`, { lastModified: c.updatedAt, changeFrequency: 'weekly', priority: 0.8, images: imgs([c.image]) }, isTranslated(c.translations, 'en', 'name')),
  );

  const productPages = products.flatMap((p) =>
    localized(
      baseUrl,
      `/products/${encodeURIComponent(p.categorySlug)}/${encodeURIComponent(p.slug)}`,
      { lastModified: p.lastModified, changeFrequency: 'weekly', priority: 0.75, images: imgs(p.images) },
      isTranslated(p.translations, 'en', 'name'),
    ),
  );

  const blogPages = posts.flatMap((p) =>
    localized(baseUrl, `/blog/${p.slug}`, { lastModified: p.updatedAt, changeFrequency: 'monthly', priority: 0.7, images: imgs([p.coverImage]) }, isTranslated(p.translations, 'en', 'title')),
  );

  const projectPages = projects.flatMap((p) =>
    localized(baseUrl, `/projects/${p.slug}`, { lastModified: p.updatedAt, changeFrequency: 'monthly', priority: 0.65, images: imgs(p.images) }, isTranslated(p.translations, 'en', 'title')),
  );

  // /search (noindex) در سایت‌مپ نیست؛ /projects فقط وقتی پروژه‌ای ثبت شده باشد
  const projectsIndex = projects.length ? localized(baseUrl, '/projects', { changeFrequency: 'monthly', priority: 0.6 }) : [];

  // /certificates بدون گواهی ۴۰۴ است؛ جایگاه «نماینده انحصاری» برای سئو مهم است — اولویت بالاتر از صفحات قوانین
  const certificates = parseCertificates(settings.certificates);
  const certificatesPage = certificates.length
    ? localized(baseUrl, '/certificates', { changeFrequency: 'monthly', priority: 0.75, images: imgs(certificates.map((c) => c.image)) })
    : [];

  return [...staticPages, ...categoryPages, ...productPages, ...blogPages, ...projectsIndex, ...projectPages, ...certificatesPage];
}
