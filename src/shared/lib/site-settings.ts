import { siteConfig } from '@/shared/config/site';

/** گواهینامه / استاندارد با عکس واقعی سند — از پنل «گواهینامه‌ها» */
export type Certificate = { title: string; code: string; image: string };

/**
 * یک عکس از اسلایدر بالای صفحه اصلی — از پنل «اسلایدر هرو».
 *
 * focusX/focusY همان object-position است و برای هر عکس جدا نگه داشته می‌شود، چون قاب هرو
 * در هر عرضی جور دیگری بریده می‌شود: روی گوشی فقط نوار باریکی از عرض دیده می‌شود (focusX
 * تعیین می‌کند کدام نوار) و روی دسکتاپ از ارتفاع زده می‌شود (focusY). یک مقدار ثابت برای
 * همه عکس‌ها جواب نمی‌دهد، چون سوژه هر عکس جای دیگری است.
 */
export type HeroSlide = { image: string; alt: string; focusX: number; focusY: number };

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
  certificates: Certificate[];
  heroSlides: HeroSlide[];
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
    `${siteConfig.legalName} تولیدکننده لوله دوجداره پلی اتیلن (کاروگیت) برای شبکه فاضلاب و آب‌های سطحی است؛ ${siteConfig.name} تنها نماینده انحصاری آن با ارسال به سراسر ایران.`,
  homeSeoContent: `<h2>فروشگاه آنلاین لوله و اتصالات ${siteConfig.name}</h2>
<p>${siteConfig.name} با بیش از ۲۰ سال تجربه در تامین لوله و اتصالات، انواع لوله کاروگیت، لوله پلی اتیلن، لوله پلیکا، منهول، سپتیک تانک، لوازم آبیاری قطره‌ای و اتصالات آب و فاضلاب را برای پروژه‌های شهری، صنعتی و کشاورزی عرضه می‌کند. در این فروشگاه می‌توانید پیش از خرید، قیمت روز هر محصول را در جدول قیمت ببینید، مشخصات فنی را مقایسه کنید و با کارشناسان فروش مشورت کنید.</p>
<h3>${siteConfig.exclusiveTitle}</h3>
<p><strong>${siteConfig.name}</strong> تنها نماینده انحصاری فروش ${siteConfig.legalName}، تولیدکننده لوله دوجداره پلی اتیلن (کاروگیت) است. کالا مستقیم از انبار کارخانه در شهرک صنعتی گرمسار (استان سمنان) بارگیری می‌شود و دفتر مرکزی فروش در تهران، شادآباد، پاسخگوی استعلام قیمت و سفارش‌های عمده پروژه‌هاست.</p>
<h3>خرید لوله با قیمت روز</h3>
<p>قیمت لوله و اتصالات با تغییرات بازار مواد اولیه جابه‌جا می‌شود. به همین دلیل برای هر محصول جدول قیمت روز سایزها و فشارهای کاری مختلف نمایش داده می‌شود تا با اطمینان تصمیم بگیرید.</p>
<h3>انتخاب لوله مناسب پروژه</h3>
<p>انتخاب جنس، قطر و فشار کاری لوله به کاربرد آن بستگی دارد: لوله پلی اتیلن برای انتقال آب تحت فشار، لوله پلیکا برای فاضلاب ساختمانی و شهری و لوله کاروگیت برای شبکه فاضلاب و آب‌های سطحی. کارشناسان ما در انتخاب محصول مناسب و برآورد مقدار مورد نیاز، مشاوره فنی رایگان ارائه می‌دهند.</p>
<h3>ارسال به سراسر کشور</h3>
<p>سفارش‌ها پس از هماهنگی، بارگیری و به محل پروژه در سراسر کشور ارسال می‌شوند. همه محصولات با ضمانت اصالت کالا و در صورت نیاز همراه با گواهینامه‌های کیفی عرضه می‌شوند.</p>`,
  phoneHref: phoneHref(siteConfig.phone),
  mobileHref: phoneHref(siteConfig.mobile),
  whatsappUrl: whatsappFromMobile(siteConfig.mobile) ?? siteConfig.socials.whatsapp,
  certificates: [],
  // تا وقتی چیزی در پنل تنظیم نشده، همان عکس ثابت فعلی نشان داده می‌شود
  heroSlides: [
    { image: '/images/site/hero-v3-wm.webp', alt: '', focusX: 100, focusY: 0 },
  ],
};

/** فقط عکس آپلودشده خود سایت یا https — این مقدار مستقیم در src می‌نشیند */
export function parseCertificates(raw: string | undefined): Certificate[] {
  try {
    const list = JSON.parse(raw || '[]');
    if (!Array.isArray(list)) return [];
    return list
      .map((c) => ({ title: String(c?.title ?? '').trim().slice(0, 120), code: String(c?.code ?? '').trim().slice(0, 60), image: String(c?.image ?? '').trim() }))
      .filter((c) => c.title && /^(\/media\/[a-z0-9]+\.[a-z0-9]+|https:\/\/\S+)$/i.test(c.image))
      .slice(0, 24);
  } catch {
    return [];
  }
}

/** عکس‌های مجاز: آپلودی‌های پنل (/media)، فایل‌های ثابت پروژه (/images) و آدرس https */
const IMAGE_SRC = /^(\/(?:media|images)\/[\w./-]+|https:\/\/\S+)$/i;

export function parseHeroSlides(raw: string | undefined): HeroSlide[] {
  try {
    const list = JSON.parse(raw || '[]');
    if (!Array.isArray(list)) return [];
    const clamp = (v: unknown) => Math.min(100, Math.max(0, Math.round(Number(v) || 0)));
    return list
      .map((s) => ({
        image: String(s?.image ?? '').trim(),
        alt: String(s?.alt ?? '').trim().slice(0, 160),
        focusX: clamp(s?.focusX ?? 50),
        focusY: clamp(s?.focusY ?? 50),
      }))
      .filter((s) => IMAGE_SRC.test(s.image))
      .slice(0, 8);
  } catch {
    return [];
  }
}

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
    certificates: parseCertificates(raw.certificates),
    // خالی بودن یعنی هنوز چیزی تنظیم نشده — عکس پیش‌فرض می‌ماند تا هرو هیچ‌وقت بی‌عکس نشود
    heroSlides: parseHeroSlides(raw.hero_slides).length
      ? parseHeroSlides(raw.hero_slides)
      : defaultSiteSettings.heroSlides,
  };
}
