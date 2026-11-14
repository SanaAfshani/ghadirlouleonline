import { defineSection, type ContentPage } from '../types';
import { seoSection } from '../seo-section';

/** {names} و {year} هنگام نمایش با نام دسته‌های فعال تابلو و سال جاری (شمسی/میلادی) پر می‌شوند */
const PLACEHOLDER_HINT = '{names} = نام دسته‌های تابلوی قیمت، {year} = سال جاری (در فارسی شمسی، در انگلیسی میلادی).';

export const pricesSeo = defineSection({
  key: 'prices.seo',
  title: 'عنوان و توضیحات گوگل',
  description: `عنوان تب مرورگر و نتیجه گوگل (حدود ۶۰ نویسه؛ نام سایت خودکار به انتهایش اضافه می‌شود) و توضیح زیر آن (حدود ۱۵۵ نویسه). ${PLACEHOLDER_HINT}`,
  fields: {
    metaTitle: { type: 'text', label: 'عنوان صفحه (title)', hint: PLACEHOLDER_HINT },
    metaDescription: { type: 'text', label: 'توضیحات (meta description)', multiline: true, hint: PLACEHOLDER_HINT },
  },
  defaults: {
    fa: {
      metaTitle: 'لیست قیمت روز {names} {year}',
      metaDescription: 'قیمت روز {names} در سال {year} به تفکیک سایز. فروش مستقیم از کارخانه، استعلام قیمت عمده و ارسال به سراسر کشور.',
    },
    en: {
      metaTitle: 'Daily price list: {names} {year}',
      metaDescription: 'Today’s {names} prices for {year}, listed by size. Supplied directly from the factory, with bulk price requests and delivery across Iran.',
    },
  },
});

export const pricesHero = defineSection({
  key: 'prices.hero',
  title: 'بالای صفحه',
  fields: {
    label: { type: 'text', label: 'برچسب کوچک بالای عنوان' },
    title: { type: 'text', label: 'عنوان', hint: PLACEHOLDER_HINT },
    description: { type: 'text', label: 'توضیح', multiline: true },
  },
  defaults: {
    fa: {
      label: 'قیمت لحظه‌ای',
      title: 'لیست قیمت {names} {year}',
      description: 'قیمت هر محصول به تفکیک سایز و فشار کاری. با دکمه «سفارش» ردیف را به پیش‌فاکتور اضافه کنید؛ پس از تأیید کارشناس، پیش‌فاکتور قابل چاپ و دانلود صادر می‌شود. هزینه حمل جداگانه اعلام می‌گردد.',
    },
    en: {
      label: 'Live prices',
      title: 'Price list: {names} {year}',
      description: 'Prices for each product by size and pressure class. Use the “Order” button to add a row to your quote; once our sales specialist approves it, a printable, downloadable pro forma invoice is issued. Shipping is quoted separately.',
    },
  },
});

export const pricesClosedNotice = defineSection({
  key: 'prices.closedNotice',
  title: 'پیام بیرون از ساعت فروش',
  description: 'بالای جدول قیمت، وقتی فروش بسته است.',
  fields: {
    title: { type: 'text', label: 'عنوان' },
    text: { type: 'text', label: 'توضیح', multiline: true },
  },
  defaults: {
    fa: {
      title: 'فروش بسته است.',
      text: 'عددهای زیر آخرین قیمت ثبت‌شده‌اند، نه قیمت قطعی امروز. برای قیمت قطعی استعلام بگیرید.',
    },
    en: {
      title: 'Sales are closed.',
      text: 'The figures below are the last recorded prices, not today’s confirmed prices. Request a price for a firm quote.',
    },
  },
});

export const pricesPage: ContentPage = {
  key: 'prices',
  title: 'قیمت روز و پیش‌فاکتور',
  path: '/prices',
  sections: [pricesSeo, pricesHero, pricesClosedNotice],
};

export const trackSeo = seoSection('track.seo', {
  fa: {
    metaTitle: 'پیگیری سفارش',
    metaDescription: 'پیگیری وضعیت سفارش و پیش‌فاکتور قدیر لوله آنلاین با شماره پیش‌فاکتور: آماده‌سازی، بارگیری، ارسال و تحویل.',
  },
  en: {
    metaTitle: 'Order tracking',
    metaDescription: 'Track your Qadir Lule Online order and pro forma invoice by its number: preparation, loading, shipping and delivery.',
  },
});

export const trackHero = defineSection({
  key: 'track.hero',
  title: 'بالای صفحه',
  fields: {
    label: { type: 'text', label: 'برچسب کوچک بالای عنوان' },
    title: { type: 'text', label: 'عنوان' },
    description: { type: 'text', label: 'توضیح', multiline: true },
  },
  defaults: {
    fa: {
      label: 'پیگیری سفارش',
      title: 'سفارش شما کجاست؟',
      description: 'از تأیید فاکتور تا آماده‌سازی در کارخانه، بارگیری و تحویل در محل پروژه — همه مراحل را اینجا ببینید.',
    },
    en: {
      label: 'Order tracking',
      title: 'Where is your order?',
      description: 'From invoice approval to preparation at the factory, loading and delivery to your project site — follow every step here.',
    },
  },
});

export const trackPage: ContentPage = {
  key: 'track',
  title: 'پیگیری سفارش',
  path: '/track',
  sections: [trackSeo, trackHero],
};
