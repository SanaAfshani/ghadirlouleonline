import { defineSection, type ContentPage } from '../types';
import { seoSection } from '../seo-section';
import { FACTORY_PHOTO_GROUPS, FACTORY_VIDEOS } from '@/shared/config/factory-media';

/** شناسه ثابت آیتم عکس/فیلم از نام فایل (factory-aerial، line-11) — ترجمه انگلیسی با همین به آیتم می‌چسبد */
const fileId = (src: string) => src.slice(src.lastIndexOf('/') + 1).replace(/\.\w+$/, '');

export const factorySeo = seoSection('factory.seo', {
  fa: {
    metaTitle: 'کارخانه لوله کاروگیت و اسپیرال در گرمسار',
    metaDescription:
      'کارخانه قدیر لوله پاسارگاد در شهرک صنعتی گرمسار از ۱۳۹۱: خط تولید لوله کاروگیت دوجداره ۱۱۰ تا ۱۲۰۰ و لوله اسپیرال ۹۰۰ تا ۲۰۰۰ میلی‌متر، کنترل کیفیت طبق ISIRI 9116-3، فیلم و عکس واقعی تولید، انبار و بارگیری.',
  },
  en: {
    metaTitle: 'Corrugated and spiral pipe factory in Garmsar',
    metaDescription:
      'The Ghadir Louleh Pasargad factory in Garmsar Industrial Park since 2012: double-wall corrugated pipes 110–1200 mm and spiral pipes 900–2000 mm, quality control to ISIRI 9116-3, real production videos and photos, warehouse and loading.',
  },
});

export const factoryHero = defineSection({
  key: 'factory.hero',
  title: 'بالای صفحه',
  description: 'آدرس روی عکس از «تنظیمات سایت ← آدرس کارخانه» می‌آید.',
  fields: {
    eyebrow: { type: 'text', label: 'برچسب کوچک بالای عنوان (نام صفحه در مسیر راهنما)' },
    title: { type: 'text', label: 'عنوان' },
    text: { type: 'text', label: 'توضیح', multiline: true },
    inquiryLabel: { type: 'text', label: 'متن دکمه اصلی' },
    inquiryLink: { type: 'link', label: 'لینک دکمه اصلی' },
    videosLabel: { type: 'text', label: 'متن دکمه فیلم‌ها' },
    image: { type: 'image', label: 'عکس', hint: 'عکس اشتراک‌گذاری صفحه (شبکه‌های اجتماعی) هم همین است.' },
    imageAlt: { type: 'text', label: 'متن جایگزین عکس' },
  },
  defaults: {
    fa: {
      eyebrow: 'کارخانه و توانمندی تأمین',
      title: 'کارخانه تولید لوله کاروگیت و اسپیرال قدیر لوله پاسارگاد در گرمسار',
      text: 'از ۱۳۹۱ لوله دوجداره پلی اتیلن در شهرک صنعتی گرمسار تولید می‌شود؛ امروز لوله کاروگیت تا ۱۲۰۰ و لوله اسپیرال تا ۲۰۰۰ میلی‌متر، با پروانه ISIRI 9116-3 و گواهینامه ISO 9001:2015. قدیر لوله آنلاین تنها نماینده انحصاری قدیر لوله پاسارگاد است.',
      inquiryLabel: 'استعلام پروژه‌ای',
      inquiryLink: '/project-inquiry',
      videosLabel: 'فیلم خط تولید',
      image: FACTORY_PHOTO_GROUPS[0].photos[0].src,
      imageAlt: FACTORY_PHOTO_GROUPS[0].photos[0].alt,
    },
    en: {
      eyebrow: 'Factory and supply capacity',
      title: 'Ghadir Louleh Pasargad corrugated and spiral pipe factory in Garmsar',
      text: 'Double-wall polyethylene pipes have been made in Garmsar Industrial Park since 2012; today the factory produces corrugated pipes up to 1200 mm and spiral pipes up to 2000 mm, under the ISIRI 9116-3 licence and ISO 9001:2015 certification. Qadir Lule Online is the exclusive sales agent of Ghadir Louleh Pasargad.',
      inquiryLabel: 'Project inquiry',
      videosLabel: 'Production line videos',
      imageAlt: 'Aerial view of the Ghadir Louleh Pasargad factory in Garmsar Industrial Park',
    },
  },
});

