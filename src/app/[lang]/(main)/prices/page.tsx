export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { Link } from '@/shared/i18n/Link';
import { getPriceBoard, groupLinesByCategory } from '@/shared/lib/price-board';
import { JsonLd } from '@/shared/ui/JsonLd';
import { PageHero } from '@/shared/ui/PageHero';
import { LivePriceTable } from '@/features/prices/LivePriceTable';
import { MarketStatus } from '@/features/prices/MarketStatus';
import { PricesEmptyState } from '@/features/prices/PricesEmptyState';
import { absoluteUrl, breadcrumbSchema } from '@/shared/lib/seo';
import { Reveal } from '@/shared/ui/Reveal';
import { localizePath, type Locale } from '@/shared/i18n/config';
import { digits } from '@/shared/i18n/format';
import { defineMessages, fill } from '@/shared/i18n/messages';
import { localeAlternates, resolveLocale } from '@/shared/i18n/server';
import { getSection } from '@/shared/content/server';
import { pricesClosedNotice, pricesHero, pricesSeo } from '@/shared/content/pages/prices';

const messages = defineMessages({
  fa: {
    fallbackNames: 'لوله و اتصالات',
    namesSeparator: '، ',
    breadcrumb: 'لیست قیمت',
    summary: '{count} قیمت در {groups} گروه محصول',
    groupsNav: 'گروه‌های قیمت',
    groupHeading: 'قیمت {name}',
    allSizes: 'همه سایزها ←',
  },
  en: {
    fallbackNames: 'pipes and fittings',
    namesSeparator: ', ',
    breadcrumb: 'Price list',
    summary: '{count} prices in {groups} product groups',
    groupsNav: 'Price groups',
    groupHeading: '{name} prices',
    allSizes: 'All sizes →',
  },
});

type Props = { params: Promise<{ lang: string }> };

/**
 * سال جاری در عنوان — مثل «قیمت لوله ۱۴۰۵» که کاربران دقیقاً همین را جستجو می‌کنند.
 * فارسی سال شمسی، انگلیسی سال میلادی.
 */
function currentYear(locale: Locale) {
  const calendar = locale === 'fa' ? 'fa-IR-u-ca-persian' : 'en-US';
  return new Intl.DateTimeFormat(calendar, { year: 'numeric', timeZone: 'Asia/Tehran' }).format(new Date());
}

/** نام دسته‌هایی که الان در تابلوی قیمت هستند (فقط دسته‌های فعال) — عنوان صفحه با محتوای واقعی آن یکی بماند */
function boardCategoryNames(board: Awaited<ReturnType<typeof getPriceBoard>>, locale: Locale) {
  const t = messages[locale];
  const names = [...new Set(board.lines.map((l) => l.categoryName))];
  return names.length && names.length <= 3 ? names.join(t.namesSeparator) : t.fallbackNames;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const [board, seo] = await Promise.all([getPriceBoard(locale), getSection(pricesSeo, locale)]);
  const values = { names: boardCategoryNames(board, locale), year: currentYear(locale) };
  const title = fill(seo.metaTitle, values);
  const description = fill(seo.metaDescription, values);
  return {
    title,
    description,
    ...localeAlternates('/prices', locale),
    // images: openGraph صفحه جایگزین openGraph روت می‌شود و تصویر opengraph-image.tsx را با خودش می‌برد
    openGraph: { title, description, url: absoluteUrl(localizePath('/prices', locale)), type: 'website', images: '/opengraph-image' },
  };
}

export default async function PricesPage({ params }: Props) {
  const locale = await resolveLocale(params);
  const t = messages[locale];
  const [board, hero, closedNotice] = await Promise.all([
    getPriceBoard(locale),
    getSection(pricesHero, locale),
    getSection(pricesClosedNotice, locale),
  ]);
  const groups = groupLinesByCategory(board.lines);

  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: t.breadcrumb, path: '/prices' }], locale)} />
      <PageHero
        label={hero.label}
        title={fill(hero.title, { names: boardCategoryNames(board, locale), year: currentYear(locale) })}
        description={hero.description}
      />

      <div className="container-main section-padding-sm">
        {board.lines.length === 0 ? (
          <PricesEmptyState />
        ) : (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <MarketStatus market={board.market} />
              <p className="text-xs text-[var(--muted-foreground)] num">
                {fill(t.summary, {
                  count: digits(board.lines.reduce((n, l) => n + l.items.length, 0), locale),
                  groups: digits(groups.length, locale),
                })}
              </p>
            </div>

            {/* پرش سریع — در موبایل زیر هدر می‌چسبد */}
            <nav aria-label={t.groupsNav} className="sticky top-[var(--nav-height)] z-20 -mx-4 px-4 sm:mx-0 sm:px-0 py-3 mb-6 bg-[var(--background)]/90 backdrop-blur-xl border-b border-[var(--border)]">
              <div className="snap-row">
                {groups.map((g) => (
                  <a key={g.categorySlug} href={`#${g.categorySlug}`} className="h-9 px-4 rounded-lg border border-[var(--border)] text-sm font-bold flex items-center whitespace-nowrap hover:border-[var(--foreground)]/40">
                    {g.categoryName}
                  </a>
                ))}
              </div>
            </nav>

            <div className="space-y-14">
              {groups.map((g) => (
                <Reveal key={g.categorySlug}>
                <section id={g.categorySlug} className="scroll-mt-44" aria-labelledby={`h-${g.categorySlug}`}>
                  <div className="flex items-end justify-between gap-3 mb-4">
                    <h2 id={`h-${g.categorySlug}`} className="text-xl sm:text-2xl font-black">{fill(t.groupHeading, { name: g.categoryName })}</h2>
                    <Link href={g.href} className="text-sm font-bold text-[var(--accent-text)] shrink-0">{t.allSizes}</Link>
                  </div>
                  <LivePriceTable
                    initial={board}
                    productIds={g.productIds}
                    showProduct={g.productIds.length > 1}
                    caption={fill(t.groupHeading, { name: g.categoryName })}
                    closedNotice={closedNotice}
                    toolbar
                  />
                </section>
                </Reveal>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
