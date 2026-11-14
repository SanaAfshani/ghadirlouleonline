import { latinDigits } from '@/shared/lib/utils';
import { defaultLocale, type Locale } from '@/shared/i18n/config';

/** مشخصات جدای یک ردیف قیمت — توابع خالص، قابل استفاده در سرور و کلاینت */

/** کلاس‌های وزنی به ترتیب سبک ← سنگین؛ ترتیب همین آرایه ترتیب مرتب‌سازی است */
export const GRADES = ['سبک', 'نیمه‌سنگین', 'سنگین'] as const;
export type Grade = (typeof GRADES)[number];

export type ItemSpecs = { title: string; size: string; grade: string; spec: string; dimensions: string };

/** ورودی کلاس: فقط مقادیر GRADES؛ «نیمه سنگین» با فاصله هم پذیرفته می‌شود */
export function toGrade(value: unknown): Grade | '' {
  const v = String(value ?? '').trim().replace(/\s+/g, '').replace('نیمه', 'نیمه‌');
  return GRADES.find((g) => g === v) ?? '';
}

/** برچسب انگلیسی کلاس‌ها — مقدار ذخیره‌شده، فیلتر و مرتب‌سازی همان فارسی GRADES می‌ماند */
const GRADE_LABELS_EN: Record<Grade, string> = { سبک: 'Light', 'نیمه‌سنگین': 'Medium', سنگین: 'Heavy' };

/** نام نمایشی کلاس به زبان صفحه («سبک» → «Light») */
export function gradeLabel(grade: string, locale: Locale) {
  if (locale === defaultLocale) return grade;
  return GRADE_LABELS_EN[grade as Grade] ?? grade;
}

/**
 * سایز و ابعاد ترجمه ندارند (عدد + واحد فارسی)؛ در انگلیسی فقط ارقام لاتین و واحد کوتاه می‌شوند:
 * «۱۶۰ میلیمتر (۶ اینچ)» → «160 mm (6 in)»
 */
export function unitsLabel(value: string, locale: Locale) {
  if (locale === defaultLocale || !value) return value;
  return latinDigits(value)
    .replace(/میلی[\s\u200c]?متر/g, 'mm')
    .replace(/سانتی[\s\u200c]?متر/g, 'cm')
    .replace(/اینچ/g, 'in')
    .replace(/متر/g, 'm')
    .replace(/،/g, ',');
}

/** رتبه کلاس برای مرتب‌سازی — بدون کلاس آخر */
export function gradeRank(grade: string) {
  const i = GRADES.indexOf(grade as Grade);
  return i < 0 ? GRADES.length : i;
}

/** عدد اول سایز («۱۶۰ میلیمتر (۶ اینچ)» → 160) — بدون عدد آخر */
export function sizeValue(size: string) {
  const m = latinDigits(size).match(/\d+(?:[.٫/]\d+)?/);
  return m ? Number(m[0].replace(/[٫/]/g, '.')) : Number.POSITIVE_INFINITY;
}

/**
 * نام کامل ردیف برای پیش‌فاکتور، نمودار، استعلام و خروجی اکسل: «لوله کاروگیت ۱۶۰ میلیمتر · سبک · SN4».
 * سند پیش‌فاکتور (API) همیشه فارسی است؛ locale فقط برای نمایش در نسخه انگلیسی سایت است.
 */
export function itemLabel(i: ItemSpecs, locale: Locale = defaultLocale) {
  const head = [i.title, unitsLabel(i.size, locale)].filter(Boolean).join(' ');
  return [head, gradeLabel(i.grade, locale), i.spec, unitsLabel(i.dimensions, locale)].filter(Boolean).join(' · ');
}

export type SortKey = 'default' | 'size' | 'grade' | 'price';
export type SortDir = 'asc' | 'desc';

type Sortable = Pick<ItemSpecs, 'size' | 'grade'> & { price: number | null };

/**
 * مقایسه دو ردیف. کلاس با سایز به عنوان معیار دوم مرتب می‌شود (همه سبک‌ها از کوچک به بزرگ، بعد سنگین‌ها)
 * و سایز با کلاس — تا ردیف‌های هم‌سایز سبک و سنگین کنار هم بیایند. ردیف بدون مقدار همیشه آخر است.
 */
export function compareItems(a: Sortable, b: Sortable, key: SortKey, dir: SortDir) {
  // معیار دوم همیشه صعودی است: «سنگین به سبک» یعنی اول سنگین‌ها، ولی هر گروه از سایز کوچک به بزرگ
  const cmp = (sign: number) => (x: number, y: number) => (x === y ? 0 : !Number.isFinite(x) ? 1 : !Number.isFinite(y) ? -1 : (x - y) * sign);
  const last = cmp(dir === 'asc' ? 1 : -1);
  const then = cmp(1);
  const price = (p: number | null) => p ?? Number.POSITIVE_INFINITY;
  const grade = (g: string) => (gradeRank(g) === GRADES.length ? Number.POSITIVE_INFINITY : gradeRank(g));
  switch (key) {
    case 'size':
      return last(sizeValue(a.size), sizeValue(b.size)) || then(grade(a.grade), grade(b.grade));
    case 'grade':
      return last(grade(a.grade), grade(b.grade)) || then(sizeValue(a.size), sizeValue(b.size));
    case 'price':
      return last(price(a.price), price(b.price));
    default:
      return 0;
  }
}