export const factoryStats = defineSection({
  key: 'factory.stats',
  title: 'آمار زیر عکس',
  description: 'فقط عدد و واقعیت قابل بررسی بنویسید.',
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
        { id: 'founded', value: '۱۳۹۱', label: 'آغاز تولید در گرمسار' },
        { id: 'corrugated', value: '۱۲', label: 'سایز کاروگیت؛ ۱۱۰ تا ۱۲۰۰' },
        { id: 'spiral', value: '۵', label: 'سایز اسپیرال؛ ۹۰۰ تا ۲۰۰۰' },
        { id: 'iso', value: 'ISO 9001', label: 'و پروانه ISIRI 9116-3' },
      ],
    },
    en: {
      items: [
        { id: 'founded', value: '2012', label: 'Production began in Garmsar' },
        { id: 'corrugated', value: '12', label: 'Corrugated sizes, 110 to 1200 mm' },
        { id: 'spiral', value: '5', label: 'Spiral sizes, 900 to 2000 mm' },
        { id: 'iso', value: 'ISO 9001', label: 'plus the ISIRI 9116-3 licence' },
      ],
    },
  },
});

export const factoryNav = defineSection({
  key: 'factory.nav',
  title: 'نوار پرش بین بخش‌ها',
  fields: {
    about: { type: 'text', label: 'معرفی' },
    process: { type: 'text', label: 'فرایند تولید' },
    quality: { type: 'text', label: 'کنترل کیفیت' },
    videos: { type: 'text', label: 'فیلم‌ها' },
    gallery: { type: 'text', label: 'عکس‌ها' },
    supply: { type: 'text', label: 'تأمین و ارسال' },
    faq: { type: 'text', label: 'سوالات متداول' },
  },
  defaults: {
    fa: {
      about: 'معرفی کارخانه',
      process: 'فرایند تولید',
      quality: 'کنترل کیفیت',
      videos: 'فیلم خط تولید',
      gallery: 'عکس‌ها',
      supply: 'تأمین و ارسال',
      faq: 'سوالات متداول',
    },
    en: {
      about: 'About the factory',
      process: 'Production process',
      quality: 'Quality control',
      videos: 'Production videos',
      gallery: 'Photos',
      supply: 'Supply and delivery',
      faq: 'FAQ',
    },
  },
});

export const factoryAbout = defineSection({
  key: 'factory.about',
  title: 'معرفی کارخانه',
  fields: {
    eyebrow: { type: 'text', label: 'برچسب کوچک' },
    title: { type: 'text', label: 'عنوان' },
    body: { type: 'html', label: 'متن', hint: 'لینک داخلی را با آدرس بدون دامنه بنویسید (مثلاً /official-representative)؛ در نسخه انگلیسی خودکار /en می‌گیرد.' },
    facts: {
      type: 'list',
      label: 'کارت‌های کنار متن',
      itemLabel: 'کارت',
      max: 8,
      fields: {
        title: { type: 'text', label: 'عنوان' },
        text: { type: 'text', label: 'متن' },
      },
    },
  },
  defaults: {
    fa: {
      eyebrow: 'معرفی',
      title: 'قدیر لوله پاسارگاد؛ از یک خط ۲۰۰ تا ۴۰۰ تا لوله ۲۰۰۰ میلی‌متری',
      body: `<p>شرکت تولیدی و بازرگانی قدیر لوله پاسارگاد در سال ۱۳۹۱ با یک خط تولید لوله کاروگیت ۲۰۰ تا ۴۰۰ میلی‌متر در شهرک صنعتی گرمسار (استان سمنان) شروع به کار کرد. با اضافه شدن خطوط قطر بزرگ و خط لوله اسپیرال، امروز طیف کامل لوله فاضلاب و آب‌های سطحی پروژه‌های عمرانی — از انشعاب ۱۱۰ تا کلکتور اصلی ۲۰۰۰ میلی‌متری — در همین کارخانه تولید می‌شود.</p>
<p>محصولات کارخانه در شبکه جمع‌آوری فاضلاب شهری و روستایی، زهکشی اراضی کشاورزی، دفع آب‌های سطحی و غلاف کابل برق و مخابرات به کار می‌روند. لوله کاروگیت در دو کلاس سختی حلقوی SN4 و SN8 عرضه می‌شود تا برای عمق دفن و بار ترافیکی هر پروژه، لوله اقتصادی و مطمئن انتخاب شود.</p>
<p>قدیر لوله آنلاین تنها نماینده انحصاری قدیر لوله پاسارگاد است و قیمت روز، پیش‌فاکتور، هماهنگی بارگیری از انبار کارخانه و ارسال به پروژه را انجام می‌دهد. <a href="/official-representative">پیام رسمی کارخانه درباره نمایندگی</a></p>`,
      facts: [
        { id: 'location', title: 'محل تولید', text: 'سمنان، گرمسار، شهرک صنعتی گرمسار؛ تولید، انبار و بارگیری در یک محوطه' },
        { id: 'products', title: 'محصولات', text: 'لوله کاروگیت دوجداره، لوله اسپیرال قطر بزرگ و اتصالات کاروگیت هم‌سایز' },
        { id: 'standard', title: 'استاندارد', text: 'پروانه ISIRI 9116-3 و گواهینامه ISO 9001:2015' },
        { id: 'delivery', title: 'ارسال', text: 'بارگیری مستقیم از انبار کارخانه به سراسر ایران' },
      ],
    },
    en: {
      eyebrow: 'About',
      title: 'Ghadir Louleh Pasargad: from one 200–400 mm line to 2000 mm pipes',
      body: `<p>Ghadir Louleh Pasargad Manufacturing and Trading Company started in 2012 with a single 200–400 mm corrugated pipe line in Garmsar Industrial Park (Semnan Province). With the addition of large-diameter lines and a spiral pipe line, the full range of sewer and stormwater pipes for civil projects — from 110 mm service connections to 2000 mm trunk collectors — is now made at this factory.</p>
<p>The factory’s products are used in urban and rural sewage collection networks, agricultural land drainage, stormwater disposal and as ducting for power and telecom cables. Corrugated pipes come in two ring-stiffness classes, SN4 and SN8, so that an economical and reliable pipe can be chosen for each project’s burial depth and traffic load.</p>
<p>Qadir Lule Online is the exclusive sales agent of Ghadir Louleh Pasargad and handles daily prices, pro forma invoices, loading from the factory warehouse and delivery to your site. <a href="/official-representative">Read the factory’s official statement on the agency</a></p>`,
      facts: [
        { id: 'location', title: 'Production site', text: 'Garmsar Industrial Park, Garmsar, Semnan; production, storage and loading on one site' },
        { id: 'products', title: 'Products', text: 'Double-wall corrugated pipes, large-diameter spiral pipes and matching corrugated pipe fittings' },
        { id: 'standard', title: 'Standards', text: 'ISIRI 9116-3 licence and ISO 9001:2015 certification' },
        { id: 'delivery', title: 'Delivery', text: 'Loaded directly from the factory warehouse and shipped anywhere in Iran' },
      ],
    },
  },
});

