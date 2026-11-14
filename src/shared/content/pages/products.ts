import { defineSection, type ContentPage } from '../types';
import { seoSection } from '../seo-section';

export const productsSeo = seoSection('products.seo', {
  fa: {
    metaTitle: 'محصولات | خرید لوله کاروگیت، اسپیرال و اتصالات',
    metaDescription: 'لوله کاروگیت دوجداره ۱۱۰ تا ۱۲۰۰، لوله اسپیرال و اتصالات کاروگیت با قیمت روز، مستقیم از کارخانه و ارسال به سراسر ایران.',
  },
  en: {
    metaTitle: 'Products | Corrugated pipes, spiral pipes and fittings',
    metaDescription: 'Double-wall corrugated pipes from 110 to 1200 mm, spiral pipes and corrugated pipe fittings at daily prices, direct from the factory with delivery across Iran.',
  },
});

export const productsHero = defineSection({
  key: 'products.hero',
  title: 'بالای صفحه محصولات',
  fields: {
    label: { type: 'text', label: 'برچسب کوچک بالای عنوان' },
    title: { type: 'text', label: 'عنوان' },
    description: { type: 'text', label: 'توضیح', multiline: true },
  },
  defaults: {
    fa: {
      label: 'محصولات',
      title: 'لوله کاروگیت، اسپیرال و اتصالات',
      description: 'هر سایز صفحه، مشخصات فنی و قیمت روز خودش را دارد. سایز را انتخاب کنید یا جستجو کنید.',
    },
    en: {
      label: 'Products',
      title: 'Corrugated pipes, spiral pipes and fittings',
      description: 'Every size has its own page with technical specifications and a daily price. Pick a size or search.',
    },
  },
});

export const productDetailCopy = defineSection({
  key: 'products.detail',
  title: 'متن‌های صفحه هر محصول',
  description: 'متن‌های ثابتی که در صفحه همه محصولات تکرار می‌شوند (کارت کارشناس فروش، قیمت و کاتالوگ).',
  fields: {
    salesPrompt: { type: 'text', label: 'دعوت به تماس در کارت کارشناس فروش' },
    salesStatus: { type: 'text', label: 'وضعیت کنار سمت کارشناس (دسکتاپ)', hint: 'بعد از سمت کارشناس با « · » می‌آید.' },
    salesTagline: { type: 'text', label: 'توضیح کنار سمت کارشناس (موبایل)', hint: 'بعد از سمت کارشناس با « · » می‌آید.' },
    noPriceHint: { type: 'text', label: 'توضیح زیر «استعلام قیمت» (محصول بدون جدول قیمت)' },
    comingSoonNote: { type: 'text', label: 'توضیح محصولِ «به زودی»', multiline: true },
    catalogIntro: { type: 'text', label: 'توضیح بخش کاتالوگ و مدارک فنی', multiline: true },
  },
  defaults: {
    fa: {
      salesPrompt: 'برای استعلام قیمت و خرید این محصول تماس بگیرید',
      salesStatus: 'پاسخگو',
      salesTagline: 'مشاوره و خرید',
      noPriceHint: 'برای قیمت روز و خرید عمده با کارشناسان تماس بگیرید.',
      comingSoonNote: 'عرضه این محصول به زودی آغاز می‌شود. برای استعلام قیمت و اطلاع از زمان عرضه درخواست ثبت کنید.',
      catalogIntro: 'کاتالوگ رسمی با جدول سایزها، ابعاد و کد فنی — برای مطالعه آفلاین دانلود کنید یا همین‌جا ببینید.',
    },
    en: {
      salesPrompt: 'Call us for a price or to order this product',
      salesStatus: 'Available now',
      salesTagline: 'Advice and orders',
      noPriceHint: 'Contact our sales team for today’s price and bulk orders.',
      comingSoonNote: 'This product will be available soon. Send a request for a price and to be notified when it launches.',
      catalogIntro: 'The official catalogue with size tables, dimensions and technical codes. Download it for offline reading or view it here.',
    },
  },
});

export const productSnNote = defineSection({
  key: 'products.sn-note',
  title: 'توضیح کلاس SN زیر جدول قیمت',
  description: 'زیر جدول قیمت محصولاتی که در ردیف‌ها «کیلونیوتن» دارند نمایش داده می‌شود.',
  fields: {
    text: { type: 'text', label: 'متن توضیح', multiline: true },
  },
  defaults: {
    fa: {
      text: 'SN4 و SN8 کلاس سختی حلقوی طبق ISO 9969 است (۴ و ۸ کیلونیوتن بر مترمربع). عدد داخل پرانتز، مقدار همان کلاس با روش DIN 16961-2 است که کارخانه برای کنترل کیفیت به کار می‌برد؛ دو روش برای یک کلاس، نه کلاس جدا.',
    },
    en: {
      text: 'SN4 and SN8 are ring-stiffness classes under ISO 9969 (4 and 8 kN/m²). The figure in brackets is the same class measured by the DIN 16961-2 method the factory uses for quality control: two methods for one class, not separate classes.',
    },
  },
});

export const productsPage: ContentPage = {
  key: 'products',
  title: 'محصولات',
  path: '/products',
  sections: [productsSeo, productsHero, productDetailCopy, productSnNote],
};
