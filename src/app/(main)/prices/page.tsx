export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import Link from 'next/link';
import { getPriceBoard, groupLinesByCategory } from '@/shared/lib/price-board';
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
    // images: openGraph صفحه جایگزین openGraph روت می‌شود و تصویر opengraph-image.tsx را با خودش می‌برد
    openGraph: { title, description, url: `${siteConfig.url}/prices`, type: 'website', images: '/opengraph-image' },
  };
}

export default async function PricesPage() {
  const board = await getPriceBoard();
  const groups = groupLinesByCategory(board.lines);

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
                {faDigits(board.lines.reduce((n, l) => n + l.items.length, 0))} قیمت در {faDigits(groups.length)} گروه محصول
              </p>
            </div>

            {/* پرش سریع — در موبایل زیر هدر می‌چسبد */}
            <nav aria-label="گروه‌های قیمت" className="sticky top-[var(--nav-height)] z-20 -mx-4 px-4 sm:mx-0 sm:px-0 py-3 mb-6 bg-[var(--background)]/90 backdrop-blur-xl border-b border-[var(--border)]">
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
                    <h2 id={`h-${g.categorySlug}`} className="text-xl sm:text-2xl font-black">قیمت {g.categoryName}</h2>
                    <Link href={g.href} className="text-sm font-bold text-[var(--accent-text)] shrink-0">همه سایزها ←</Link>
                  </div>
                  <LivePriceTable initial={board} productIds={g.productIds} showProduct={g.productIds.length > 1} caption={`قیمت ${g.categoryName}`} toolbar />
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
