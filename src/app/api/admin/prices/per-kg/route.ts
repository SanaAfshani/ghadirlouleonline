import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/prisma';
import { requireAdmin } from '@/shared/lib/admin-auth';
import { serverErrorResponse } from '@/shared/lib/api-errors';
import { text, toPrice } from '@/shared/lib/price-admin';
import { applyPricePerKg } from '@/shared/lib/price-per-kg';
import { pingIndexNow } from '@/shared/lib/indexnow';

/**
 * ثبت قیمت روز هر کیلو — خالی یعنی فرمول خاموش و قیمت ردیف‌ها دستی.
 *
 * قیمت روز مال جنس است نه سایز: هر سایز لوله یک محصول جداست، پس عدد روی همه محصولات هم‌دسته‌ای که
 * فرمولشان روشن است هم می‌نشیند — وگرنه ادمین باید هر روز دوازده بار همین عدد را وارد می‌کرد.
 */
export async function PUT(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await request.json();
    const productId = text(body.productId, 64);
    const product = productId
      ? await prisma.product.findUnique({ where: { id: productId }, select: { categoryId: true } })
      : null;
    if (!productId || !product) {
      return NextResponse.json({ success: false, error: 'محصول یافت نشد' }, { status: 404 });
    }
    const pricePerKg = toPrice(body.pricePerKg);
    const targets = await prisma.product.findMany({
      where: { categoryId: product.categoryId, OR: [{ id: productId }, { pricePerKg: { not: null } }] },
      select: { id: true, slug: true, category: { select: { slug: true } } },
    });
    let updated = 0;
    let missingWeight = 0;
    // پشت سر هم، نه موازی: هر کدام تراکنش خودش را دارد و اتصال‌های دیتابیس محدود است
    for (const t of targets) {
      const r = await applyPricePerKg(t.id, pricePerKg);
      updated += r.updated;
      missingWeight += r.missingWeight;
    }
    // قیمت عوض شد — صفحه قیمت‌ها و صفحه اول را همین حالا به موتورها خبر بده، نه هفته بعد
    pingIndexNow([
      '/',
      '/prices',
      ...targets.map((t) => `/products/${t.category.slug}/${t.slug}`),
    ]);
    return NextResponse.json({ success: true, data: { pricePerKg, updated, missingWeight, products: targets.length } });
  } catch (error) {
    return serverErrorResponse(error, 'Admin price per kg error:');
  }
}
