import { cache } from 'react';
import { prisma } from '@/shared/lib/prisma';
import { getSiteSettingsMap } from '@/shared/lib/site-settings-store';
import { getMarketStatus, parseMarketConfig, type MarketStatus } from '@/shared/lib/market';
import type { PriceBoard } from '@/shared/lib/price-board-types';
import { categoryRank } from '@/shared/lib/catalog';
import { siteConfig } from '@/shared/config/site';

export * from '@/shared/lib/price-board-types';

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

  const lines = products
    .sort((a, b) => categoryRank(a.category.slug) - categoryRank(b.category.slug) || a.category.order - b.category.order || a.name.localeCompare(b.name, 'fa'))
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
        price: market.open ? i.price : null,
        previousPrice: market.open ? i.previousPrice : null,
        note: i.note,
        priceChangedAt: i.priceChangedAt.toISOString(),
      })),
    }));

  return { market, version, lines };
});
