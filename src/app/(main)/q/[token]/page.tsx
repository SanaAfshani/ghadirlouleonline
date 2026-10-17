import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FileClock, FileX2, Headphones, Table2 } from 'lucide-react';
import { ErrorState, stateButton } from '@/shared/ui/ErrorState';
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

  // پیش‌نویس مخفی است؛ ردشده و منقضی صفحه وضعیت خودشان را دارند (نه ۴۰۴ گیج‌کننده)؛ درخواست‌شده و صادرشده سند را می‌بینند
  if (quote.status === 'DRAFT') notFound();
  if (quote.status === 'REJECTED' || quote.status === 'EXPIRED') {
    const rejected = quote.status === 'REJECTED';
    return (
      <ErrorState
        icon={rejected ? FileX2 : FileClock}
        tone={rejected ? 'rose' : 'accent'}
        title={rejected ? `پیش‌فاکتور ${quote.number} تأیید نشد` : `اعتبار پیش‌فاکتور ${quote.number} تمام شده است`}
        description={
          rejected
            ? 'کارشناس فروش این درخواست را تأیید نکرد (مثلاً به‌خاطر موجودی یا تغییر قیمت). برای ثبت دوباره یا هماهنگی با فروش تماس بگیرید.'
            : 'قیمت‌ها روزانه تغییر می‌کنند. با قیمت روز پیش‌فاکتور جدید بسازید یا برای تمدید با فروش تماس بگیرید.'
        }
      >
        <Link href="/prices" className={stateButton.primary}><Table2 className="w-4 h-4" />پیش‌فاکتور جدید با قیمت روز</Link>
        <Link href="/contact" className={stateButton.secondary}><Headphones className="w-4 h-4" />تماس با فروش</Link>
      </ErrorState>
    );
  }

  const settings = mergeSiteSettings(settingsMap);
  return <QuoteView quote={serializePublicQuote(quote)} settings={settings} />;
}
