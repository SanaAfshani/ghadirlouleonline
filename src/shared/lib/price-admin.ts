import { latinDigits } from '@/shared/lib/utils';
import { toGrade } from '@/shared/lib/price-item';

/** قیمت ورودی ادمین: «۲٬۲۹۸٬۶۴۸»، «2,298,648» یا عدد — خالی/صفر یعنی «استعلام» */
export function toPrice(value: unknown): number | null {
  if (value == null || value === '') return null;
  const n = Number(latinDigits(String(value)).replace(/[^\d]/g, ''));
  return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
}

export const text = (value: unknown, max = 300) => String(value ?? '').trim().slice(0, max);

/** وزن هر متر به کیلوگرم: «۱٫۹»، «1/9»، «1,9» یا «1.9» — خالی/نامعتبر null */
export function toWeight(value: string): number | null {
  // واحد کنار عدد («۱٫۹ کیلو») نباید ردیف را بی‌وزن کند — فقط اولین عدد خوانده می‌شود
  const m = latinDigits(value).replace(/[٫,/]/g, '.').match(/\d+(?:\.\d+)?/);
  const n = m ? Number(m[0]) : NaN;
  return Number.isFinite(n) && n > 0 ? n : null;
}

/**
 * قیمت هر متر = وزن × قیمت روز هر کیلو.
 * undefined یعنی فرمول برای این ردیف اعمال نمی‌شود (محصول قیمت روز ندارد یا ردیف وزن ندارد) و قیمت دستی است.
 */
export function priceFromWeight(weight: string, pricePerKg: number | null | undefined): number | undefined {
  const w = toWeight(weight);
  return pricePerKg && w ? Math.round(w * pricePerKg) : undefined;
}

/** فیلدهای مشخصات ارسال‌شده در body — فقط کلیدهایی که آمده‌اند (برای PATCH تک‌سلولی) */
export function specFields(body: Record<string, unknown>) {
  const out: { size?: string; grade?: string; spec?: string; dimensions?: string } = {};
  if (body.size !== undefined) out.size = text(body.size, 60);
  if (body.grade !== undefined) out.grade = toGrade(body.grade);
  if (body.spec !== undefined) out.spec = text(body.spec, 120);
  if (body.dimensions !== undefined) out.dimensions = text(body.dimensions, 120);
  return out;
}
