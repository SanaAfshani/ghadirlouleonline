import { defineSection, type ContentPage } from '../types';
import { seoSection } from '../seo-section';

/** خود سوال‌ها از بخش «سوالات متداول» پنل (مدل FAQ) می‌آیند؛ این‌جا فقط متن‌های ثابت صفحه است */
export const faqSeo = seoSection('faq.seo', {
  fa: {
    metaTitle: 'سوالات متداول خرید لوله و اتصالات',
    metaDescription: 'پاسخ پرتکرارترین سوالات درباره خرید لوله و اتصالات صنعتی، قیمت‌گذاری، نحوه سفارش، ارسال و تحویل در سراسر کشور.',
  },
  en: {
    metaTitle: 'FAQ: buying pipes and fittings',
    metaDescription: 'Answers to the most common questions about buying pipes and industrial fittings, pricing, ordering, shipping and delivery across Iran.',
  },
});

export const faqHero = defineSection({
  key: 'faq.hero',
  title: 'بالای صفحه',
  fields: {
    label: { type: 'text', label: 'برچسب کوچک بالای عنوان' },
    title: { type: 'text', label: 'عنوان' },
    description: { type: 'text', label: 'توضیح', multiline: true },
  },
  defaults: {
    fa: {
      label: 'سوالات متداول',
      title: 'پاسخ سوالات شما',
      description: 'پرتکرارترین سوالات مشتریان درباره محصولات، سفارش، تحویل و خدمات',
    },
    en: {
      label: 'FAQ',
      title: 'Answers to your questions',
      description: 'The questions our customers ask most about products, ordering, delivery and services',
    },
  },
});

export const faqCta = defineSection({
  key: 'faq.cta',
  title: 'کادر «سوال دیگری دارید؟» (پایین صفحه)',
  fields: {
    title: { type: 'text', label: 'عنوان' },
    text: { type: 'text', label: 'توضیح' },
    consultLabel: { type: 'text', label: 'متن دکمه درخواست مشاوره' },
    contactLabel: { type: 'text', label: 'متن دکمه دوم' },
    contactLink: { type: 'link', label: 'لینک دکمه دوم' },
  },
  defaults: {
    fa: {
      title: 'سوال دیگری دارید؟',
      text: 'کارشناسان ما آماده پاسخگویی هستند',
      consultLabel: 'درخواست مشاوره',
      contactLabel: 'تماس با ما',
      contactLink: '/contact',
    },
    en: {
      title: 'Have another question?',
      text: 'Our specialists are ready to help',
      consultLabel: 'Request advice',
      contactLabel: 'Contact us',
    },
  },
});

export const faqPage: ContentPage = {
  key: 'faq',
  title: 'سوالات متداول',
  path: '/faq',
  sections: [faqSeo, faqHero, faqCta],
};