export const factoryProcess = defineSection({
  key: 'factory.process',
  title: 'فرایند تولید',
  fields: {
    eyebrow: { type: 'text', label: 'برچسب کوچک' },
    title: { type: 'text', label: 'عنوان' },
    text: { type: 'text', label: 'توضیح', multiline: true },
    steps: {
      type: 'list',
      label: 'مراحل',
      itemLabel: 'مرحله',
      max: 12,
      fields: {
        title: { type: 'text', label: 'عنوان' },
        text: { type: 'text', label: 'متن', multiline: true },
      },
    },
  },
  defaults: {
    fa: {
      eyebrow: 'فرایند تولید',
      title: 'لوله کاروگیت دوجداره چطور تولید می‌شود؟',
      text: 'مراحل تولید در خط کارخانه گرمسار، از گرانول تا لوله آماده بارگیری — همه این مراحل را در فیلم‌های پایین همین صفحه می‌بینید.',
      steps: [
        { id: 'material', title: 'مواد اولیه پلی اتیلن', text: 'گرانول پلی اتیلن سنگین (HDPE) خشک و با مستربچ رنگ مخلوط می‌شود؛ جداره بیرونی مشکی برای مقاومت در برابر UV و جداره داخلی روشن برای بازرسی تصویری شبکه.' },
        { id: 'extrusion', title: 'اکستروژن دو لایه', text: 'دو اکسترودر هم‌زمان مذاب دو جداره را به یک قالب مشترک می‌رسانند تا لایه داخلی صاف و لایه بیرونی موج‌دار در یک مرحله شکل بگیرند.' },
        { id: 'corrugation', title: 'شکل‌دهی موج در کاروگیتور', text: 'زنجیره قالب‌های موج‌دار کاروگیتور با مکش خلأ، جداره بیرونی را به شکل موج درمی‌آورد و به جداره داخلی جوش می‌دهد؛ همین پروفیل است که سختی حلقوی لوله را می‌سازد.' },
        { id: 'cutting', title: 'خنک‌کاری، برش و سرسازی', text: 'لوله پس از خنک‌کاری روی میز خط به طول سفارش برش می‌خورد و سر آن برای اتصال کوپلری با واشر آب‌بند EPDM آماده می‌شود.' },
        { id: 'spiral', title: 'لوله اسپیرال قطر بزرگ', text: 'برای قطرهای ۹۰۰ تا ۲۰۰۰، پروفیل پلی اتیلن به‌صورت مارپیچ پیچیده و جوش داده می‌شود؛ اتصال این لوله‌ها با جوش اکستروژنی است، نه کوپلر.' },
      ],
    },
    en: {
      eyebrow: 'Production process',
      title: 'How is double-wall corrugated pipe made?',
      text: 'The production steps on the Garmsar factory line, from granules to pipe ready for loading — you can watch every step in the videos further down this page.',
      steps: [
        { id: 'material', title: 'Polyethylene raw material', text: 'High-density polyethylene (HDPE) granules are dried and mixed with colour masterbatch: a black outer wall for UV resistance and a light inner wall for CCTV inspection of the network.' },
        { id: 'extrusion', title: 'Two-layer extrusion', text: 'Two extruders feed the melt for both walls into a common die at the same time, so the smooth inner layer and the corrugated outer layer are formed in a single step.' },
        { id: 'corrugation', title: 'Corrugation in the corrugator', text: 'Using vacuum, the corrugator’s chain of corrugated moulds shapes the outer wall into corrugations and fuses it to the inner wall; this profile is what gives the pipe its ring stiffness.' },
        { id: 'cutting', title: 'Cooling, cutting and end forming', text: 'After cooling on the line table, the pipe is cut to the ordered length and its end is prepared for a coupler joint with an EPDM sealing gasket.' },
        { id: 'spiral', title: 'Large-diameter spiral pipe', text: 'For diameters from 900 to 2000 mm, a polyethylene profile is wound helically and welded; these pipes are jointed by extrusion welding, not with couplers.' },
      ],
    },
  },
});

