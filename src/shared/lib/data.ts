import { existsSync } from 'fs';
import { cache } from 'react';
import path from 'path';
import { prisma } from '@/shared/lib/prisma';
import { getMarketNow } from '@/shared/lib/price-board';
import { categoryRank, isComingSoon } from '@/shared/lib/catalog';
import {
  normalizeProjectImages,
  serializeBlogPost,
  serializeProduct,
  serializeProject,
  toProductListItem,
} from '@/shared/lib/serializers';

/**
 * دسته‌های اولویت‌دار (siteConfig.priorityCategorySlugs) همیشه اول؛ بقیه به ترتیب پنل ادمین.
 * با cache: layout (منو و فوتر) و صفحه در یک درخواست فقط یک بار به دیتابیس می‌روند.
 */
export const getPublishedCategories = cache(async () => {
  const categories = await prisma.category.findMany({
    where: { published: true },
    include: { _count: { select: { products: { where: { published: true } } } } },
    orderBy: { order: 'asc' },
  });
  return categories.sort((a, b) => categoryRank(a.slug) - categoryRank(b.slug));
});

/**
 * تصویر دسته: اگر در دیتابیس ثبت نشده، فایل هم‌نام اسلاگ در public/images/categories
 * فقط وقتی استفاده می‌شود که واقعاً وجود داشته باشد (حدس کورکورانه قبلاً ۴۰۴ می‌داد).
 */
export function resolveCategoryImage(cat: { slug: string; image: string | null }): string | null {
  if (cat.image) return cat.image;
  const file = `/images/categories/${cat.slug}.jpg`;
  return existsSync(path.join(process.cwd(), 'public', file)) ? file : null;
}

export type NavCategory = { slug: string; name: string; image: string | null; productCount: number; comingSoon: boolean };

export async function getNavCategories(): Promise<NavCategory[]> {
  const cats = await getPublishedCategories();
  return cats.map((c) => ({
    slug: c.slug,
    name: c.name,
    image: resolveCategoryImage(c),
    productCount: c._count?.products ?? 0,
    comingSoon: isComingSoon(c.slug),
  }));
}

// cache: layout (بررسی وجود/ریدایرکت)، متادیتا و صفحه در یک درخواست فقط یک بار به دیتابیس می‌روند
export const getCategoryBySlug = cache(async (slug: string) => {
  return prisma.category.findFirst({
    where: { slug, published: true },
    include: { _count: { select: { products: { where: { published: true } } } } },
  });
});

export async function getPublishedProducts(options?: {
  categorySlug?: string;
  featured?: boolean;
  search?: string;
  limit?: number;
  /** فقط محصولاتی که عکس خودشان را دارند */
  withImage?: boolean;
}) {
  const where: {
    published: boolean;
    featured?: boolean;
    category?: { slug: string };
    OR?: { name?: { contains: string }; shortDescription?: { contains: string } }[];
    images?: { not: string };
  } = { published: true };

  if (options?.categorySlug && options.categorySlug !== 'all') {
    where.category = { slug: options.categorySlug };
  }
  if (options?.featured) where.featured = true;
  if (options?.withImage) where.images = { not: '[]' };
  if (options?.search) {
    where.OR = [
      { name: { contains: options.search } },
      { shortDescription: { contains: options.search } },
    ];
  }

  const [products, market] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true, priceItems: { select: { price: true, priceChangedAt: true } } },
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
    }),
    getMarketNow(),
  ]);

  // محصولات دسته‌های فعال اول؛ limit بعد از مرتب‌سازی، وگرنه با take دیتابیس ممکن بود کاروگیت اصلاً نیاید (کاتالوگ کوچک است)
  const sorted = products.sort((a, b) => categoryRank(a.category.slug) - categoryRank(b.category.slug));
  // بیرون از ساعت کاری قیمت در کارت‌ها هم نمایش داده نمی‌شود
  return sorted.slice(0, options?.limit).map((p) => toProductListItem(p, { showPrices: market.open }));
}

// cache: layout (بررسی وجود/ریدایرکت)، متادیتا و صفحه در یک درخواست فقط یک بار به دیتابیس می‌روند
export const getProductBySlug = cache(async (slug: string, categorySlug?: string) => {
  const product = await prisma.product.findFirst({
    where: {
      slug,
      published: true,
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    },
    include: { category: true },
  });

  return product ? serializeProduct(product) : null;
});

