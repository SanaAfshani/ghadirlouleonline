import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageHero } from '@/shared/ui/PageHero';
import { CertificatesGrid } from '@/features/certificates/Certificates';
import { getSiteSettingsMap } from '@/shared/lib/site-settings-store';
import { parseCertificates } from '@/shared/lib/site-settings';
import { siteConfig } from '@/shared/config/site';

export const metadata: Metadata = {
  title: 'گواهینامه‌ها و استانداردها',
  description: `گواهینامه‌های کیفیت و استانداردهای محصولات ${siteConfig.legalName} — مدارک رسمی تولید لوله کاروگیت و پلی اتیلن.`,
  alternates: { canonical: `${siteConfig.url}/certificates` },
};

export default async function CertificatesPage() {
  const certificates = parseCertificates((await getSiteSettingsMap()).certificates);
  // تا وقتی گواهی‌ای ثبت نشده صفحه وجود ندارد — صفحه خالی برای گوگل و مشتری بد است
  if (!certificates.length) notFound();
  return (
    <>
      <PageHero label="اعتبار و کیفیت" title="گواهینامه‌ها و استانداردها" description={`مدارک رسمی کیفیت و استانداردهای تولید ${siteConfig.legalName}. برای دیدن هر سند روی آن بزنید.`} />
      <section className="container-main section-padding-sm">
        <CertificatesGrid certificates={certificates} />
      </section>
    </>
  );
}
