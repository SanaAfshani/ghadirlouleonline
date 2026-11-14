import { defineSection, type ContentPage } from '../types';
import { seoSection } from '../seo-section';

/** شماره‌ها از تنظیمات سایت در متن می‌نشینند تا با عوض شدن شماره، توضیحات گوگل قدیمی نماند */
export const contactSeo = {
  ...seoSection('contact.seo', {
    fa: {
      metaTitle: 'تماس با ما | خرید لوله کاروگیت و اسپیرال',
      metaDescription:
        'تماس با قدیر لوله آنلاین، تنها نماینده انحصاری قدیر لوله پاسارگاد: فروش و سفارش عمده {mobile} (تماس، واتس‌اپ و روبیکا)، دفتر {officePhone}، دفتر تهران و کارخانه گرمسار.',
    },
    en: {
      metaTitle: 'Contact us | Buy corrugated and spiral pipes',
      metaDescription:
        'Contact Qadir Lule Online, exclusive sales agent of Ghadir Louleh Pasargad: sales and bulk orders {mobile} (call, WhatsApp and Rubika), office {officePhone}, Tehran office and Garmsar factory.',
    },
  }),
  description: 'در توضیحات، {mobile} شماره همراه فروش و {officePhone} اولین تلفن دفتر از «تنظیمات سایت» است.',
};

export const contactHero = defineSection({
  key: 'contact.hero',
  title: 'بالای صفحه',
  fields: {
    label: { type: 'text', label: 'برچسب کوچک بالای عنوان' },
    title: { type: 'text', label: 'عنوان' },
    description: { type: 'text', label: 'توضیح', multiline: true },
  },
  defaults: {
    fa: {
      label: 'تماس با ما',
      title: 'تماس با قدیر لوله آنلاین',
      description: 'استعلام قیمت روز، مشاوره انتخاب سایز و کلاس SN و سفارش لوله کاروگیت، اسپیرال و اتصالات — تلفن، واتس‌اپ و روبیکا واحد فروش.',
    },
    en: {
      label: 'Contact us',
      title: 'Contact Qadir Lule Online',
      description: 'Today’s prices, advice on choosing the size and SN class, and orders for corrugated pipes, spiral pipes and fittings — reach our sales team by phone, WhatsApp or Rubika.',
    },
  },
});

export const contactChannels = defineSection({
  key: 'contact.channels',
  title: 'راه‌های تماس',
  description: 'شماره‌ها، ایمیل، شناسه روبیکا و ساعت کاری از «تنظیمات سایت» می‌آیند؛ این‌جا فقط عنوان کارت‌هاست.',
  fields: {
    officePhonesTitle: { type: 'text', label: 'عنوان تلفن‌های دفتر' },
    salesTitle: { type: 'text', label: 'عنوان شماره فروش', hint: '{name} = نام کارشناس فروش از تنظیمات سایت' },
    rubikaTitle: { type: 'text', label: 'عنوان روبیکا' },
    emailTitle: { type: 'text', label: 'عنوان ایمیل' },
    hoursTitle: { type: 'text', label: 'عنوان ساعت کاری' },
    closedNote: { type: 'text', label: 'روز تعطیل' },
    whatsappTitle: { type: 'text', label: 'عنوان کارت واتس‌اپ' },
    whatsappText: { type: 'text', label: 'توضیح کارت واتس‌اپ' },
  },
  defaults: {
    fa: {
      officePhonesTitle: 'تلفن دفتر مرکزی قدیر لوله پاسارگاد',
      salesTitle: 'فروش و سفارش عمده — {name} (تماس، واتس‌اپ و روبیکا)',
      rubikaTitle: 'پیام‌رسان روبیکا',
      emailTitle: 'ایمیل',
      hoursTitle: 'ساعت کاری دفتر فروش',
      closedNote: 'جمعه: تعطیل',
      whatsappTitle: 'گفتگو در واتس‌اپ',
      whatsappText: 'پاسخ سریع در ساعت کاری',
    },
    en: {
      officePhonesTitle: 'Ghadir Louleh Pasargad head office phone',
      salesTitle: 'Sales and bulk orders — {name} (call, WhatsApp and Rubika)',
      rubikaTitle: 'Rubika messenger',
      emailTitle: 'Email',
      hoursTitle: 'Sales office hours',
      closedNote: 'Friday: closed',
      whatsappTitle: 'Chat on WhatsApp',
      whatsappText: 'Quick replies during business hours',
    },
  },
});

