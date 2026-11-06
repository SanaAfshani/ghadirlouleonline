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

/** سایزهای لوله اسپیرال — از ۹۰۰ تا ۲۰۰۰ (سایز ۹۰۰ کاروگیت عرضه نمی‌شود، ولی اسپیرال ۹۰۰ هست) */
export const SPIRAL_PIPE_SIZES = [900, 1400, 1600, 1800, 2000] as const;

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

/**
 * گروه‌بندی نمایش در منو، صفحه محصولات و صفحه اول: اتصالات زیر کاروگیت می‌آیند چون هم‌سایز لوله
 * کاروگیت‌اند؛ اسپیرال جداست (با جوش اکستروژن وصل می‌شود و اتصالات جدا ندارد).
 * فقط نمایش است — دسته‌ها و آدرس صفحه‌ها همان می‌مانند تا سئو و لینک‌ها دست نخورند.
 */
export const PRODUCT_GROUPS = [
  { title: 'لوله و اتصالات کاروگیت', categories: ['corrugated-pipes', 'corrugated-fittings'] },
  { title: 'لوله اسپیرال', categories: ['spiral-pipes'] },
] as const;

/** دسته‌ها به ترتیب PRODUCT_GROUPS؛ دسته‌ای که در هیچ گروهی نیست گروه خودش را می‌گیرد تا گم نشود */
export function groupCategories<T extends { slug: string; name: string }>(categories: T[]) {
  const grouped = PRODUCT_GROUPS.map((g) => ({
    title: g.title,
    categories: g.categories.map((slug) => categories.find((c) => c.slug === slug)).filter((c): c is T => !!c),
  })).filter((g) => g.categories.length);
  const used = new Set(grouped.flatMap((g) => g.categories.map((c) => c.slug)));
  return [...grouped, ...categories.filter((c) => !used.has(c.slug)).map((c) => ({ title: c.name, categories: [c] }))];
}

/** برچسب کوتاه محصول برای منو و دکمه‌ها: سایز لوله («۴۰۰») یا نام کوتاه اتصال («کوپلر») */
export function shortProductLabel(p: { name: string; specs: Record<string, string> }) {
  const size = p.specs[SIZE_SPEC_KEY];
  if (size) return size.replace(/\s*میلی‌متر$/, '');
  return p.name.replace(/\s+(لوله\s+)?کاروگیت$/, '');
}
