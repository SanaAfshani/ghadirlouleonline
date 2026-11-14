import { defineSection, type ContentPage } from '../types';
import { seoSection } from '../seo-section';

/**
 * جمله معرفی سایت جلو، عبارت‌هایی که برایشان رتبه می‌گیریم پشتش.
 *
 * عنوان قبلی فقط «خرید لوله کاروگیت با قیمت روز | نماینده انحصاری…» بود. جمله معرفی تازه جای
 * بخش برند را گرفته، ولی «قیمت روز» و «لوله کاروگیت» عمداً مانده‌اند: کل تلاش سئوی این سایت
 * روی همین دو عبارت است و برداشتنشان از عنوان، رتبه‌ای را که تازه داریم می‌سازیم دور می‌ریخت.
 */
export const homeSeo = {
  ...seoSection('home.seo', {
    fa: {
      metaTitle: 'عرضه کننده لوله کاروگیت دوجداره و اسپیرال | قیمت روز لوله کاروگیت',
      metaDescription:
        'قدیر لوله آنلاین، نماینده انحصاری قدیر لوله پاسارگاد: قیمت روز لوله کاروگیت دوجداره با استاندارد ISIRI 9116 و ارسال از کارخانه گرمسار به سراسر ایران.',
    },
    en: {
      metaTitle: 'Double-wall corrugated and spiral pipe supplier | Daily corrugated pipe prices',
      metaDescription:
        'Qadir Lule Online, exclusive agent of Ghadir Louleh Pasargad: daily prices for ISIRI 9116 double-wall corrugated pipes, shipped from the Garmsar factory across Iran.',
    },
  }),
  // صفحه اصلی عنوان کامل خودش را دارد و نام سایت به آن اضافه نمی‌شود
  description: 'عنوان تب مرورگر و نتیجه گوگل (حدود ۶۰ نویسه؛ در صفحه اصلی نام سایت اضافه نمی‌شود) و توضیح زیر آن (حدود ۱۵۵ نویسه).',
};

export const homeHero = defineSection({
  key: 'home.hero',
  title: 'بالای صفحه (هیرو)',
  description: 'تیتر و زیرتیتر و عکس‌های پس‌زمینه از «تنظیمات سایت» و «اسلایدر هرو» می‌آیند؛ این‌جا بقیه متن‌های هیرو است.',
  fields: {
    badgeLabel: { type: 'text', label: 'برچسب بالای نام کارخانه', hint: 'نام کارخانه از تنظیمات سایت کنارش می‌آید.' },
    badgeCodes: {
      type: 'list',
      label: 'کدهای استاندارد کنار برچسب',
      itemLabel: 'کد',
      max: 3,
      fields: { text: { type: 'text', label: 'کد' } },
    },
    searchPlaceholder: { type: 'text', label: 'متن راهنمای جستجو' },
    searchButton: { type: 'text', label: 'دکمه جستجو' },
    highlights: {
      type: 'list',
      label: 'مزیت‌های زیر جستجو',
      itemLabel: 'مزیت',
      max: 4,
      fields: { text: { type: 'text', label: 'متن' } },
    },
    consultButton: { type: 'text', label: 'دکمه مشاوره زیر تابلوی قیمت' },
  },
  defaults: {
    fa: {
      badgeLabel: 'تنها نماینده انحصاری',
      badgeCodes: [
        { id: 'iso', text: 'ISO 9001' },
        { id: 'isiri', text: 'ISIRI 9116' },
      ],
      searchPlaceholder: 'نام محصول یا سایز…',
      searchButton: 'جستجو',
      highlights: [
        { id: 'warehouse', text: 'بارگیری از انبار کارخانه گرمسار' },
        { id: 'direct', text: 'خرید بدون واسطه از تولیدکننده' },
        { id: 'delivery', text: 'ارسال به سراسر کشور' },
      ],
      consultButton: 'مشاوره رایگان و استعلام قیمت عمده',
    },
    en: {
      badgeLabel: 'Sole exclusive agent of',
      badgeCodes: [
        { id: 'iso', text: 'ISO 9001' },
        { id: 'isiri', text: 'ISIRI 9116' },
      ],
      searchPlaceholder: 'Product name or size…',
      searchButton: 'Search',
      highlights: [
        { id: 'warehouse', text: 'Loaded at the Garmsar factory warehouse' },
        { id: 'direct', text: 'Buy direct from the manufacturer' },
        { id: 'delivery', text: 'Delivery anywhere in Iran' },
      ],
      consultButton: 'Free advice and bulk price requests',
    },
  },
});

