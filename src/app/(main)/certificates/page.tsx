import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { BadgeCheck, FileText, ShieldCheck } from 'lucide-react';
import { PageHero } from '@/shared/ui/PageHero';
import { CertificatesGrid } from '@/features/certificates/Certificates';
import { getSiteSettingsMap } from '@/shared/lib/site-settings-store';
import { parseCertificates } from '@/shared/lib/site-settings';
import { siteConfig } from '@/shared/config/site';
import { JsonLd } from '@/shared/ui/JsonLd';
import { absoluteUrl, breadcrumbSchema } from '@/shared/lib/seo';
import { LtrCodes } from '@/shared/ui/LtrCodes';
import { Reveal } from '@/shared/ui/Reveal';

const TITLE = 'مدارک نمایندگی و تأییدیه‌های فنی';
const DESCRIPTION = `گواهی نمایندگی ${siteConfig.name}، گواهینامه ISO 9001:2015، پروانه استاندارد اجباری ISIRI 9116-3، گزارش آزمون کنترل کیفیت و مستندات فنی ${siteConfig.legalName} با تاریخ اعتبار هر مدرک.`;

/** گواهی نمایندگی — صادرشده از کارخانه برای همین مجموعه (همان تصویر صفحه پیام رسمی) */
const REPRESENTATION = {
  title: `گواهی نمایندگی ${siteConfig.name}`,
  code: 'مدت اعتبار: نامحدود، از تاریخ صدور',
  image: '/images/site/representation-certificate.webp',
};

/** مستندات فنی منتشرشده در سایت رسمی کارخانه — لینک به خود کارخانه (منبع اصلی، و بک‌لینک به سایتش) */
const factoryFile = (name: string) => `${siteConfig.manufacturerUrl}/${encodeURIComponent(name)}`;
const FACTORY_DOCS = [
  {
    title: 'کارگذاری و نصب لوله‌های دوجداره پلی اتیلن',
    meta: 'PDF فارسی · ۸ صفحه',
    text: 'ترانشه، بستر، خاک‌ریزی و تراکم، و روش اتصال لوله کاروگیت هنگام اجرا.',
    href: factoryFile('کارگذاری لوله های کاروگیت.pdf'),
  },
  {
    title: 'اتصال لوله‌های اسپیرال به روش اکستروژنی',
    meta: 'PDF فارسی · ۴ صفحه',
    text: 'روش جوش اکستروژن برای اتصال لوله‌های قطر بزرگ و اسپیرال — اسپیرال کوپلر ندارد.',
    href: factoryFile('اتصال لوله های اسپیرال گروگیت به روش اکستروژنی.pdf'),
  },
  {
    title: 'مشخصات و الزامات کیفی لوله‌های کاروگیت',
    meta: 'Word فارسی',
    text: 'کوپلر سرخود دولایه، واشر EPDM، الزامات مواد اولیه و فهرست استانداردهای مرجع.',
    href: factoryFile('مشخصات لوله های گزوگیت.docx'),
  },
  {
    title: 'کاتالوگ شرکت (انگلیسی)',
    meta: 'PDF انگلیسی · ۳۷ صفحه',
    text: 'جدول قطر داخلی و خارجی، ارتفاع پروفیل و وزن هر متر سایزها در کلاس SN4 و SN8، و مشخصات مواد.',
    href: `${siteConfig.manufacturerUrl}/e69c5b52-d29f-423c-b743-3e4ec1fa006e.pdf`,
  },
];

export async function generateMetadata(): Promise<Metadata> {
  const certificates = parseCertificates((await getSiteSettingsMap()).certificates);
  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: `${siteConfig.url}/certificates` },
    openGraph: {
      title: TITLE,
      description: DESCRIPTION,
      url: `${siteConfig.url}/certificates`,
      images: certificates.slice(0, 1).map((c) => ({ url: absoluteUrl(c.image), alt: c.title })),
    },
  };
}

/**
 * هر مدرک: صادرکننده، اعتبار و ارتباطش با محصول — متن قابل خواندن برای مشتری و گوگل.
 * تاریخ‌ها فقط همان‌هایی است که روی خود سند یا در مستندات کارخانه آمده؛ چیزی حدس زده نشده.
 */
