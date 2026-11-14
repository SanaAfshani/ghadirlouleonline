import type { Metadata } from 'next';
import Image from 'next/image';
import { BadgeCheck, Check, ChevronLeft, FileSignature, Globe } from 'lucide-react';
import { PageHero } from '@/shared/ui/PageHero';
import { JsonLd } from '@/shared/ui/JsonLd';
import { RichText } from '@/shared/ui/RichText';
import { Link } from '@/shared/i18n/Link';
import { siteConfig } from '@/shared/config/site';
import { absoluteUrl, breadcrumbSchema } from '@/shared/lib/seo';
import { getSiteSettingsMap } from '@/shared/lib/data';
import { mergeSiteSettings } from '@/shared/lib/site-settings';
import { localeTag, localizePath } from '@/shared/i18n/config';
import { digits } from '@/shared/i18n/format';
import { defineMessages, fill } from '@/shared/i18n/messages';
import { resolveLocale } from '@/shared/i18n/server';
import { getSection } from '@/shared/content/server';
import { staticPageMetadata } from '@/shared/content/metadata';
import {
  officialRepresentativeAside,
  officialRepresentativeHero,
  officialRepresentativeLetter,
  officialRepresentativeSeo,
} from '@/shared/content/pages/official-representative';

/**
 * پیام رسمی قدیر لوله پاسارگاد درباره نمایندگی قدیر لوله آنلاین — متن نامه (پنل محتوا) عیناً همان متن رسمی شرکت است.
 * صفحه برای جستجوی «نماینده رسمی قدیر لوله پاسارگاد» ساخته شده و جایگاه «تنها نماینده انحصاری»
 * در هدر، هیرو و فوتر به آن لینک می‌دهد.
 */

type Props = { params: Promise<{ lang: string }> };

const PATH = '/official-representative';
/** ابعاد تصویر پیش‌فرض گواهی — برای عکس دیگری که از پنل گذاشته شود ابعاد در og نمی‌آید */
const DEFAULT_CERTIFICATE = { src: '/images/site/representation-certificate.webp', width: 1000, height: 1410 };

const messages = defineMessages({
  fa: {
    viewSizes: 'مشاهده سایزها و قیمت',
    keywords: ['نماینده رسمی {legalName}', 'نمایندگی {legalName}', '{siteName}', 'امیر یوسفی'],
  },
  en: {
    viewSizes: 'View sizes and prices',
    keywords: ['{legalName} official representative', '{legalName} agent', '{siteName}', 'Amir Yousefi'],
  },
});

/**
 * متن HTML نامه: پاراگراف برجسته داخل blockquote و عنوان‌ها h2 — همان فاصله‌ها و قاب نسخه قبلیِ کدنویسی‌شده.
 * جمله پایانی پررنگ (strong) در «سخن پایانی» font-black است.
 */
const letterHtml =
  '[&>*+*]:mt-3 [&>blockquote]:mt-5 [&>blockquote+p]:mt-5 [&>blockquote]:rounded-[var(--radius-panel)] [&>blockquote]:border-s-4 [&>blockquote]:border-[var(--accent)] [&>blockquote]:bg-[var(--card)] [&>blockquote]:px-5 [&>blockquote]:py-4 [&>blockquote]:font-bold [&>h2]:mt-10 [&>h2]:text-xl sm:[&>h2]:text-2xl [&>h2]:font-black';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const [seo, letter, aside, raw] = await Promise.all([
    getSection(officialRepresentativeSeo, locale),
    getSection(officialRepresentativeLetter, locale),
    getSection(officialRepresentativeAside, locale),
    getSiteSettingsMap(),
  ]);
  const settings = mergeSiteSettings(raw, locale);
  const dimensions = aside.image === DEFAULT_CERTIFICATE.src ? { width: DEFAULT_CERTIFICATE.width, height: DEFAULT_CERTIFICATE.height } : {};
  return {
    ...staticPageMetadata(seo, PATH, locale),
    keywords: messages[locale].keywords.map((k) => fill(k, { legalName: settings.legalName, siteName: settings.siteName })),
    openGraph: {
      title: seo.metaTitle,
      description: seo.metaDescription,
      url: absoluteUrl(localizePath(PATH, locale)),
      type: 'article',
      ...(letter.published && { publishedTime: letter.published }),
      ...(aside.image && { images: [{ url: aside.image, ...dimensions, alt: aside.imageAlt }] }),
    },
  };
}