export const contactProjectCta = defineSection({
  key: 'contact.projectCta',
  title: 'کارت خرید پروژه‌ای (بالای فرم)',
  fields: {
    title: { type: 'text', label: 'عنوان' },
    text: { type: 'text', label: 'توضیح' },
    link: { type: 'link', label: 'لینک' },
  },
  defaults: {
    fa: {
      title: 'خرید پروژه‌ای و عمده',
      text: 'چند سایز، کلاس SN، متراژ و شهر پروژه را در فرم استعلام پروژه‌ای ثبت کنید',
      link: '/project-inquiry',
    },
    en: {
      title: 'Project and bulk purchases',
      text: 'Enter several sizes, SN class, lengths and the project city in the project inquiry form',
    },
  },
});

export const contactLocations = defineSection({
  key: 'contact.locations',
  title: 'آدرس‌ها',
  description: 'خود آدرس‌ها از «تنظیمات سایت» می‌آیند.',
  fields: {
    eyebrow: { type: 'text', label: 'برچسب کوچک' },
    title: { type: 'text', label: 'عنوان' },
    officeTitle: { type: 'text', label: 'عنوان دفتر' },
    factoryTitle: { type: 'text', label: 'عنوان کارخانه' },
  },
  defaults: {
    fa: { eyebrow: 'آدرس‌ها', title: 'دفتر مرکزی و کارخانه', officeTitle: 'دفتر مرکزی و فروش', factoryTitle: 'کارخانه و انبار' },
    en: { eyebrow: 'Addresses', title: 'Head office and factory', officeTitle: 'Head office and sales', factoryTitle: 'Factory and warehouse' },
  },
});