export const factoryQuality = defineSection({
  key: 'factory.quality',
  title: 'کنترل کیفیت',
  fields: {
    eyebrow: { type: 'text', label: 'برچسب کوچک' },
    title: { type: 'text', label: 'عنوان' },
    text: { type: 'text', label: 'متن', multiline: true },
    note: { type: 'text', label: 'نکته زیر متن', multiline: true },
    buttonLabel: { type: 'text', label: 'متن دکمه' },
    buttonLink: { type: 'link', label: 'لینک دکمه' },
    tests: {
      type: 'list',
      label: 'آزمون‌ها',
      itemLabel: 'آزمون',
      max: 12,
      fields: {
        title: { type: 'text', label: 'عنوان' },
        text: { type: 'text', label: 'متن', multiline: true },
      },
    },
  },
  defaults: {
    fa: {
      eyebrow: 'کنترل کیفیت',
      title: 'آزمایشگاه کنترل کیفیت و استاندارد ISIRI 9116-3',
      text: 'لوله‌های دیواره ساختمند پلی اتیلن مشمول استاندارد اجباری ملی ISIRI 9116-3 هستند. نمونه‌های تولید در آزمایشگاه کارخانه آزمون می‌شوند و کارخانه علاوه بر پروانه کاربرد علامت استاندارد، گواهینامه سیستم مدیریت کیفیت ISO 9001:2015 دارد.',
      note: 'نکته کلاس SN: عدد ۱۶ و ۳۱٫۵ کیلونیوتن بر مترمربع که در بعضی اسناد آمده، همان SN4 و SN8 است که با روش DIN 16961-2 اندازه‌گیری شده؛ روش ISO 9969 همین کلاس‌ها را ۴ و ۸ گزارش می‌کند.',
      buttonLabel: 'مدارک و تأییدیه‌های فنی',
      buttonLink: '/certificates',
      tests: [
        { id: 'ring-stiffness', title: 'سختی حلقوی (SN)', text: 'تعیین کلاس SN4 یا SN8 طبق ISO 9969 — مهم‌ترین عدد برای انتخاب لوله بر اساس عمق دفن و بار ترافیکی.' },
        { id: 'flexibility', title: 'انعطاف‌پذیری حلقوی', text: 'لوله تا ۳۰٪ قطر فشرده می‌شود و نباید ترک، جداشدگی لایه‌ها یا تغییر شکل دائمی نشان دهد.' },
        { id: 'impact', title: 'مقاومت ضربه', text: 'آزمون ضربه وزنه سقوطی برای اطمینان از سلامت لوله در حمل، تخلیه و کارگذاری.' },
        { id: 'dimensions', title: 'ابعاد و ضخامت جداره', text: 'کنترل قطر داخلی و خارجی، ضخامت لایه داخلی و ارتفاع پروفیل در برابر جدول ابعاد کارخانه.' },
      ],
    },
    en: {
      eyebrow: 'Quality control',
      title: 'Quality-control laboratory and the ISIRI 9116-3 standard',
      text: 'Structured-wall polyethylene pipes fall under the mandatory Iranian national standard ISIRI 9116-3. Production samples are tested in the factory laboratory, and in addition to its licence to use the standard mark, the factory holds ISO 9001:2015 quality management certification.',
      note: 'A note on SN classes: the 16 and 31.5 kN/m² figures found in some documents are the same SN4 and SN8 classes measured by the DIN 16961-2 method; the ISO 9969 method reports these classes as 4 and 8.',
      buttonLabel: 'Certificates and technical approvals',
      tests: [
        { id: 'ring-stiffness', title: 'Ring stiffness (SN)', text: 'Determines the SN4 or SN8 class per ISO 9969 — the key figure for choosing a pipe for its burial depth and traffic load.' },
        { id: 'flexibility', title: 'Ring flexibility', text: 'The pipe is compressed by up to 30% of its diameter and must show no cracking, layer separation or permanent deformation.' },
        { id: 'impact', title: 'Impact resistance', text: 'Falling-weight impact test to make sure the pipe survives transport, unloading and installation intact.' },
        { id: 'dimensions', title: 'Dimensions and wall thickness', text: 'Checks of inner and outer diameter, inner-layer thickness and profile height against the factory’s dimension table.' },
      ],
    },
  },
});

