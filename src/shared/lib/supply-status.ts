/**
 * وضعیت تأمین هر محصول (هر سایز) — به‌جای «موجود/ناموجود»، که برای لوله پروژه‌ای و سفارشی گمراه‌کننده بود.
 * سه وضعیت همان است که در برنامه بهبود سایت توافق شد؛ موجودی هر سایز و کلاس باید از کارخانه تأیید شود.
 * بدون وابستگی سرور — در کامپوننت‌های کلاینت هم استفاده می‌شود.
 */
export const SUPPLY_STATUSES = ['ready', 'inquiry', 'pending'] as const;
export type SupplyStatus = (typeof SUPPLY_STATUSES)[number];

export const SUPPLY_STATUS_LABEL: Record<SupplyStatus, string> = {
  ready: 'آماده تأمین',
  inquiry: 'استعلام موجودی',
  pending: 'در انتظار تأیید مشخصات',
};

export const isSupplyStatus = (value: unknown): value is SupplyStatus =>
  typeof value === 'string' && (SUPPLY_STATUSES as readonly string[]).includes(value);

/**
 * وضعیت مؤثر: اگر در پنل انتخاب نشده (ردیف‌های قدیمی، ستون خالی)، از همان «موجود در انبار» قبلی ساخته می‌شود
 * تا با اضافه شدن این ستون هیچ صفحه‌ای ناگهان وضعیتش عوض نشود.
 */
export function supplyStatusOf(p: { supplyStatus?: string | null; inStock: boolean }): SupplyStatus {
  if (isSupplyStatus(p.supplyStatus)) return p.supplyStatus;
  return p.inStock ? 'ready' : 'inquiry';
}
