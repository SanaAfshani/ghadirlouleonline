import { siteConfig } from '@/shared/config/site';

/** وضعیت دسته‌ها در کاتالوگ — بدون وابستگی سرور، قابل استفاده در کامپوننت‌های کلاینت */

const priority: readonly string[] = siteConfig.priorityCategorySlugs;
const comingSoon: readonly string[] = siteConfig.comingSoonCategorySlugs;
const priorityProducts: readonly string[] = siteConfig.priorityProductSlugs;

/** دسته فعلاً فروش ندارد و «به زودی» نمایش داده می‌شود */
export function isComingSoon(categorySlug: string) {
  return comingSoon.includes(categorySlug);
}

/** رتبه نمایش: دسته‌های اولویت‌دار به ترتیب siteConfig اول، بقیه بعد از آن‌ها */
export function categoryRank(categorySlug: string) {
  const i = priority.indexOf(categorySlug);
  return i === -1 ? priority.length : i;
}

/** همان قاعده در سطح محصول — برای وقتی چند محصول در یک دسته‌اند و ترتیبشان مهم است */
export function productRank(productSlug: string) {
  const i = priorityProducts.indexOf(productSlug);
  return i === -1 ? priorityProducts.length : i;
}
