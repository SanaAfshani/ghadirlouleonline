import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/prisma';
import { requireAdmin } from '@/shared/lib/admin-auth';
import { serverErrorResponse } from '@/shared/lib/api-errors';
import { text, toPrice } from '@/shared/lib/price-admin';
import { applyPricePerKg } from '@/shared/lib/price-per-kg';
import { pingIndexNow } from '@/shared/lib/indexnow';

/** ثبت قیمت روز هر کیلو — خالی یعنی فرمول خاموش و قیمت ردیف‌ها دستی */
export async function PUT(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await request.json();
    const productId = text(body.productId, 64);
    if (!productId || !(await prisma.product.findUnique({ where: { id: productId }, select: { id: true } }))) {
      return NextResponse.json({ success: false, error: 'محصول یافت نشد' }, { status: 404 });
    }
    const pricePerKg = toPrice(body.pricePerKg);
    const result = await applyPricePerKg(productId, pricePerKg);
    // قیمت عوض شد — صفحه قیمت‌ها و صفحه اول را همین حالا به موتورها خبر بده، نه هفته بعد
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { slug: true, category: { select: { slug: true } } },
    });
    pingIndexNow([
      '/',
      '/prices',
      ...(product ? [`/products/${product.category.slug}/${product.slug}`] : []),
    ]);
    return NextResponse.json({ success: true, data: { pricePerKg, ...result } });
  } catch (error) {
    return serverErrorResponse(error, 'Admin price per kg error:');
  }
}
