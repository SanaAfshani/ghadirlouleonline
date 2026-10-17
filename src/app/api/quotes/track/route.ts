import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/prisma';
import { serverErrorResponse } from '@/shared/lib/api-errors';
import { normalizeQuoteNumber } from '@/shared/lib/quotes';
import { parseOrderLog } from '@/shared/lib/order-status';
import { latinDigits } from '@/shared/lib/utils';

/**
 * پیگیری سفارش با شماره پیش‌فاکتور + موبایل ثبت‌شده — موبایل لازم است چون شماره‌ها پشت‌سرهم و قابل حدس‌اند.
 * پاسخ «پیدا نشد» برای شماره اشتباه و موبایل اشتباه یکی است تا وجود شماره لو نرود.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const number = normalizeQuoteNumber(body.number);
    const phone = latinDigits(String(body.phone ?? '')).replace(/\D/g, '').replace(/^0?/, '0');
    if (!number || !/^09\d{9}$/.test(phone)) {
      return NextResponse.json({ success: false, error: 'شماره پیش‌فاکتور و موبایل را درست وارد کنید' }, { status: 400 });
    }
    const q = await prisma.quote.findUnique({
      where: { number },
      select: {
        number: true, token: true, status: true, customerName: true, customerPhone: true, createdAt: true, issuedAt: true,
        validUntil: true, total: true, orderStatus: true, orderLog: true, trackingNote: true, _count: { select: { items: true } },
      },
    });
    if (!q || q.customerPhone !== phone || q.status === 'DRAFT') {
      return NextResponse.json({ success: false, error: 'سفارشی با این شماره و موبایل پیدا نشد' }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      data: {
        number: q.number,
        status: q.status,
        // فقط نام کوچک — صفحه پیگیری ممکن است جلوی دیگران باز شود
        customerName: q.customerName.split(/\s+/)[0] ?? '',
        createdAt: q.createdAt.toISOString(),
        issuedAt: q.issuedAt?.toISOString() ?? null,
        validUntil: q.validUntil?.toISOString() ?? null,
        total: q.total,
        items: q._count.items,
        orderStatus: q.orderStatus,
        orderLog: parseOrderLog(q.orderLog),
        trackingNote: q.trackingNote,
        url: `/q/${q.token}`,
      },
    });
  } catch (error) {
    return serverErrorResponse(error, 'Quote track error:');
  }
}
