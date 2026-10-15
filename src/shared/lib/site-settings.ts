import { siteConfig } from '@/shared/config/site';

export type SiteSettings = {
  siteName: string;
  siteDescription: string;
  phone: string;
  mobile: string;
  email: string;
  /** آدرس دفتر مرکزی */
  address: string;
  /** تلفن‌های ثابت شرکت */
  companyPhones: string[];
  factoryAddress: string;
  /** لینک کارخانه در گوگل مپ */
  mapUrl: string;
  heroTitle: string;
  heroSubtitle: string;
  /** متن سئوی پایین صفحه اصلی (HTML) — از پنل سئو قابل ویرایش */
  homeSeoContent: string;
  phoneHref: string;
  mobileHref: string;
  whatsappUrl: string;
};

export const defaultSiteSettings: SiteSettings = {
  siteName: siteConfig.name,
  siteDescription: siteConfig.description,
  phone: siteConfig.phone,
  mobile: siteConfig.mobile,
  email: siteConfig.email,
  address: siteConfig.address,
  companyPhones: siteConfig.companyPhones,
  factoryAddress: siteConfig.factoryAddress,
  mapUrl: siteConfig.mapUrl,
  heroTitle: 'تولید و فروش لوله کاروگیت با قیمت روز',
  heroSubtitle:
    `${siteConfig.legalName} تولیدکننده لوله دوجداره پلی اتیلن (کاروگیت) برای شبکه فاضلاب و آب‌های سطحی است؛ فروش مستقیم از کارخانه و ارسال به سراسر ایران.`,
  homeSeoContent: `<h2>فروشگاه آنلاین لوله و اتصالات ${siteConfig.name}</h2>
<p>${siteConfig.name} با بیش از ۲۰ سال تجربه در تامین لوله و اتصالات، انواع لوله پلی اتیلن، لوله پلیکا، لوله چدن داکتیل، منهول و دریچه و اتصالات آب و فاضلاب را برای پروژه‌های شهری، صنعتی و کشاورزی عرضه می‌کند. در این فروشگاه می‌توانید پیش از خرید، قیمت روز هر محصول را در جدول قیمت ببینید، مشخصات فنی را مقایسه کنید و با کارشناسان فروش مشورت کنید.</p>
<h3>خرید مستقیم از کارخانه ${siteConfig.legalName}</h3>
<p>${siteConfig.name} فروشگاه آنلاین کارخانه ${siteConfig.legalName}، تولیدکننده لوله دوجداره پلی اتیلن (کاروگیت) است. کالا مستقیم از انبار کارخانه در شهرک صنعتی گرمسار (استان سمنان) بارگیری می‌شود و دفتر مرکزی فروش در تهران، شادآباد، پاسخگوی استعلام قیمت و سفارش‌های عمده پروژه‌هاست.</p>
<h3>خرید لوله با قیمت روز</h3>
<p>قیمت لوله و اتصالات با تغییرات بازار مواد اولیه جابه‌جا می‌شود. به همین دلیل برای هر محصول جدول قیمت سایزها و فشارهای کاری مختلف همراه با تاریخ آخرین به‌روزرسانی نمایش داده می‌شود تا با اطمینان تصمیم بگیرید.</p>
<h3>انتخاب لوله مناسب پروژه</h3>
<p>انتخاب جنس، قطر و فشار کاری لوله به کاربرد آن بستگی دارد: لوله پلی اتیلن برای انتقال آب تحت فشار، لوله پلیکا برای فاضلاب ساختمانی و شهری و لوله چدن داکتیل برای خطوط انتقال با فشار بالا. کارشناسان ما در انتخاب محصول مناسب و برآورد مقدار مورد نیاز، مشاوره فنی رایگان ارائه می‌دهند.</p>
<h3>ارسال به سراسر کشور</h3>
<p>سفارش‌ها پس از هماهنگی، بارگیری و به محل پروژه در سراسر کشور ارسال می‌شوند. همه محصولات با ضمانت اصالت کالا و در صورت نیاز همراه با گواهینامه‌های کیفی عرضه می‌شوند.</p>`,
  phoneHref: phoneHref(siteConfig.phone),
  mobileHref: phoneHref(siteConfig.mobile),
  whatsappUrl: whatsappFromMobile(siteConfig.mobile) ?? siteConfig.socials.whatsapp,
};

/** ارقام فارسی/عربی → لاتین؛ \D به تنهایی ارقام فارسی را هم حذف می‌کند */
function toLatin(v: string) {
  return v.replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
}

export function phoneHref(phone: string) {
  return `tel:${toLatin(phone).replace(/\D/g, '')}`;
}

export function whatsappFromMobile(mobile: string) {
  const digits = toLatin(mobile).replace(/\D/g, '');
  if (!digits) return undefined;
  const normalized = digits.startsWith('98') ? digits : `98${digits.replace(/^0/, '')}`;
  return `https://wa.me/${normalized}`;
}

/** «۰۲۱-۸۶۰۳۸۲۲۰، ۰۲۱۸۶۰۳۸۲۲۴» → فهرست؛ جداکننده: ویرگول، خط تیره بین شماره‌ها یا خط جدید */
function parsePhones(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(/[,،\n]|\s[-–]\s/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function mergeSiteSettings(raw: Record<string, string>): SiteSettings {
  const phone = raw.contact_phone || defaultSiteSettings.phone;
  const mobile = raw.contact_mobile || defaultSiteSettings.mobile;

  return {
    siteName: raw.site_title || defaultSiteSettings.siteName,
    siteDescription: raw.site_description || defaultSiteSettings.siteDescription,
    phone,
    mobile,
    email: raw.contact_email || defaultSiteSettings.email,
    address: raw.contact_address || defaultSiteSettings.address,
    companyPhones: parsePhones(raw.company_phones).length ? parsePhones(raw.company_phones) : defaultSiteSettings.companyPhones,
    factoryAddress: raw.factory_address || defaultSiteSettings.factoryAddress,
    // فقط http(s) — این مقدار مستقیم در href می‌نشیند (جلوی javascript: و مشابه)
    mapUrl: /^https?:\/\//i.test(raw.map_url ?? '') ? raw.map_url : defaultSiteSettings.mapUrl,
    heroTitle: raw.hero_title || defaultSiteSettings.heroTitle,
    heroSubtitle: raw.hero_subtitle || defaultSiteSettings.heroSubtitle,
    homeSeoContent: raw.home_seo_content ?? defaultSiteSettings.homeSeoContent,
    phoneHref: phoneHref(phone),
    mobileHref: phoneHref(mobile),
    whatsappUrl: whatsappFromMobile(mobile) ?? defaultSiteSettings.whatsappUrl,
  };
}
