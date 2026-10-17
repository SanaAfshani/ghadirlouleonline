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

/** بازه‌های نمودار نوسان قیمت (روز) */
export type HistoryRange = 7 | 30 | 90 | 365;

/** یک نقطه نمودار: day به صورت YYYY-MM-DD به وقت تهران */
export type HistoryPoint = { day: string; price: number };

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
