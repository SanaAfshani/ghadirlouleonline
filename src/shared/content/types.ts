import type { Locale } from '@/shared/i18n/config';

/**
 * سیستم محتوای صفحات: هر بخش صفحه (مثلاً «خدمات صفحه اصلی») یک‌بار در کد با فیلدها و متن پیش‌فرض فارسی و انگلیسی
 * تعریف می‌شود؛ پنل ادمین از روی همین تعریف فرم می‌سازد و صفحه مقدار ذخیره‌شده را روی پیش‌فرض می‌نشاند.
 *
 * متن (text/html) هر زبان جداست؛ عکس و لینک بین دو زبان مشترک است و فقط در فارسی ویرایش می‌شود.
 * آیتم‌های فهرست شناسه ثابت (id) دارند تا ترجمه انگلیسی با جابه‌جا شدن ترتیب در فارسی به آیتم اشتباه نچسبد.
 */
export type FieldDef =
  | { type: 'text'; label: string; hint?: string; multiline?: boolean }
  | { type: 'html'; label: string; hint?: string }
  | { type: 'image'; label: string; hint?: string }
  /** مسیر داخلی (/products) یا آدرس https */
  | { type: 'link'; label: string; hint?: string }
  | { type: 'list'; label: string; hint?: string; itemLabel: string; fields: Fields; max?: number };

export type Fields = Record<string, FieldDef>;

type SharedField = { type: 'image' | 'link' };

export type FieldValue<F> = F extends { type: 'list'; fields: infer C extends Fields } ? ListItem<C>[] : string;
export type ListItem<C extends Fields> = { id: string } & SectionValue<C>;
export type SectionValue<S extends Fields> = { [K in keyof S]: FieldValue<S[K]> };

/** آنچه هر زبانِ غیر اصلی ذخیره می‌کند: فقط متن‌ها، آیتم‌های فهرست با همان id نسخه فارسی */
export type LocalizedValue<S extends Fields> = {
  [K in keyof S as S[K] extends SharedField ? never : K]: S[K] extends { type: 'list'; fields: infer C extends Fields }
    ? ({ id: string } & LocalizedValue<C>)[]
    : string;
};

export type SectionDef<S extends Fields = Fields> = {
  key: string;
  title: string;
  description?: string;
  fields: S;
  defaults: { fa: SectionValue<S>; en: LocalizedValue<S> };
};

export function defineSection<const S extends Fields>(def: SectionDef<S>): SectionDef<S> {
  return def;
}

/** هر بخش بدون نوع دقیق فیلدها — برای فهرست پنل، API و ادغام عمومی */
export type AnySection = {
  key: string;
  title: string;
  description?: string;
  fields: Fields;
  defaults: { fa: Record<string, unknown>; en: Record<string, unknown> };
};

/** یک صفحه سایت در پنل محتوا — path برای لینک «مشاهده در سایت» */
export type ContentPage = { key: string; title: string; path?: string; sections: AnySection[] };

/** داده ذخیره‌شده یک بخش در جدول ContentBlock */
export type StoredBlock = Partial<Record<Locale, Record<string, unknown>>>;

/** مقدار نهایی یک بخش برای props کامپوننت: ContentOf<typeof aboutHero> */
export type ContentOf<T> = T extends SectionDef<infer S> ? SectionValue<S> : never;
