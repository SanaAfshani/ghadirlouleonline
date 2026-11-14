import { defineSection, type ContentPage } from '../types';
import { seoSection } from '../seo-section';
import { siteConfig } from '@/shared/config/site';

/** مستندات فنی منتشرشده در سایت رسمی کارخانه — لینک به خود کارخانه (منبع اصلی، و بک‌لینک به سایتش) */
const factoryFile = (name: string) => `${siteConfig.manufacturerUrl}/${encodeURIComponent(name)}`;

export const certificatesSeo = seoSection('certificates.seo', {
  fa: {
    metaTitle: 'مدارک نمایندگی و تأییدیه‌های فنی',
    metaDescription:
      'گواهی نمایندگی قدیر لوله آنلاین، گواهینامه ISO 9001:2015، پروانه استاندارد اجباری ISIRI 9116-3، گزارش آزمون کنترل کیفیت و مستندات فنی قدیر لوله پاسارگاد با تاریخ اعتبار هر مدرک.',
  },
  en: {
    metaTitle: 'Agency documents and technical approvals',
    metaDescription:
      'Qadir Lule Online’s agency certificate, ISO 9001:2015 certification, the mandatory ISIRI 9116-3 standard licence, quality-control test reports and Ghadir Louleh Pasargad technical documents, with the validity of each.',
  },
});

export const certificatesHero = defineSection({
  key: 'certificates.hero',
  title: 'بالای صفحه',
  description: 'تصویر گواهینامه‌ها از «گواهینامه‌ها» در پنل می‌آید؛ صفحه تا وقتی گواهی‌ای ثبت نشده نمایش داده نمی‌شود.',
  fields: {
    label: { type: 'text', label: 'برچسب کوچک بالای عنوان' },
    title: { type: 'text', label: 'عنوان' },
    description: { type: 'text', label: 'توضیح', multiline: true },
  },
  defaults: {
    fa: {
      label: 'اعتبار و کیفیت',
      title: 'مدارک نمایندگی و تأییدیه‌های فنی',
      description:
        'مدرک نمایندگی قدیر لوله آنلاین و مدارک کیفیت و استاندارد قدیر لوله پاسارگاد، با صادرکننده، اعتبار و محصول مربوط به هر مدرک. برای دیدن هر سند روی آن بزنید.',
    },
    en: {
      label: 'Credentials and quality',
      title: 'Agency documents and technical approvals',
      description:
        'Qadir Lule Online’s agency certificate and Ghadir Louleh Pasargad’s quality and standard documents, with the issuer, validity and related product of each. Tap any document to view it.',
    },
  },
});

export const certificatesExclusive = defineSection({
  key: 'certificates.exclusive',
  title: 'کادر نمایندگی انحصاری',
  description: 'عنوان کادر، نام سایت و «جایگاه نمایندگی» از تنظیمات سایت است.',
  fields: {
    text: { type: 'text', label: 'متن', multiline: true },
  },
  defaults: {
    fa: {
      text: 'محصولات قدیر لوله پاسارگاد — لوله کاروگیت دوجداره، لوله اسپیرال و اتصالات — با همین گواهینامه‌ها فقط از طریق قدیر لوله آنلاین عرضه می‌شود؛ کالای اصل کارخانه با قیمت روز کارخانه.',
    },
    en: {
      text: 'Ghadir Louleh Pasargad products — double-wall corrugated pipes, spiral pipes and fittings — covered by these certificates are sold only through Qadir Lule Online: genuine factory goods at the daily factory price.',
    },
  },
});

export const certificatesRepresentation = defineSection({
  key: 'certificates.representation',
  title: 'گواهی نمایندگی',
  description: 'صادرکننده، نام کارخانه از تنظیمات سایت است.',
  fields: {
    title: { type: 'text', label: 'عنوان بخش' },
    image: { type: 'image', label: 'تصویر گواهی' },
    certificateTitle: { type: 'text', label: 'عنوان گواهی' },
    certificateCode: { type: 'text', label: 'متن زیر عنوان گواهی' },
    validity: { type: 'text', label: 'اعتبار' },
    subject: { type: 'text', label: 'موضوع' },
    note: { type: 'html', label: 'توضیح زیر جدول', hint: 'لینک داخلی را با آدرس بدون دامنه بنویسید (مثلاً /official-representative).' },
  },
  defaults: {
    fa: {
      title: 'مدارک نمایندگی',
      image: '/images/site/representation-certificate.webp',
      certificateTitle: 'گواهی نمایندگی قدیر لوله آنلاین',
      certificateCode: 'مدت اعتبار: نامحدود، از تاریخ صدور',
      validity: 'نامحدود، از تاریخ صدور',
      subject: 'نمایندگی فروش و عرضه لوله‌های دوجداره و آبرسانی قدیر لوله پاسارگاد',
      note: 'متن کامل پیام رسمی کارخانه، با امضای مدیریت قدیر لوله پاسارگاد، در صفحه <a href="/official-representative">نماینده رسمی و اختصاصی</a> آمده است.',
    },
    en: {
      title: 'Agency documents',
      certificateTitle: 'Qadir Lule Online agency certificate',
      certificateCode: 'Validity: unlimited, from the date of issue',
      validity: 'Unlimited, from the date of issue',
      subject: 'Sales and distribution agency for Ghadir Louleh Pasargad double-wall and water supply pipes',
      note: 'The full text of the factory’s official statement, signed by the management of Ghadir Louleh Pasargad, is on the <a href="/official-representative">official exclusive agent</a> page.',
    },
  },
});

