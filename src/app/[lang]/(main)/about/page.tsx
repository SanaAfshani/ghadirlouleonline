import type { Metadata } from 'next';
import { AboutContent } from './AboutContent';
import { JsonLd } from '@/shared/ui/JsonLd';
import { breadcrumbSchema, organizationSchema } from '@/shared/lib/seo';
import { getSiteSettingsMap } from '@/shared/lib/data';
import { mergeSiteSettings } from '@/shared/lib/site-settings';
import { resolveLocale } from '@/shared/i18n/server';
import { getSection } from '@/shared/content/server';
import { staticPageMetadata } from '@/shared/content/metadata';
import { aboutCta, aboutHero, aboutSeo, aboutStats, aboutStory, aboutTeam, aboutValues } from '@/shared/content/pages/about';

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await resolveLocale(params);
  return staticPageMetadata(await getSection(aboutSeo, locale), '/about', locale);
}

export default async function AboutPage({ params }: Props) {
  const locale = await resolveLocale(params);
  const [raw, hero, stats, story, values, team, cta] = await Promise.all([
    getSiteSettingsMap(),
    getSection(aboutHero, locale),
    getSection(aboutStats, locale),
    getSection(aboutStory, locale),
    getSection(aboutValues, locale),
    getSection(aboutTeam, locale),
    getSection(aboutCta, locale),
  ]);
  const settings = mergeSiteSettings(raw, locale);
  return (
    <>
      <JsonLd data={organizationSchema(settings)} />
      <JsonLd data={breadcrumbSchema([{ name: hero.label, path: '/about' }], locale)} />
      <AboutContent hero={hero} stats={stats} story={story} values={values} team={team} cta={cta} />
    </>
  );
}
