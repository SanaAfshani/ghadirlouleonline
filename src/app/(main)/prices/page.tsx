export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import Link from 'next/link';
import { getPriceBoard } from '@/shared/lib/price-board';
import { siteConfig } from '@/shared/config/site';
import { JsonLd } from '@/shared/ui/JsonLd';
import { PageHero } from '@/shared/ui/PageHero';
import { LivePriceTable } from '@/features/prices/LivePriceTable';
import { MarketStatus } from '@/features/prices/MarketStatus';
import { PricesEmptyState } from '@/features/prices/PricesEmptyState';
import { breadcrumbSchema } from '@/shared/lib/seo';
import { faDigits } from '@/shared/lib/utils';
import { Reveal } from '@/shared/ui/Reveal';

/** سال شمسی جاری در عنوان — مثل «قیمت لوله ۱۴۰۵» که کاربران دقیقاً همین را جستجو می‌کنند */
function persianYear() {
  return new Intl.DateTimeFormat('fa-IR-u-ca-persian', { year: 'numeric' }).format(new Date());
}

/** نام دسته‌هایی که الان در تابلوی قیمت هستند (فقط دسته‌های فعال) — عنوان صفحه با محتوای واقعی آن یکی بماند */
function boardCategoryNames(board: Awaited<ReturnType<typeof getPriceBoard>>) {
  const names = [...new Set(board.lines.map((l) => l.categoryName))];
  return names.length && names.length <= 3 ? names.join('، ') : 'لوله و اتصالات';
}

export async function generateMetadata(): Promise<Metadata> {
  const year = persianYear();
  const names = boardCategoryNames(await getPriceBoard());
  const title = `لیست قیمت روز ${names} ${year}`;
  const description = `قیمت روز ${names} در سال ${year} به تفکیک سایز. فروش مستقیم از کارخانه، استعلام قیمت عمده و ارسال به سراسر کشور.`;
  return {
    title,
    description,
    alternates: { canonical: `${siteConfig.url}/prices` },
    openGraph: { title, description, url: `${siteConfig.url}/prices`, type: 'website' },
  };
}

export default async function PricesPage() {
  const board = await getPriceBoard();

  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: 'لیست قیمت', path: '/prices' }])} />
      <PageHero
        label="قیمت لحظه‌ای"
        title={`لیست قیمت ${boardCategoryNames(board)} ${persianYear()}`}
        description="قیمت هر محصول به تفکیک سایز و فشار کاری. با دکمه «سفارش» ردیف را به پیش‌فاکتور اضافه کنید؛ پس از تأیید کارشناس، پیش‌فاکتور قابل چاپ و دانلود صادر می‌شود. هزینه حمل جداگانه اعلام می‌گردد."
      />

      <div className="container-main section-padding-sm">
        {board.lines.length === 0 ? (
          <PricesEmptyState />
        ) : (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <MarketStatus market={board.market} />
              <p className="text-xs text-[var(--muted-foreground)] num">
                {faDigits(board.lines.reduce((n, l) => n + l.items.length, 0))} قیمت در {faDigits(board.lines.length)} گروه محصول
              </p>
            </div>

            {/* پرش سریع — در موبایل زیر هدر می‌چسبد */}
            <nav aria-label="گروه‌های قیمت" className="sticky top-[var(--nav-height)] z-20 -mx-4 px-4 sm:mx-0 sm:px-0 py-3 mb-6 bg-[var(--background)]/90 backdrop-blur-xl border-b border-[var(--border)]">
              <div className="snap-row">
                {board.lines.map((l) => (
                  <a key={l.productId} href={`#${l.productSlug}`} className="h-9 px-4 rounded-lg border border-[var(--border)] text-sm font-bold flex items-center whitespace-nowrap hover:border-[var(--foreground)]/40">
                    {l.productName}
                  </a>
                ))}
              </div>
            </nav>

            <div className="space-y-14">
              {board.lines.map((l) => (
                <Reveal key={l.productId}>
                <section id={l.productSlug} className="scroll-mt-44" aria-labelledby={`h-${l.productSlug}`}>
                  <div className="flex items-end justify-between gap-3 mb-4">
                    <div>
                      <p className="text-xs text-[var(--muted-foreground)]">{l.categoryName}</p>
                      <h2 id={`h-${l.productSlug}`} className="text-xl sm:text-2xl font-black">قیمت {l.productName}</h2>
                    </div>
                    <Link href={l.href} className="text-sm font-bold text-[var(--accent-text)] shrink-0">صفحه محصول ←</Link>
                  </div>
                  <LivePriceTable initial={board} productIds={[l.productId]} caption={`قیمت ${l.productName}`} toolbar />
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