/**
 * هر مدرک: صادرکننده، اعتبار و ارتباطش با محصول — متن قابل خواندن برای مشتری و گوگل.
 * تاریخ‌ها فقط همان‌هایی است که روی خود سند یا در مستندات کارخانه آمده؛ چیزی حدس زده نشده.
 */
export const certificatesStandards = defineSection({
  key: 'certificates.standards',
  title: 'گواهینامه‌ها و استانداردها',
  description: 'کارت‌های توضیح زیر تصویر گواهینامه‌ها. تاریخ‌ها فقط همان‌هایی باشد که روی خود سند آمده.',
  fields: {
    title: { type: 'text', label: 'عنوان بخش' },
    items: {
      type: 'list',
      label: 'مدارک',
      itemLabel: 'مدرک',
      max: 12,
      fields: {
        title: { type: 'text', label: 'عنوان' },
        issuer: { type: 'text', label: 'صادرکننده' },
        validity: { type: 'text', label: 'اعتبار' },
        product: { type: 'text', label: 'محصول' },
        text: { type: 'text', label: 'توضیح', multiline: true },
      },
    },
  },
  defaults: {
    fa: {
      title: 'گواهینامه‌ها، پروانه استاندارد و کنترل کیفیت',
      items: [
        {
          id: 'isiri',
          title: 'ISIRI 9116-3 — استاندارد ملی ایران',
          issuer: 'سازمان ملی استاندارد ایران',
          validity: 'تمدید ۱۴۰۱ — تاریخ انقضا روی تصویر پروانه',
          product: 'لوله کاروگیت و دیواره ساختمند (همه سایزهای کاروگیت)',
          text: 'استاندارد اجباری لوله‌های پلاستیکی دیواره ساختمند (کاروگیت) از جنس پلی اتیلن، پلی پروپیلن و PVC-U با سطح بیرونی غیرصاف (نوع B) برای شبکه فاضلاب و زهکشی بدون فشار. پروانه کاربرد علامت استاندارد این کارخانه از سازمان ملی استاندارد ایران صادر و در ۱۴۰۱ تمدید شده است.',
        },
        {
          id: 'iso',
          title: 'ISO 9001:2015 — سیستم مدیریت کیفیت',
          issuer: 'BRSM',
          validity: 'معتبر تا آذر ۱۴۰۷',
          product: 'فرایند تولید لوله کاروگیت و لوله اسپیرال',
          text: 'گواهی سیستم مدیریت کیفیت برای تولید لوله کاروگیت با قطر ۱۱۰ تا ۱۰۰۰ میلیمتر و لوله اسپیرال کاروگیت با قطر ۸۰۰ تا ۲۰۰۰ میلیمتر، صادرشده از BRSM و معتبر تا آذر ۱۴۰۷.',
        },
        {
          id: 'test-report',
          title: 'گزارش آزمون آزمایشگاه کنترل کیفیت',
          issuer: 'آزمایشگاه کارخانه',
          validity: 'نمونه گزارش آزمون یک بچ تولید',
          product: 'لوله کاروگیت ۳۱۵ میلیمتر SN8',
          text: 'نمونه گزارش آزمون لوله کاروگیت ۳۱۵ میلیمتر SN8 در آزمایشگاه کارخانه: ابعاد، سختی حلقوی کوتاه‌مدت و بلندمدت (۳۲٫۵۹ کیلونیوتن بر مترمربع طبق DIN 16961-2 — حداقل الزام کارخانه ۳۱٫۵)، درصد و پراکندگی دوده، MFI، OIT، چگالی، آب‌بندی، ضربه و آزمون آون — همه در محدوده قابل قبول.',
        },
      ],
    },
    en: {
      title: 'Certificates, standard licence and quality control',
      items: [
        {
          id: 'isiri',
          title: 'ISIRI 9116-3 — Iranian national standard',
          issuer: 'Iranian National Standards Organization',
          validity: 'Renewed in 2022 — expiry date shown on the licence',
          product: 'Corrugated structured-wall pipes (all corrugated sizes)',
          text: 'The mandatory standard for structured-wall (corrugated) plastic pipes made of polyethylene, polypropylene and PVC-U with a non-smooth outer surface (type B), for non-pressure sewer and drainage networks. The factory’s licence to use the standard mark was issued by the Iranian National Standards Organization and renewed in 2022.',
        },
        {
          id: 'iso',
          title: 'ISO 9001:2015 — quality management system',
          issuer: 'BRSM',
          validity: 'Valid until Azar 1407 (November–December 2028)',
          product: 'Corrugated and spiral pipe production',
          text: 'Quality management system certification for producing corrugated pipes from 110 to 1000 mm and corrugated spiral pipes from 800 to 2000 mm in diameter, issued by BRSM and valid until Azar 1407 (November–December 2028).',
        },
        {
          id: 'test-report',
          title: 'Quality-control laboratory test report',
          issuer: 'Factory laboratory',
          validity: 'Sample test report for one production batch',
          product: 'Corrugated pipe 315 mm SN8',
          text: 'Sample test report for a 315 mm SN8 corrugated pipe from the factory laboratory: dimensions, short- and long-term ring stiffness (32.59 kN/m² per DIN 16961-2 — factory minimum 31.5), carbon black content and dispersion, MFI, OIT, density, watertightness, impact and oven test — all within acceptable limits.',
        },
      ],
    },
  },
});

