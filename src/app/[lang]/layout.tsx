import type { Metadata } from 'next';
import { siteConfig } from '@/shared/config/site';
import { getSiteSettingsMap } from '@/shared/lib/data';
import { mergeSiteSettings } from '@/shared/lib/site-settings';
import { localeDir, locales, ogLocale } from '@/shared/i18n/config';
import { resolveLocale } from '@/shared/i18n/server';
import { LocaleProvider } from '@/shared/i18n/LocaleProvider';
import { RootDocument } from '@/shared/ui/RootDocument';

type Props = { params: Promise<{ lang: string }> };

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

/** کد تایید Search Console از پنل «مرکز سئو» (یا متغیر محیطی) در <head> همه صفحات قرار می‌گیرد */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const raw = await getSiteSettingsMap();
  const settings = mergeSiteSettings(raw, locale);
  const google = raw.google_site_verification || process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

  return {
    title: {
      default: `${settings.heroTitle} | ${settings.siteName}`,
      template: `%s | ${settings.siteName}`,
    },
    description: settings.siteDescription,
    keywords: locale === 'fa' ? siteConfig.keywords : undefined,
    authors: [{ name: settings.siteName }],
    metadataBase: new URL(siteConfig.url),
    // canonical اینجا تعریف نمی‌شود: به همه صفحه‌های بدون canonical ارث می‌رسید و آن‌ها را «نسخه دیگر صفحه اصلی» معرفی می‌کرد.
    // هر صفحه canonical خودش را می‌گذارد (صفحه اصلی هم).
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
    },
    // title و description شبکه‌های اجتماعی عمداً اینجا نیست: Next.js فقط وقتی og:title و twitter:title را از
    // عنوان و توضیحات خود صفحه پر می‌کند که لایه بالاتر آن‌ها را تعیین نکرده باشد. قبلاً همه صفحه‌های بدون
    // openGraph اختصاصی (محصولات، وبلاگ، تماس، درباره ما، سوالات متداول) عنوان صفحه اصلی را می‌گرفتند.
    openGraph: {
      type: 'website',
      locale: ogLocale[locale],
      alternateLocale: locales.filter((l) => l !== locale).map((l) => ogLocale[l]),
      siteName: settings.siteName,
    },
    twitter: {
      card: 'summary_large_image',
    },
    applicationName: settings.siteName,
    publisher: settings.siteName,
    creator: settings.siteName,
    category: 'business',
    // شماره تلفن‌ها خودمان لینک شده‌اند؛ تشخیص خودکار مرورگر باعث hydration mismatch می‌شود
    formatDetection: { telephone: false, address: false, email: false },
    ...(google ? { verification: { google } } : {}),
  };
}

export default async function LocaleLayout({ children, params }: Props & { children: React.ReactNode }) {
  const locale = await resolveLocale(params);
  return (
    <RootDocument lang={locale} dir={localeDir[locale]}>
      <LocaleProvider locale={locale}>{children}</LocaleProvider>
    </RootDocument>
  );
}
