/** مراحل پیگیری سفارش بعد از صدور فاکتور — بدون وابستگی سرور، قابل استفاده در کلاینت */

export const ORDER_STEPS = [
  { key: 'PREPARING', label: 'در حال آماده‌سازی', desc: 'سفارش در انبار کارخانه آماده و کنترل کیفیت می‌شود' },
  { key: 'LOADING', label: 'در حال بارگیری', desc: 'لوله‌ها روی خودرو بارگیری می‌شوند' },
  { key: 'SHIPPED', label: 'ارسال شد', desc: 'بار از کارخانه خارج شد و در مسیر محل پروژه است' },
  { key: 'DELIVERED', label: 'تحویل شد', desc: 'سفارش در محل تحویل داده شد' },
] as const;

export type OrderStatus = (typeof ORDER_STEPS)[number]['key'];
export type OrderLogEntry = { status: OrderStatus; at: string };

export const isOrderStatus = (v: unknown): v is OrderStatus => ORDER_STEPS.some((s) => s.key === v);

export function orderStepIndex(status: string) {
  return ORDER_STEPS.findIndex((s) => s.key === status);
}

export function parseOrderLog(raw: string | null | undefined): OrderLogEntry[] {
  try {
    const v = JSON.parse(raw || '[]');
    return Array.isArray(v) ? v.filter((e) => isOrderStatus(e?.status) && typeof e?.at === 'string') : [];
  } catch {
    return [];
  }
}
