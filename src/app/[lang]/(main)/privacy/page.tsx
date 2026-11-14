import type { Metadata } from 'next';
import { JsonLd } from '@/shared/ui/JsonLd';
import { PageHero } from '@/shared/ui/PageHero';
import { RichText } from '@/shared/ui/RichText';
import { breadcrumbSchema } from '@/shared/lib/seo';
import { getSiteSettingsMap } from '@/shared/lib/data';
import { mergeSiteSettings } from '@/shared/lib/site-settings';
import { resolveLocale } from '@/shared/i18n/server';
import { getSection } from '@/shared/content/server';
import { staticPageMetadata } from '@/shared/content/metadata';
import { fillLegalHtml, privacyBody, privacyHero, privacySeo } from '@/shared/content/pages/legal';

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await resolveLocale(params);
  return staticPageMetadata(await getSection(privacySeo, locale), '/privacy', locale);
}

/** متن از پنل «محتوای صفحات» (shared/content/pages/legal.ts) */
export default async function PrivacyPage({ params }: Props) {
  const locale = await resolveLocale(params);
  const [raw, hero, body] = await Promise.all([getSiteSettingsMap(), getSection(privacyHero, locale), getSection(privacyBody, locale)]);
  const settings = mergeSiteSettings(raw, locale);

  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: hero.title, path: '/privacy' }], locale)} />
      <PageHero label={hero.label} title={hero.title} description={hero.description} />

      <div className="container-main section-padding-sm max-w-3xl">
        <article>
          <RichText html={fillLegalHtml(body.html, { email: settings.email })} className="article-content" />
        </article>
      </div>
    </>
  );
}
