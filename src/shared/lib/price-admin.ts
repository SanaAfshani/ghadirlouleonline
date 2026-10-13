import { latinDigits } from '@/shared/lib/utils';

/** قیمت ورودی ادمین: «۲٬۲۹۸٬۶۴۸»، «2,298,648» یا عدد — خالی/صفر یعنی «استعلام» */
export function toPrice(value: unknown): number | null {
  if (value == null || value === '') return null;
  const n = Number(latinDigits(String(value)).replace(/[^\d]/g, ''));
  return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
}

export const text = (value: unknown, max = 300) => String(value ?? '').trim().slice(0, max);

/** وزن هر متر به کیلوگرم: «۱٫۹»، «1/9»، «1,9» یا «1.9» — خالی/نامعتبر null */
export function toWeight(value: string): number | null {
  const n = Number(latinDigits(value.trim()).replace(/[٫,/]/g, '.'));
  return value.trim() && Number.isFinite(n) && n > 0 ? n : null;
}

/**
 * قیمت هر متر = وزن × قیمت روز هر کیلو.
 * undefined یعنی فرمول برای این ردیف اعمال نمی‌شود (محصول قیمت روز ندارد یا ردیف وزن ندارد) و قیمت دستی است.
 */
export function priceFromWeight(weight: string, pricePerKg: number | null | undefined): number | undefined {
  const w = toWeight(weight);
  return pricePerKg && w ? Math.round(w * pricePerKg) : undefined;
}