export const contactFactory = defineSection({
  key: 'contact.factory',
  title: 'درباره کارخانه',
  fields: {
    eyebrow: { type: 'text', label: 'برچسب کوچک' },
    title: { type: 'text', label: 'عنوان' },
    highlightTitle: { type: 'text', label: 'جمله پررنگ کادر نمایندگی' },
    highlightText: { type: 'text', label: 'ادامه متن کادر نمایندگی' },
    buttonLabel: { type: 'text', label: 'متن دکمه' },
    buttonLink: { type: 'link', label: 'لینک دکمه' },
    body: { type: 'text', label: 'معرفی کارخانه', multiline: true },
    timeline: {
      type: 'list',
      label: 'تاریخچه',
      itemLabel: 'رویداد',
      max: 12,
      fields: {
        year: { type: 'text', label: 'سال' },
        text: { type: 'text', label: 'شرح' },
      },
    },
    facts: {
      type: 'list',
      label: 'مشخصات',
      itemLabel: 'مورد',
      max: 6,
      fields: {
        title: { type: 'text', label: 'عنوان' },
        text: { type: 'text', label: 'توضیح' },
      },
    },
    links: {
      type: 'list',
      label: 'صفحه‌های مرتبط',
      itemLabel: 'لینک',
      max: 6,
      fields: {
        title: { type: 'text', label: 'عنوان' },
        text: { type: 'text', label: 'توضیح' },
        href: { type: 'link', label: 'لینک' },
      },
    },
    usesTitle: { type: 'text', label: 'عنوان کاربردها' },
    uses: {
      type: 'list',
      label: 'کاربردها',
      itemLabel: 'کاربرد',
      max: 12,
      fields: { text: { type: 'text', label: 'متن' } },
    },
  },
  defaults: {
    fa: {
      eyebrow: 'درباره کارخانه',
      title: 'قدیر لوله پاسارگاد؛ تولیدکننده لوله کاروگیت در گرمسار',
      highlightTitle: 'قدیر لوله آنلاین، تنها نماینده انحصاری قدیر لوله پاسارگاد است.',
      highlightText: 'برای خرید، استعلام قیمت و سفارش پروژه‌ای با دفتر فروش ما تماس بگیرید.',
      buttonLabel: 'گواهینامه‌ها',
      buttonLink: '/certificates',
      body: 'شرکت تولیدی و بازرگانی قدیر لوله پاسارگاد از سال ۱۳۹۱ در شهرک صنعتی گرمسار لوله دوجداره پلی اتیلن (کاروگیت) تولید می‌کند. کارخانه با یک خط ۲۰۰ تا ۴۰۰ میلیمتر شروع کرد و با افزودن خطوط جدید و خط لوله اسپیرال، امروز لوله کاروگیت تا ۱۲۰۰ میلیمتر و لوله اسپیرال تا ۲۰۰۰ میلیمتر را برای پروژه‌های فاضلاب، زهکشی و آب‌های سطحی تأمین می‌کند.',
      timeline: [
        { id: 'start', year: '۱۳۹۱', text: 'آغاز فعالیت در شهرک صنعتی گرمسار با یک خط تولید لوله کاروگیت ۲۰۰ تا ۴۰۰ میلیمتر' },
        { id: 'isiri', year: '۱۳۹۲', text: 'دریافت پروانه کاربرد علامت استاندارد اجباری ISIRI 9116-3 از سازمان ملی استاندارد' },
        { id: 'renewal', year: '۱۴۰۱', text: 'تمدید پروانه استاندارد برای لوله‌های دیواره ساختمند پلی اتیلن، پلی پروپیلن و PVC-U' },
        { id: 'iso', year: '۱۴۰۴', text: 'گواهینامه سیستم مدیریت کیفیت ISO 9001:2015 برای تولید لوله کاروگیت و اسپیرال' },
      ],
      facts: [
        { id: 'products', title: 'محصولات', text: 'لوله کاروگیت دوجداره ۱۱۰ تا ۱۲۰۰ میلیمتر، لوله اسپیرال ۹۰۰ تا ۲۰۰۰ میلیمتر و اتصالات کاروگیت' },
        { id: 'stiffness', title: 'کلاس سختی حلقوی', text: 'SN4 (۱۶) و SN8 (۳۱٫۵ کیلونیوتن بر مترمربع) — بر اساس عمق دفن و بار ترافیکی' },
        { id: 'material', title: 'جنس و اتصال', text: 'پلی اتیلن سنگین HDPE، جداره داخلی صاف و روشن؛ اتصال با کوپلر و واشر آب‌بند EPDM' },
      ],
      links: [
        { id: 'factory', title: 'کارخانه و توانمندی تأمین', text: 'فرایند تولید، کنترل کیفیت، فیلم و عکس خط تولید و انبار', href: '/factory' },
        { id: 'representative', title: 'پیام رسمی نمایندگی', text: 'متن رسمی قدیر لوله پاسارگاد و گواهی نمایندگی انحصاری', href: '/official-representative' },
        { id: 'certificates', title: 'مدارک و تأییدیه‌های فنی', text: 'پروانه ISIRI 9116-3، گواهینامه ISO 9001:2015 و اعتبار آن‌ها', href: '/certificates' },
      ],
      usesTitle: 'کاربردها',
      uses: [
        { id: 'sewer', text: 'شبکه جمع‌آوری فاضلاب شهری و روستایی' },
        { id: 'drainage', text: 'زهکشی اراضی کشاورزی و آب‌های سطحی' },
        { id: 'gravity', text: 'انتقال ثقلی آب' },
        { id: 'conduit', text: 'غلاف محافظ کابل برق و مخابرات' },
      ],
    },
    en: {
      eyebrow: 'About the factory',
      title: 'Ghadir Louleh Pasargad: corrugated pipe manufacturer in Garmsar',
      highlightTitle: 'Qadir Lule Online is the sole exclusive sales agent of Ghadir Louleh Pasargad.',
      highlightText: 'Contact our sales office to buy, request a price or place a project order.',
      buttonLabel: 'Certificates',
      body: 'Ghadir Louleh Pasargad Manufacturing and Trading Company has produced double-wall polyethylene (corrugated) pipes in Garmsar Industrial Park since 2012. The factory started with a single 200–400 mm line and, after adding new lines and a spiral pipe line, now supplies corrugated pipes up to 1200 mm and spiral pipes up to 2000 mm for sewer, drainage and stormwater projects.',
      timeline: [
        { id: 'start', year: '2012', text: 'Operations began in Garmsar Industrial Park with a single 200–400 mm corrugated pipe line' },
        { id: 'isiri', year: '2013', text: 'Awarded the mandatory ISIRI 9116-3 standard mark licence by the Iranian National Standards Organization' },
        { id: 'renewal', year: '2022', text: 'Standard licence renewed for structured-wall polyethylene, polypropylene and PVC-U pipes' },
        { id: 'iso', year: '2025', text: 'ISO 9001:2015 quality management certification for corrugated and spiral pipe production' },
      ],
      facts: [
        { id: 'products', title: 'Products', text: 'Double-wall corrugated pipes 110 to 1200 mm, spiral pipes 900 to 2000 mm and corrugated pipe fittings' },
        { id: 'stiffness', title: 'Ring stiffness classes', text: 'SN4 (16) and SN8 (31.5 kN/m²) — chosen by burial depth and traffic load' },
        { id: 'material', title: 'Material and jointing', text: 'High-density polyethylene (HDPE) with a smooth, light-coloured inner wall; joined with couplers and EPDM sealing gaskets' },
      ],
      links: [
        { id: 'factory', title: 'Factory and supply capacity', text: 'Production process, quality control, and videos and photos of the production line and warehouse' },
        { id: 'representative', title: 'Official agency statement', text: 'The official statement of Ghadir Louleh Pasargad and the exclusive agency certificate' },
        { id: 'certificates', title: 'Technical documents and approvals', text: 'ISIRI 9116-3 licence, ISO 9001:2015 certificate and their validity' },
      ],
      usesTitle: 'Applications',
      uses: [
        { id: 'sewer', text: 'Urban and rural sewer collection networks' },
        { id: 'drainage', text: 'Agricultural land drainage and stormwater' },
        { id: 'gravity', text: 'Gravity water transmission' },
        { id: 'conduit', text: 'Protective conduit for power and telecom cables' },
      ],
    },
  },
});

