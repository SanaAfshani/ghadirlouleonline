import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/prisma';
import { requireAdmin } from '@/shared/lib/admin-auth';
import { serverErrorResponse } from '@/shared/lib/api-errors';
import { getQuoteById, serializeQuote } from '@/shared/lib/quotes';
import { isOrderStatus, parseOrderLog } from '@/shared/lib/order-status';

type Props = { params: Promise<{ id: string }> };

/** ثبت مرحله سفارش (آماده‌سازی، بارگیری، ارسال، تحویل) و توضیح پیگیری — فقط برای فاکتور صادرشده */
export async function PUT(request: NextRequest, { params }: Props) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    const current = await getQuoteById(id);
    if (!current) return NextResponse.json({ success: false, error: 'یافت نشد' }, { status: 404 });
    if (current.status !== 'ISSUED') {
      return NextResponse.json({ success: false, error: 'پیگیری سفارش فقط برای فاکتور صادرشده است' }, { status: 400 });
    }
    const body = await request.json();
    const orderStatus = body.orderStatus === '' ? '' : isOrderStatus(body.orderStatus) ? body.orderStatus : null;
    if (orderStatus === null) return NextResponse.json({ success: false, error: 'مرحله نامعتبر است' }, { status: 400 });

    const log = parseOrderLog(current.orderLog);
    // هر مرحله جدید یک ردیف با زمان؛ برگشت به مرحله قبل، مراحل بعدی را از خط زمانی برمی‌دارد
    const nextLog = orderStatus === current.orderStatus
      ? log
      : orderStatus === ''
        ? []
        : [...log.filter((e) => e.status !== orderStatus), { status: orderStatus, at: new Date().toISOString() }];

    const quote = await prisma.quote.update({
      where: { id },
      data: {
        orderStatus,
        orderLog: JSON.stringify(nextLog),
        trackingNote: body.trackingNote !== undefined ? String(body.trackingNote).trim().slice(0, 300) : undefined,
      },
      include: { items: { orderBy: { sortOrder: 'asc' } } },
    });
    return NextResponse.json({ success: true, data: serializeQuote(quote) });
  } catch (error) {
    return serverErrorResponse(error, 'Admin quote order error:');
  }
}
