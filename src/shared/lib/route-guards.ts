import { notFound, permanentRedirect } from 'next/navigation';
import { findRedirect } from '@/shared/lib/redirects';
import { getBlogPostBySlug, getCategoryBySlug, getProductBySlug, getProjectBySlug } from '@/shared/lib/data';
import { defaultLocale, localizePath, type Locale } from '@/shared/i18n/config';

/** ریدایرکت دائمی با پیشوند زبان صفحه — کاربر نسخه انگلیسی به صفحه فارسی پرت نشود */
function movedTo(path: string, locale: Locale): never {
  permanentRedirect(localizePath(path, locale));
}

/**
 * بررسی وجود + ریدایرکت ۳۰۸ / ۴۰۴ صفحه‌های جزئیات — در layout همان مسیر صدا زده می‌شود، قبل از مرز loading.tsx،
 * تا کد وضعیت واقعی (۴۰۴/۳۰۸) قبل از شروع استریم ارسال شود؛ وگرنه اسکلت بارگذاری ۴۰۴ را ۲۰۰ می‌کرد (soft 404).
 * صفحه هم همین را صدا می‌زند؛ داده‌ها با cache یک بار خوانده می‌شوند.
 */

export async function ensureCategory(slug: string, locale: Locale = defaultLocale) {
  const category = await getCategoryBySlug(slug);
  if (category) return category;
  const moved = await findRedirect(`/products/${slug}`);
  if (moved) movedTo(moved, locale);
  notFound();
}

export async function ensureProduct(categorySlug: string, slug: string, locale: Locale = defaultLocale) {
  const product = await getProductBySlug(slug, categorySlug);
  if (product) return product;
  // اسلاگ محصول یکتاست؛ اگر فقط دسته عوض شده، محصول را بدون دسته پیدا و به آدرس درست منتقل کن
  const elsewhere = await getProductBySlug(slug);
  if (elsewhere) {
    movedTo(`/products/${encodeURIComponent(elsewhere.category.slug)}/${encodeURIComponent(elsewhere.slug)}`, locale);
  }
  // محصولی که با دسته‌اش جمع شده ریدایرکت خودش را ندارد؛ آدرس قدیمی‌اش دنبال مقصد دسته می‌رود، نه ۴۰۴
  const moved =
    (await findRedirect(`/products/${categorySlug}/${slug}`)) ?? (await findRedirect(`/products/${categorySlug}`));
  if (moved) movedTo(moved, locale);
  notFound();
}

export async function ensureBlogPost(slug: string, locale: Locale = defaultLocale) {
  const post = await getBlogPostBySlug(slug);
  if (post) return post;
  const moved = await findRedirect(`/blog/${slug}`);
  if (moved) movedTo(moved, locale);
  notFound();
}

export async function ensureProject(slug: string, locale: Locale = defaultLocale) {
  const project = await getProjectBySlug(slug);
  if (project) return project;
  const moved = await findRedirect(`/projects/${slug}`);
  if (moved) movedTo(moved, locale);
  notFound();
}
