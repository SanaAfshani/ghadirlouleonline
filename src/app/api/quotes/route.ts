import { after, NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/prisma';
import { recordLead } from '@/shared/lib/lead-events';
import { cleanPath } from '@/shared/lib/leads';
import { serverErrorResponse } from '@/shared/lib/api-errors';
import {
  calcTotals,
  lineTotal,
  newQuoteToken,
  nextQuoteNumber,
  type QuoteLineInput,
} from '@/shared/lib/quotes';
import { DEFAULT_VAT_RATE } from '@/shared/lib/quote-constants';
import { latinDigits } from '@/shared/lib/utils';
import { getMarketNow } from '@/shared/lib/price-board';
import { itemLabel } from '@/shared/lib/price-item';
import { notifyQuoteRequested } from '@/shared/lib/sms';

const MAX_ITEMS = 40;

function parsePhone(raw: unknown) {
  const digits = latinDigits(String(raw ?? '')).replace(/\D/g, '');
  if (!/^0?9\d{9}$/.test(digits)) return null;
  return digits.startsWith('0') ? digits : `0${digits}`;
}

/** ثبت درخواست پیش‌فاکتور توسط مشتری */
export async function POST(request: NextRequest) {
  try {
    const market = await getMarketNow();
    if (!market.open) {
      return NextResponse.json({ success: false, error: 'فروش بسته است — لطفاً استعلام قیمت بگیرید' }, { status: 400 });
    }

    const body = await request.json();
    const customerName = String(body.customerName ?? '').trim().slice(0, 120);
    const customerPhone = parsePhone(body.customerPhone);
    const customerMessage = String(body.customerMessage ?? '').trim().slice(0, 2000);
    const sourcePath = cleanPath(body.sourcePath) || null;
    const rawItems = Array.isArray(body.items) ? body.items.slice(0, MAX_ITEMS) : [];

    if (!customerName || !customerPhone) {
      return NextResponse.json({ success: false, error: 'نام و موبایل الزامی است' }, { status: 400 });
    }
    if (!rawItems.length) {
      return NextResponse.json({ success: false, error: 'حداقل یک ردیف لازم است' }, { status: 400 });
    }

    const priceItemIds = rawItems.map((i: { priceItemId?: string }) => i.priceItemId).filter(Boolean) as string[];
    const live = priceItemIds.length
      ? await prisma.priceItem.findMany({
          where: { id: { in: priceItemIds } },
          select: { id: true, title: true, size: true, grade: true, spec: true, dimensions: true, price: true, note: true, productId: true, product: { select: { name: true } } },
        })
      : [];
    const byId = new Map(live.map((i) => [i.id, i]));

    const items: QuoteLineInput[] = [];
    for (const raw of rawItems) {
      const qty = Number(latinDigits(String(raw.quantity ?? '')).replace(/[^\d.]/g, ''));
      if (!Number.isFinite(qty) || qty <= 0 || qty > 100_000) {
        return NextResponse.json({ success: false, error: 'متراژ نامعتبر است' }, { status: 400 });
      }
      const liveRow = raw.priceItemId ? byId.get(String(raw.priceItemId)) : null;
      if (!liveRow || liveRow.price == null) {
        return NextResponse.json({ success: false, error: 'یکی از ردیف‌ها قیمت ندارد یا موجود نیست' }, { status: 400 });
      }
      items.push({
        priceItemId: liveRow.id,
        productId: liveRow.productId,
        title: itemLabel(liveRow),
        unitPrice: liveRow.price,
        quantity: qty,
        unit: 'متر',
        note: liveRow.note || '',
      });
    }

    const vatRate = DEFAULT_VAT_RATE;
    const totals = calcTotals(items, vatRate);

    const quote = await prisma.$transaction(async (tx) => {
      const number = await nextQuoteNumber(tx);
      return tx.quote.create({
        data: {
          number,
          token: newQuoteToken(),
          status: 'REQUESTED',
          customerName,
          customerPhone,
          customerMessage,
          sourcePath,
          vatRate,
          ...totals,
          items: {
            create: items.map((i, idx) => ({
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
          },
        },
        include: { items: { orderBy: { sortOrder: 'asc' } } },
      });
    });

    await recordLead('form', sourcePath ?? '', `پیش‌فاکتور ${quote.number}`).catch((e) => console.error('Lead record error:', e));
    // پیامک بعد از پاسخ — کندی یا خطای پنل پیامک ثبت درخواست را معطل نمی‌کند
    after(() => notifyQuoteRequested(quote));

    return NextResponse.json({
      success: true,
      data: {
        id: quote.id,
        number: quote.number,
        status: quote.status,
        token: quote.token,
        /** لینک مشاهده پیش‌فاکتور — همین الان برای مشتری باز است؛ بعد از تأیید ادمین همان لینک فاکتور می‌شود */
        publicUrl: `/q/${quote.token}`,
      },
    }, { status: 201 });
  } catch (error) {
    return serverErrorResponse(error, 'Quotes POST error:');
  }
}
