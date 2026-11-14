import { siteConfig } from '@/shared/config/site';
import { defaultLocale, type Locale } from '@/shared/i18n/config';

/** گواهینامه / استاندارد با عکس واقعی سند — از پنل «گواهینامه‌ها» */
export type Certificate = { title: string; titleEn: string; code: string; image: string };

/**
 * یک عکس از اسلایدر بالای صفحه اصلی — از پنل «اسلایدر هرو».
 *
 * focusX/focusY همان object-position است و برای هر عکس جدا نگه داشته می‌شود، چون قاب هرو
 * در هر عرضی جور دیگری بریده می‌شود: روی گوشی فقط نوار باریکی از عرض دیده می‌شود (focusX
 * تعیین می‌کند کدام نوار) و روی دسکتاپ از ارتفاع زده می‌شود (focusY). یک مقدار ثابت برای
 * همه عکس‌ها جواب نمی‌دهد، چون سوژه هر عکس جای دیگری است.
 */
export type HeroSlide = {
  image: string;
  alt: string;
  altEn: string;
  focusX: number;
  focusY: number;
  /**
   * cover: کادر را پر می‌کند و لبه‌ها بریده می‌شوند — حالت استاندارد هرو.
   * contain: کل عکس بدون برش دیده می‌شود و جای خالی با نسخه محوِ همان عکس پر می‌شود.
   * کادر هرو روی دسکتاپ نسبت ۲.۴ دارد و عکس معمولی ۱.۳۳، یعنی cover حدود ۱.۸ برابر
   * بزرگ‌نمایی می‌کند؛ برای عکسی که سوژه‌اش با این برش خراب می‌شود contain بهتر است.
   */
  fit: 'cover' | 'contain';
};

/** متن‌هایی که هر زبان نسخه خودش را دارد؛ نسخه انگلیسی در کلید `<key>_en` ذخیره می‌شود */
export type LocalizedSiteText = {
  siteName: string;
  siteDescription: string;
  /** آدرس دفتر مرکزی */
  address: string;
  factoryAddress: string;
  heroTitle: string;
  heroSubtitle: string;
  /** متن سئوی پایین صفحه اصلی (HTML) — از پنل سئو قابل ویرایش */
  homeSeoContent: string;
  /** نام کارخانه تولیدکننده */
  legalName: string;
  /** «تنها نماینده انحصاری ...» — در هدر، هیرو و فوتر */
  exclusiveTitle: string;
  workingHours: string;
  salesExpertName: string;
  salesExpertRole: string;
};

/** نماد اعتماد فوتر؛ href لینک استعلام رسمی همان نماد است */
export type TrustBadge = { name: string; image: string; href: string };

export type SiteSettings = LocalizedSiteText & {
  locale: Locale;
  phone: string;
  mobile: string;
  email: string;
  /** تلفن‌های ثابت شرکت */
  companyPhones: string[];
  /** لینک کارخانه در گوگل مپ */
  mapUrl: string;
  phoneHref: string;
  mobileHref: string;
  whatsappUrl: string;
  rubikaId: string;
  rubikaUrl: string;
  certificates: Certificate[];
  heroSlides: HeroSlide[];
  trustBadges: TrustBadge[];
};

/** کلید دیتابیس هر متن چندزبانه */
const LOCALIZED_KEYS: Record<keyof LocalizedSiteText, string> = {
  siteName: 'site_title',
  siteDescription: 'site_description',
  address: 'contact_address',
  factoryAddress: 'factory_address',
  heroTitle: 'hero_title',
  heroSubtitle: 'hero_subtitle',
  homeSeoContent: 'home_seo_content',
  legalName: 'manufacturer_name',
  exclusiveTitle: 'exclusive_title',
  workingHours: 'working_hours',
  salesExpertName: 'sales_expert_name',
  salesExpertRole: 'sales_expert_role',
};

export function localizedSettingKey(key: string, locale: Locale): string {
  return locale === defaultLocale ? key : `${key}_${locale}`;
}

