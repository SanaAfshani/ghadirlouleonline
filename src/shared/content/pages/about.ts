import { defineSection, type ContentPage } from '../types';
import { seoSection } from '../seo-section';

export const aboutSeo = seoSection('about.seo', {
  fa: {
    metaTitle: 'درباره ما | نماینده رسمی قدیر لوله پاسارگاد',
    metaDescription: 'قدیر لوله آنلاین، نماینده انحصاری قدیر لوله پاسارگاد: فروش لوله کاروگیت دوجداره، لوله اسپیرال و اتصالات کاروگیت با ارسال به سراسر کشور.',
  },
  en: {
    metaTitle: 'About us | Official agent of Ghadir Louleh Pasargad',
    metaDescription: 'Qadir Lule Online, the exclusive agent of Ghadir Louleh Pasargad: double-wall corrugated pipes, spiral pipes and corrugated fittings, delivered across Iran.',
  },
});

export const aboutHero = defineSection({
  key: 'about.hero',
  title: 'بالای صفحه',
  fields: {
    label: { type: 'text', label: 'برچسب کوچک بالای عنوان' },
    title: { type: 'text', label: 'عنوان' },
    description: { type: 'text', label: 'توضیح', multiline: true },
  },
  defaults: {
    fa: {
      label: 'درباره ما',
      title: 'قدیر لوله آنلاین',
      description: 'نماینده رسمی و اختصاصی فروش و عرضه آنلاین محصولات قدیر لوله پاسارگاد: لوله کاروگیت دوجداره، لوله اسپیرال و اتصالات کاروگیت',
    },
    en: {
      label: 'About us',
      title: 'Qadir Lule Online',
      description: 'The official, exclusive sales and online distribution agent of Ghadir Louleh Pasargad: double-wall corrugated pipes, spiral pipes and corrugated pipe fittings',
    },
  },
});

export const aboutStats = defineSection({
  key: 'about.stats',
  title: 'آمار',
  description: 'فقط عدد و واقعیت قابل بررسی (مثلاً از سایت رسمی کارخانه یا گواهینامه‌ها) بنویسید.',
  fields: {
    items: {
      type: 'list',
      label: 'آمار',
      itemLabel: 'عدد',
      max: 8,
      fields: {
        value: { type: 'text', label: 'عدد یا عنوان کوتاه' },
        label: { type: 'text', label: 'توضیح' },
      },
    },
  },
  defaults: {
    fa: {
      items: [
        { id: 'founded', value: '۱۳۹۱', label: 'آغاز تولید کارخانه در گرمسار' },
        { id: 'corrugated', value: '۱۲', label: 'سایز لوله کاروگیت؛ ۱۱۰ تا ۱۲۰۰' },
        { id: 'spiral', value: '۵', label: 'سایز لوله اسپیرال؛ ۹۰۰ تا ۲۰۰۰' },
        { id: 'iso', value: 'ISO 9001', label: 'و پروانه استاندارد ISIRI 9116-3' },
      ],
    },
    en: {
      items: [
        { id: 'founded', value: '2012', label: 'Factory production began in Garmsar' },
        { id: 'corrugated', value: '12', label: 'Corrugated pipe sizes, 110 to 1200 mm' },
        { id: 'spiral', value: '5', label: 'Spiral pipe sizes, 900 to 2000 mm' },
        { id: 'iso', value: 'ISO 9001', label: 'plus the ISIRI 9116-3 standard licence' },
      ],
    },
  },
});

