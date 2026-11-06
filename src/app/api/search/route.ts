import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/prisma';
import { serializeBlogPost, toProductListItem } from '@/shared/lib/serializers';
import { getMarketNow } from '@/shared/lib/price-board';
import { categoryRank, productRank } from '@/shared/lib/catalog';
import { faDigits, latinDigits } from '@/shared/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const q = new URL(request.url).searchParams.get('q')?.trim() || '';

    if (!q) {
      return NextResponse.json({
        success: true,
        data: { products: [], posts: [], projects: [] },
      });
    }

    // نام محصولات با رقم فارسی است («لوله کاروگیت ۴۰۰») ولی کاربر اغلب با رقم لاتین می‌نویسد
    const terms = [...new Set([q, faDigits(q), latinDigits(q)])];
    // «کاروگیت ۴۰۰» در توضیحات صفحه‌های ۳۱۵ و ۵۰۰ هم آمده (لینک سایز همسایه)؛ صفحه‌ای که نامش می‌خورد اول بیاید
    const nameMiss = (name: string) => (terms.some((t) => name.includes(t)) ? 0 : 1);
    const market = await getMarketNow();
    const [products, posts, projects] = await Promise.all([
      prisma.product.findMany({
        where: {
          published: true,
          OR: terms.flatMap((t) => [
            { name: { contains: t } },
            { shortDescription: { contains: t } },
            { description: { contains: t } },
          ]),
        },
        include: { category: true },
        take: 12,
        orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
      }),
      prisma.blogPost.findMany({
        where: {
          published: true,
          OR: [
            { title: { contains: q } },
            { excerpt: { contains: q } },
          ],
        },
        include: { author: { select: { id: true, name: true, email: true } } },
        take: 8,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.project.findMany({
        where: {
          published: true,
          OR: [
            { title: { contains: q } },
            { description: { contains: q } },
            { location: { contains: q } },
          ],
        },
        take: 6,
        orderBy: [{ featured: 'desc' }, { year: 'desc' }],
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        products: products
          .sort(
            (a, b) =>
              nameMiss(a.name) - nameMiss(b.name) ||
              categoryRank(a.category.slug) - categoryRank(b.category.slug) ||
              productRank(a.slug) - productRank(b.slug),
          )
          .map((p) => toProductListItem(p, { showPrices: market.open })),
        posts: posts.map(serializeBlogPost),
        projects: projects.map((p) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          description: p.description ?? '',
          location: p.location ?? '',
          year: p.year,
        })),
      },
    });
  } catch (error) {
    console.error('Search GET error:', error);
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 });
  }
}
