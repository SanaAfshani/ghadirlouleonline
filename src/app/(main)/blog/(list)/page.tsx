import type { Metadata } from 'next';
import { BlogListClient } from '@/features/blog/BlogListClient';
import { getPublishedBlogPosts } from '@/shared/lib/data';
import { formatDate } from '@/shared/lib/utils';
import { siteConfig } from '@/shared/config/site';
import { JsonLd } from '@/shared/ui/JsonLd';
import { breadcrumbSchema } from '@/shared/lib/seo';

/** با انتشار مقاله تازه عوض می‌شود. */
export const revalidate = 1800;

export const metadata: Metadata = {
  title: 'وبلاگ | راهنمای خرید و مقالات تخصصی لوله',
  description:
    'مقالات تخصصی و راهنمای خرید لوله آب و فاضلاب، کاروگیت، پلی اتیلن، پلیکا و اتصالات — نوشته کارشناسان قدیر لوله آنلاین.',
  alternates: { canonical: `${siteConfig.url}/blog` },
};

export default async function BlogPage() {
  const posts = await getPublishedBlogPosts();

  const cards = posts.map((p) => ({
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    readTime: p.readTime,
    tag: p.tags[0] || 'مقاله',
    date: formatDate(p.createdAt),
    featured: p.featured,
    coverImage: p.coverImage || undefined,
  }));

  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: `وبلاگ ${siteConfig.name}`,
    url: `${siteConfig.url}/blog`,
    inLanguage: 'fa-IR',
    publisher: { '@type': 'Organization', name: siteConfig.name, url: siteConfig.url },
    blogPost: posts.slice(0, 20).map((p) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      url: `${siteConfig.url}/blog/${encodeURIComponent(p.slug)}`,
      datePublished: p.createdAt.toISOString(),
    })),
  };

  return (
    <>
      <JsonLd data={blogSchema} />
      <JsonLd data={breadcrumbSchema([{ name: 'وبلاگ', path: '/blog' }])} />
      <BlogListClient posts={cards} />
    </>
  );
}
