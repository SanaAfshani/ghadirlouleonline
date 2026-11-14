import { defineSection, type ContentPage } from '../types';

/**
 * متن‌های هدر و فوتر که در همه صفحات دیده می‌شوند.
 * تلفن، آدرس، نام سایت، «تنها نماینده انحصاری»، ساعت کاری و نمادهای اعتماد این‌جا نیستند؛ از «تنظیمات سایت» می‌آیند.
 */
export const globalHeader = defineSection({
  key: 'global.header',
  title: 'هدر و منو',
  fields: {
    shippingNote: { type: 'text', label: 'متن نوار بالای هدر (کنار نماینده انحصاری)' },
    consultLabel: { type: 'text', label: 'دکمه مشاوره هدر' },
    nav: {
      type: 'list',
      label: 'منوی اصلی (دسکتاپ)',
      hint: 'آیتمی که لینکش /products است منوی بازشوی محصولات را دارد.',
      itemLabel: 'آیتم منو',
      max: 9,
      fields: {
        label: { type: 'text', label: 'عنوان' },
        link: { type: 'link', label: 'لینک' },
      },
    },
    drawerLinks: {
      type: 'list',
      label: 'میانبرهای منوی موبایل',
      itemLabel: 'میانبر',
      max: 12,
      fields: {
        label: { type: 'text', label: 'عنوان' },
        link: { type: 'link', label: 'لینک' },
      },
    },
    megaEyebrow: { type: 'text', label: 'منوی محصولات: برچسب کوچک کارت قیمت' },
    megaTitle: { type: 'text', label: 'منوی محصولات: عنوان کارت قیمت' },
    megaCta: { type: 'text', label: 'منوی محصولات: متن لینک کارت قیمت' },
    drawerPriceTitle: { type: 'text', label: 'منوی موبایل: عنوان کارت قیمت' },
    drawerPriceText: { type: 'text', label: 'منوی موبایل: توضیح کارت قیمت' },
    popularHeading: { type: 'text', label: 'جستجو: عنوان دسته‌های پرجستجو' },
  },
  defaults: {
    fa: {
      shippingNote: 'ارسال از انبار به سراسر کشور',
      consultLabel: 'مشاوره رایگان',
      nav: [
        { id: 'home', label: 'خانه', link: '/' },
        { id: 'products', label: 'محصولات', link: '/products' },
        { id: 'prices', label: 'لیست قیمت', link: '/prices' },
        { id: 'factory', label: 'کارخانه', link: '/factory' },
        { id: 'project-inquiry', label: 'استعلام پروژه‌ای', link: '/project-inquiry' },
        { id: 'blog', label: 'مجله', link: '/blog' },
        { id: 'contact', label: 'تماس با ما', link: '/contact' },
      ],
      drawerLinks: [
        { id: 'home', label: 'خانه', link: '/' },
        { id: 'products', label: 'محصولات', link: '/products' },
        { id: 'factory', label: 'کارخانه و تأمین', link: '/factory' },
        { id: 'project-inquiry', label: 'استعلام پروژه‌ای', link: '/project-inquiry' },
        { id: 'blog', label: 'مجله', link: '/blog' },
        { id: 'projects', label: 'پروژه‌های اجراشده', link: '/projects' },
        { id: 'track', label: 'پیگیری سفارش', link: '/track' },
        { id: 'faq', label: 'سوالات', link: '/faq' },
        { id: 'contact', label: 'تماس', link: '/contact' },
      ],
      megaEyebrow: 'به‌روز',
      megaTitle: 'لیست قیمت روز لوله کاروگیت و اسپیرال',
      megaCta: 'مشاهده قیمت‌ها',
      drawerPriceTitle: 'لیست قیمت روز',
      drawerPriceText: 'قیمت لحظه‌ای و نمودار نوسان',
      popularHeading: 'دسته‌های پرجستجو',
    },
    en: {
      shippingNote: 'Shipped from our warehouse across Iran',
      consultLabel: 'Free consultation',
      nav: [
        { id: 'home', label: 'Home' },
        { id: 'products', label: 'Products' },
        { id: 'prices', label: 'Price list' },
        { id: 'factory', label: 'Factory' },
        { id: 'project-inquiry', label: 'Project inquiry' },
        { id: 'blog', label: 'Journal' },
        { id: 'contact', label: 'Contact us' },
      ],
      drawerLinks: [
        { id: 'home', label: 'Home' },
        { id: 'products', label: 'Products' },
        { id: 'factory', label: 'Factory & supply' },
        { id: 'project-inquiry', label: 'Project inquiry' },
        { id: 'blog', label: 'Journal' },
        { id: 'projects', label: 'Completed projects' },
        { id: 'track', label: 'Track order' },
        { id: 'faq', label: 'FAQ' },
        { id: 'contact', label: 'Contact' },
      ],
      megaEyebrow: 'Updated',
      megaTitle: 'Today’s prices for corrugated and spiral pipes',
      megaCta: 'View prices',
      drawerPriceTitle: 'Today’s price list',
      drawerPriceText: 'Live prices and price trend chart',
      popularHeading: 'Popular categories',
    },
  },
});

