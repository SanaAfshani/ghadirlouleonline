import type { Metadata } from 'next';
import { Link } from '@/shared/i18n/Link';
import { SearchPageClient } from '@/features/search/SearchPageClient';
import { defineMessages } from '@/shared/i18n/messages';
import { resolveLocale } from '@/shared/i18n/server';
import { getSection } from '@/shared/content/server';
import { staticPageMetadata } from '@/shared/content/metadata';
import { searchHero, searchSeo, searchSuggestions } from '@/shared/content/pages/search';

type Props = { params: Promise<{ lang: string }> };

const messages = defineMessages({
  fa: { home: 'خانه' },
  en: { home: 'Home' },
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await resolveLocale(params);
  return {
    ...staticPageMetadata(await getSection(searchSeo, locale), '/search', locale),
    // صفحه نتایج جستجوی داخلی — طبق راهنمای گوگل ایندکس نشود، ولی لینک‌هایش دنبال شود
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({ params }: Props) {
  const locale = await resolveLocale(params);
  const [hero, suggestions] = await Promise.all([getSection(searchHero, locale), getSection(searchSuggestions, locale)]);
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="bg-[var(--ink)] bp-grid relative overflow-hidden">
        <div className="container-main relative z-10 py-10 md:py-14">
          <nav className="flex items-center gap-2 text-xs text-slate-500 mb-4">
            <Link href="/" className="hover:text-slate-300 transition-colors">{messages[locale].home}</Link>
            <span>/</span>
            <span className="text-[var(--accent-text)]">{hero.title}</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">{hero.title}</h1>
          <p className="text-slate-400 text-sm">{hero.description}</p>
        </div>
      </div>
      <SearchPageClient hero={hero} suggestions={suggestions.items.map((item) => item.term)} />
    </div>
  );
}
