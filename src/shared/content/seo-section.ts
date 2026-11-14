import { defineSection } from './types';

type SeoText = { metaTitle: string; metaDescription: string };

/** عنوان و توضیحات گوگل یک صفحه ثابت — هر صفحه یک بخش «سئو» با همین دو فیلد دارد */
export function seoSection(key: string, defaults: { fa: SeoText; en: SeoText }) {
  return defineSection({
    key,
    title: 'عنوان و توضیحات گوگل',
    description: 'عنوان تب مرورگر و نتیجه گوگل (حدود ۶۰ نویسه؛ نام سایت خودکار به انتهایش اضافه می‌شود) و توضیح زیر آن (حدود ۱۵۵ نویسه).',
    fields: {
      metaTitle: { type: 'text', label: 'عنوان صفحه (title)' },
      metaDescription: { type: 'text', label: 'توضیحات (meta description)', multiline: true },
    },
    defaults,
  });
}
