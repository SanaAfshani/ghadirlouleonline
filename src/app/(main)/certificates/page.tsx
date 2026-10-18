import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BadgeCheck, ShieldCheck } from 'lucide-react';
import { PageHero } from '@/shared/ui/PageHero';
import { CertificatesGrid } from '@/features/certificates/Certificates';
import { getSiteSettingsMap } from '@/shared/lib/site-settings-store';
import { parseCertificates } from '@/shared/lib/site-settings';
import { siteConfig } from '@/shared/config/site';
import { JsonLd } from '@/shared/ui/JsonLd';
import { absoluteUrl, breadcrumbSchema } from '@/shared/lib/seo';
import { LtrCodes } from '@/shared/ui/LtrCodes';

const TITLE = `گواهینامه‌ها و مجوزهای ${siteConfig.legalName}`;
const DESCRIPTION = `گواهینامه ISO 9001:2015 و پروانه علامت استاندارد اجباری ISIRI 9116-3 ${siteConfig.legalName}. ${siteConfig.name} ${siteConfig.exclusiveTitle} است.`;

export async function generateMetadata(): Promise<Metadata> {
  const certificates = parseCertificates((await getSiteSettingsMap()).certificates);
  return {
    title: `${TITLE} | نماینده انحصاری`,
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

/** توضیح کوتاه هر استاندارد — متن قابل خواندن برای مشتری و گوگل (فقط عکس، محتوای صفحه را خالی نشان می‌داد) */
const STANDARDS = [
  {
    title: 'ISIRI 9116-3 — استاندارد ملی ایران',
    text: 'استاندارد اجباری لوله‌های پلاستیکی دیواره ساختمند (کاروگیت) از جنس پلی اتیلن، پلی پروپیلن و PVC-U با سطح بیرونی غیرصاف (نوع B) برای شبکه فاضلاب و زهکشی بدون فشار. پروانه کاربرد علامت استاندارد این کارخانه از سازمان ملی استاندارد ایران صادر و در ۱۴۰۱ تمدید شده است.',
  },
  {
    title: 'ISO 9001:2015 — سیستم مدیریت کیفیت',
    text: 'گواهی سیستم مدیریت کیفیت برای تولید لوله کاروگیت با قطر ۱۱۰ تا ۱۰۰۰ میلیمتر و لوله اسپیرال کاروگیت با قطر ۸۰۰ تا ۲۰۰۰ میلیمتر، صادرشده از BRSM و معتبر تا آذر ۱۴۰۷.',
  },
  {
    title: 'گزارش آزمون آزمایشگاه کنترل کیفیت',
    text: 'نمونه گزارش آزمون لوله کاروگیت ۳۱۵ میلیمتر SN8 در آزمایشگاه کارخانه: ابعاد، سختی حلقوی کوتاه‌مدت و بلندمدت (۳۲٫۵۹ کیلونیوتن بر مترمربع)، درصد و پراکندگی دوده، MFI، OIT، چگالی، آب‌بندی، ضربه و آزمون آون — همه در محدوده قابل قبول.',
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
      <JsonLd data={breadcrumbSchema([{ name: 'گواهینامه‌ها', path: '/certificates' }])} />
      <JsonLd data={manufacturer} />
      <PageHero label="اعتبار و کیفیت" title={TITLE} description={`مدارک رسمی کیفیت و استاندارد تولید ${siteConfig.legalName}. برای دیدن هر سند روی آن بزنید.`} />

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

        <div className="mt-8">
          <CertificatesGrid certificates={certificates} />
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {STANDARDS.map((s) => (
            <article key={s.title} className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5">
              <h2 className="flex items-start gap-2 font-black text-base leading-7 num">
                <BadgeCheck className="w-5 h-5 mt-1 shrink-0 text-emerald-600" />
                <span><LtrCodes text={s.title} /></span>
              </h2>
              <p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)] num"><LtrCodes text={s.text} /></p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