export const globalFooter = defineSection({
  key: 'global.footer',
  title: 'فوتر',
  fields: {
    manufacturerSiteLabel: { type: 'text', label: 'برچسب لینک سایت رسمی کارخانه' },
    categoriesTitle: { type: 'text', label: 'عنوان ستون دسته‌بندی‌ها' },
    quickLinksTitle: { type: 'text', label: 'عنوان ستون دسترسی سریع' },
    quickLinks: {
      type: 'list',
      label: 'لینک‌های دسترسی سریع',
      itemLabel: 'لینک',
      max: 16,
      fields: {
        label: { type: 'text', label: 'عنوان' },
        link: { type: 'link', label: 'لینک' },
      },
    },
    contactTitle: { type: 'text', label: 'عنوان ستون ارتباط با ما' },
    trustTitle: { type: 'text', label: 'عنوان نمادهای اعتماد' },
    rights: { type: 'text', label: 'متن انتهای کپی‌رایت' },
    legalLinks: {
      type: 'list',
      label: 'لینک‌های قوانین (پایین فوتر)',
      itemLabel: 'لینک',
      max: 4,
      fields: {
        label: { type: 'text', label: 'عنوان' },
        link: { type: 'link', label: 'لینک' },
      },
    },
  },
  defaults: {
    fa: {
      manufacturerSiteLabel: 'وب‌سایت رسمی کارخانه:',
      categoriesTitle: 'دسته‌بندی محصولات',
      quickLinksTitle: 'دسترسی سریع',
      quickLinks: [
        { id: 'prices', label: 'لیست قیمت روز', link: '/prices' },
        { id: 'project-inquiry', label: 'استعلام خرید پروژه‌ای', link: '/project-inquiry' },
        { id: 'official-representative', label: 'نمایندگی رسمی قدیر لوله پاسارگاد', link: '/official-representative' },
        { id: 'certificates', label: 'مدارک نمایندگی و تأییدیه‌های فنی', link: '/certificates' },
        { id: 'factory', label: 'کارخانه و توانمندی تأمین', link: '/factory' },
        { id: 'services', label: 'خدمات ما', link: '/services' },
        { id: 'blog', label: 'مجله تخصصی', link: '/blog' },
        { id: 'projects', label: 'پروژه‌های اجراشده', link: '/projects' },
        { id: 'track', label: 'پیگیری سفارش', link: '/track' },
        { id: 'faq', label: 'سوالات متداول', link: '/faq' },
        { id: 'contact', label: 'تماس با ما', link: '/contact' },
      ],
      contactTitle: 'ارتباط با ما',
      trustTitle: 'نمادهای اعتماد',
      rights: 'تمامی حقوق محفوظ است.',
      legalLinks: [
        { id: 'terms', label: 'قوانین و شرایط خرید', link: '/terms' },
        { id: 'privacy', label: 'حریم خصوصی', link: '/privacy' },
      ],
    },
    en: {
      manufacturerSiteLabel: 'Official factory website:',
      categoriesTitle: 'Product categories',
      quickLinksTitle: 'Quick links',
      quickLinks: [
        { id: 'prices', label: 'Today’s price list' },
        { id: 'project-inquiry', label: 'Project purchase inquiry' },
        { id: 'official-representative', label: 'Official agent of Ghadir Louleh Pasargad' },
        { id: 'certificates', label: 'Agency documents and technical approvals' },
        { id: 'factory', label: 'Factory and supply capacity' },
        { id: 'services', label: 'Our services' },
        { id: 'blog', label: 'Technical journal' },
        { id: 'projects', label: 'Completed projects' },
        { id: 'track', label: 'Track order' },
        { id: 'faq', label: 'FAQ' },
        { id: 'contact', label: 'Contact us' },
      ],
      contactTitle: 'Get in touch',
      trustTitle: 'Trust seals',
      rights: 'All rights reserved.',
      legalLinks: [
        { id: 'terms', label: 'Terms and conditions' },
        { id: 'privacy', label: 'Privacy policy' },
      ],
    },
  },
});

export const globalPage: ContentPage = {
  key: 'global',
  title: 'سراسری (هدر و فوتر)',
  sections: [globalHeader, globalFooter],
};
