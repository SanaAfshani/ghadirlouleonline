import { defineSection, type ContentPage } from '../types';
import { seoSection } from '../seo-section';

export const searchSeo = seoSection('search.seo', {
  fa: {
    metaTitle: 'جستجو در محصولات و مقالات',
    metaDescription: 'جستجو در محصولات، مقالات و پروژه‌های قدیر لوله آنلاین',
  },
  en: {
    metaTitle: 'Search products and articles',
    metaDescription: 'Search Qadir Lule Online products, articles and projects',
  },
});

export const searchHero = defineSection({
  key: 'search.hero',
  title: 'بالای صفحه و حالت خالی',
  fields: {
    title: { type: 'text', label: 'عنوان' },
    description: { type: 'text', label: 'توضیح' },
    emptyTitle: { type: 'text', label: 'عنوان وقتی هنوز چیزی جستجو نشده' },
    emptyText: { type: 'text', label: 'توضیح وقتی هنوز چیزی جستجو نشده' },
  },
  defaults: {
    fa: {
      title: 'جستجو',
      description: 'جستجو در محصولات، مقالات و پروژه‌ها',
      emptyTitle: 'دنبال چه محصولی می‌گردید؟',
      emptyText: 'عبارت جستجو را وارد کنید یا یکی از پیشنهادها را انتخاب کنید',
    },
    en: {
      title: 'Search',
      description: 'Search products, articles and projects',
      emptyTitle: 'What are you looking for?',
      emptyText: 'Type a search term or pick one of the suggestions',
    },
  },
});

export const searchSuggestions = defineSection({
  key: 'search.suggestions',
  title: 'جستجوهای پرطرفدار',
  description: 'دکمه‌های آماده زیر کادر جستجو؛ با کلیک همان عبارت جستجو می‌شود.',
  fields: {
    items: {
      type: 'list',
      label: 'عبارت‌ها',
      itemLabel: 'عبارت',
      max: 10,
      fields: { term: { type: 'text', label: 'عبارت جستجو' } },
    },
  },
  defaults: {
    fa: {
      items: [
        { id: 'corrugated', term: 'لوله کاروگیت' },
        { id: 'corrugated-400', term: 'کاروگیت ۴۰۰' },
        { id: 'spiral', term: 'لوله اسپیرال' },
        { id: 'coupler', term: 'کوپلر' },
        { id: 'gasket', term: 'واشر' },
        { id: 'fittings', term: 'اتصالات' },
      ],
    },
    en: {
      items: [
        { id: 'corrugated', term: 'Corrugated pipe' },
        { id: 'corrugated-400', term: 'Corrugated 400' },
        { id: 'spiral', term: 'Spiral pipe' },
        { id: 'coupler', term: 'Coupler' },
        { id: 'gasket', term: 'Gasket' },
        { id: 'fittings', term: 'Fittings' },
      ],
    },
  },
});

export const searchPage: ContentPage = {
  key: 'search',
  title: 'جستجو',
  path: '/search',
  sections: [searchSeo, searchHero, searchSuggestions],
};
