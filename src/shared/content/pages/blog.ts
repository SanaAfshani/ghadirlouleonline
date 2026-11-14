import { defineSection, type ContentPage } from '../types';
import { seoSection } from '../seo-section';

export const blogSeo = seoSection('blog.seo', {
  fa: {
    metaTitle: 'وبلاگ | راهنمای خرید و مقالات تخصصی لوله',
    metaDescription: 'مقالات تخصصی و راهنمای خرید لوله آب و فاضلاب، کاروگیت، پلی اتیلن، پلیکا و اتصالات — نوشته کارشناسان قدیر لوله آنلاین.',
  },
  en: {
    metaTitle: 'Blog | Pipe buying guides and technical articles',
    metaDescription: 'Technical articles and buying guides for water and sewer pipes, double-wall corrugated pipes, spiral pipes and fittings — written by the Qadir Lule Online team.',
  },
});

export const blogHero = defineSection({
  key: 'blog.hero',
  title: 'بالای صفحه',
  fields: {
    label: { type: 'text', label: 'برچسب کوچک بالای عنوان' },
    title: { type: 'text', label: 'عنوان' },
    description: { type: 'text', label: 'توضیح', multiline: true },
    emptyText: { type: 'text', label: 'متن وقتی هنوز مقاله‌ای منتشر نشده' },
  },
  defaults: {
    fa: {
      label: 'مجله تخصصی',
      title: 'مقالات و راهنماها',
      description: 'آموزش، راهنمای فنی و اخبار دنیای لوله آب و فاضلاب، کاروگیت، پلی‌اتیلن و پلیکا',
      emptyText: 'هنوز مقاله‌ای منتشر نشده است.',
    },
    en: {
      label: 'Technical journal',
      title: 'Articles and guides',
      description: 'Tutorials, technical guides and news on water and sewer pipes, corrugated pipes, polyethylene and PVC',
      emptyText: 'No articles have been published yet.',
    },
  },
});

export const blogPage: ContentPage = {
  key: 'blog',
  title: 'وبلاگ',
  path: '/blog',
  sections: [blogSeo, blogHero],
};
