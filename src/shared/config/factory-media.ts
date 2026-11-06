/**
 * عکس‌ها و فیلم‌های واقعی کارخانه برای صفحه «کارخانه و توانمندی تأمین» (/factory).
 *
 * فایل‌ها در public/ هستند: عکس‌ها با واترمارک سایت و WebP (حداکثر ۱۶۰۰ پیکسل)، فیلم‌ها ۷۲۰p بی‌صدا
 * با واترمارک و faststart، و برای هر فیلم یک پوستر WebP هم‌نام. عکس و فیلم جدا نگه داشته می‌شوند
 * و عکس‌ها بر اساس موضوع گروه‌بندی شده‌اند.
 */

export type FactoryPhoto = { src: string; alt: string; width: number; height: number };
export type FactoryPhotoGroup = { id: string; title: string; description: string; photos: FactoryPhoto[] };
export type FactoryVideo = { src: string; poster: string; title: string; /** ثانیه */ duration: number };

const photo = (name: string, alt: string, width: number, height: number): FactoryPhoto => ({
  src: `/images/factory/${name}.webp`,
  alt,
  width,
  height,
});

export const FACTORY_PHOTO_GROUPS: FactoryPhotoGroup[] = [
  {
    id: 'plant',
    title: 'کارخانه و کنترل کیفیت',
    description: 'کارخانه گرمسار، خط تولید و آزمایشگاه کنترل کیفیت — از سایت رسمی قدیر لوله پاسارگاد.',
    photos: [
      photo('factory-aerial', 'نمای هوایی کارخانه قدیر لوله پاسارگاد در شهرک صنعتی گرمسار', 1080, 1091),
      photo('production-line', 'خط تولید لوله دوجداره در کارخانه قدیر لوله پاسارگاد', 1600, 722),
      photo('qc-lab', 'آزمایشگاه کنترل کیفیت لوله در کارخانه', 1280, 577),
      photo('mou-signing', 'امضای تفاهم‌نامه همکاری قدیر لوله پاسارگاد با شرکتی از تاجیکستان، دی ۱۴۰۲', 1080, 608),
    ],
  },
  {
    id: 'warehouse',
    title: 'انبار محصولات',
    description: 'موجودی لوله کاروگیت در محوطه کارخانه گرمسار؛ سفارش مستقیم از همین انبار بارگیری می‌شود.',
    photos: [
      photo('yard-rows', 'ردیف‌های لوله کاروگیت دوجداره با جداره داخلی زرد در محوطه انبار کارخانه', 1280, 960),
      photo('yard-factory', 'لوله‌های کاروگیت چیده‌شده جلوی سوله کارخانه قدیر لوله پاسارگاد', 960, 1280),
      photo('yard-stack', 'دپوی لوله کاروگیت سایز بزرگ در انبار روباز کارخانه', 720, 1280),
      photo('pipe-large', 'نمای مقطع لوله کاروگیت قطر بزرگ و جداره داخلی صاف زرد', 960, 1280),
    ],
  },
  {
    id: 'loading',
    title: 'بارگیری و ارسال',
    description: 'بارگیری روزانه سفارش‌ها برای پروژه‌های سراسر کشور؛ از وانت تا تریلی.',
    photos: [
      photo('loading-truck-large', 'بارگیری لوله کاروگیت قطر بزرگ روی کامیون برای ارسال به پروژه', 960, 1280),
      photo('loading-pickup', 'بارگیری لوله کاروگیت روی وانت در محوطه کارخانه', 960, 1280),
      photo('loading-truck', 'کامیون پر از لوله کاروگیت آماده حرکت از کارخانه', 720, 1280),
      photo('loading-trailer', 'بارگیری لوله کاروگیت سایزهای مختلف داخل تریلی', 721, 1280),
      photo('loading-spiral-1', 'حمل لوله اسپیرال قطر بزرگ با تریلی', 1080, 1040),
      photo('loading-spiral-2', 'لوله اسپیرال قطر بزرگ روی تریلی آماده ارسال', 1071, 1017),
    ],
  },
  {
    id: 'installation',
    title: 'اجرای لوله در پروژه',
    description: 'کارگذاری لوله کاروگیت کارخانه در ترانشه شبکه فاضلاب — از سایت رسمی قدیر لوله پاسارگاد.',
    photos: [
      photo('install-trench-1', 'کارگذاری لوله کاروگیت در ترانشه شبکه فاضلاب شهری', 450, 800),
      photo('install-trench-2', 'اجرای خط لوله کاروگیت در کنار معبر', 450, 800),
    ],
  },
  {
    id: 'fittings',
    title: 'اتصالات کاروگیت',
    description: 'زانو، سه‌راهی و درپوش تولید کارخانه، هم‌خوان با سایزهای لوله کاروگیت.',
    photos: [
      photo('fittings-elbows', 'انواع زانو و اتصالات لوله کاروگیت کنار لوله‌ها در انبار', 912, 1000),
      photo('fittings-tees-caps', 'سه راهی ۴۵ درجه و درپوش لوله کاروگیت', 796, 1000),
      photo('fitting-tee-45', 'سه راهی ۴۵ درجه کاروگیت دوسر کوپلر', 1000, 888),
      photo('fitting-elbow-45', 'زانو ۴۵ درجه لوله کاروگیت', 754, 1000),
      photo('fittings-end-caps', 'درپوش لوله کاروگیت', 1000, 400),
    ],
  },
];

const video = (n: number, title: string, duration: number): FactoryVideo => {
  const name = `line-${String(n).padStart(2, '0')}`;
  return { src: `/videos/factory/${name}.mp4`, poster: `/videos/factory/${name}.webp`, title, duration };
};

export const FACTORY_VIDEOS: FactoryVideo[] = [
  video(11, 'لوله کاروگیت قطر بزرگ روی خط تولید', 39),
  video(5, 'شکل‌گیری موج لوله در کاروگیتور', 26),
  video(7, 'نمای خط تولید لوله کاروگیت', 13),
  video(2, 'قالب‌های کاروگیتور', 13),
  video(6, 'زنجیره قالب‌های موج‌دار', 16),
  video(8, 'خروج لوله از کاروگیتور', 25),
  video(3, 'خروج لوله قطر بزرگ از اکسترودر', 21),
  video(4, 'لوله قطر بزرگ روی میز خط', 24),
  video(9, 'خط تولید سایزهای کوچک', 16),
  video(10, 'میز انتقال و برش لوله', 25),
  video(1, 'آماده‌سازی سر لوله برای اتصال', 30),
];
