import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getQuoteByToken, serializePublicQuote } from '@/shared/lib/quotes';
import { getSiteSettingsMap } from '@/shared/lib/site-settings-store';
import { mergeSiteSettings } from '@/shared/lib/site-settings';
import { QuoteView } from '@/features/quotes/QuoteView';
import { siteConfig } from '@/shared/config/site';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ token: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const quote = await getQuoteByToken(token);
  if (!quote) return { title: 'پیش‌فاکتور', robots: { index: false, follow: false } };
  return {
    title: `پیش‌فاکتور ${quote.number}`,
    description: `پیش‌فاکتور ${quote.number} — ${siteConfig.name}`,
    robots: { index: false, follow: false },
    alternates: { canonical: `${siteConfig.url}/q/${token}` },
  };
}

export default async function PublicQuotePage({ params }: Props) {
  const { token } = await params;
  const [quote, settingsMap] = await Promise.all([getQuoteByToken(token), getSiteSettingsMap()]);
  if (!quote) notFound();

  // ردشده / پیش‌نویس مخفی؛ درخواست‌شده صفحه «در انتظار تأیید» می‌بیند؛ فقط صادرشده سند کامل دارد
  if (quote.status === 'REJECTED' || quote.status === 'DRAFT' || quote.status === 'EXPIRED') notFound();

  const settings = mergeSiteSettings(settingsMap);
  return <QuoteView quote={serializePublicQuote(quote)} settings={settings} />;
}
