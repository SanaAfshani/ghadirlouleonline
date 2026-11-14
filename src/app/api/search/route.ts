import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/prisma';
import { serializeBlogPost, toProductListItem } from '@/shared/lib/serializers';
import { getMarketNow } from '@/shared/lib/price-board';
import { categoryRank, productRank } from '@/shared/lib/catalog';
import { faDigits, latinDigits } from '@/shared/lib/utils';
import { defaultLocale, isLocale } from '@/shared/i18n/config';
import { localizeRecord } from '@/shared/lib/translations';

export async function GET(request: NextRequest) {
  try {
    const params = new URL(request.url).searchParams;
    const q = params.get('q')?.trim() || '';
    // زبان صفحه جستجو: نام‌ها و عنوان‌های نتیجه به همان زبان؛ پارامتر نامعتبر یعنی فارسی (رفتار قبلی)
    const lang = params.get('locale') ?? undefined;
    const locale = isLocale(lang) ? lang : defaultLocale;

    if (!q) {
      return NextResponse.json({
        success: true,
        data: { products: [], posts: [], projects: [] },
      });
    }

    // نام محصولات با رقم فارسی است («لوله کاروگیت ۴۰۰») ولی کاربر اغلب با رقم لاتین می‌نویسد
    const terms = [...new Set([q, faDigits(q), latinDigits(q)])];
    // در نسخه انگلیسی متن ترجمه (ستون translations، JSON) هم جستجو می‌شود؛ بدون حساسیت به حروف بزرگ/کوچک
    const inTranslations = locale === defaultLocale ? [] : [{ translations: { contains: q, mode: 'insensitive' as const } }];
    // «کاروگیت ۴۰۰» در توضیحات صفحه‌های ۳۱۵ و ۵۰۰ هم آمده (لینک سایز همسایه)؛ صفحه‌ای که نامش می‌خورد اول بیاید
    const nameMiss = (name: string) => (terms.some((t) => name.toLowerCase().includes(t.toLowerCase())) ? 0 : 1);
    const market = await getMarketNow();
    const [products, posts, projects] = await Promise.all([
      prisma.product.findMany({
        where: {
          published: true,
          OR: [
            ...terms.flatMap((t) => [
              { name: { contains: t } },
              { shortDescription: { contains: t } },
              { description: { contains: t } },
            ]),
            ...inTranslations,
          ],
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
            ...inTranslations,
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
            ...inTranslations,
          ],
        },
        take: 6,
        orderBy: [{ featured: 'desc' }, { year: 'desc' }],
      }),
    ]);

    const localizedProducts = products.map((p) => ({ ...localizeRecord(p, locale, 'name'), category: localizeRecord(p.category, locale, 'name') }));

    return NextResponse.json({
      success: true,
      data: {
        products: localizedProducts
          .sort(
            (a, b) =>
              nameMiss(a.name) - nameMiss(b.name) ||
              categoryRank(a.category.slug) - categoryRank(b.category.slug) ||
              productRank(a.slug) - productRank(b.slug),
          )
          .map((p) => toProductListItem(p, { showPrices: market.open })),
        posts: posts.map((p) => localizeRecord(serializeBlogPost(p), locale, 'title')),
        projects: projects.map((project) => {
          const p = localizeRecord(project, locale, 'title');
          return {
            id: p.id,
            title: p.title,
            slug: p.slug,
            description: p.description ?? '',
            location: p.location ?? '',
            year: p.year,
          };
        }),
      },
    });
  } catch (error) {
    console.error('Search GET error:', error);
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 });
  }
}