/** پیش‌فرض متن‌ها تا وقتی در پنل چیزی ثبت نشده — نسخه انگلیسی ترجمه همین متن‌هاست، نه خالی */
export const defaultLocalizedText: Record<Locale, LocalizedSiteText> = {
  fa: {
    siteName: siteConfig.name,
    siteDescription: siteConfig.description,
    address: siteConfig.address,
    factoryAddress: siteConfig.factoryAddress,
    heroTitle: siteConfig.tagline,
    heroSubtitle:
      `${siteConfig.legalName} تولیدکننده لوله کاروگیت دوجداره، لوله اسپیرال و اتصالات کاروگیت برای شبکه فاضلاب و آب‌های سطحی است؛ ${siteConfig.name} تنها نماینده انحصاری آن با ارسال به سراسر ایران.`,
    homeSeoContent: `<h2>فروش لوله کاروگیت، اسپیرال و اتصالات ${siteConfig.name}</h2>
<p>${siteConfig.name} سه محصول را مستقیم از کارخانه عرضه می‌کند: <strong>لوله کاروگیت دوجداره</strong> در سایزهای ۱۱۰ تا ۱۲۰۰ میلی‌متر، <strong>لوله اسپیرال</strong> در قطرهای ۹۰۰ تا ۲۰۰۰ میلی‌متر و <strong>اتصالات کاروگیت</strong> شامل کوپلر، واشر EPDM، زانو، سه‌راهی، تبدیل و درپوش. هر سایز صفحه جداگانه با مشخصات، جدول قیمت روز و توضیحات کاربرد خودش را دارد.</p>
<h3>${siteConfig.exclusiveTitle}</h3>
<p><strong>${siteConfig.name}</strong> تنها نماینده انحصاری فروش ${siteConfig.legalName}، تولیدکننده لوله دوجداره پلی اتیلن (کاروگیت) است. کالا مستقیم از انبار کارخانه در شهرک صنعتی گرمسار (استان سمنان) بارگیری می‌شود و دفتر مرکزی فروش در تهران، شادآباد، پاسخگوی استعلام قیمت و سفارش‌های عمده پروژه‌هاست.</p>
<h3>خرید لوله کاروگیت با قیمت روز</h3>
<p>قیمت لوله کاروگیت با قیمت مواد اولیه پلی اتیلن جابه‌جا می‌شود. قیمت هر متر از وزن همان سایز و قیمت روز هر کیلو حساب می‌شود و برای هر سایز در دو کلاس سختی حلقوی SN4 و SN8 همراه با تاریخ آخرین به‌روزرسانی نمایش داده می‌شود.</p>
<h3>انتخاب سایز و کلاس مناسب پروژه</h3>
<p>سایز لوله از دبی طراحی شبکه و کلاس SN از عمق دفن و بار ترافیکی مسیر تعیین می‌شود: SN4 برای مسیرهای کم‌عمق و بدون ترافیک سنگین و SN8 برای معابر شهری و خطوط اصلی. کارشناسان ما در انتخاب سایز، کلاس و اتصالات و برآورد متراژ، مشاوره فنی رایگان می‌دهند.</p>
<h3>ارسال به سراسر کشور</h3>
<p>سفارش‌ها پس از هماهنگی، از انبار کارخانه بارگیری و به محل پروژه در سراسر کشور ارسال می‌شوند و در صورت نیاز همراه با گواهینامه‌های کیفی کارخانه عرضه می‌شوند.</p>`,
    legalName: siteConfig.legalName,
    exclusiveTitle: siteConfig.exclusiveTitle,
    workingHours: siteConfig.workingHours,
    salesExpertName: siteConfig.salesExpert.name,
    salesExpertRole: siteConfig.salesExpert.role,
  },
  en: {
    siteName: siteConfig.nameEn,
    siteDescription:
      `${siteConfig.nameEn}, the exclusive sales agent of ${siteConfig.legalNameEn}: double-wall corrugated pipes, spiral pipes and corrugated pipe fittings at daily factory prices, delivered anywhere in Iran.`,
    address: 'Shadabad, Tehran, Iran',
    factoryAddress: 'Garmsar Industrial Park, Garmsar, Semnan, Iran',
    heroTitle: 'Supplier of double-wall corrugated and spiral pipes',
    heroSubtitle:
      `${siteConfig.legalNameEn} manufactures double-wall corrugated pipes, spiral pipes and corrugated fittings for sewer and stormwater networks; ${siteConfig.nameEn} is its exclusive sales agent, delivering across Iran.`,
    homeSeoContent: `<h2>Corrugated pipes, spiral pipes and fittings from ${siteConfig.nameEn}</h2>
<p>${siteConfig.nameEn} supplies three product lines directly from the factory: <strong>double-wall corrugated pipes</strong> from 110 to 1200 mm, <strong>spiral pipes</strong> from 900 to 2000 mm, and <strong>corrugated pipe fittings</strong> including couplers, EPDM seals, elbows, tees, reducers and end caps. Every size has its own page with specifications, a daily price table and application notes.</p>
<h3>Exclusive sales agent of ${siteConfig.legalNameEn}</h3>
<p><strong>${siteConfig.nameEn}</strong> is the sole exclusive sales agent of ${siteConfig.legalNameEn}, a manufacturer of double-wall polyethylene (corrugated) pipes. Orders are loaded directly from the factory warehouse in Garmsar Industrial Park (Semnan Province), and the head sales office in Shadabad, Tehran handles price inquiries and bulk project orders.</p>
<h3>Corrugated pipes at today's price</h3>
<p>Corrugated pipe prices follow the price of polyethylene raw material. The price per metre is calculated from the weight of each size and the daily price per kilogram, and is shown for both ring-stiffness classes SN4 and SN8 together with the date of the last update.</p>
<h3>Choosing the right size and class</h3>
<p>Pipe size is set by the design flow of the network, and the SN class by burial depth and traffic load: SN4 for shallow routes without heavy traffic, SN8 for urban roads and main lines. Our engineers provide free technical advice on size, class, fittings and quantity estimates.</p>
<h3>Delivery across Iran</h3>
<p>After confirmation, orders are loaded at the factory warehouse and shipped to project sites anywhere in the country, with the factory's quality certificates when required.</p>`,
    legalName: siteConfig.legalNameEn,
    exclusiveTitle: `Exclusive sales agent of ${siteConfig.legalNameEn}`,
    workingHours: 'Saturday to Thursday, 8 am to 6 pm (Iran time)',
    salesExpertName: 'Mr. Amir Yousefi',
    salesExpertRole: 'Sales Specialist',
  },
};

