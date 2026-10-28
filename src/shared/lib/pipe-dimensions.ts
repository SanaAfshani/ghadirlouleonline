/**
 * جدول ابعاد کارخانه برای لوله کاروگیت دوجداره.
 *
 * این داده در `specifications` محصول جا نمی‌شود: آن یک نگاشت کلید/مقدار است و این یک جدول
 * چهارده‌ردیفی با پنج ستون. چون عدد کارخانه است و با ویرایش محتوا عوض نمی‌شود، در کد می‌ماند
 * تا یک‌جا و قابل بازبینی باشد — نه پخش‌شده داخل HTML توضیحات محصول.
 *
 * منبع: برگه مشخصات قدیر لوله پاسارگاد.
 */
export type PipeDimension = {
  /** سایز اسمی لوله (mm) */
  size: number;
  /** قطر خارجی (mm) */
  outerDiameter: number;
  /** ضخامت لایه داخلی (mm) */
  innerLayer: number;
  /** ضخامت مجموع لایه‌ها (mm) */
  totalLayers: number;
  /** نوع واشر آب‌بندی؛ خالی یعنی برای این سایز واشر ارائه نمی‌شود */
  washer: string;
};

const EPDM = 'EPDM';

export const CORRUGATED_PIPE_DIMENSIONS: readonly PipeDimension[] = [
  { size: 110, outerDiameter: 126, innerLayer: 1, totalLayers: 1.3, washer: EPDM },
  { size: 160, outerDiameter: 184, innerLayer: 1, totalLayers: 1.4, washer: EPDM },
  { size: 200, outerDiameter: 231, innerLayer: 1.1, totalLayers: 1.5, washer: EPDM },
  { size: 250, outerDiameter: 290, innerLayer: 1.5, totalLayers: 1.8, washer: EPDM },
  { size: 315, outerDiameter: 364, innerLayer: 1.8, totalLayers: 2.1, washer: EPDM },
  { size: 400, outerDiameter: 457, innerLayer: 2.3, totalLayers: 2.5, washer: EPDM },
  { size: 500, outerDiameter: 583, innerLayer: 3, totalLayers: 3, washer: EPDM },
  { size: 600, outerDiameter: 693, innerLayer: 3.5, totalLayers: 3.5, washer: EPDM },
  { size: 700, outerDiameter: 816, innerLayer: 4, totalLayers: 4, washer: EPDM },
  { size: 800, outerDiameter: 931, innerLayer: 4.5, totalLayers: 4.5, washer: EPDM },
  { size: 900, outerDiameter: 1050, innerLayer: 4.8, totalLayers: 4.8, washer: EPDM },
  { size: 1000, outerDiameter: 1185, innerLayer: 5, totalLayers: 5, washer: EPDM },
  { size: 1200, outerDiameter: 1415, innerLayer: 5, totalLayers: 5, washer: EPDM },
  // سایز ۱۴۰۰ در برگه کارخانه واشر ندارد
  { size: 1400, outerDiameter: 1560, innerLayer: 6.6, totalLayers: 7, washer: '' },
];

/**
 * جدول ابعاد یک محصول، یا خالی اگر برایش جدولی ثبت نشده.
 * فعلاً فقط لوله کاروگیت دوجداره؛ اسپیرال کاروگیت ابعاد خودش را دارد و اینجا نیست.
 */
export function pipeDimensionsFor(productSlug: string): readonly PipeDimension[] {
  return productSlug === 'corrugated-pipe' ? CORRUGATED_PIPE_DIMENSIONS : [];
}
