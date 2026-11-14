import { safeDecode } from '@/shared/lib/utils';
import { ensureBlogPost } from '@/shared/lib/route-guards';
import type { Metadata } from 'next';
import { BlogPostView } from '@/features/blog/BlogPostView';
import { getBlogPostBySlug, getNavCategories, getPublishedBlogPosts, getSiteSettingsMap } from '@/shared/lib/data';
import { mergeSiteSettings } from '@/shared/lib/site-settings';
import { siteConfig } from '@/shared/config/site';
import { JsonLd } from '@/shared/ui/JsonLd';
import { absoluteUrl, breadcrumbSchema, faqPageSchema, toMetaDescription } from '@/shared/lib/seo';
import { stripHtml } from '@/shared/lib/utils';
import { localeTag, localizePath } from '@/shared/i18n/config';
import { defineMessages, fill } from '@/shared/i18n/messages';
import { localeAlternates, resolveLocale } from '@/shared/i18n/server';
import { localizeRecord } from '@/shared/lib/translations';

/** متن مقاله پس از انتشار کم دست می‌خورد. */
export const revalidate = 1800;

type Props = { params: Promise<{ lang: string; slug: string }> };

const messages = defineMessages({
  fa: { notFound: 'مقاله یافت نشد', crumb: 'وبلاگ', blogName: 'وبلاگ {site}' },
  en: { notFound: 'Article not found', crumb: 'Blog', blogName: '{site} blog' },
});


/**
 * بدون این، سگمنت پارامتری در هر درخواست از نو رندر می‌شود و revalidate به‌تنهایی کاری نمی‌کند —
 * با هدر no-store دیده می‌شد. با فهرست‌کردن آدرس‌های موجود، همان‌ها موقع build ساخته و کش می‌شوند.
 * dynamicParams پیش‌فرض روشن است، پس محصول یا مقاله‌ای که بعداً اضافه شود هم کار می‌کند.
 */
export async function generateStaticParams() {
  const posts = await getPublishedBlogPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const { slug: rawSlug } = await params;
  const slug = safeDecode(rawSlug);
  const [found, raw] = await Promise.all([getBlogPostBySlug(slug), getSiteSettingsMap()]);
  if (!found) return { title: messages[locale].notFound, robots: { index: false, follow: true } };
  const post = localizeRecord(found, locale, 'title');
  const settings = mergeSiteSettings(raw, locale);

  // مقادیر ست‌شده در پنل ادمین اولویت دارند؛ در صورت خالی بودن از محتوای مقاله fallback می‌شود
  const description = toMetaDescription(post.metaDescription || post.excerpt || post.content);
  const ogTitle = post.ogTitle || post.metaTitle || post.title;
  const ogDescription = toMetaDescription(post.ogDescription || description);
  const path = `/blog/${encodeURIComponent(slug)}`;
  const canonical = absoluteUrl(localizePath(path, locale));
  const image = post.coverImage ? absoluteUrl(post.coverImage) : undefined;

  return {
    // metaTitle دقیقاً همان چیزی است که ادمین در پیش‌نمایش گوگل دیده — پس template سایت روی آن اعمال نمی‌شود
    title: post.metaTitle ? { absolute: post.metaTitle } : post.title,
    description,
    ...(post.focusKeyword && locale === 'fa' ? { keywords: [post.focusKeyword] } : {}),
    // مقاله ترجمه‌نشده در /en فارسی نمایش داده می‌شود — noindex و بدون hreflang
    ...localeAlternates(path, locale, post.translated),
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: canonical,
      type: 'article',
      publishedTime: post.createdAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [post.author?.name ?? settings.siteName],
      ...(image ? { images: [{ url: image, alt: ogTitle }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: ogDescription,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const locale = await resolveLocale(params);
  const t = messages[locale];
  const { slug: rawSlug } = await params;
  const slug = safeDecode(rawSlug);
  // ریدایرکت/۴۰۴ قبلاً در layout همین مسیر انجام شده
  const original = await ensureBlogPost(slug, locale);
  const post = localizeRecord(original, locale, 'title');
  const settings = mergeSiteSettings(await getSiteSettingsMap(), locale);

  // مقاله اطلاعاتی بن‌بست نباشد: دسته‌هایی که در مقاله از آن‌ها نام برده شده، به صفحه خرید همان دسته لینک می‌شوند.
  // نام کامل دسته («منهول و دریچه») در متن کم می‌آید؛ هسته نام («منهول») جستجو می‌شود و پرتکرارترها اول می‌آیند.
  // تطبیق همیشه روی متن و نام فارسی است (ترجمه ممکن است ناقص باشد)؛ فقط نام نمایشی به زبان صفحه است
  const norm = (s: string) => s.replace(/[\u200c\s]+/g, ' ');
  const text = norm(`${original.title} ${original.tags.join(' ')} ${stripHtml(original.content)}`);
  const mentions = (name: string) => text.split(norm(name).replace(/^لوله /, '').split(' و ')[0]).length - 1;
  const [faCategories, localCategories] = await Promise.all([getNavCategories(), getNavCategories(locale)]);
  const localName = new Map(localCategories.map((c) => [c.slug, c.name]));
  const relatedCategories = faCategories
    .map((c) => ({ slug: c.slug, name: localName.get(c.slug) ?? c.name, comingSoon: c.comingSoon, count: mentions(c.name) }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 4)
    .map(({ slug, name, comingSoon }) => ({ slug, name, comingSoon }));

  const url = absoluteUrl(localizePath(`/blog/${encodeURIComponent(slug)}`, locale));

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.metaTitle || post.title,
    name: post.title,
    description: toMetaDescription(post.metaDescription || post.excerpt || post.content, 400),
    ...(post.focusKeyword && locale === 'fa' ? { keywords: post.focusKeyword } : {}),
    author: {
      '@type': 'Person',
      name: post.author?.name ?? settings.siteName,
    },
    publisher: {
      '@type': 'Organization',
      name: settings.siteName,
      url: siteConfig.url,
    },
    datePublished: post.createdAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    url,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    ...(post.coverImage ? { image: absoluteUrl(post.coverImage) } : {}),
    ...(post.content
      ? { wordCount: post.content.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).length }
      : {}),
    isPartOf: { '@type': 'Blog', name: fill(t.blogName, { site: settings.siteName }), url: absoluteUrl(localizePath('/blog', locale)) },
    // مقاله ترجمه‌نشده در /en همان متن فارسی است
    inLanguage: localeTag[post.translated ? locale : 'fa'],
  };

  return (
    <>
      <JsonLd data={articleSchema} />
      {/* سوالات متداول اختصاصی مقاله — واجد شرایط rich result آکاردئونی */}
      {post.faqs.length > 0 && <JsonLd data={faqPageSchema(post.faqs)} />}
      <JsonLd
        data={breadcrumbSchema(
          [
            { name: t.crumb, path: '/blog' },
            { name: post.title, path: `/blog/${encodeURIComponent(slug)}` },
          ],
          locale,
        )}
      />
      <BlogPostView post={post} relatedCategories={relatedCategories} />
    </>
  );
}
