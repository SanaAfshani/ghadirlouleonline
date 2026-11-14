import type { TranslationFieldDef } from './TranslationEditor';

/**
 * فیلدهای زبانه English هر فرم پنل — همان TRANSLATABLE_FIELDS در shared/lib/translations.ts.
 * فیلد اول، فیلد اصلی است (بدون آن صفحه انگلیسی ایندکس نمی‌شود).
 */
const SEO_FIELDS: TranslationFieldDef[] = [
  { name: 'metaTitle', label: 'عنوان سئو (Meta Title)', type: 'text' },
  { name: 'metaDescription', label: 'توضیحات متا', type: 'textarea' },
  { name: 'ogTitle', label: 'عنوان اشتراک‌گذاری (OG)', type: 'text' },
  { name: 'ogDescription', label: 'توضیح اشتراک‌گذاری (OG)', type: 'textarea' },
];

export const PRODUCT_TRANSLATION_FIELDS: TranslationFieldDef[] = [
  { name: 'name', label: 'نام محصول', type: 'text' },
  { name: 'shortDescription', label: 'توضیح کوتاه', type: 'textarea' },
  { name: 'description', label: 'توضیحات کامل', type: 'html' },
  ...SEO_FIELDS,
  { name: 'specifications', label: 'مشخصات فنی', type: 'specs' },
  { name: 'faqs', label: 'سوالات متداول', type: 'faqs' },
  { name: 'catalogTitles', label: 'عنوان کاتالوگ‌ها', type: 'list' },
];

export const BLOG_TRANSLATION_FIELDS: TranslationFieldDef[] = [
  { name: 'title', label: 'عنوان', type: 'text' },
  { name: 'excerpt', label: 'خلاصه', type: 'textarea' },
  { name: 'content', label: 'متن کامل مقاله', type: 'html' },
  ...SEO_FIELDS,
  { name: 'faqs', label: 'سوالات متداول', type: 'faqs' },
  { name: 'tags', label: 'برچسب‌ها', type: 'list' },
];

export const PROJECT_TRANSLATION_FIELDS: TranslationFieldDef[] = [
  { name: 'title', label: 'عنوان پروژه', type: 'text' },
  { name: 'description', label: 'توضیح کوتاه', type: 'textarea' },
  { name: 'content', label: 'شرح کامل پروژه', type: 'html' },
  { name: 'location', label: 'موقعیت', type: 'text' },
  { name: 'client', label: 'کارفرما', type: 'text' },
  ...SEO_FIELDS,
  { name: 'faqs', label: 'سوالات متداول', type: 'faqs' },
  { name: 'imageAlts', label: 'متن جایگزین تصاویر (alt)', type: 'list' },
];

export const CATEGORY_TRANSLATION_FIELDS: TranslationFieldDef[] = [
  { name: 'name', label: 'نام', type: 'text' },
  { name: 'description', label: 'توضیح کوتاه', type: 'textarea' },
  { name: 'content', label: 'متن بلند صفحه دسته', type: 'html' },
];

export const FAQ_TRANSLATION_FIELDS: TranslationFieldDef[] = [
  { name: 'question', label: 'سوال', type: 'text' },
  { name: 'answer', label: 'پاسخ', type: 'textarea' },
  { name: 'category', label: 'دسته سوال', type: 'text' },
];

export const TESTIMONIAL_TRANSLATION_FIELDS: TranslationFieldDef[] = [
  { name: 'name', label: 'نام', type: 'text' },
  { name: 'company', label: 'شرکت', type: 'text' },
  { name: 'position', label: 'سمت', type: 'text' },
  { name: 'content', label: 'متن نظر', type: 'textarea' },
];