export const certificatesDocs = defineSection({
  key: 'certificates.docs',
  title: 'مستندات فنی کارخانه',
  fields: {
    title: { type: 'text', label: 'عنوان بخش' },
    source: { type: 'text', label: 'توضیح زیر عنوان' },
    items: {
      type: 'list',
      label: 'فایل‌ها',
      itemLabel: 'فایل',
      max: 20,
      fields: {
        title: { type: 'text', label: 'عنوان' },
        meta: { type: 'text', label: 'نوع و حجم (مثلاً PDF فارسی · ۸ صفحه)' },
        text: { type: 'text', label: 'توضیح', multiline: true },
        link: { type: 'link', label: 'آدرس فایل' },
      },
    },
  },
  defaults: {
    fa: {
      title: 'مستندات فنی کارخانه',
      source: 'از سایت رسمی قدیر لوله پاسارگاد (ghadirlouleh.com).',
      items: [
        {
          id: 'installation',
          title: 'کارگذاری و نصب لوله‌های دوجداره پلی اتیلن',
          meta: 'PDF فارسی · ۸ صفحه',
          text: 'ترانشه، بستر، خاک‌ریزی و تراکم، و روش اتصال لوله کاروگیت هنگام اجرا.',
          link: factoryFile('کارگذاری لوله های کاروگیت.pdf'),
        },
        {
          id: 'spiral-joint',
          title: 'اتصال لوله‌های اسپیرال به روش اکستروژنی',
          meta: 'PDF فارسی · ۴ صفحه',
          text: 'روش جوش اکستروژن برای اتصال لوله‌های قطر بزرگ و اسپیرال — اسپیرال کوپلر ندارد.',
          link: factoryFile('اتصال لوله های اسپیرال گروگیت به روش اکستروژنی.pdf'),
        },
        {
          id: 'specs',
          title: 'مشخصات و الزامات کیفی لوله‌های کاروگیت',
          meta: 'Word فارسی',
          text: 'کوپلر سرخود دولایه، واشر EPDM، الزامات مواد اولیه و فهرست استانداردهای مرجع.',
          link: factoryFile('مشخصات لوله های گزوگیت.docx'),
        },
        {
          id: 'catalog',
          title: 'کاتالوگ شرکت (انگلیسی)',
          meta: 'PDF انگلیسی · ۳۷ صفحه',
          text: 'جدول قطر داخلی و خارجی، ارتفاع پروفیل و وزن هر متر سایزها در کلاس SN4 و SN8، و مشخصات مواد.',
          link: `${siteConfig.manufacturerUrl}/e69c5b52-d29f-423c-b743-3e4ec1fa006e.pdf`,
        },
      ],
    },
    en: {
      title: 'Factory technical documents',
      source: 'From the official Ghadir Louleh Pasargad website (ghadirlouleh.com).',
      items: [
        {
          id: 'installation',
          title: 'Installing double-wall polyethylene pipes',
          meta: 'PDF in Persian · 8 pages',
          text: 'Trench, bedding, backfilling and compaction, and how to joint corrugated pipes on site.',
        },
        {
          id: 'spiral-joint',
          title: 'Jointing spiral pipes by extrusion welding',
          meta: 'PDF in Persian · 4 pages',
          text: 'The extrusion welding method for jointing large-diameter and spiral pipes — spiral pipes have no couplers.',
        },
        {
          id: 'specs',
          title: 'Corrugated pipe specifications and quality requirements',
          meta: 'Word document in Persian',
          text: 'Integral double-layer coupler, EPDM seal, raw-material requirements and the list of reference standards.',
        },
        {
          id: 'catalog',
          title: 'Company catalogue (English)',
          meta: 'PDF in English · 37 pages',
          text: 'Inner and outer diameter, profile height and weight per metre for each size in SN4 and SN8, plus material specifications.',
        },
      ],
    },
  },
});

export const certificatesPage: ContentPage = {
  key: 'certificates',
  title: 'مدارک نمایندگی و تأییدیه‌ها',
  path: '/certificates',
  sections: [certificatesSeo, certificatesHero, certificatesExclusive, certificatesRepresentation, certificatesStandards, certificatesDocs],
};
