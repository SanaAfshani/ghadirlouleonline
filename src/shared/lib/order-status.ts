import { defaultLocale, type Locale } from '@/shared/i18n/config';

/** مراحل پیگیری سفارش بعد از صدور فاکتور — بدون وابستگی سرور، قابل استفاده در کلاینت */

export const ORDER_STEPS = [
  { key: 'PREPARING', label: 'در حال آماده‌سازی', desc: 'سفارش در انبار کارخانه آماده و کنترل کیفیت می‌شود' },
  { key: 'LOADING', label: 'در حال بارگیری', desc: 'لوله‌ها روی خودرو بارگیری می‌شوند' },
  { key: 'SHIPPED', label: 'ارسال شد', desc: 'بار از کارخانه خارج شد و در مسیر محل پروژه است' },
  { key: 'DELIVERED', label: 'تحویل شد', desc: 'سفارش در محل تحویل داده شد' },
] as const;

export type OrderStatus = (typeof ORDER_STEPS)[number]['key'];
export type OrderLogEntry = { status: OrderStatus; at: string };

/** متن انگلیسی مراحل برای سایت — ORDER_STEPS فارسی می‌ماند چون پنل ادمین و پیامک از آن استفاده می‌کنند */
const ORDER_STEPS_EN: Record<OrderStatus, { label: string; desc: string }> = {
  PREPARING: { label: 'Being prepared', desc: 'Your order is being prepared and quality-checked at the factory warehouse' },
  LOADING: { label: 'Loading', desc: 'The pipes are being loaded onto the truck' },
  SHIPPED: { label: 'Shipped', desc: 'The load has left the factory and is on its way to your site' },
  DELIVERED: { label: 'Delivered', desc: 'The order has been delivered on site' },
};

/** برچسب و توضیح یک مرحله به زبان صفحه */
export function orderStepText(step: (typeof ORDER_STEPS)[number], locale: Locale): { label: string; desc: string } {
  return locale === defaultLocale ? step : ORDER_STEPS_EN[step.key];
}

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
