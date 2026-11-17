import { defineSection, type ContentPage } from '../types';
import { seoSection } from '../seo-section';

export const servicesSeo = seoSection('services.seo', {
  fa: {
    metaTitle: 'خدمات | مشاوره فنی و Mill Certificate',
    metaDescription:
      'خدمات قدیر لوله آنلاین، نماینده انحصاری قدیر لوله پاسارگاد: مشاوره فنی رایگان، گواهینامه‌های کارخانه (ISIRI 9116-3، ISO 9001)، گارانتی کیفیت و ارسال سراسری.',
  },
  en: {
    metaTitle: 'Services | Technical advice and Mill Certificates',
    metaDescription:
      'Services of Ghadir Louleh Online, exclusive agent of Ghadir Louleh Pasargad: free technical advice, factory certificates (ISIRI 9116-3, ISO 9001), quality guarantee and nationwide delivery.',
  },
});

export const servicesHero = defineSection({
  key: 'services.hero',
  title: 'بالای صفحه',
  fields: {
    label: { type: 'text', label: 'برچسب کوچک بالای عنوان' },
    title: { type: 'text', label: 'عنوان' },
    description: { type: 'text', label: 'توضیح', multiline: true },
  },
  defaults: {
    fa: {
      label: 'خدمات ما',
      title: 'خدمات جامع آب و فاضلاب',
      description: 'از مشاوره تخصصی تا تحویل درب کارگاه — همه مراحل را با تیم ما طی کنید',
    },
    en: {
      label: 'Our services',
      title: 'Complete water and sewer pipe services',
      description: 'From expert advice to delivery at your site — our team is with you at every step',
    },
  },
});

export const servicesList = defineSection({
  key: 'services.list',
  title: 'کارت‌های خدمات',
  fields: {
    items: {
      type: 'list',
      label: 'خدمات',
      itemLabel: 'خدمت',
      max: 8,
      fields: {
        title: { type: 'text', label: 'عنوان' },
        desc: { type: 'text', label: 'توضیح', multiline: true },
        features: { type: 'text', label: 'ویژگی‌ها', hint: 'هر ویژگی در یک خط', multiline: true },
      },
    },
  },
  defaults: {
    fa: {
      items: [
        {
          id: 'consulting',
          title: 'مشاوره تخصصی رایگان',
          desc: 'کارشناسان ما با پشتیبانی فنی کارخانه، در انتخاب سایز، کلاس SN و اتصالات مناسب پروژه شما مشاوره رایگان می‌دهند.',
          features: 'مشاوره تلفنی رایگان\nبررسی مدارک فنی\nپیشنهاد بهینه محصول\nمحاسبه نیاز پروژه',
        },
        {
          id: 'cutting',
          title: 'خدمات برش و تبدیل',
          desc: 'برش لوله در ابعاد و اندازه‌های دلخواه با تجهیزات پیشرفته CNC. دقت بالا و کیفیت برش تضمین شده.',
          features: 'برش با دقت بالا\nتجهیزات CNC\nابعاد سفارشی\nصدور گواهینامه',
        },
        {
          id: 'documents',
          title: 'مستندات فنی',
          desc: 'ارائه آنالیز مواد، گواهینامه کیفیت Mill Certificate، تست‌های فنی و سایر مستندات مورد نیاز پروژه.',
          features: 'Mill Certificate\nآنالیز شیمیایی\nگواهی کیفیت\nتست هیدرواستاتیک',
        },
        {
          id: 'warranty',
          title: 'گارانتی و پشتیبانی',
          desc: 'تضمین کیفیت تمامی محصولات و خدمات پس از فروش. در صورت عدم تطابق با مشخصات، تعویض یا استرداد وجه.',
          features: 'گارانتی کیفیت\nخدمات پس از فروش\nامکان مرجوعی\nپشتیبانی ۲۴ ساعته',
        },
      ],
    },
    en: {
      items: [
        {
          id: 'consulting',
          title: 'Free expert advice',
          desc: 'Backed by the factory’s technical team, our specialists give free advice on choosing the right size, SN class and fittings for your project.',
          features: 'Free phone consultation\nReview of technical documents\nOptimal product recommendation\nProject quantity estimate',
        },
        {
          id: 'cutting',
          title: 'Cutting and adaptation',
          desc: 'Pipes cut to the dimensions you need using advanced CNC equipment, with guaranteed precision and cut quality.',
          features: 'High-precision cutting\nCNC equipment\nCustom dimensions\nCertificate issued',
        },
        {
          id: 'documents',
          title: 'Technical documentation',
          desc: 'Material analysis, Mill Certificate quality certificates, technical test results and any other documents your project requires.',
          features: 'Mill Certificate\nChemical analysis\nQuality certificate\nHydrostatic testing',
        },
        {
          id: 'warranty',
          title: 'Warranty and support',
          desc: 'Quality guarantee on every product, plus after-sales service. If a product does not match its specification, it is replaced or refunded.',
          features: 'Quality guarantee\nAfter-sales service\nReturns accepted\n24/7 support',
        },
      ],
    },
  },
});

