import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/prisma';
import { requireAdmin } from '@/shared/lib/admin-auth';
import { serverErrorResponse } from '@/shared/lib/api-errors';
import { priceFromWeight, specFields, text, toPrice } from '@/shared/lib/price-admin';

/** ورود گروهی (پیست از اکسل). replace=true یعنی جدول قبلی محصول جایگزین شود */
export async function POST(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await request.json();
    const productId = text(body.productId, 64);
    const rows = Array.isArray(body.rows) ? body.rows : [];
    const product = productId ? await prisma.product.findUnique({ where: { id: productId }, select: { pricePerKg: true } }) : null;
    const clean = rows
      .map((r: Record<string, unknown>) => {
        const weight = text(r.weight, 40);
        return {
          title: text(r.title),
          price: priceFromWeight(weight, product?.pricePerKg) ?? toPrice(r.price),
          ...specFields(r),
          weight,
          note: text(r.note),
        };
      })
      .filter((r: { title: string }) => r.title)
      .slice(0, 500);
    if (!productId || !clean.length) return NextResponse.json({ success: false, error: 'ردیفی برای ورود نیست' }, { status: 400 });

    const start = body.replace
      ? 0
      : ((await prisma.priceItem.findFirst({ where: { productId }, orderBy: { sortOrder: 'desc' }, select: { sortOrder: true } }))?.sortOrder ?? -1) + 1;

    await prisma.$transaction(async (tx) => {
      if (body.replace) await tx.priceItem.deleteMany({ where: { productId } });
      const created = await tx.priceItem.createManyAndReturn({
        data: clean.map((r: object, i: number) => ({ ...r, productId, sortOrder: start + i })),
        select: { id: true, price: true },
      });
      // نقطه شروع نمودار هر ردیف تازه
      const history = created.flatMap((c) => (c.price != null ? [{ priceItemId: c.id, price: c.price }] : []));
      if (history.length) await tx.priceHistory.createMany({ data: history });
    });
    return NextResponse.json({ success: true, data: { created: clean.length } });
  } catch (error) {
    return serverErrorResponse(error, 'Admin prices import error:');
  }
}
