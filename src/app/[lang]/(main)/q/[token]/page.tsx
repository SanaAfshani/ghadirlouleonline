import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { FileClock, FileX2, Headphones, Table2 } from 'lucide-react';
import { ErrorState, stateButton } from '@/shared/ui/ErrorState';
import { getQuoteByToken, serializePublicQuote } from '@/shared/lib/quotes';
import { getSiteSettingsMap } from '@/shared/lib/site-settings-store';
import { mergeSiteSettings } from '@/shared/lib/site-settings';
import { QuoteView } from '@/features/quotes/QuoteView';
import { absoluteUrl } from '@/shared/lib/seo';
import { Link } from '@/shared/i18n/Link';
import { localizePath } from '@/shared/i18n/config';
import { defineMessages, fill } from '@/shared/i18n/messages';
import { resolveLocale } from '@/shared/i18n/server';

export const dynamic = 'force-dynamic';

const messages = defineMessages({
  fa: {
    quote: 'پیش‌فاکتور',
    quoteNumber: 'پیش‌فاکتور {number}',
    description: 'پیش‌فاکتور {number} — قدیر لوله آنلاین',
    rejectedTitle: 'پیش‌فاکتور {number} تأیید نشد',
    expiredTitle: 'اعتبار پیش‌فاکتور {number} تمام شده است',
    rejectedText: 'کارشناس فروش این درخواست را تأیید نکرد (مثلاً به‌خاطر موجودی یا تغییر قیمت). برای ثبت دوباره یا هماهنگی با فروش تماس بگیرید.',
    expiredText: 'قیمت‌ها روزانه تغییر می‌کنند. با قیمت روز پیش‌فاکتور جدید بسازید یا برای تمدید با فروش تماس بگیرید.',
    newQuote: 'پیش‌فاکتور جدید با قیمت روز',
    contact: 'تماس با فروش',
  },
  en: {
    quote: 'Quote',
    quoteNumber: 'Quote {number}',
    description: 'Quote {number} — Ghadir Louleh Online',
    rejectedTitle: 'Quote {number} was not approved',
    expiredTitle: 'Quote {number} has expired',
    rejectedText: 'Our sales specialist did not approve this request (for example because of stock or a price change). Contact sales to submit it again or arrange your order.',
    expiredText: 'Prices change daily. Create a new quote at today’s prices, or contact sales to extend it.',
    newQuote: 'New quote at today’s prices',
    contact: 'Contact sales',
  },
});

type Props = { params: Promise<{ lang: string; token: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [locale, { token }] = await Promise.all([resolveLocale(params), params]);
  const t = messages[locale];
  const quote = await getQuoteByToken(token);
  if (!quote) return { title: t.quote, robots: { index: false, follow: false } };
  return {
    title: fill(t.quoteNumber, { number: quote.number }),
    description: fill(t.description, { number: quote.number }),
    robots: { index: false, follow: false },
    alternates: { canonical: absoluteUrl(localizePath(`/q/${token}`, locale)) },
  };
}

export default async function PublicQuotePage({ params }: Props) {
  const [locale, { token }] = await Promise.all([resolveLocale(params), params]);
  const t = messages[locale];
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
        title={fill(rejected ? t.rejectedTitle : t.expiredTitle, { number: quote.number })}
        description={rejected ? t.rejectedText : t.expiredText}
      >
        <Link href="/prices" className={stateButton.primary}><Table2 className="w-4 h-4" />{t.newQuote}</Link>
        <Link href="/contact" className={stateButton.secondary}><Headphones className="w-4 h-4" />{t.contact}</Link>
      </ErrorState>
    );
  }

  const settings = mergeSiteSettings(settingsMap, locale);
  // لینک اشتراک‌گذاری (واتساپ/ایمیل) به همان زبانی که مشتری صفحه را باز کرده
  const publicQuote = { ...serializePublicQuote(quote), publicUrl: absoluteUrl(localizePath(`/q/${token}`, locale)) };
  return <QuoteView quote={publicQuote} settings={settings} />;
}
