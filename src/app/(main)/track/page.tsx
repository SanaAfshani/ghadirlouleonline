import type { Metadata } from 'next';
import { PageHero } from '@/shared/ui/PageHero';
import { TrackOrder } from '@/features/quotes/TrackOrder';
import { siteConfig } from '@/shared/config/site';

export const metadata: Metadata = {
  title: 'پیگیری سفارش',
  description: `پیگیری وضعیت سفارش و پیش‌فاکتور ${siteConfig.name} با شماره پیش‌فاکتور: آماده‌سازی، بارگیری، ارسال و تحویل.`,
  alternates: { canonical: `${siteConfig.url}/track` },
  /**
   * ابزار است، نه صفحه محتوا: بدون شماره پیش‌فاکتور چیزی برای ایندکس ندارد و گوگل هم
   * «Crawled - currently not indexed» گزارشش می‌کرد. لینک‌ها دنبال می‌شوند ولی ایندکس نه.
   */
  robots: { index: false, follow: true },
};

type Props = { searchParams: Promise<{ n?: string }> };

export default async function TrackPage({ searchParams }: Props) {
  const { n } = await searchParams;
  return (
    <>
      <PageHero label="پیگیری سفارش" title="سفارش شما کجاست؟" description="از تأیید فاکتور تا آماده‌سازی در کارخانه، بارگیری و تحویل در محل پروژه — همه مراحل را اینجا ببینید." />
      <TrackOrder initialNumber={typeof n === 'string' ? n.slice(0, 20) : ''} />
    </>
  );
}
