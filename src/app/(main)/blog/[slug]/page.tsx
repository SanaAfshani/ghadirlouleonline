import { safeDecode } from '@/shared/lib/utils';
import { ensureBlogPost } from '@/shared/lib/route-guards';
import type { Metadata } from 'next';
import { BlogPostView } from '@/features/blog/BlogPostView';
import { getBlogPostBySlug, getNavCategories, getPublishedBlogPosts } from '@/shared/lib/data';
import { siteConfig } from '@/shared/config/site';
import { JsonLd } from '@/shared/ui/JsonLd';
import { absoluteUrl, breadcrumbSchema, faqPageSchema, toMetaDescription } from '@/shared/lib/seo';
import { stripHtml } from '@/shared/lib/utils';

/** متن مقاله پس از انتشار کم دست می‌خورد. */
export const revalidate = 1800;

type Props = { params: Promise<{ slug: string }> };


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
  const { slug: rawSlug } = await params;
  const slug = safeDecode(rawSlug);
  const post = await getBlogPostBySlug(slug);
  if (!post) return { title: 'مقاله یافت نشد', robots: { index: false, follow: true } };

  // مقادیر ست‌شده در پنل ادمین اولویت دارند؛ در صورت خالی بودن از محتوای مقاله fallback می‌شود
  const description = toMetaDescription(post.metaDescription || post.excerpt || post.content);
  const ogTitle = post.ogTitle || post.metaTitle || post.title;
  const ogDescription = toMetaDescription(post.ogDescription || description);
  const canonical = `${siteConfig.url}/blog/${encodeURIComponent(slug)}`;
  const image = post.coverImage ? absoluteUrl(post.coverImage) : undefined;

  return {
    // metaTitle دقیقاً همان چیزی است که ادمین در پیش‌نمایش گوگل دیده — پس template سایت روی آن اعمال نمی‌شود
    title: post.metaTitle ? { absolute: post.metaTitle } : post.title,
    description,
    ...(post.focusKeyword ? { keywords: [post.focusKeyword] } : {}),
    alternates: { canonical },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: canonical,
      type: 'article',
      publishedTime: post.createdAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [post.author?.name ?? siteConfig.name],
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
  const { slug: rawSlug } = await params;
  const slug = safeDecode(rawSlug);
  // ریدایرکت/۴۰۴ قبلاً در layout همین مسیر انجام شده
  const post = await ensureBlogPost(slug);

  // مقاله اطلاعاتی بن‌بست نباشد: دسته‌هایی که در مقاله از آن‌ها نام برده شده، به صفحه خرید همان دسته لینک می‌شوند.
  // نام کامل دسته («منهول و دریچه») در متن کم می‌آید؛ هسته نام («منهول») جستجو می‌شود و پرتکرارترها اول می‌آیند
  const norm = (s: string) => s.replace(/[\u200c\s]+/g, ' ');
  const text = norm(`${post.title} ${post.tags.join(' ')} ${stripHtml(post.content)}`);
  const mentions = (name: string) => text.split(norm(name).replace(/^لوله /, '').split(' و ')[0]).length - 1;
  const relatedCategories = (await getNavCategories())
    .map((c) => ({ slug: c.slug, name: c.name, comingSoon: c.comingSoon, count: mentions(c.name) }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 4)
    .map(({ slug, name, comingSoon }) => ({ slug, name, comingSoon }));

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.metaTitle || post.title,
    name: post.title,
    description: toMetaDescription(post.metaDescription || post.excerpt || post.content, 400),
    ...(post.focusKeyword ? { keywords: post.focusKeyword } : {}),
    author: {
      '@type': 'Person',
      name: post.author?.name ?? siteConfig.name,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.url,
    },
    datePublished: post.createdAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    url: `${siteConfig.url}/blog/${encodeURIComponent(slug)}`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteConfig.url}/blog/${encodeURIComponent(slug)}`,
    },
    ...(post.coverImage ? { image: absoluteUrl(post.coverImage) } : {}),
    ...(post.content
      ? { wordCount: post.content.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).length }
      : {}),
    isPartOf: { '@type': 'Blog', name: `وبلاگ ${siteConfig.name}`, url: `${siteConfig.url}/blog` },
    inLanguage: 'fa-IR',
  };

  return (
    <>
      <JsonLd data={articleSchema} />
      {/* سوالات متداول اختصاصی مقاله — واجد شرایط rich result آکاردئونی */}
      {post.faqs.length > 0 && <JsonLd data={faqPageSchema(post.faqs)} />}
      <JsonLd
        data={breadcrumbSchema([
          { name: 'وبلاگ', path: '/blog' },
          { name: post.title, path: `/blog/${encodeURIComponent(slug)}` },
        ])}
      />
      <BlogPostView post={post} relatedCategories={relatedCategories} />
    </>
  );
}