export const homePrices = defineSection({
  key: 'home.prices',
  title: 'قیمت روز',
  fields: {
    eyebrow: { type: 'text', label: 'برچسب کوچک' },
    title: { type: 'text', label: 'عنوان' },
    note: { type: 'text', label: 'توضیح زیر عنوان' },
    allPricesLabel: { type: 'text', label: 'لینک «همه قیمت‌ها»' },
  },
  defaults: {
    fa: {
      eyebrow: 'قیمت روز',
      title: 'قیمت روز لوله کاروگیت و اسپیرال',
      note: 'قیمت نهایی هنگام ثبت سفارش تایید می‌شود.',
      allPricesLabel: 'لیست قیمت همه محصولات ←',
    },
    en: {
      eyebrow: 'Today’s prices',
      title: 'Today’s corrugated and spiral pipe prices',
      note: 'The final price is confirmed when you place your order.',
      allPricesLabel: 'Price list for all products →',
    },
  },
});

export const homeProductLines = defineSection({
  key: 'home.productLines',
  title: 'محصولات',
  description: 'گروه‌ها، دسته‌ها و سایزها خودکار از محصولات منتشرشده می‌آیند.',
  fields: {
    label: { type: 'text', label: 'برچسب کوچک' },
    title: { type: 'text', label: 'عنوان' },
    description: { type: 'text', label: 'توضیح', multiline: true },
    actionLabel: { type: 'text', label: 'دکمه «همه محصولات»' },
  },
  defaults: {
    fa: {
      label: 'محصولات',
      title: 'لوله کاروگیت، اسپیرال و اتصالات',
      description: 'سایز را انتخاب کنید؛ هر سایز صفحه، مشخصات فنی و قیمت روز خودش را دارد.',
      actionLabel: 'همه محصولات',
    },
    en: {
      label: 'Products',
      title: 'Corrugated pipes, spiral pipes and fittings',
      description: 'Pick a size: each one has its own page, technical specifications and today’s price.',
      actionLabel: 'All products',
    },
  },
});

export const homeServices = defineSection({
  key: 'home.services',
  title: 'چرا ما (خدمات)',
  fields: {
    eyebrow: { type: 'text', label: 'برچسب کوچک' },
    title: { type: 'text', label: 'عنوان' },
    text: { type: 'text', label: 'توضیح', multiline: true },
    ctaLabel: { type: 'text', label: 'دکمه فرم مشاوره' },
    items: {
      type: 'list',
      label: 'خدمات',
      itemLabel: 'خدمت',
      max: 8,
      fields: {
        title: { type: 'text', label: 'عنوان' },
        desc: { type: 'text', label: 'توضیح', multiline: true },
      },
    },
  },
  defaults: {
    fa: {
      eyebrow: 'چرا ما',
      title: 'خرید مطمئن لوله کاروگیت و اسپیرال، از مشاوره تا تحویل',
      text: 'فرم مشاوره را پر کنید تا کارشناسان ما برای انتخاب محصول، استعلام قیمت روز و زمان ارسال با شما تماس بگیرند.',
      ctaLabel: 'ثبت درخواست مشاوره',
      items: [
        { id: 'consult', title: 'مشاوره فنی رایگان', desc: 'انتخاب جنس، سایز و فشار کاری مناسب پروژه با کمک کارشناسان.' },
        { id: 'delivery', title: 'ارسال به سراسر ایران', desc: 'بارگیری و ارسال سفارش به محل پروژه در هر نقطه از کشور.' },
        { id: 'certificates', title: 'گواهینامه کیفیت', desc: 'ارائه گواهینامه‌های کیفی (ISIRI, ISO, EN) و Mill Certificate.' },
        { id: 'authenticity', title: 'ضمانت اصالت کالا', desc: 'تامین مستقیم از کارخانه‌های معتبر ایرانی و خارجی.' },
        { id: 'cutting', title: 'برش و تبدیل لوله', desc: 'آماده‌سازی لوله در طول و اتصال مورد نیاز پروژه.' },
      ],
    },
    en: {
      eyebrow: 'Why us',
      title: 'Buy corrugated and spiral pipes with confidence, from advice to delivery',
      text: 'Fill in the consultation form and our specialists will call you about product selection, today’s price and delivery time.',
      ctaLabel: 'Request a consultation',
      items: [
        { id: 'consult', title: 'Free technical advice', desc: 'Our specialists help you choose the right material, size and working pressure for your project.' },
        { id: 'delivery', title: 'Delivery across Iran', desc: 'Orders are loaded and shipped to your project site anywhere in the country.' },
        { id: 'certificates', title: 'Quality certificates', desc: 'Quality certificates (ISIRI, ISO, EN) and mill certificates supplied.' },
        { id: 'authenticity', title: 'Guaranteed genuine products', desc: 'Supplied directly from reputable Iranian and international manufacturers.' },
        { id: 'cutting', title: 'Pipe cutting and adaptation', desc: 'Pipes prepared to the length and connection your project needs.' },
      ],
    },
  },
});