const STANDARDS = [
  {
    title: 'ISIRI 9116-3 — استاندارد ملی ایران',
    issuer: 'سازمان ملی استاندارد ایران',
    validity: 'تمدید ۱۴۰۱ — تاریخ انقضا روی تصویر پروانه',
    product: 'لوله کاروگیت و دیواره ساختمند (همه سایزهای کاروگیت)',
    text: 'استاندارد اجباری لوله‌های پلاستیکی دیواره ساختمند (کاروگیت) از جنس پلی اتیلن، پلی پروپیلن و PVC-U با سطح بیرونی غیرصاف (نوع B) برای شبکه فاضلاب و زهکشی بدون فشار. پروانه کاربرد علامت استاندارد این کارخانه از سازمان ملی استاندارد ایران صادر و در ۱۴۰۱ تمدید شده است.',
  },
  {
    title: 'ISO 9001:2015 — سیستم مدیریت کیفیت',
    issuer: 'BRSM',
    validity: 'معتبر تا آذر ۱۴۰۷',
    product: 'فرایند تولید لوله کاروگیت و لوله اسپیرال',
    text: 'گواهی سیستم مدیریت کیفیت برای تولید لوله کاروگیت با قطر ۱۱۰ تا ۱۰۰۰ میلیمتر و لوله اسپیرال کاروگیت با قطر ۸۰۰ تا ۲۰۰۰ میلیمتر، صادرشده از BRSM و معتبر تا آذر ۱۴۰۷.',
  },
  {
    title: 'گزارش آزمون آزمایشگاه کنترل کیفیت',
    issuer: 'آزمایشگاه کارخانه',
    validity: 'نمونه گزارش آزمون یک بچ تولید',
    product: 'لوله کاروگیت ۳۱۵ میلیمتر SN8',
    text: 'نمونه گزارش آزمون لوله کاروگیت ۳۱۵ میلیمتر SN8 در آزمایشگاه کارخانه: ابعاد، سختی حلقوی کوتاه‌مدت و بلندمدت (۳۲٫۵۹ کیلونیوتن بر مترمربع طبق DIN 16961-2 — حداقل الزام کارخانه ۳۱٫۵)، درصد و پراکندگی دوده، MFI، OIT، چگالی، آب‌بندی، ضربه و آزمون آون — همه در محدوده قابل قبول.',
  },
];