/** عنوان انگلیسی فیلم‌ها به ترتیب شناسه فایل */
const VIDEO_TITLES_EN: Record<string, string> = {
  'line-11': 'Large-diameter corrugated pipe on the production line',
  'line-05': 'Corrugations forming in the corrugator',
  'line-07': 'View of the corrugated pipe production line',
  'line-02': 'Corrugator moulds',
  'line-06': 'Chain of corrugated moulds',
  'line-08': 'Pipe leaving the corrugator',
  'line-03': 'Large-diameter pipe leaving the extruder',
  'line-04': 'Large-diameter pipe on the line table',
  'line-09': 'Small-size production line',
  'line-10': 'Transfer table and pipe cutting',
  'line-01': 'Preparing the pipe end for jointing',
};

export const factoryVideos = defineSection({
  key: 'factory.videos',
  title: 'فیلم‌های خط تولید',
  description: 'فایل فیلم (mp4) و پوستر آن در public/videos/factory هستند؛ برای فیلم تازه، آدرس فایل را در «آدرس فیلم» بنویسید.',
  fields: {
    eyebrow: { type: 'text', label: 'برچسب کوچک' },
    title: { type: 'text', label: 'عنوان' },
    text: { type: 'text', label: 'توضیح', multiline: true },
    items: {
      type: 'list',
      label: 'فیلم‌ها',
      itemLabel: 'فیلم',
      max: 40,
      fields: {
        title: { type: 'text', label: 'عنوان فیلم' },
        duration: { type: 'text', label: 'مدت (ثانیه)', hint: 'فقط عدد، مثلاً 39' },
        poster: { type: 'image', label: 'پوستر (عکس قبل از پخش)' },
        video: { type: 'link', label: 'آدرس فیلم', hint: 'مثلاً /videos/factory/line-11.mp4 یا آدرس https' },
      },
    },
  },
  defaults: {
    fa: {
      eyebrow: 'فیلم',
      title: 'فیلم‌های خط تولید لوله کاروگیت',
      text: 'از قالب‌های کاروگیتور و شکل‌گیری موج تا خروج لوله قطر بزرگ از خط و سرسازی برای اتصال؛ همه فیلم‌ها در کارخانه گرمسار گرفته شده‌اند.',
      items: FACTORY_VIDEOS.map((v) => ({ id: fileId(v.src), title: v.title, duration: String(v.duration), poster: v.poster, video: v.src })),
    },
    en: {
      eyebrow: 'Videos',
      title: 'Corrugated pipe production line videos',
      text: 'From the corrugator moulds and corrugation forming to large-diameter pipe leaving the line and end forming for jointing; all videos were filmed at the Garmsar factory.',
      items: FACTORY_VIDEOS.map((v) => ({ id: fileId(v.src), title: VIDEO_TITLES_EN[fileId(v.src)] ?? v.title, duration: String(v.duration) })),
    },
  },
});

