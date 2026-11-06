/**
 * خط محصولات سایت — فقط سه محصول: لوله کاروگیت، لوله اسپیرال و اتصالات کاروگیت.
 *
 * مثل دیجی‌کالا هر سایز لوله یک صفحه محصول جداست و هر نوع اتصال هم یک صفحه (سایزهایش ردیف‌های
 * جدول قیمت همان صفحه‌اند). سایزهای کاروگیت در pipe-dimensions.ts کنار جدول ابعاد کارخانه است.
 * اسکریپت scripts/restructure-catalog.ts محصولات را از روی همین فهرست می‌سازد و ترتیب نمایش
 * (siteConfig.priorityProductSlugs) هم از همین می‌آید.
 */

/** کلید مشخصات فنی سایز هر صفحه لوله — برچسب دکمه‌های «انتخاب سایز» صفحه محصول از همین است */
export const SIZE_SPEC_KEY = 'سایز اسمی';

/** سایزهای لوله اسپیرال — اسپیرال برای قطرهای بزرگ‌تر از کاروگیت است؛ ۹۰۰ عرضه نمی‌شود */
export const SPIRAL_PIPE_SIZES = [1400, 1600, 1800, 2000] as const;

export const spiralPipeSlug = (size: number) => `spiral-pipe-${size}`;

/** انواع اتصالات کاروگیت، به ترتیب نمایش */
export const CORRUGATED_FITTINGS = [
  { slug: 'corrugated-coupler', name: 'کوپلر لوله کاروگیت' },
  { slug: 'corrugated-epdm-gasket', name: 'واشر EPDM لوله کاروگیت' },
  { slug: 'corrugated-elbow-45', name: 'زانو ۴۵ درجه کاروگیت' },
  { slug: 'corrugated-elbow-90', name: 'زانو ۹۰ درجه کاروگیت' },
  { slug: 'corrugated-elbow-90-single', name: 'زانو ۹۰ درجه یک سر کوپلر کاروگیت' },
  { slug: 'corrugated-tee-45', name: 'سه راهی ۴۵ درجه کاروگیت' },
  { slug: 'corrugated-tee-90', name: 'سه راهی ۹۰ درجه کاروگیت' },
  { slug: 'corrugated-cross', name: 'چهار راهی کاروگیت' },
  { slug: 'corrugated-reducer', name: 'تبدیل لوله کاروگیت' },
  { slug: 'corrugated-end-cap', name: 'درپوش لوله کاروگیت' },
] as const;