export default async function CertificatesPage() {
  const certificates = parseCertificates((await getSiteSettingsMap()).certificates);
  // تا وقتی گواهی‌ای ثبت نشده صفحه وجود ندارد — صفحه خالی برای گوگل و مشتری بد است
  if (!certificates.length) notFound();

  // مدارک متعلق به کارخانه (تولیدکننده) است؛ سایت نماینده انحصاری آن
  const manufacturer = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.legalName,
    alternateName: siteConfig.legalNameEn,
    url: siteConfig.manufacturerUrl,
    description: `تولیدکننده لوله دوجداره پلی اتیلن (کاروگیت) در شهرک صنعتی گرمسار. ${siteConfig.name} ${siteConfig.exclusiveTitle} است.`,
    hasCredential: certificates.map((c) => ({
      '@type': 'EducationalOccupationalCredential',
      name: c.title,
      credentialCategory: c.code || 'certificate',
      image: absoluteUrl(c.image),
      url: `${siteConfig.url}/certificates`,
    })),
  };

  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: TITLE, path: '/certificates' }])} />
      <JsonLd data={manufacturer} />
      <PageHero label="اعتبار و کیفیت" title={TITLE} description={`مدرک نمایندگی ${siteConfig.name} و مدارک کیفیت و استاندارد ${siteConfig.legalName}، با صادرکننده، اعتبار و محصول مربوط به هر مدرک. برای دیدن هر سند روی آن بزنید.`} />

      <Reveal>
      <section className="container-main section-padding-sm">
        <div className="rounded-3xl border-2 border-[var(--accent)]/50 bg-[var(--accent)]/[0.07] p-5 sm:p-6 flex items-start gap-4">
          <ShieldCheck className="w-8 h-8 shrink-0 text-[var(--accent-text)]" />
          <div>
            <p className="text-lg sm:text-xl font-black leading-8">
              <strong>{siteConfig.name}، {siteConfig.exclusiveTitle}</strong>
            </p>
            <p className="mt-2 text-sm sm:text-[15px] leading-8 text-[var(--muted-foreground)]">
              محصولات {siteConfig.legalName} — لوله کاروگیت دوجداره، لوله اسپیرال و اتصالات — با همین گواهینامه‌ها فقط از طریق {siteConfig.name} عرضه
              می‌شود؛ کالای اصل کارخانه با قیمت روز کارخانه.
            </p>
          </div>
        </div>

        <h2 className="mt-10 text-xl sm:text-2xl font-black">مدارک نمایندگی</h2>
        <div className="mt-4 grid gap-6 md:grid-cols-[minmax(0,280px)_1fr] items-start">
          <CertificatesGrid certificates={[REPRESENTATION]} columns="single" />
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5 text-sm leading-8">
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
              <dt className="text-[var(--muted-foreground)]">صادرکننده</dt>
              <dd className="font-bold">{siteConfig.legalName}</dd>
              <dt className="text-[var(--muted-foreground)]">اعتبار</dt>
              <dd className="font-bold">نامحدود، از تاریخ صدور</dd>
              <dt className="text-[var(--muted-foreground)]">موضوع</dt>
              <dd className="font-bold">نمایندگی فروش و عرضه لوله‌های دوجداره و آبرسانی {siteConfig.legalName}</dd>
            </dl>
            <p className="mt-3 text-[var(--muted-foreground)]">
              متن کامل پیام رسمی کارخانه، با امضای مدیریت {siteConfig.legalName}، در صفحه{' '}
              <Link href="/official-representative" className="font-bold text-[var(--accent-text)] hover:underline">نماینده رسمی و اختصاصی</Link> آمده است.
            </p>
          </div>
        </div>

        <h2 className="mt-12 text-xl sm:text-2xl font-black">گواهینامه‌ها، پروانه استاندارد و کنترل کیفیت</h2>
        <div className="mt-4">
          <CertificatesGrid certificates={certificates} />
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {STANDARDS.map((s) => (
            <article key={s.title} className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5">
              <h3 className="flex items-start gap-2 font-black text-base leading-7 num">
                <BadgeCheck className="w-5 h-5 mt-1 shrink-0 text-emerald-600" />
                <span><LtrCodes text={s.title} /></span>
              </h3>
              <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs leading-6">
                <dt className="text-[var(--muted-foreground)]">صادرکننده</dt>
                <dd className="font-bold num">{s.issuer}</dd>
                <dt className="text-[var(--muted-foreground)]">اعتبار</dt>
                <dd className="font-bold num">{s.validity}</dd>
                <dt className="text-[var(--muted-foreground)]">محصول</dt>
                <dd className="font-bold num">{s.product}</dd>
              </dl>
              <p className="mt-3 text-sm leading-7 text-[var(--muted-foreground)] num"><LtrCodes text={s.text} /></p>
            </article>
          ))}
        </div>

        <h2 className="mt-12 text-xl sm:text-2xl font-black">مستندات فنی کارخانه</h2>
        <p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">
          از سایت رسمی {siteConfig.legalName} ({siteConfig.manufacturerUrl.replace(/^https?:\/\/(www\.)?/, '')}).
        </p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {FACTORY_DOCS.map((d) => (
            <li key={d.href}>
              <a href={d.href} target="_blank" rel="noopener" className="flex items-start gap-3 h-full rounded-2xl border border-[var(--border)] p-4 hover:border-[var(--accent)] transition-colors">
                <FileText className="w-5 h-5 mt-1 shrink-0 text-[var(--accent-text)]" />
                <span>
                  <span className="block font-black text-sm leading-7">{d.title}</span>
                  <span className="block text-xs text-[var(--muted-foreground)]">{d.meta}</span>
                  <span className="mt-1 block text-sm leading-7 text-[var(--muted-foreground)]">{d.text}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>
      </Reveal>
    </>
  );
}
