import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/prisma';
import { requireAdmin } from '@/shared/lib/admin-auth';
import { serverErrorResponse } from '@/shared/lib/api-errors';
import { bumpProduct, parseBulk } from '@/shared/lib/price-bulk';

export const maxDuration = 60;

/**
 * افزایش/کاهش درصدی قیمت همه محصولات (یا محصولات انتخاب‌شده) — برای اعلام افزایش قیمت کارخانه.
 * productIds خالی یعنی همه محصولاتی که جدول قیمت دارند.
 */
export async function POST(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await request.json();
    const input = parseBulk(body);
    if (!input) return NextResponse.json({ success: false, error: 'درصد معتبر نیست' }, { status: 400 });
    const only: string[] = Array.isArray(body.productIds) ? body.productIds.map(String) : [];
    const products = await prisma.product.findMany({
      where: { priceItems: { some: {} }, ...(only.length && { id: { in: only } }) },
      select: { id: true },
    });
    let updated = 0;
    // محصول به محصول — هر کدام تراکنش خودش؛ خطای یکی بقیه را نیمه‌کاره نمی‌گذارد چون هر محصول کامل اعمال می‌شود
    for (const p of products) updated += (await bumpProduct(p.id, input)).updated;
    return NextResponse.json({ success: true, data: { updated, products: products.length } });
  } catch (error) {
    return serverErrorResponse(error, 'Admin prices bulk-all error:');
  }
}