export default async function OfficialRepresentativePage({ params }: Props) {
  const locale = await resolveLocale(params);
  const t = messages[locale];
  const [raw, seo, hero, letter, aside] = await Promise.all([
    getSiteSettingsMap(),
    getSection(officialRepresentativeSeo, locale),
    getSection(officialRepresentativeHero, locale),
    getSection(officialRepresentativeLetter, locale),
    getSection(officialRepresentativeAside, locale),
  ]);
  const settings = mergeSiteSettings(raw, locale);
  const url = absoluteUrl(localizePath(PATH, locale));
  const manufacturer = {
    '@type': 'Organization',
    name: settings.legalName,
    alternateName: locale === 'fa' ? siteConfig.legalNameEn : siteConfig.legalName,
    url: siteConfig.manufacturerUrl,
  };
  const site = { '@type': 'Organization', name: settings.siteName, url: siteConfig.url };

  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: seo.metaTitle, path: PATH }], locale)} />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: hero.title,
          description: seo.metaDescription,
          inLanguage: localeTag[locale],
          url,
          mainEntityOfPage: url,
          ...(letter.published && { datePublished: letter.published }),
          ...(aside.image && { image: absoluteUrl(aside.image) }),
          author: { '@type': 'Person', name: letter.signerName, jobTitle: letter.signerRole, worksFor: manufacturer },
          publisher: site,
          // فقط آنچه در نامه آمده: موضوع نامه دو مجموعه‌اند؛ ادعای زیرمجموعه بودن یا مؤسس در schema نمی‌آید
          about: [site, manufacturer],
        }}
      />

      <PageHero label={hero.label} title={hero.title} />

      <article className="section-padding-sm">
        <div className="container-main grid gap-10 lg:grid-cols-[1fr_340px] items-start">
          <div className="max-w-3xl text-[15px] sm:text-base leading-9">
            {letter.note && <p className="mb-6 text-sm leading-7 italic text-[var(--muted-foreground)]">{letter.note}</p>}

            <RichText html={letter.opening} className={letterHtml} />
            {letter.goals.length > 0 && (
              <ul className="mt-4 grid gap-2.5">
                {letter.goals.map((g) => (
                  <li key={g.id} className="flex items-start gap-2.5">
                    <span className="mt-2 grid place-items-center w-5 h-5 rounded-full bg-[var(--accent)] text-[var(--accent-foreground)] shrink-0">
                      <Check className="w-3 h-3" strokeWidth={3} />
                    </span>
                    {g.text}
                  </li>
                ))}
              </ul>
            )}

            <RichText html={letter.productsIntro} className={letterHtml} />
            {letter.products.length > 0 && (
              <ol className="mt-4 grid gap-3">
                {letter.products.map((p, i) => (
                  <li key={p.id} className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--card)] p-4 sm:p-5">
                    <h3 className="font-black text-base sm:text-lg">
                      <span className="num">{digits(i + 1, locale)}.</span> {p.title}
                    </h3>
                    <p className="mt-1.5 text-[var(--muted-foreground)] leading-8">{p.text}</p>
                    {p.link && (
                      <Link href={p.link} className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-[var(--accent-text)] hover:underline">
                        {t.viewSizes}<ChevronLeft className="w-4 h-4 ltr:rotate-180" />
                      </Link>
                    )}
                  </li>
                ))}
              </ol>
            )}

            <RichText html={letter.closing} className={`${letterHtml} [&_strong]:font-black`} />

            <footer className="mt-8 flex items-center gap-3 border-t border-[var(--border)] pt-6">
              <FileSignature className="w-6 h-6 text-[var(--accent-text)] shrink-0" aria-hidden />
              <p className="leading-7">
                <span className="block text-sm text-[var(--muted-foreground)]">{letter.regards}</span>
                <span className="block font-bold">{letter.signerRole}</span>
                <span className="block font-black text-lg">{letter.signerName}</span>
              </p>
            </footer>
          </div>

          <aside className="lg:sticky lg:top-[calc(var(--nav-height)+1.5rem)] grid gap-4">
            {aside.image && (
              <figure className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--card)] p-3">
                <Image
                  src={aside.image}
                  alt={aside.imageAlt}
                  width={DEFAULT_CERTIFICATE.width}
                  height={DEFAULT_CERTIFICATE.height}
                  sizes="(min-width: 1024px) 340px, 100vw"
                  className="w-full h-auto rounded-[var(--radius-control)]"
                />
                {aside.caption && <figcaption className="mt-3 text-center text-sm font-bold">{aside.caption}</figcaption>}
              </figure>
            )}
            <a
              href={siteConfig.manufacturerUrl}
              target="_blank"
              rel="noopener"
              className="flex items-center justify-center gap-2 h-11 rounded-[var(--radius-control)] border border-[var(--accent)] text-[var(--accent-text)] text-sm font-bold hover:bg-[var(--accent)]/5"
            >
              <Globe className="w-4 h-4" />{aside.manufacturerLabel}
            </a>
            <Link
              href="/certificates"
              className="flex items-center justify-center gap-2 h-11 rounded-[var(--radius-control)] border border-[var(--border)] text-sm font-bold hover:border-[var(--accent)]"
            >
              <BadgeCheck className="w-4 h-4" />{aside.certificatesLabel}
            </Link>
            <Link
              href="/factory"
              className="flex items-center justify-center gap-2 h-11 rounded-[var(--radius-control)] bg-[var(--foreground)] text-[var(--background)] text-sm font-bold"
            >
              {aside.factoryLabel}<ChevronLeft className="w-4 h-4 ltr:rotate-180" />
            </Link>
          </aside>
        </div>
      </article>
    </>
  );
}
