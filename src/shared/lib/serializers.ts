import type { FaqItem, BlogPost, Category, Product, Project } from '@/shared/types';
import { formatPersianNumber } from '@/shared/lib/utils';
import { isComingSoon } from '@/shared/lib/catalog';
import { parseCatalogs } from '@/shared/lib/catalog-files';

export function parseJsonArray(value: string): string[] {
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

export function parseJsonObject(value: string): Record<string, string> {
  try {
    const parsed = JSON.parse(value) as unknown;
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, string>)
      : {};
  } catch {
    return {};
  }
}

export function formatProductPrice(price: number | null | undefined): string {
  if (price == null || price === 0) return '۰';
  return formatPersianNumber(price);
}

type DbProduct = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  price: number | null;
  images: string;
  specifications: string;
  inStock: boolean;
  featured: boolean;
  published: boolean;
  metaTitle?: string | null;
  metaDescription?: string | null;
  focusKeyword?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  faqs?: string;
  catalogs?: string;
  categoryId: string;
  category: { slug: string; name: string; image?: string | null };
  createdAt: Date;
  updatedAt: Date;
};

export function serializeProduct(p: DbProduct): Product {
  return {
    ...p,
    description: p.description ?? '',
    shortDescription: p.shortDescription ?? '',
    price: p.price ?? undefined,
    images: parseJsonArray(p.images),
    specifications: parseJsonObject(p.specifications),
    faqs: parseFaqs(p.faqs),
    catalogs: parseCatalogs(p.catalogs),
  } as Product;
}

export type ProductListItem = {
  id: string;
  slug: string;
  name: string;
  category: string;
  categoryName: string;
  price: string;
  inStock: boolean;
  featured: boolean;
  specs: Record<string, string>;
  image?: string;
  /** دسته فعلاً فروش ندارد — کارت «به زودی» بدون قیمت */
  comingSoon: boolean;
  /** خلاصه جدول قیمت: تعداد ردیف، کمترین قیمت و تاریخ آخرین به‌روزرسانی */
  priceRows: number;
  priceFrom: number | null;
  priceUpdatedAt: string | null;
};

export function toProductListItem(
  p: DbProduct & { priceItems?: { price: number | null; priceChangedAt: Date }[] },
  { showPrices = true }: { showPrices?: boolean } = {},
): ProductListItem {
  const specs = parseJsonObject(p.specifications);
  const images = parseJsonArray(p.images);
  const comingSoon = isComingSoon(p.category.slug);
  // دسته «به زودی» هیچ قیمتی (تکی یا جدول) بیرون نمی‌دهد
  const withPrices = showPrices && !comingSoon;
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.category.slug,
    categoryName: p.category.name,
    // بیرون از ساعت کاری قیمت تکی هم مثل جدول قیمت پنهان است
    price: withPrices ? formatProductPrice(p.price) : '۰',
    inStock: p.inStock,
    featured: p.featured,
    comingSoon,
    specs,
    image: images[0] || p.category.image || undefined,
    ...(() => {
      const items = comingSoon ? [] : (p.priceItems ?? []);
      const prices = items.map((i) => i.price).filter((x): x is number => x != null);
      const latest = items.reduce<Date | null>((a, i) => (!a || i.priceChangedAt > a ? i.priceChangedAt : a), null);
      return {
        priceRows: items.length,
        priceFrom: withPrices && prices.length ? Math.min(...prices) : null,
        priceUpdatedAt: latest?.toISOString() ?? null,
      };
    })(),
  };
}

export function serializeCategory(c: Category & { _count?: { products: number } }): Category {
  return c;
}

type DbBlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  pdfUrl?: string | null;
  tags: string;
  published: boolean;
  featured: boolean;
  readTime: number;
  viewCount: number;
  metaTitle?: string | null;
  metaDescription?: string | null;
  focusKeyword?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  faqs?: string;
  authorId: string;
  author?: { id: string; name: string; email?: string };
  createdAt: Date;
  updatedAt: Date;
};

/** فقط ردیف‌هایی که هم سوال و هم پاسخ دارند معتبرند — ردیف ناقص در schema گوگل خطا می‌دهد */
export function parseFaqs(value: string | null | undefined): FaqItem[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => ({
        question: String((item as FaqItem)?.question ?? '').trim(),
        answer: String((item as FaqItem)?.answer ?? '').trim(),
      }))
      .filter((item) => item.question && item.answer);
  } catch {
    return [];
  }
}

export function serializeBlogPost(p: DbBlogPost): BlogPost {
  return {
    ...p,
    excerpt: p.excerpt ?? '',
    coverImage: p.coverImage ?? '',
    pdfUrl: p.pdfUrl ?? undefined,
    tags: parseJsonArray(p.tags),
    faqs: parseFaqs(p.faqs),
    author: p.author as BlogPost['author'],
  };
}

export function serializeProject(p: {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  content: string | null;
  images: string;
  location: string | null;
  year: number;
  client: string | null;
  published: boolean;
  featured: boolean;
  createdAt: Date;
}): Project {
  return {
    ...p,
    description: p.description ?? '',
    content: p.content ?? '',
    images: parseJsonArray(p.images),
    location: p.location ?? '',
    client: p.client ?? undefined,
  };
}