/** سوالات متداول صفحه تماس — هم آکاردئون و هم FAQPage گوگل از همین فهرست ساخته می‌شوند */
export const contactFaq = defineSection({
  key: 'contact.faq',
  title: 'سوالات متداول',
  description: 'در پاسخ‌ها {factoryAddress} و {officeAddress} با آدرس‌های «تنظیمات سایت» جایگزین می‌شوند.',
  fields: {
    items: {
      type: 'list',
      label: 'سوال‌ها',
      itemLabel: 'سوال',
      max: 20,
      fields: {
        question: { type: 'text', label: 'سوال' },
        answer: { type: 'text', label: 'پاسخ', multiline: true },
      },
    },
  },
  defaults: {
    fa: {
      items: [
        {
          id: 'agent',
          question: 'نماینده رسمی فروش قدیر لوله پاسارگاد کیست؟',
          answer: 'قدیر لوله آنلاین تنها نماینده انحصاری قدیر لوله پاسارگاد است و محصولات کارخانه را با قیمت روز و ارسال مستقیم از انبار گرمسار عرضه می‌کند.',
        },
        {
          id: 'location',
          question: 'کارخانه قدیر لوله پاسارگاد کجاست؟',
          answer: 'کارخانه و انبار در {factoryAddress} است و دفتر مرکزی فروش در {officeAddress}.',
        },
        {
          id: 'standards',
          question: 'لوله‌های قدیر لوله پاسارگاد چه استاندارد و گواهینامه‌ای دارند؟',
          answer: 'پروانه کاربرد علامت استاندارد اجباری ISIRI 9116-3 (تمدید ۱۴۰۱) و گواهینامه سیستم مدیریت کیفیت ISO 9001:2015. تصویر اسناد در صفحه گواهینامه‌ها آمده است.',
        },
        {
          id: 'classes',
          question: 'لوله کاروگیت قدیر لوله در چه کلاس‌هایی تولید می‌شود؟',
          answer: 'در دو کلاس سختی حلقوی SN4 (۱۶ کیلونیوتن) و SN8 (۳۱٫۵ کیلونیوتن بر مترمربع)؛ انتخاب کلاس به عمق دفن و بار ترافیکی بستگی دارد.',
        },
      ],
    },
    en: {
      items: [
        {
          id: 'agent',
          question: 'Who is the official sales agent of Ghadir Louleh Pasargad?',
          answer: 'Qadir Lule Online is the sole exclusive sales agent of Ghadir Louleh Pasargad, supplying the factory’s products at today’s price with direct shipping from the Garmsar warehouse.',
        },
        {
          id: 'location',
          question: 'Where is the Ghadir Louleh Pasargad factory?',
          answer: 'The factory and warehouse are in {factoryAddress}, and the head sales office is in {officeAddress}.',
        },
        {
          id: 'standards',
          question: 'Which standards and certificates do Ghadir Louleh Pasargad pipes hold?',
          answer: 'The mandatory ISIRI 9116-3 standard mark licence (renewed in 2022) and ISO 9001:2015 quality management certification. Images of the documents are on the certificates page.',
        },
        {
          id: 'classes',
          question: 'In which classes are Ghadir Louleh corrugated pipes produced?',
          answer: 'In two ring-stiffness classes: SN4 (16 kN) and SN8 (31.5 kN/m²); the right class depends on burial depth and traffic load.',
        },
      ],
    },
  },
});

export const contactPage: ContentPage = {
  key: 'contact',
  title: 'تماس با ما',
  path: '/contact',
  sections: [contactSeo, contactHero, contactChannels, contactProjectCta, contactLocations, contactFactory, contactFaq],
};
