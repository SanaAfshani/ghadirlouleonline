import type { MarketStatus } from '@/shared/lib/market';

/** تایپ‌ها و توابع خالص تابلوی قیمت — بدون وابستگی سرور، قابل import در کامپوننت‌های کلاینت */

export type LiveItem = {
  id: string;
  /** مدل — سایز و کلاس و مشخصات جدا هستند؛ نام کامل با itemLabel */
  title: string;
  size: string;
  /** سبک / نیمه‌سنگین / سنگین */
  grade: string;
  spec: string;
  dimensions: string;
  /** وقتی بازار بسته است سرور null می‌فرستد — قیمت حتی در HTML صفحه هم نیست */
  price: number | null;
  previousPrice: number | null;
  /** وزن عمداً نیست — فقط برای محاسبه قیمت در پنل ادمین است و به کاربر نمایش داده نمی‌شود */
  note: string;
  priceChangedAt: string;
};

export type PriceLine = {
  productId: string;
  productSlug: string;
  productName: string;
  categorySlug: string;
  categoryName: string;
  href: string;
  items: LiveItem[];
};

export type PriceBoard = {
  market: MarketStatus;
  /** با هر تغییر قیمت یا باز/بسته شدن بازار عوض می‌شود — کلاینت فقط وقتی عوض شد داده کامل می‌گیرد */
  version: string;
  lines: PriceLine[];
};

/** خطوط قیمت یک دسته کنار هم — برای تب‌ها و جدول‌های تابلو */
export type PriceGroup = {
  categorySlug: string;
  categoryName: string;
  href: string;
  productIds: string[];
  items: LiveItem[];
};

/**
 * هر سایز لوله محصول جداست، پس یک تب برای هر خط محصول یعنی ده‌ها تب دوردیفی. تابلو برای هر
 * دسته یک جدول نشان می‌دهد. lines از قبل به ترتیب دسته مرتب است و Map همان ترتیب را نگه می‌دارد.
 */
export function groupLinesByCategory(lines: PriceLine[]): PriceGroup[] {
  const groups = new Map<string, PriceGroup>();
  for (const l of lines) {
    const group = groups.get(l.categorySlug) ?? {
      categorySlug: l.categorySlug,
      categoryName: l.categoryName,
      href: `/products/${l.categorySlug}`,
      productIds: [],
      items: [],
    };
    group.productIds.push(l.productId);
    group.items.push(...l.items);
    groups.set(l.categorySlug, group);
  }
  return [...groups.values()];
}

/** بازه‌های نمودار نوسان قیمت (روز) */
export type HistoryRange = 7 | 30 | 90 | 365;

/** یک نقطه نمودار: day به صورت YYYY-MM-DD به وقت تهران */
export type HistoryPoint = { day: string; price: number };

/**
 * قیمتی که از این تازه‌تر است «قیمت امروز» حساب می‌شود؛ قدیمی‌تر، با برچسب «آخرین قیمت ثبت‌شده» و تاریخش
 * نمایش داده می‌شود تا عدد چند روز پیش به‌جای قیمت روز دیده نشود (حتی در ساعت فروش).
 */
export const PRICE_FRESH_DAYS = 2;

export function isPriceFresh(changedAt: string | null | undefined, now = Date.now()) {
  return !!changedAt && now - Date.parse(changedAt) < PRICE_FRESH_DAYS * 24 * 60 * 60 * 1000;
}

/** خلاصه یک خط قیمت برای کارت و schema */
export function summarizeLine(items: LiveItem[]) {
  const prices = items.map((i) => i.price).filter((p): p is number => p != null);
  const latest = items.reduce<string | null>((a, i) => (!a || i.priceChangedAt > a ? i.priceChangedAt : a), null);
  return {
    count: items.length,
    minPrice: prices.length ? Math.min(...prices) : null,
    maxPrice: prices.length ? Math.max(...prices) : null,
    updatedAt: latest,
  };
}