/** متن انگلیسی گروه‌ها و متن جایگزین عکس‌ها، با شناسه گروه و نام فایل */
const GALLERY_EN: Record<string, { title: string; description: string; alts: Record<string, string> }> = {
  plant: {
    title: 'Factory and quality control',
    description: 'The Garmsar factory, production line and quality-control laboratory — from the official Ghadir Louleh Pasargad website.',
    alts: {
      'factory-aerial': 'Aerial view of the Ghadir Louleh Pasargad factory in Garmsar Industrial Park',
      'production-line': 'Double-wall pipe production line at the Ghadir Louleh Pasargad factory',
      'qc-lab': 'Pipe quality-control laboratory at the factory',
      'mou-signing': 'Ghadir Louleh Pasargad signing a cooperation agreement with a company from Tajikistan, January 2024',
    },
  },
  warehouse: {
    title: 'Product warehouse',
    description: 'Corrugated pipe stock in the Garmsar factory yard; orders are loaded directly from this warehouse.',
    alts: {
      'yard-rows': 'Rows of double-wall corrugated pipes with a yellow inner wall in the factory yard',
      'yard-factory': 'Corrugated pipes stacked in front of the Ghadir Louleh Pasargad factory hall',
      'yard-stack': 'Large-diameter corrugated pipes stockpiled in the factory’s open-air warehouse',
      'pipe-large': 'Cross-section of a large-diameter corrugated pipe with its smooth yellow inner wall',
    },
  },
  loading: {
    title: 'Loading and shipping',
    description: 'Orders are loaded every day for projects across Iran, from pickups to trailers.',
    alts: {
      'loading-truck-large': 'Loading large-diameter corrugated pipes onto a truck for delivery to a project',
      'loading-pickup': 'Loading corrugated pipes onto a pickup in the factory yard',
      'loading-truck': 'Truck loaded with corrugated pipes, ready to leave the factory',
      'loading-trailer': 'Loading corrugated pipes of various sizes into a trailer',
      'loading-spiral-1': 'Transporting large-diameter spiral pipes by trailer',
      'loading-spiral-2': 'Large-diameter spiral pipe on a trailer, ready for shipping',
    },
  },
  installation: {
    title: 'Pipe installation on site',
    description: 'Factory corrugated pipes being laid in a sewer network trench — from the official Ghadir Louleh Pasargad website.',
    alts: {
      'install-trench-1': 'Laying corrugated pipe in an urban sewer network trench',
      'install-trench-2': 'Corrugated pipeline being installed alongside a roadway',
    },
  },
  fittings: {
    title: 'Corrugated pipe fittings',
    description: 'Elbows, tees and end caps made by the factory to match the corrugated pipe sizes.',
    alts: {
      'fittings-elbows': 'Corrugated pipe elbows and fittings next to pipes in the warehouse',
      'fittings-tees-caps': '45° tee and end cap for corrugated pipe',
      'fitting-tee-45': '45° corrugated tee with couplers on both ends',
      'fitting-elbow-45': '45° corrugated pipe elbow',
      'fittings-end-caps': 'Corrugated pipe end caps',
    },
  },
};

export const factoryGallery = defineSection({
  key: 'factory.gallery',
  title: 'عکس‌ها',
  description: 'هر گروه یک تب گالری است؛ عکس اول هر گروه بزرگ‌تر نمایش داده می‌شود.',
  fields: {
    eyebrow: { type: 'text', label: 'برچسب کوچک' },
    title: { type: 'text', label: 'عنوان' },
    text: { type: 'text', label: 'توضیح', multiline: true },
    groups: {
      type: 'list',
      label: 'گروه‌های عکس',
      itemLabel: 'گروه',
      max: 12,
      fields: {
        title: { type: 'text', label: 'عنوان گروه (تب)' },
        description: { type: 'text', label: 'توضیح گروه', multiline: true },
        photos: {
          type: 'list',
          label: 'عکس‌ها',
          itemLabel: 'عکس',
          max: 30,
          fields: {
            image: { type: 'image', label: 'عکس' },
            alt: { type: 'text', label: 'متن جایگزین (توضیح عکس برای گوگل)' },
          },
        },
      },
    },
  },
  defaults: {
    fa: {
      eyebrow: 'عکس',
      title: 'عکس‌های کارخانه، انبار و بارگیری',
      text: 'عکس‌های واقعی کارخانه، انبار روباز، بارگیری سفارش‌ها، اجرای لوله در پروژه و اتصالات کاروگیت.',
      groups: FACTORY_PHOTO_GROUPS.map((g) => ({
        id: g.id,
        title: g.title,
        description: g.description,
        photos: g.photos.map((p) => ({ id: fileId(p.src), image: p.src, alt: p.alt })),
      })),
    },
    en: {
      eyebrow: 'Photos',
      title: 'Photos of the factory, warehouse and loading',
      text: 'Real photos of the factory, the open-air warehouse, order loading, pipe installation on site and corrugated pipe fittings.',
      groups: FACTORY_PHOTO_GROUPS.map((g) => ({
        id: g.id,
        title: GALLERY_EN[g.id]?.title ?? g.title,
        description: GALLERY_EN[g.id]?.description ?? g.description,
        photos: g.photos.map((p) => ({ id: fileId(p.src), alt: GALLERY_EN[g.id]?.alts[fileId(p.src)] ?? p.alt })),
      })),
    },
  },
});

