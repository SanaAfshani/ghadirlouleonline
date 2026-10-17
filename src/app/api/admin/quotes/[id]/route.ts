import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/prisma';
import { requireAdmin } from '@/shared/lib/admin-auth';
import { serverErrorResponse } from '@/shared/lib/api-errors';
import {
  calcTotals,
  DEFAULT_VALIDITY_HOURS,
  getQuoteById,
  lineTotal,
  serializeQuote,
  type QuoteLineInput,
} from '@/shared/lib/quotes';
import { latinDigits } from '@/shared/lib/utils';

type Props = { params: Promise<{ id: string }> };

function parseItems(raw: unknown): QuoteLineInput[] | null {
  if (!Array.isArray(raw) || !raw.length) return null;
  const items: QuoteLineInput[] = [];
  for (const [idx, r] of raw.entries()) {
    const title = String(r.title ?? '').trim().slice(0, 300);
    const unitPrice = Math.round(Number(latinDigits(String(r.unitPrice ?? '')).replace(/[^\d]/g, '')));
    const quantity = Number(latinDigits(String(r.quantity ?? '')).replace(/[^\d.]/g, ''));
    if (!title || !Number.isFinite(unitPrice) || unitPrice < 0 || !Number.isFinite(quantity) || quantity <= 0) return null;
    items.push({
      priceItemId: r.priceItemId ? String(r.priceItemId) : null,
      productId: r.productId ? String(r.productId) : null,
      title,
      unitPrice,
      quantity,
      unit: String(r.unit ?? 'متر').slice(0, 20) || 'متر',
      note: String(r.note ?? '').slice(0, 300),
      // sortOrder via index
      ...(idx >= 0 ? {} : {}),
    });
  }
  return items;
}

export async function GET(request: NextRequest, { params }: Props) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const quote = await getQuoteById(id);
  if (!quote) return NextResponse.json({ success: false, error: 'یافت نشد' }, { status: 404 });
  return NextResponse.json({ success: true, data: serializeQuote(quote) });
}

/** ویرایش درخواست / صدور / رد */
export async function PATCH(request: NextRequest, { params }: Props) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    const current = await getQuoteById(id);
    if (!current) return NextResponse.json({ success: false, error: 'یافت نشد' }, { status: 404 });

    const body = await request.json();
    const action = typeof body.action === 'string' ? body.action : '';

    if (action === 'reject') {
      if (current.status === 'ISSUED') {
        return NextResponse.json({ success: false, error: 'پیش‌فاکتور صادرشده قابل رد نیست' }, { status: 400 });
      }
      const quote = await prisma.quote.update({
        where: { id },
        data: { status: 'REJECTED', adminNote: String(body.adminNote ?? current.adminNote).slice(0, 2000) },
        include: { items: { orderBy: { sortOrder: 'asc' } } },
      });
      return NextResponse.json({ success: true, data: serializeQuote(quote) });
    }

    if (current.status === 'ISSUED' && action !== 'reissue') {
      return NextResponse.json({ success: false, error: 'پیش‌فاکتور صادرشده قابل ویرایش نیست' }, { status: 400 });
    }

    const vatRate = body.vatRate !== undefined ? Number(body.vatRate) : current.vatRate;
    if (!Number.isFinite(vatRate) || vatRate < 0 || vatRate > 100) {
      return NextResponse.json({ success: false, error: 'نرخ مالیات نامعتبر است' }, { status: 400 });
    }

    const parsedItems = body.items !== undefined ? parseItems(body.items) : null;
    if (body.items !== undefined && !parsedItems) {
      return NextResponse.json({ success: false, error: 'ردیف‌ها نامعتبرند' }, { status: 400 });
    }
    const items = parsedItems ?? current.items.map((i) => ({
      priceItemId: i.priceItemId,
      productId: i.productId,
      title: i.title,
      unitPrice: i.unitPrice,
      quantity: i.quantity,
      unit: i.unit,
      note: i.note,
    }));
    const totals = calcTotals(items, vatRate);

    let validUntil = current.validUntil;
    if (body.validUntil !== undefined) {
      validUntil = body.validUntil ? new Date(body.validUntil) : null;
      if (body.validUntil && Number.isNaN(validUntil?.getTime())) {
        return NextResponse.json({ success: false, error: 'تاریخ اعتبار نامعتبر است' }, { status: 400 });
      }
    }

    const issuing = action === 'issue' || action === 'reissue';
    if (issuing && !validUntil) {
      validUntil = new Date(Date.now() + DEFAULT_VALIDITY_HOURS * 3600_000);
    }
    // تاریخ گذشته یعنی مشتری از همان لحظه صدور «منقضی شده» می‌بیند — قبلاً با کلیک روی تقویم، اعتبار = همین لحظه ثبت می‌شد
    if (issuing && validUntil && validUntil.getTime() <= Date.now()) {
      return NextResponse.json({ success: false, error: 'تاریخ «اعتبار تا» باید بعد از الان باشد — خالی بگذارید تا ۴۸ ساعت در نظر گرفته شود' }, { status: 400 });
    }

    const quote = await prisma.$transaction(async (tx) => {
      if (parsedItems) {
        await tx.quoteItem.deleteMany({ where: { quoteId: id } });
        await tx.quoteItem.createMany({
          data: parsedItems.map((i, idx) => ({
            quoteId: id,
            priceItemId: i.priceItemId ?? null,
            productId: i.productId ?? null,
            title: i.title,
            unitPrice: i.unitPrice,
            quantity: i.quantity,
            unit: i.unit ?? 'متر',
            lineTotal: lineTotal(i.unitPrice, i.quantity),
            note: i.note ?? '',
            sortOrder: idx,
          })),
        });
      }
      return tx.quote.update({
        where: { id },
        data: {
          customerName: body.customerName !== undefined ? String(body.customerName).trim().slice(0, 120) : undefined,
          customerPhone: body.customerPhone !== undefined ? String(body.customerPhone).trim().slice(0, 20) : undefined,
          customerEmail: body.customerEmail !== undefined ? String(body.customerEmail).trim().slice(0, 120) : undefined,
          customerCompany: body.customerCompany !== undefined ? String(body.customerCompany).trim().slice(0, 120) : undefined,
          customerMessage: body.customerMessage !== undefined ? String(body.customerMessage).trim().slice(0, 2000) : undefined,
          adminNote: body.adminNote !== undefined ? String(body.adminNote).trim().slice(0, 2000) : undefined,
          vatRate,
          ...totals,
          validUntil,
          ...(issuing && { status: 'ISSUED' as const, issuedAt: new Date() }),
        },
        include: { items: { orderBy: { sortOrder: 'asc' } } },
      });
    });

    return NextResponse.json({ success: true, data: serializeQuote(quote) });
  } catch (error) {
    return serverErrorResponse(error, 'Admin quote PATCH error:');
  }
}

export async function DELETE(request: NextRequest, { params }: Props) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  await prisma.quote.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ success: true });
}
