import { defineSection, type ContentPage } from '../types';
import { seoSection } from '../seo-section';

export const projectsSeo = seoSection('projects.seo', {
  fa: {
    metaTitle: 'پروژه‌ها | نمونه‌کارهای تامین لوله و اتصالات',
    metaDescription: 'نمونه پروژه‌های اجراشده تامین لوله آب و فاضلاب و اتصالات صنعتی در سراسر ایران توسط قدیر لوله آنلاین.',
  },
  en: {
    metaTitle: 'Projects | Pipe and fittings supply references',
    metaDescription: 'Completed water and sewer pipe and industrial fittings supply projects across Iran by Qadir Lule Online.',
  },
});

export const projectsHero = defineSection({
  key: 'projects.hero',
  title: 'بالای صفحه',
  fields: {
    label: { type: 'text', label: 'برچسب کوچک بالای عنوان' },
    title: { type: 'text', label: 'عنوان' },
    description: { type: 'text', label: 'توضیح', multiline: true },
    emptyText: { type: 'text', label: 'متن وقتی هنوز پروژه‌ای ثبت نشده' },
  },
  defaults: {
    fa: {
      label: 'پورتفوی',
      title: 'پروژه‌های اجرا شده',
      description: 'نگاهی به بزرگ‌ترین پروژه‌های تامین لوله آب و فاضلاب در سراسر کشور',
      emptyText: 'پروژه‌ای ثبت نشده است.',
    },
    en: {
      label: 'Portfolio',
      title: 'Completed projects',
      description: 'A look at some of the largest water and sewer pipe supply projects we have delivered across Iran',
      emptyText: 'No projects have been added yet.',
    },
  },
});

export const projectsPage: ContentPage = {
  key: 'projects',
  title: 'پروژه‌ها',
  path: '/projects',
  sections: [projectsSeo, projectsHero],
};