export const factorySupply = defineSection({
  key: 'factory.supply',
  title: 'تأمین و ارسال',
  fields: {
    eyebrow: { type: 'text', label: 'برچسب کوچک' },
    title: { type: 'text', label: 'عنوان' },
    text: { type: 'text', label: 'متن', multiline: true, hint: 'برای پاراگراف تازه یک خط خالی بگذارید.' },
    steps: {
      type: 'list',
      label: 'مراحل سفارش',
      itemLabel: 'مرحله',
      max: 8,
      fields: {
        title: { type: 'text', label: 'عنوان' },
        text: { type: 'text', label: 'متن' },
      },
    },
  },
  defaults: {
    fa: {
      eyebrow: 'تأمین و ارسال',
      title: 'از انبار کارخانه تا محل پروژه',
      text: `موجودی لوله کاروگیت در محوطه روباز کارخانه دپو می‌شود و سفارش‌ها مستقیم از همین انبار بارگیری می‌شوند؛ بدون واسطه و انبار میانی، که هم زمان تحویل را کوتاه می‌کند و هم قیمت را به قیمت کارخانه نزدیک نگه می‌دارد.

وسیله حمل بر اساس سایز و متراژ انتخاب می‌شود: سایزهای کوچک با وانت، سفارش‌های متوسط با کامیون و لوله‌های قطر بزرگ و اسپیرال با تریلی. هماهنگی حمل تا شهر و محل پروژه در سراسر کشور با واحد فروش است.`,
      steps: [
        { id: 'inquiry', title: 'ثبت استعلام', text: 'سایز، کلاس SN، متراژ، شهر پروژه و زمان تحویل' },
        { id: 'quote', title: 'پیش‌فاکتور با قیمت روز', text: 'قیمت روز کارخانه و شرایط پرداخت' },
        { id: 'loading', title: 'بارگیری از انبار گرمسار', text: 'آماده‌سازی و بارگیری سفارش در کارخانه' },
        { id: 'delivery', title: 'تحویل در محل پروژه', text: 'حمل با وانت، کامیون یا تریلی بسته به سفارش' },
      ],
    },
    en: {
      eyebrow: 'Supply and delivery',
      title: 'From the factory warehouse to your site',
      text: `Corrugated pipe stock is kept in the factory’s open-air yard and orders are loaded directly from this warehouse, with no middlemen or intermediate storage — which shortens delivery times and keeps prices close to the factory price.

The vehicle is chosen by size and length: small sizes go by pickup, medium orders by truck, and large-diameter and spiral pipes by trailer. The sales team coordinates transport to your city and site anywhere in Iran.`,
      steps: [
        { id: 'inquiry', title: 'Send an inquiry', text: 'Size, SN class, length, project city and delivery date' },
        { id: 'quote', title: 'Quote at today’s price', text: 'Today’s factory price and payment terms' },
        { id: 'loading', title: 'Loading at the Garmsar warehouse', text: 'The order is prepared and loaded at the factory' },
        { id: 'delivery', title: 'Delivery to your site', text: 'By pickup, truck or trailer depending on the order' },
      ],
    },
  },
});

