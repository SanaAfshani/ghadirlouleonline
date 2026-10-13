import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/prisma';
import { requireAdmin } from '@/shared/lib/admin-auth';
import { serverErrorResponse } from '@/shared/lib/api-errors';
import { priceFromWeight } from '@/shared/lib/price-admin';
import { applyPricePerKg } from '@/shared/lib/price-per-kg';

/** افزایش/کاهش درصدی همه قیمت‌های یک محصول — برای وقتی کل بازار یک کالا جابه‌جا می‌شود */
export async function POST(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const { productId, percent, roundTo = 1 } = await request.json();
    const pct = Number(percent);
    const step = [1, 10, 100, 1000].includes(Number(roundTo)) ? Number(roundTo) : 1;
    if (!productId || !Number.isFinite(pct) || pct === 0 || pct <= -90 || pct > 500) {
      return NextResponse.json({ success: false, error: 'درصد معتبر نیست' }, { status: 400 });
    }
    const id = String(productId);
    const bump = (n: number) => Math.max(step, Math.round((n * (1 + pct / 100)) / step) * step);
    const product = await prisma.product.findUnique({ where: { id }, select: { pricePerKg: true } });

    // با قیمت روز هر کیلو، درصد روی خود قیمت روز می‌نشیند تا ردیف‌ها از فرمول وزن × قیمت روز خارج نشوند
    let updated = 0;
    let pricePerKg = product?.pricePerKg ?? null;
    if (pricePerKg) {
      pricePerKg = bump(pricePerKg);
      updated += (await applyPricePerKg(id, pricePerKg)).updated;
    }

    const items = (await prisma.priceItem.findMany({ where: { productId: id, price: { not: null } } }))
      .filter((i) => priceFromWeight(i.weight, pricePerKg) === undefined);
    const now = new Date();
    await prisma.$transaction(
      items.map((i) => {
        const price = bump(i.price!);
        return prisma.priceItem.update({
          where: { id: i.id },
          data: { previousPrice: i.price, price, priceChangedAt: now, history: { create: { price, recordedAt: now } } },
        });
      }),
    );
    return NextResponse.json({ success: true, data: { updated: updated + items.length, pricePerKg } });
  } catch (error) {
    return serverErrorResponse(error, 'Admin prices bulk error:');
  }
}
