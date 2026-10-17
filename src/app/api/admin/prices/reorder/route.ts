import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/prisma';
import { requireAdmin } from '@/shared/lib/admin-auth';
import { serverErrorResponse } from '@/shared/lib/api-errors';
import { text } from '@/shared/lib/price-admin';

/** ذخیره ترتیب ردیف‌های یک محصول (مثلاً بعد از مرتب‌سازی سبک به سنگین) — ترتیب پیش‌فرض جدول سایت همین است */
export async function POST(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await request.json();
    const productId = text(body.productId, 64);
    const ids: string[] = Array.isArray(body.ids) ? body.ids.map((id: unknown) => text(id, 64)) : [];
    const existing = await prisma.priceItem.findMany({ where: { productId }, select: { id: true } });
    // باید دقیقاً همه ردیف‌های همین محصول باشد — نه کمتر، نه ردیف محصول دیگر
    const known = new Set(existing.map((i) => i.id));
    if (!productId || ids.length !== known.size || new Set(ids).size !== ids.length || !ids.every((id) => known.has(id))) {
      return NextResponse.json({ success: false, error: 'فهرست ردیف‌ها با جدول فعلی نمی‌خواند — صفحه را تازه کنید' }, { status: 400 });
    }
    await prisma.$transaction(ids.map((id, sortOrder) => prisma.priceItem.update({ where: { id }, data: { sortOrder } })));
    return NextResponse.json({ success: true, data: { updated: ids.length } });
  } catch (error) {
    return serverErrorResponse(error, 'Admin prices reorder error:');
  }
}
