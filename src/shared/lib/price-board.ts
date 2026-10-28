import { cache } from 'react';
import { prisma } from '@/shared/lib/prisma';
import { getSiteSettingsMap } from '@/shared/lib/site-settings-store';
import { getMarketStatus, parseMarketConfig, type MarketStatus } from '@/shared/lib/market';
import type { PriceBoard } from '@/shared/lib/price-board-types';
import { categoryRank, productRank } from '@/shared/lib/catalog';
import { siteConfig } from '@/shared/config/site';

export * from '@/shared/lib/price-board-types';

/** قیمت قدیمی‌تر از این، دیگر نمایش داده نمی‌شود */
const STALE_AFTER_DAYS = 7;
const isFresh = (changedAt: Date, now: number) =>
  now - changedAt.getTime() < STALE_AFTER_DAYS * 24 * 60 * 60 * 1000;

export const getMarketNow = cache(async (): Promise<MarketStatus> => {
  return getMarketStatus(parseMarketConfig(await getSiteSettingsMap()));
});

/** نسخه ارزان برای polling: بدون خواندن همه ردیف‌ها */
export async function getBoardVersion(): Promise<string> {
  const [market, agg] = await Promise.all([
    getMarketNow(),
    prisma.priceItem.aggregate({ _max: { updatedAt: true }, _count: { _all: true } }),
  ]);
  return `${agg._max.updatedAt?.getTime() ?? 0}.${agg._count._all}.${market.open ? 1 : 0}.${market.mode}`;
}

export const getPriceBoard = cache(async (): Promise<PriceBoard> => {
  const [market, products, version] = await Promise.all([
    getMarketNow(),
    prisma.product.findMany({
      // فقط دسته‌های فعال — قیمت دسته‌های «به زودی» حتی در API زنده هم بیرون نمی‌رود
      where: {
        published: true,
        // محصولِ «فقط استعلام قیمت» هیچ ردیفی در تابلو نمی‌گذارد؛ ردیف‌هایش در دیتابیس می‌مانند
        quoteOnly: false,
        category: { published: true, slug: { notIn: [...siteConfig.comingSoonCategorySlugs] } },
        priceItems: { some: {} },
      },
      select: {
        id: true,
        slug: true,
        name: true,
        category: { select: { slug: true, name: true, order: true } },
        priceItems: { orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] },
      },
    }),
    getBoardVersion(),
  ]);

  const now = Date.now();
  const lines = products
    .sort((a, b) => categoryRank(a.category.slug) - categoryRank(b.category.slug) || a.category.order - b.category.order || productRank(a.slug) - productRank(b.slug) || a.name.localeCompare(b.name, 'fa'))
    .map((p) => ({
      productId: p.id,
      productSlug: p.slug,
      productName: p.name,
      categorySlug: p.category.slug,
      categoryName: p.category.name,
      href: `/products/${p.category.slug}/${p.slug}`,
      items: p.priceItems.map((i) => ({
        id: i.id,
        title: i.title,
        size: i.size,
        grade: i.grade,
        spec: i.spec,
        dimensions: i.dimensions,
        // بیرون از ساعت فروش هم عدد می‌رود، ولی به‌عنوان «آخرین قیمت ثبت‌شده» با تاریخش،
        // نه قیمت قطعی امروز (برچسبش در LivePriceTable).
        //
        // قبلاً اینجا null می‌شد و نتیجه‌اش این بود که بیشتر ساعات شبانه‌روز صفحه قیمت هیچ عددی
        // نداشت — همان صفحه‌ای که کل سئوی سایت رویش بنا شده. خزنده گوگل ساعت کاری نمی‌شناسد و
        // نسخه‌ای که ایندکس می‌کرد بی‌قیمت بود. رقبا هم قیمت لحظه‌ای نمی‌دهند؛ قیمت تاریخ‌دار
        // می‌دهند («قیمت ۲ آبان» در عنوانشان).
        //
        // قیمت کهنه اطلاعات نیست، گمراهی است: اگر از STALE_AFTER_DAYS قدیمی‌تر باشد پنهان می‌شود.
        price: market.open || isFresh(i.priceChangedAt, now) ? i.price : null,
        // درصد تغییر فقط وقتی معنا دارد که قیمت زنده باشد
        previousPrice: market.open ? i.previousPrice : null,
        note: i.note,
        priceChangedAt: i.priceChangedAt.toISOString(),
      })),
    }));

  return { market, version, lines };
});
