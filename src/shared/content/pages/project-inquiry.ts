import { defineSection, type ContentPage } from '../types';
import { seoSection } from '../seo-section';

export const projectInquirySeo = seoSection('projectInquiry.seo', {
  fa: {
    metaTitle: 'استعلام خرید پروژه‌ای | لوله کاروگیت و اسپیرال',
    metaDescription:
      'استعلام قیمت عمده لوله کاروگیت، اسپیرال و اتصالات برای پروژه‌های عمرانی: چند سایز در یک درخواست، با کلاس SN، متراژ، شهر پروژه و زمان تحویل — مستقیم به واحد فروش عمده قدیر لوله آنلاین.',
  },
  en: {
    metaTitle: 'Project purchase inquiry | Corrugated and spiral pipes',
    metaDescription:
      'Request bulk prices for corrugated pipes, spiral pipes and fittings for civil projects: several sizes in one request, with SN class, lengths, project city and delivery time — sent straight to the Qadir Lule Online bulk sales team.',
  },
});

export const projectInquiryHero = defineSection({
  key: 'projectInquiry.hero',
  title: 'بالای صفحه',
  fields: {
    label: { type: 'text', label: 'برچسب کوچک بالای عنوان' },
    title: { type: 'text', label: 'عنوان' },
    description: { type: 'text', label: 'توضیح', multiline: true },
  },
  defaults: {
    fa: {
      label: 'فروش عمده',
      title: 'استعلام خرید پروژه‌ای',
      description: 'سایز، کلاس SN، متراژ، شهر پروژه و زمان تحویل را بنویسید؛ درخواست مستقیم به واحد فروش عمده می‌رسد.',
    },
    en: {
      label: 'Bulk sales',
      title: 'Project purchase inquiry',
      description: 'Enter the sizes, SN class, lengths, project city and delivery time; your request goes straight to our bulk sales team.',
    },
  },
});

export const projectInquirySteps = defineSection({
  key: 'projectInquiry.steps',
  title: 'مراحل (کنار فرم)',
  fields: {
    items: {
      type: 'list',
      label: 'مراحل',
      itemLabel: 'مرحله',
      max: 6,
      fields: {
        title: { type: 'text', label: 'عنوان' },
        text: { type: 'text', label: 'توضیح', multiline: true },
      },
    },
  },
  defaults: {
    fa: {
      items: [
        { id: 'items', title: 'ثبت اقلام', text: 'چند سایز و محصول را با متراژ و کلاس SN در یک درخواست بفرستید.' },
        { id: 'quote', title: 'پیش‌فاکتور', text: 'کارشناس فروش عمده قیمت روز کارخانه و شرایط پرداخت را اعلام می‌کند.' },
        { id: 'supply', title: 'تأمین از کارخانه', text: 'بارگیری مستقیم از انبار قدیر لوله پاسارگاد در گرمسار.' },
        { id: 'delivery', title: 'ارسال به پروژه', text: 'هماهنگی حمل تا شهر و محل پروژه در سراسر کشور.' },
      ],
    },
    en: {
      items: [
        { id: 'items', title: 'List your items', text: 'Send several sizes and products, with lengths and SN class, in a single request.' },
        { id: 'quote', title: 'Pro forma invoice', text: 'A bulk sales specialist confirms the factory’s daily price and the payment terms.' },
        { id: 'supply', title: 'Supplied by the factory', text: 'Loaded directly from the Ghadir Louleh Pasargad warehouse in Garmsar.' },
        { id: 'delivery', title: 'Delivered to your project', text: 'Transport arranged to your project city and site anywhere in Iran.' },
      ],
    },
  },
});

export const projectInquiryPage: ContentPage = {
  key: 'projectInquiry',
  title: 'استعلام خرید پروژه‌ای',
  path: '/project-inquiry',
  sections: [projectInquirySeo, projectInquiryHero, projectInquirySteps],
};
