import type { Metadata } from 'next';
import { PageHero } from '@/shared/ui/PageHero';
import { TrackOrder } from '@/features/quotes/TrackOrder';
import { resolveLocale } from '@/shared/i18n/server';
import { getSection } from '@/shared/content/server';
import { staticPageMetadata } from '@/shared/content/metadata';
import { trackHero, trackSeo } from '@/shared/content/pages/prices';

type Props = { params: Promise<{ lang: string }>; searchParams: Promise<{ n?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await resolveLocale(params);
  return {
    ...staticPageMetadata(await getSection(trackSeo, locale), '/track', locale),
    /**
     * ابزار است، نه صفحه محتوا: بدون شماره پیش‌فاکتور چیزی برای ایندکس ندارد و گوگل هم
     * «Crawled - currently not indexed» گزارشش می‌کرد. لینک‌ها دنبال می‌شوند ولی ایندکس نه.
     */
    robots: { index: false, follow: true },
  };
}

export default async function TrackPage({ params, searchParams }: Props) {
  const [locale, { n }] = await Promise.all([resolveLocale(params), searchParams]);
  const hero = await getSection(trackHero, locale);
  return (
    <>
      <PageHero label={hero.label} title={hero.title} description={hero.description} />
      <TrackOrder initialNumber={typeof n === 'string' ? n.slice(0, 20) : ''} />
    </>
  );
}