export const aboutStory = defineSection({
  key: 'about.story',
  title: 'داستان ما',
  fields: {
    eyebrow: { type: 'text', label: 'برچسب کوچک' },
    title: { type: 'text', label: 'عنوان' },
    body: { type: 'html', label: 'متن', hint: 'لینک داخلی را با آدرس بدون دامنه بنویسید (مثلاً /official-representative)؛ در نسخه انگلیسی خودکار /en می‌گیرد.' },
    advantages: {
      type: 'list',
      label: 'مزیت‌ها (تیک‌دار)',
      itemLabel: 'مزیت',
      max: 12,
      fields: { text: { type: 'text', label: 'متن' } },
    },
  },
  defaults: {
    fa: {
      eyebrow: 'داستان ما',
      title: 'نماینده رسمی کارخانه‌ای که از ۱۳۹۱ لوله دوجداره می‌سازد',
      body: `<p>شرکت تولیدی و بازرگانی قدیر لوله پاسارگاد در اوایل سال ۱۳۹۱ در شهرک صنعتی گرمسار با یک خط تولید ۲۰۰ تا ۴۰۰ میلیمتر شروع به کار کرد و امروز لوله دوجداره کاروگیت و لوله اسپیرال تولید می‌کند. کارخانه گواهینامه ISO 9001 و پروانه استاندارد اجباری ISIRI 9116-3 دارد و در دی ۱۴۰۲ تفاهم‌نامه همکاری فنی با شرکتی از تاجیکستان امضا کرده است.</p>
<p>قدیر لوله آنلاین به مدیریت آقای امیر یوسفی، طبق <a href="/official-representative">پیام رسمی کارخانه</a>، نماینده رسمی و اختصاصی فروش و عرضه آنلاین محصولات قدیر لوله پاسارگاد است. تمرکز ما روی سه محصول است: لوله کاروگیت دوجداره، لوله اسپیرال و اتصالات کاروگیت؛ همه مستقیم از کارخانه و با قیمت روز.</p>`,
      advantages: [
        { id: 'direct', text: 'تأمین مستقیم از کارخانه قدیر لوله پاسارگاد، بدون واسطه' },
        { id: 'official', text: 'نماینده رسمی و اختصاصی با گواهی نمایندگی کارخانه' },
        { id: 'quality', text: 'مدارک کیفیت: ISO 9001، پروانه ISIRI 9116-3 و گزارش آزمون' },
        { id: 'warehouse', text: 'بارگیری از انبار کارخانه در گرمسار' },
        { id: 'advice', text: 'مشاوره انتخاب سایز و کلاس SN برای پروژه' },
        { id: 'delivery', text: 'ارسال به سراسر ایران' },
      ],
    },
    en: {
      eyebrow: 'Our story',
      title: 'Official agent of a factory making double-wall pipes since 2012',
      body: `<p>Ghadir Louleh Pasargad Manufacturing and Trading Company started in early 2012 in Garmsar Industrial Park with a single 200–400 mm production line, and today manufactures double-wall corrugated pipes and spiral pipes. The factory holds ISO 9001 certification and the mandatory ISIRI 9116-3 standard licence, and in January 2024 signed a technical cooperation agreement with a company from Tajikistan.</p>
<p>Qadir Lule Online, managed by Mr. Amir Yousefi, is — according to the <a href="/official-representative">factory's official statement</a> — the official and exclusive sales and online distribution agent of Ghadir Louleh Pasargad. We focus on three products: double-wall corrugated pipes, spiral pipes and corrugated pipe fittings, all supplied directly from the factory at today's price.</p>`,
      advantages: [
        { id: 'direct', text: 'Supplied directly by the Ghadir Louleh Pasargad factory, with no middlemen' },
        { id: 'official', text: 'Official, exclusive agent with the factory’s representation certificate' },
        { id: 'quality', text: 'Quality documents: ISO 9001, ISIRI 9116-3 licence and test reports' },
        { id: 'warehouse', text: 'Loaded at the factory warehouse in Garmsar' },
        { id: 'advice', text: 'Advice on choosing the right size and SN class for your project' },
        { id: 'delivery', text: 'Delivery anywhere in Iran' },
      ],
    },
  },
});