/**
 * مقاله‌های مرتبط با یک موضوع — برای لینک‌دادن از صفحه دسته به راهنماهای همان محصول.
 *
 * صفحه دسته تا امروز هیچ لینکی به وبلاگ نداشت، در حالی که مثلاً برای کاروگیت سه مقاله درباره
 * انتخاب سایز و مقایسه با پلی‌اتیلن وجود داشت. این لینک‌ها هم خواننده را به جواب سوالش می‌رسانند
 * و هم به گوگل نشان می‌دهند این صفحه‌ها یک موضوع واحدند.
 *
 * BlogPost رابطه‌ای با Category ندارد، پس بر اساس نام دسته در عنوان، برچسب‌ها یا کلیدواژه کانونی
 * تطبیق داده می‌شود — همان چیزی که نویسنده مقاله به‌هرحال می‌نویسد.
 *
 * اول کل نام دسته امتحان می‌شود چون دقیق‌ترین است («لوله کاروگیت» سه مقاله خودش را می‌آورد).
 * اگر چیزی پیدا نشد، سراغ تک‌واژه‌ها می‌رویم: نام دسته‌ای مثل «منهول و دریچه» هیچ‌وقت عیناً در
 * عنوان مقاله نمی‌آید، ولی «منهول» و «دریچه» می‌آیند.
 */
/** واژه‌های آن‌قدر عمومی که در یک سایت لوله‌فروشی تقریباً با همه‌چیز تطبیق می‌خورند */
const TOO_GENERIC = new Set(['لوله', 'قیمت', 'خرید', 'فروش', 'انواع']);

export async function getRelatedBlogPosts(term: string, limit = 3) {
  const needle = term.trim();
  if (!needle) return [];

  const find = (value: string) =>
    prisma.blogPost.findMany({
      where: {
        published: true,
        OR: [
          { title: { contains: value, mode: 'insensitive' } },
          { tags: { contains: value, mode: 'insensitive' } },
          { focusKeyword: { contains: value, mode: 'insensitive' } },
        ],
      },
      select: { slug: true, title: true, excerpt: true },
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
      take: limit,
    });

  const exact = await find(needle);
  if (exact.length > 0) return exact;

  // از مشخص‌ترین واژه شروع می‌کنیم و به اولین نتیجه بسنده می‌کنیم.
  // OR کردن همه واژه‌ها نتیجه شلی می‌داد: «سپتیک تانک پلی اتیلن» با «اتیلن» مقاله‌های پلی‌اتیلن را
  // می‌آورد و «مبلمان و تجهیزات شهری» با «شهری» مقاله فاضلاب شهری را — ربطی که فقط لفظی است.
  // لینک داخلی بی‌ربط هم خواننده را سر می‌دواند و هم موضوع صفحه را نزد گوگل مبهم می‌کند؛
  // نبودِ این بخش بهتر از پرکردنش با چیز نامربوط است.
  const words = needle
    .split(/\s+/)
    // چهارحرفی‌ها در فارسی اغلب عمومی‌اند («آب»، «شهری»، «تانک») و تطبیق لفظی می‌سازند:
    // «مبلمان و تجهیزات شهری» با «شهری» به مقاله فاضلاب شهری می‌رسید
    .filter((w) => w.length >= 5 && !TOO_GENERIC.has(w))
    .sort((a, b) => b.length - a.length);

  for (const word of words) {
    const found = await find(word);
    if (found.length > 0) return found;
  }
  return [];
}

export async function getPublishedBlogPosts(options?: { featured?: boolean; limit?: number }) {
  const posts = await prisma.blogPost.findMany({
    where: { published: true, ...(options?.featured ? { featured: true } : {}) },
    include: { author: { select: { id: true, name: true, email: true } } },
    orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
    take: options?.limit,
  });

  return posts.map(serializeBlogPost);
}