export const homeBlog = defineSection({
  key: 'home.blog',
  title: 'مجله (آخرین مقالات)',
  description: 'سه مقاله آخر منتشرشده خودکار نمایش داده می‌شوند.',
  fields: {
    eyebrow: { type: 'text', label: 'برچسب کوچک' },
    title: { type: 'text', label: 'عنوان' },
    allLabel: { type: 'text', label: 'لینک «همه مقالات»' },
  },
  defaults: {
    fa: {
      eyebrow: 'مجله تخصصی',
      title: 'آخرین مقالات و راهنماهای خرید',
      allLabel: 'همه مقالات',
    },
    en: {
      eyebrow: 'Technical journal',
      title: 'Latest articles and buying guides',
      allLabel: 'All articles',
    },
  },
});

export const homeFactory = defineSection({
  key: 'home.factory',
  title: 'کارخانه و انبار',
  description: 'عنوان این بخش «تنها نماینده انحصاری ...»، آدرس‌ها، تلفن‌ها، لینک نقشه و گواهینامه‌ها از «تنظیمات سایت» می‌آیند.',
  fields: {
    photos: {
      type: 'list',
      label: 'عکس‌ها',
      hint: 'به ترتیب: ۱ عکس بزرگ بالا (با نام و آدرس کارخانه)، ۲ عکس کنار آن، ۳ و ۴ دو عکس کوچک پایین.',
      itemLabel: 'عکس',
      max: 4,
      fields: {
        image: { type: 'image', label: 'عکس' },
        alt: { type: 'text', label: 'متن جایگزین (alt)' },
        caption: { type: 'text', label: 'برچسب روی عکس' },
      },
    },
    photoTitle: { type: 'text', label: 'عنوان روی عکس بزرگ' },
    eyebrow: { type: 'text', label: 'برچسب کوچک' },
    intro: { type: 'html', label: 'متن معرفی' },
    steps: {
      type: 'list',
      label: 'مراحل (از انبار تا مشتری)',
      itemLabel: 'مرحله',
      max: 4,
      fields: {
        title: { type: 'text', label: 'عنوان' },
        desc: { type: 'text', label: 'توضیح' },
      },
    },
    exclusiveText: { type: 'text', label: 'متن کارت نمایندگی انحصاری', multiline: true },
    certificatesTitle: { type: 'text', label: 'عنوان نوار گواهینامه‌ها' },
    factoryTitle: { type: 'text', label: 'عنوان کارت کارخانه' },
    officeTitle: { type: 'text', label: 'عنوان کارت دفتر' },
  },
  defaults: {
    fa: {
      photos: [
        { id: 'aerial', image: '/images/site/factory-aerial-wm.webp', alt: 'نمای هوایی کارخانه قدیر لوله پاسارگاد در شهرک صنعتی گرمسار', caption: 'نمای هوایی کارخانه' },
        { id: 'entrance', image: '/images/site/factory-entrance-wm.webp', alt: 'سردر کارخانه قدیر لوله پاسارگاد — تولیدکننده لوله دوجداره و آبرسانی', caption: 'سردر کارخانه' },
        { id: 'yard', image: '/images/site/yard-branded-wm.webp', alt: 'انبار لوله کاروگیت قدیر لوله پاسارگاد در شهرک صنعتی گرمسار', caption: 'انبار کارخانه' },
        { id: 'loading', image: '/images/site/truck-loading-wm.webp', alt: 'بارگیری لوله کاروگیت برای ارسال به پروژه', caption: 'بارگیری و ارسال' },
      ],
      photoTitle: 'کارخانه قدیر لوله پاسارگاد',
      eyebrow: 'کارخانه و انبار',
      intro:
        '<p><strong>قدیر لوله آنلاین</strong> تنها نماینده انحصاری فروش قدیر لوله پاسارگاد، تولیدکننده لوله دوجداره پلی اتیلن (کاروگیت) است. سفارش‌ها مستقیم از انبار کارخانه در گرمسار بارگیری و بدون واسطه به سراسر کشور ارسال می‌شوند.</p>',
      steps: [
        { id: 'order', title: 'ثبت سفارش یا استعلام', desc: 'آنلاین از جدول قیمت یا تماس با دفتر فروش' },
        { id: 'loading', title: 'بارگیری از انبار کارخانه', desc: 'شهرک صنعتی گرمسار، استان سمنان' },
        { id: 'delivery', title: 'ارسال به محل پروژه', desc: 'حمل به سراسر کشور پس از هماهنگی' },
      ],
      exclusiveText: 'محصولات قدیر لوله پاسارگاد با گواهینامه ISO 9001 و پروانه استاندارد ملی ISIRI 9116-3 فقط از طریق قدیر لوله آنلاین عرضه می‌شود.',
      certificatesTitle: 'گواهینامه‌ها و مجوزها',
      factoryTitle: 'کارخانه و انبار',
      officeTitle: 'دفتر مرکزی و فروش',
    },
    en: {
      photos: [
        { id: 'aerial', alt: 'Aerial view of the Ghadir Louleh Pasargad factory in Garmsar Industrial Park', caption: 'Aerial view of the factory' },
        { id: 'entrance', alt: 'Entrance of the Ghadir Louleh Pasargad factory, a manufacturer of double-wall and water supply pipes', caption: 'Factory entrance' },
        { id: 'yard', alt: 'Ghadir Louleh Pasargad corrugated pipe yard in Garmsar Industrial Park', caption: 'Factory warehouse' },
        { id: 'loading', alt: 'Loading corrugated pipes for delivery to a project', caption: 'Loading and dispatch' },
      ],
      photoTitle: 'Ghadir Louleh Pasargad factory',
      eyebrow: 'Factory and warehouse',
      intro:
        '<p><strong>Qadir Lule Online</strong> is the sole exclusive sales agent of Ghadir Louleh Pasargad, a manufacturer of double-wall polyethylene (corrugated) pipes. Orders are loaded directly at the factory warehouse in Garmsar and shipped across the country with no middlemen.</p>',
      steps: [
        { id: 'order', title: 'Order or request a price', desc: 'Online from the price table or by calling the sales office' },
        { id: 'loading', title: 'Loading at the factory warehouse', desc: 'Garmsar Industrial Park, Semnan Province' },
        { id: 'delivery', title: 'Delivery to your project site', desc: 'Shipped anywhere in Iran once scheduled' },
      ],
      exclusiveText: 'Ghadir Louleh Pasargad products, certified to ISO 9001 and holding the ISIRI 9116-3 national standard licence, are sold only through Qadir Lule Online.',
      certificatesTitle: 'Certificates and licences',
      factoryTitle: 'Factory and warehouse',
      officeTitle: 'Head office and sales',
    },
  },
});

export const homePage: ContentPage = {
  key: 'home',
  title: 'صفحه اصلی',
  path: '/',
  sections: [homeSeo, homeHero, homePrices, homeProductLines, homeServices, homeBlog, homeFactory],
};