export const factoryFaq = defineSection({
  key: 'factory.faq',
  title: 'سوالات متداول',
  description: 'در نتیجه گوگل هم (FAQ) نمایش داده می‌شود.',
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
          id: 'location',
          question: 'کارخانه قدیر لوله پاسارگاد کجاست؟',
          answer: 'کارخانه و انبار در سمنان، گرمسار، شهرک صنعتی گرمسار است. خرید، استعلام قیمت و هماهنگی بارگیری از طریق قدیر لوله آنلاین، تنها نماینده انحصاری قدیر لوله پاسارگاد، انجام می‌شود.',
        },
        {
          id: 'sizes',
          question: 'کارخانه چه سایزهایی تولید می‌کند؟',
          answer: 'لوله کاروگیت دوجداره در سایزهای ۱۱۰، ۱۶۰، ۲۰۰، ۲۵۰، ۳۱۵، ۴۰۰، ۵۰۰، ۶۰۰، ۷۰۰، ۸۰۰، ۱۰۰۰، ۱۲۰۰ میلی‌متر با کلاس SN4 و SN8، لوله اسپیرال ۹۰۰، ۱۴۰۰، ۱۶۰۰، ۱۸۰۰، ۲۰۰۰ میلی‌متر و اتصالات کاروگیت (کوپلر، زانو، سه‌راهی، درپوش و…).',
        },
        {
          id: 'direct',
          question: 'آیا لوله مستقیم از کارخانه بارگیری می‌شود؟',
          answer: 'بله. سفارش‌ها از انبار کارخانه در گرمسار بارگیری و با وانت، کامیون یا تریلی (بسته به سایز و متراژ) به شهر و محل پروژه ارسال می‌شوند.',
        },
        {
          id: 'standards',
          question: 'لوله‌های کارخانه چه استاندارد و گواهینامه‌ای دارند؟',
          answer: 'پروانه کاربرد علامت استاندارد اجباری ISIRI 9116-3 برای لوله‌های دیواره ساختمند و گواهینامه سیستم مدیریت کیفیت ISO 9001:2015. تصویر مدارک در صفحه مدارک نمایندگی و تأییدیه‌های فنی آمده است.',
        },
        {
          id: 'order',
          question: 'برای سفارش پروژه‌ای چه اطلاعاتی لازم است؟',
          answer: 'سایز، کلاس SN، متراژ هر سایز، شهر پروژه و زمان تحویل. این موارد را در فرم استعلام پروژه‌ای ثبت کنید تا پیش‌فاکتور با قیمت روز کارخانه صادر شود.',
        },
      ],
    },
    en: {
      items: [
        {
          id: 'location',
          question: 'Where is the Ghadir Louleh Pasargad factory?',
          answer: 'The factory and warehouse are in Garmsar Industrial Park, Garmsar, Semnan Province. Purchasing, price requests and loading arrangements are handled through Qadir Lule Online, the exclusive sales agent of Ghadir Louleh Pasargad.',
        },
        {
          id: 'sizes',
          question: 'What sizes does the factory make?',
          answer: 'Double-wall corrugated pipes in 110, 160, 200, 250, 315, 400, 500, 600, 700, 800, 1000 and 1200 mm, in SN4 and SN8 classes; spiral pipes in 900, 1400, 1600, 1800 and 2000 mm; and corrugated pipe fittings (couplers, elbows, tees, end caps and more).',
        },
        {
          id: 'direct',
          question: 'Are pipes loaded directly at the factory?',
          answer: 'Yes. Orders are loaded at the factory warehouse in Garmsar and shipped by pickup, truck or trailer (depending on size and length) to your city and project site.',
        },
        {
          id: 'standards',
          question: 'Which standards and certificates do the factory’s pipes have?',
          answer: 'A licence to use the mandatory ISIRI 9116-3 standard mark for structured-wall pipes, and ISO 9001:2015 quality management certification. Images of the documents are on the agency documents and technical approvals page.',
        },
        {
          id: 'order',
          question: 'What information is needed for a project order?',
          answer: 'Size, SN class, length of each size, project city and delivery date. Enter these in the project inquiry form and we will issue a pro forma invoice at today’s factory price.',
        },
      ],
    },
  },
});

export const factoryCta = defineSection({
  key: 'factory.cta',
  title: 'دعوت به تماس (پایین صفحه)',
  description: 'عنوان کادر، نام سایت و «جایگاه نمایندگی» از تنظیمات سایت است.',
  fields: {
    text: { type: 'text', label: 'توضیح' },
    manufacturerLabel: { type: 'text', label: 'متن دکمه سایت کارخانه' },
    productsLabel: { type: 'text', label: 'متن دکمه محصولات' },
    productsLink: { type: 'link', label: 'لینک دکمه محصولات' },
    inquiryLabel: { type: 'text', label: 'متن دکمه اصلی' },
    inquiryLink: { type: 'link', label: 'لینک دکمه اصلی' },
  },
  defaults: {
    fa: {
      text: 'برای قیمت روز و سفارش پروژه‌ای، استعلام بفرستید یا محصولات را ببینید.',
      manufacturerLabel: 'سایت کارخانه',
      productsLabel: 'مشاهده محصولات',
      productsLink: '/products',
      inquiryLabel: 'استعلام پروژه‌ای',
      inquiryLink: '/project-inquiry',
    },
    en: {
      text: 'For today’s prices and project orders, send an inquiry or browse our products.',
      manufacturerLabel: 'Factory website',
      productsLabel: 'View products',
      inquiryLabel: 'Project inquiry',
    },
  },
});

export const factoryPage: ContentPage = {
  key: 'factory',
  title: 'کارخانه و توانمندی تأمین',
  path: '/factory',
  sections: [
    factorySeo,
    factoryHero,
    factoryStats,
    factoryNav,
    factoryAbout,
    factoryProcess,
    factoryQuality,
    factoryVideos,
    factoryGallery,
    factorySupply,
    factoryFaq,
    factoryCta,
  ],
};
