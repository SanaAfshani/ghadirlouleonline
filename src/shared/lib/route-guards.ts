import { notFound, permanentRedirect } from 'next/navigation';
import { findRedirect } from '@/shared/lib/redirects';
import { getBlogPostBySlug, getCategoryBySlug, getProductBySlug, getProjectBySlug } from '@/shared/lib/data';

/**
 * بررسی وجود + ریدایرکت ۳۰۸ / ۴۰۴ صفحه‌های جزئیات — در layout همان مسیر صدا زده می‌شود، قبل از مرز loading.tsx،
 * تا کد وضعیت واقعی (۴۰۴/۳۰۸) قبل از شروع استریم ارسال شود؛ وگرنه اسکلت بارگذاری ۴۰۴ را ۲۰۰ می‌کرد (soft 404).
 * صفحه هم همین را صدا می‌زند؛ داده‌ها با cache یک بار خوانده می‌شوند.
 */

export async function ensureCategory(slug: string) {
  const category = await getCategoryBySlug(slug);
  if (category) return category;
  const moved = await findRedirect(`/products/${slug}`);
  if (moved) permanentRedirect(moved);
  notFound();
}

export async function ensureProduct(categorySlug: string, slug: string) {
  const product = await getProductBySlug(slug, categorySlug);
  if (product) return product;
  // اسلاگ محصول یکتاست؛ اگر فقط دسته عوض شده، محصول را بدون دسته پیدا و به آدرس درست منتقل کن
  const elsewhere = await getProductBySlug(slug);
  if (elsewhere) {
    permanentRedirect(`/products/${encodeURIComponent(elsewhere.category.slug)}/${encodeURIComponent(elsewhere.slug)}`);
  }
  const moved = await findRedirect(`/products/${categorySlug}/${slug}`);
  if (moved) permanentRedirect(moved);
  notFound();
}

export async function ensureBlogPost(slug: string) {
  const post = await getBlogPostBySlug(slug);
  if (post) return post;
  const moved = await findRedirect(`/blog/${slug}`);
  if (moved) permanentRedirect(moved);
  notFound();
}

export async function ensureProject(slug: string) {
  const project = await getProjectBySlug(slug);
  if (project) return project;
  const moved = await findRedirect(`/projects/${slug}`);
  if (moved) permanentRedirect(moved);
  notFound();
}
