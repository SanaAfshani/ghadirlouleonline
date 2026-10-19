import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isAdmin } from '@/shared/lib/admin-auth';
import { prisma } from '@/shared/lib/prisma';
import { serializeProduct, toProductListItem } from '@/shared/lib/serializers';
import { slugify } from '@/shared/lib/utils';
import { serializeFaqs } from '@/shared/lib/page-faqs';
import { serializeCatalogs } from '@/shared/lib/catalog-files';
import { getMarketNow } from '@/shared/lib/price-board';

/** فیلد متنی اختیاری: رشته خالی را به null تبدیل می‌کند تا fallback سئو درست کار کند */
function optionalText(value: unknown): string | null {
  if (value == null) return null;
  const text = String(value).trim();
  return text || null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const categorySlug = searchParams.get('category');
    const featured = searchParams.get('featured') === 'true';
    const search = searchParams.get('search');
    const admin = searchParams.get('admin') === 'true' && isAdmin(request);

    const where: Record<string, unknown> = {};
    if (!admin) where.published = true;
    if (categorySlug && categorySlug !== 'all') {
      where.category = { slug: categorySlug };
    }
    if (featured) where.featured = true;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const market = await getMarketNow();
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: admin
        ? products.map(serializeProduct)
        : products.map((p) => toProductListItem(p, { showPrices: market.open })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Products GET error:', error);
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await request.json();
    const name = String(body.name || '').trim();
    if (!name || !body.categoryId) {
      return NextResponse.json({ success: false, error: 'نام و دسته‌بندی الزامی است' }, { status: 400 });
    }

    const slug = slugify(String(body.slug || '').trim() || name);
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description: body.description ? String(body.description) : null,
        shortDescription: body.shortDescription ? String(body.shortDescription) : null,
        price: body.price != null && body.price !== '' ? parseFloat(String(body.price)) : null,
        images: JSON.stringify(body.images || []),
        specifications: JSON.stringify(body.specifications || {}),
        inStock: body.inStock ?? true,
        featured: body.featured ?? false,
        published: body.published ?? true,
        metaTitle: optionalText(body.metaTitle),
        metaDescription: optionalText(body.metaDescription),
        focusKeyword: optionalText(body.focusKeyword),
        ogTitle: optionalText(body.ogTitle),
        ogDescription: optionalText(body.ogDescription),
        faqs: serializeFaqs(body.faqs),
        catalogs: serializeCatalogs(body.catalogs),
        categoryId: body.categoryId,
      },
      include: { category: true },
    });

    return NextResponse.json({ success: true, data: serializeProduct(product) }, { status: 201 });
  } catch (error) {
    console.error('Products POST error:', error);
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 });
  }
}