/** پیش‌فرض کامل فارسی — برای Context کلاینت قبل از رسیدن داده و API هایی که زبان ندارند */
export const defaultSiteSettings: SiteSettings = {
  ...defaultLocalizedText.fa,
  locale: defaultLocale,
  phone: siteConfig.phone,
  mobile: siteConfig.mobile,
  email: siteConfig.email,
  companyPhones: siteConfig.companyPhones,
  mapUrl: siteConfig.mapUrl,
  phoneHref: phoneHref(siteConfig.phone),
  mobileHref: phoneHref(siteConfig.mobile),
  whatsappUrl: whatsappFromMobile(siteConfig.mobile) ?? siteConfig.socials.whatsapp,
  rubikaId: siteConfig.socials.rubikaId,
  rubikaUrl: siteConfig.socials.rubikaUrl,
  certificates: [],
  // تا وقتی چیزی در پنل تنظیم نشده، همان عکس ثابت فعلی نشان داده می‌شود
  heroSlides: [
    { image: '/images/site/hero-v3-wm.webp', alt: '', altEn: '', focusX: 100, focusY: 0, fit: 'cover' },
  ],
  trustBadges: siteConfig.trustBadges,
};

/** فقط عکس آپلودشده خود سایت یا https — این مقدار مستقیم در src می‌نشیند */
export function parseCertificates(raw: string | undefined): Certificate[] {
  try {
    const list = JSON.parse(raw || '[]');
    if (!Array.isArray(list)) return [];
    return list
      .map((c) => ({
        title: String(c?.title ?? '').trim().slice(0, 120),
        titleEn: String(c?.titleEn ?? '').trim().slice(0, 120),
        code: String(c?.code ?? '').trim().slice(0, 60), image: String(c?.image ?? '').trim() }))
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
        altEn: String(s?.altEn ?? '').trim().slice(0, 160),
        focusX: clamp(s?.focusX ?? 50),
        focusY: clamp(s?.focusY ?? 50),
        // اسلایدهای ذخیره‌شده قبل از افزودن این گزینه fit ندارند — پیش‌فرض همان رفتار قبلی
        fit: s?.fit === 'contain' ? ('contain' as const) : ('cover' as const),
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

/** فقط آدرس http(s) — این مقدارها مستقیم در href می‌نشینند (جلوی javascript: و مشابه) */
function httpUrl(value: string | undefined, fallback: string): string {
  return /^https?:\/\//i.test(value ?? '') ? value! : fallback;
}

export function parseTrustBadges(raw: string | undefined): TrustBadge[] | null {
  if (!raw) return null;
  try {
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return null;
    return list
      .map((b) => ({ name: String(b?.name ?? '').trim().slice(0, 120), image: String(b?.image ?? '').trim(), href: String(b?.href ?? '').trim() }))
      .filter((b) => b.name && IMAGE_SRC.test(b.image))
      .map((b) => ({ ...b, href: /^https:\/\//i.test(b.href) ? b.href : '' }))
      .slice(0, 8);
  } catch {
    return null;
  }
}

/**
 * کلیدهایی که از /api/settings قابل نوشتن‌اند. بقیه کلیدها (بازار، سئو، ...) API و اعتبارسنجی خودشان را دارند؛
 * بدون این فهرست هر کلید دلخواهی (با هر حجمی) در جدول تنظیمات — که به همه صفحات می‌رود — ذخیره می‌شد.
 */
export const EDITABLE_SETTING_KEYS = new Set([
  ...Object.values(LOCALIZED_KEYS).flatMap((key) => [key, localizedSettingKey(key, 'en')]),
  'contact_phone', 'contact_mobile', 'contact_email', 'company_phones', 'map_url',
  'rubika_id', 'rubika_url', 'trust_badges',
  'hero_slides', 'certificates', 'theme_color',
]);

export function mergeSiteSettings(raw: Record<string, string>, locale: Locale = defaultLocale): SiteSettings {
  const phone = raw.contact_phone?.trim() || defaultSiteSettings.phone;
  const mobile = raw.contact_mobile?.trim() || defaultSiteSettings.mobile;
  const en = locale !== defaultLocale;

  // متن خالیِ نسخه انگلیسی یعنی هنوز ترجمه نشده — پیش‌فرض انگلیسی، نه متن فارسی
  const text = Object.fromEntries(
    (Object.keys(LOCALIZED_KEYS) as (keyof LocalizedSiteText)[]).map((field) => {
      const value = raw[localizedSettingKey(LOCALIZED_KEYS[field], locale)]?.trim();
      // متن سئوی صفحه اصلی را می‌شود عمداً خالی گذاشت (??)؛ بقیه با رشته خالی به پیش‌فرض برمی‌گردند
      return [field, field === 'homeSeoContent' ? value ?? defaultLocalizedText[locale][field] : value || defaultLocalizedText[locale][field]];
    }),
  ) as LocalizedSiteText;

  const heroSlides = parseHeroSlides(raw.hero_slides);

  return {
    ...text,
    locale,
    phone,
    mobile,
    email: raw.contact_email?.trim() || defaultSiteSettings.email,
    companyPhones: parsePhones(raw.company_phones).length ? parsePhones(raw.company_phones) : defaultSiteSettings.companyPhones,
    mapUrl: httpUrl(raw.map_url, defaultSiteSettings.mapUrl),
    phoneHref: phoneHref(phone),
    mobileHref: phoneHref(mobile),
    whatsappUrl: whatsappFromMobile(mobile) ?? defaultSiteSettings.whatsappUrl,
    rubikaId: raw.rubika_id?.trim() || defaultSiteSettings.rubikaId,
    rubikaUrl: httpUrl(raw.rubika_url, defaultSiteSettings.rubikaUrl),
    certificates: parseCertificates(raw.certificates).map((c) => ({ ...c, title: (en && c.titleEn) || c.title })),
    // خالی بودن یعنی هنوز چیزی تنظیم نشده — عکس پیش‌فرض می‌ماند تا هرو هیچ‌وقت بی‌عکس نشود
    heroSlides: (heroSlides.length ? heroSlides : defaultSiteSettings.heroSlides).map((s) => ({ ...s, alt: (en && s.altEn) || s.alt })),
    trustBadges: parseTrustBadges(raw.trust_badges) ?? defaultSiteSettings.trustBadges,
  };
}