export const aboutValues = defineSection({
  key: 'about.values',
  title: 'ماموریت، چشم‌انداز و ارزش‌ها',
  fields: {
    items: {
      type: 'list',
      label: 'کارت‌ها',
      itemLabel: 'کارت',
      max: 6,
      fields: {
        title: { type: 'text', label: 'عنوان' },
        text: { type: 'text', label: 'متن', multiline: true },
      },
    },
  },
  defaults: {
    fa: {
      items: [
        { id: 'mission', title: 'ماموریت ما', text: 'تامین با کیفیت‌ترین لوله فاضلاب و آب‌های سطحی — لوله کاروگیت دوجداره، لوله اسپیرال و اتصالات کاروگیت — با قیمت رقابتی و خدمات حرفه‌ای.' },
        { id: 'vision', title: 'چشم‌انداز ما', text: 'مرجع تخصصی خرید و تأمین لوله کاروگیت و اسپیرال برای پیمانکاران، مهندسان مشاور و پروژه‌های عمرانی ایران.' },
        { id: 'values', title: 'ارزش‌های ما', text: 'صداقت، کیفیت تضمین‌شده، تحویل به‌موقع و رضایت مشتری اصول اساسی ما هستند.' },
      ],
    },
    en: {
      items: [
        { id: 'mission', title: 'Our mission', text: 'Supplying the highest-quality sewer and stormwater pipes — double-wall corrugated pipes, spiral pipes and corrugated fittings — at competitive prices with professional service.' },
        { id: 'vision', title: 'Our vision', text: 'To be the specialist source for buying corrugated and spiral pipes for contractors, consulting engineers and civil projects across Iran.' },
        { id: 'values', title: 'Our values', text: 'Honesty, guaranteed quality, on-time delivery and customer satisfaction are the principles we work by.' },
      ],
    },
  },
});

export const aboutTeam = defineSection({
  key: 'about.team',
  title: 'مدیریت',
  fields: {
    eyebrow: { type: 'text', label: 'برچسب کوچک' },
    title: { type: 'text', label: 'عنوان' },
    members: {
      type: 'list',
      label: 'افراد',
      itemLabel: 'نفر',
      max: 9,
      fields: {
        name: { type: 'text', label: 'نام' },
        role: { type: 'text', label: 'سمت' },
        text: { type: 'text', label: 'توضیح' },
      },
    },
  },
  defaults: {
    fa: {
      eyebrow: 'مدیریت',
      title: 'مدیریت مجموعه و کارخانه',
      members: [
        { id: 'yousefi', name: 'آقای امیر یوسفی', role: 'مدیر قدیر لوله آنلاین', text: 'فروش و تأمین، اعلام قیمت روز، صدور پیش‌فاکتور و پیگیری سفارش' },
        { id: 'jamshid', name: 'دکتر جمشید شاطری', role: 'مدیرعامل قدیر لوله پاسارگاد', text: 'امضاکننده پیام رسمی معرفی نمایندگی' },
        { id: 'nader', name: 'دکتر نادر شاطری', role: 'مدیر فروش قدیر لوله پاسارگاد', text: 'واحد فروش کارخانه' },
      ],
    },
    en: {
      eyebrow: 'Management',
      title: 'Agency and factory management',
      members: [
        { id: 'yousefi', name: 'Mr. Amir Yousefi', role: 'Manager, Qadir Lule Online', text: 'Sales and supply, daily pricing, pro forma invoices and order follow-up' },
        { id: 'jamshid', name: 'Dr. Jamshid Shateri', role: 'CEO, Ghadir Louleh Pasargad', text: 'Signatory of the official statement appointing the agency' },
        { id: 'nader', name: 'Dr. Nader Shateri', role: 'Sales Director, Ghadir Louleh Pasargad', text: 'Factory sales department' },
      ],
    },
  },
});

export const aboutCta = defineSection({
  key: 'about.cta',
  title: 'دعوت به تماس (پایین صفحه)',
  fields: {
    title: { type: 'text', label: 'عنوان' },
    text: { type: 'text', label: 'توضیح' },
    buttonLabel: { type: 'text', label: 'متن دکمه' },
    buttonLink: { type: 'link', label: 'لینک دکمه' },
  },
  defaults: {
    fa: {
      title: 'با ما در تماس باشید',
      text: 'برای استعلام قیمت و مشاوره رایگان با کارشناسان ما تماس بگیرید',
      buttonLabel: 'تماس با ما',
      buttonLink: '/contact',
    },
    en: {
      title: 'Get in touch',
      text: 'Contact our specialists for a price quote and free advice',
      buttonLabel: 'Contact us',
    },
  },
});

export const aboutPage: ContentPage = {
  key: 'about',
  title: 'درباره ما',
  path: '/about',
  sections: [aboutSeo, aboutHero, aboutStats, aboutStory, aboutValues, aboutTeam, aboutCta],
};