export const servicesFactory = defineSection({
  key: 'services.factory',
  title: 'کارخانه تولیدکننده',
  description: 'نام کارخانه (عنوان) از «تنظیمات سایت ← نام کارخانه» می‌آید.',
  fields: {
    eyebrow: { type: 'text', label: 'برچسب کوچک' },
    body: { type: 'text', label: 'معرفی کارخانه', multiline: true },
    highlightTitle: { type: 'text', label: 'جمله پررنگ کادر نمایندگی' },
    highlightText: { type: 'text', label: 'ادامه متن کادر نمایندگی', multiline: true },
    buttonLabel: { type: 'text', label: 'متن دکمه' },
    buttonLink: { type: 'link', label: 'لینک دکمه' },
    facts: {
      type: 'list',
      label: 'واقعیت‌های کارخانه',
      itemLabel: 'مورد',
      max: 8,
      fields: {
        title: { type: 'text', label: 'عنوان' },
        desc: { type: 'text', label: 'توضیح' },
      },
    },
  },
  defaults: {
    fa: {
      eyebrow: 'کارخانه تولیدکننده',
      body: 'قدیر لوله پاسارگاد در شهرک صنعتی گرمسار (استان سمنان) لوله دوجداره پلی اتیلن (کاروگیت) و لوله اسپیرال برای شبکه فاضلاب، زهکشی و آب‌های سطحی تولید می‌کند. محصولات این کارخانه با پروانه استاندارد ملی ISIRI 9116-3 و گواهینامه سیستم مدیریت کیفیت ISO 9001:2015 عرضه می‌شوند و آزمایشگاه کنترل کیفیت کارخانه آزمون‌های ابعاد، سختی حلقوی، دوده، MFI و آب‌بندی لوله را انجام می‌دهد.',
      highlightTitle: 'قدیر لوله آنلاین، تنها نماینده انحصاری قدیر لوله پاسارگاد است.',
      highlightText: 'خرید از ما یعنی کالای اصل کارخانه با همین گواهینامه‌ها، قیمت روز کارخانه و ارسال مستقیم از انبار گرمسار.',
      buttonLabel: 'مشاهده گواهینامه‌ها و مجوزها',
      buttonLink: '/certificates',
      facts: [
        { id: 'corrugated', title: 'تولید لوله کاروگیت دوجداره', desc: 'قطر ۱۱۰ تا ۱۰۰۰ میلیمتر، کلاس سبک SN4 و سنگین SN8' },
        { id: 'spiral', title: 'تولید لوله اسپیرال کاروگیت', desc: 'قطر ۸۰۰ تا ۲۰۰۰ میلیمتر برای خطوط اصلی فاضلاب و آب‌های سطحی' },
        { id: 'isiri', title: 'استاندارد ملی ISIRI 9116-3', desc: 'پروانه کاربرد علامت استاندارد اجباری از سازمان ملی استاندارد ایران' },
        { id: 'iso', title: 'ISO 9001:2015', desc: 'سیستم مدیریت کیفیت با آزمایشگاه کنترل کیفیت در کارخانه' },
      ],
    },
    en: {
      eyebrow: 'The manufacturer',
      body: 'Ghadir Louleh Pasargad manufactures double-wall polyethylene (corrugated) pipes and spiral pipes for sewer, drainage and stormwater networks in Garmsar Industrial Park (Semnan Province). Its products carry the ISIRI 9116-3 national standard licence and ISO 9001:2015 quality management certification, and the factory’s quality-control laboratory tests every pipe for dimensions, ring stiffness, carbon black content, MFI and watertightness.',
      highlightTitle: 'Ghadir Louleh Online is the sole exclusive sales agent of Ghadir Louleh Pasargad.',
      highlightText: 'Buying from us means genuine factory products with these same certificates, the factory’s daily price and direct shipping from the Garmsar warehouse.',
      buttonLabel: 'View certificates and licences',
      facts: [
        { id: 'corrugated', title: 'Double-wall corrugated pipe production', desc: '110 to 1000 mm diameter, light SN4 and heavy SN8 classes' },
        { id: 'spiral', title: 'Spiral pipe production', desc: '800 to 2000 mm diameter for main sewer and stormwater lines' },
        { id: 'isiri', title: 'ISIRI 9116-3 national standard', desc: 'Mandatory standard mark licence from the Iranian National Standards Organization' },
        { id: 'iso', title: 'ISO 9001:2015', desc: 'Quality management system with an in-house quality-control laboratory' },
      ],
    },
  },
});

export const servicesCta = defineSection({
  key: 'services.cta',
  title: 'دعوت به مشاوره (پایین صفحه)',
  description: 'دکمه فرم درخواست مشاوره را باز می‌کند.',
  fields: {
    title: { type: 'text', label: 'عنوان' },
    text: { type: 'text', label: 'توضیح' },
    buttonLabel: { type: 'text', label: 'متن دکمه' },
  },
  defaults: {
    fa: {
      title: 'برای مشاوره رایگان تماس بگیرید',
      text: 'تیم کارشناسان ما شنبه تا پنجشنبه آماده پاسخگویی هستند',
      buttonLabel: 'درخواست مشاوره رایگان',
    },
    en: {
      title: 'Call us for free advice',
      text: 'Our specialists are available Saturday to Thursday',
      buttonLabel: 'Request free advice',
    },
  },
});

export const servicesPage: ContentPage = {
  key: 'services',
  title: 'خدمات',
  path: '/services',
  sections: [servicesSeo, servicesHero, servicesList, servicesFactory, servicesCta],
};