/**
 * slug باید decode‌شده باشد (صفحه با safeDecode این کار را می‌کند).
 * خطای دیتابیس عمداً بالا می‌رود: ۵۰۰ یعنی «موقت، دوباره بیا» برای گوگل؛
 * قبلاً catch آن را به null و در نتیجه ۴۰۴ تبدیل می‌کرد و یک قطعی لحظه‌ای Neon صفحه را از ایندکس خارج می‌کرد.
 */
// cache: layout (بررسی وجود/ریدایرکت)، متادیتا و صفحه در یک درخواست فقط یک بار به دیتابیس می‌روند
export const getBlogPostBySlug = cache(async (slug: string) => {
  const post = await prisma.blogPost.findFirst({
    where: { slug, published: true },
    include: { author: { select: { id: true, name: true, email: true } } },
  });
  if (!post) return null;

  prisma.blogPost.update({
    where: { id: post.id },
    // updatedAt صریح: وگرنه @updatedAt با هر بازدید عوض می‌شد و dateModified/lastmod مقاله بی‌معنا می‌شد
    data: { viewCount: { increment: 1 }, updatedAt: post.updatedAt },
  }).catch(() => {});

  return serializeBlogPost(post);
});

export async function getPublishedFaqs() {
  const faqs = await prisma.fAQ.findMany({
    where: { published: true },
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
  });

  const seen = new Set<string>();
  return faqs.filter((f) => {
    const key = f.question.trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function getPublishedTestimonials(limit?: number) {
  return prisma.testimonial.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

export async function getPublishedProjects(options?: { featured?: boolean; limit?: number }) {
  const projects = await prisma.project.findMany({
    where: { published: true, ...(options?.featured ? { featured: true } : {}) },
    orderBy: [{ featured: 'desc' }, { year: 'desc' }],
    take: options?.limit,
  });

  return projects.map(serializeProject);
}

// cache: layout (بررسی وجود/ریدایرکت)، متادیتا و صفحه در یک درخواست فقط یک بار به دیتابیس می‌روند
export const getProjectBySlug = cache(async (slug: string) => {
  const project = await prisma.project.findFirst({
    where: { slug, published: true },
  });

  return project ? serializeProject(project) : null;
});

/**
 * فقط داده لازم سایت‌مپ با تاریخ آخرین تغییر واقعی هر آدرس.
 * lastmod همیشه «اکنون» برای گوگل بی‌معناست و نادیده گرفته می‌شود.
 */
/** ستون images (JSON) → فهرست آدرس عکس برای سایت‌مپ تصاویر؛ نامعتبر = خالی */
function parseImageList(raw: string | null): string[] {
  try {
    const list = JSON.parse(raw || '[]');
    return Array.isArray(list) ? list.filter((u): u is string => typeof u === 'string' && u.length > 0).slice(0, 10) : [];
  } catch {
    return [];
  }
}

export async function getSitemapData() {
  const [products, projects, prices] = await Promise.all([
    prisma.product.findMany({
      where: { published: true },
      select: {
        slug: true,
        updatedAt: true,
        images: true,
        category: { select: { slug: true } },
        priceItems: { select: { updatedAt: true }, orderBy: { updatedAt: 'desc' }, take: 1 },
      },
    }),
    prisma.project.findMany({ where: { published: true }, select: { slug: true, updatedAt: true, images: true } }),
    prisma.priceItem.aggregate({ _max: { updatedAt: true } }),
  ]);

  return {
    // تغییر جدول قیمت هم محتوای صفحه محصول را عوض می‌کند
    products: products.map((p) => {
      const priced = p.priceItems[0]?.updatedAt;
      return {
        slug: p.slug,
        categorySlug: p.category.slug,
        lastModified: priced && priced > p.updatedAt ? priced : p.updatedAt,
        images: parseImageList(p.images),
      };
    }),
    // تصاویر پروژه {url, alt} هستند (ردیف قدیمی: رشته) — سایت‌مپ فقط آدرس می‌خواهد
    projects: projects.map((p) => ({
      slug: p.slug,
      updatedAt: p.updatedAt,
      images: normalizeProjectImages(p.images).map((img) => img.url).slice(0, 10),
    })),
    pricesUpdatedAt: prices._max.updatedAt,
  };
}

export { getSiteSettingsMap } from '@/shared/lib/site-settings-store';
