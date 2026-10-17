import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/prisma';
import { requireAdmin } from '@/shared/lib/admin-auth';
import { serverErrorResponse } from '@/shared/lib/api-errors';
import { priceFromWeight, specFields, text, toPrice } from '@/shared/lib/price-admin';

/** همه محصولات با ردیف‌های قیمت (قیمت کامل، مستقل از باز/بسته بودن بازار) */
export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true, name: true, slug: true, published: true, pricePerKg: true,
        category: { select: { slug: true, name: true, order: true } },
        priceItems: { orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] },
      },
      orderBy: [{ name: 'asc' }],
    });
    products.sort((a, b) => b.priceItems.length - a.priceItems.length || a.category.order - b.category.order);
    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    return serverErrorResponse(error, 'Admin prices GET error:');
  }
}

export async function POST(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await request.json();
    const productId = text(body.productId, 64);
    const title = text(body.title);
    if (!productId || !title) return NextResponse.json({ success: false, error: 'محصول و عنوان لازم است' }, { status: 400 });
    const [last, product] = await Promise.all([
      prisma.priceItem.findFirst({ where: { productId }, orderBy: { sortOrder: 'desc' }, select: { sortOrder: true } }),
      prisma.product.findUnique({ where: { id: productId }, select: { pricePerKg: true } }),
    ]);
    const weight = text(body.weight, 40);
    const price = priceFromWeight(weight, product?.pricePerKg) ?? toPrice(body.price);
    const item = await prisma.priceItem.create({
      data: {
        productId, title, price,
        ...(price != null && { history: { create: { price } } }),
        ...specFields(body),
        weight,
        note: text(body.note),
        sortOrder: (last?.sortOrder ?? -1) + 1,
      },
    });
    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (error) {
    return serverErrorResponse(error, 'Admin prices POST error:');
  }
}
