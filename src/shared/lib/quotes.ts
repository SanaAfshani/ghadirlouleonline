import { randomBytes } from 'node:crypto';
import { prisma } from '@/shared/lib/prisma';
import { siteConfig } from '@/shared/config/site';
import type { Quote, QuoteItem, QuoteStatus } from '@/generated/prisma/client';
import { DEFAULT_VAT_RATE } from '@/shared/lib/quote-constants';
import { parseOrderLog } from '@/shared/lib/order-status';

export { DEFAULT_VAT_RATE, DEFAULT_VALIDITY_HOURS, statusLabel } from '@/shared/lib/quote-constants';

export type QuoteLineInput = {
  priceItemId?: string | null;
  productId?: string | null;
  title: string;
  unitPrice: number;
  quantity: number;
  unit?: string;
  note?: string;
};

export type QuoteWithItems = Quote & { items: QuoteItem[] };

export function calcTotals(items: { unitPrice: number; quantity: number }[], vatRate = DEFAULT_VAT_RATE) {
  const subtotal = items.reduce((s, i) => s + Math.round(i.unitPrice * i.quantity), 0);
  const vatAmount = Math.round(subtotal * (vatRate / 100));
  return { subtotal, vatAmount, total: subtotal + vatAmount };
}

export function lineTotal(unitPrice: number, quantity: number) {
  return Math.round(unitPrice * quantity);
}

export function newQuoteToken() {
  return randomBytes(18).toString('base64url');
}

/** سال شمسی تقریبی برای شماره پیش‌فاکتور (کافی برای سریال سالانه) */
function jalaliYear(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US-u-ca-persian', { timeZone: 'Asia/Tehran', year: 'numeric' }).formatToParts(date);
  return Number(parts.find((p) => p.type === 'year')?.value ?? new Date().getFullYear());
}

/** شماره بعدی: Q-1404-0001 */
export async function nextQuoteNumber(db: { quote: typeof prisma.quote } = prisma) {
  const year = jalaliYear();
  const prefix = `Q-${year}-`;
  const last = await db.quote.findFirst({
    where: { number: { startsWith: prefix } },
    orderBy: { number: 'desc' },
    select: { number: true },
  });
  const seq = last ? Number(last.number.slice(prefix.length)) + 1 : 1;
  return `${prefix}${String(seq).padStart(4, '0')}`;
}

export function publicQuoteUrl(token: string) {
  return `${siteConfig.url}/q/${token}`;
}

export function serializeQuote(q: QuoteWithItems) {
  return {
    id: q.id,
    number: q.number,
    token: q.token,
    status: q.status as QuoteStatus,
    customerName: q.customerName,
    customerPhone: q.customerPhone,
    customerEmail: q.customerEmail,
    customerCompany: q.customerCompany,
    customerMessage: q.customerMessage,
    adminNote: q.adminNote,
    sourcePath: q.sourcePath,
    vatRate: q.vatRate,
    subtotal: q.subtotal,
    vatAmount: q.vatAmount,
    total: q.total,
    validUntil: q.validUntil?.toISOString() ?? null,
    issuedAt: q.issuedAt?.toISOString() ?? null,
    createdAt: q.createdAt.toISOString(),
    updatedAt: q.updatedAt.toISOString(),
    publicUrl: publicQuoteUrl(q.token),
    orderStatus: q.orderStatus,
    orderLog: parseOrderLog(q.orderLog),
    trackingNote: q.trackingNote,
    items: q.items
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((i) => ({
        id: i.id,
        priceItemId: i.priceItemId,
        productId: i.productId,
        title: i.title,
        unitPrice: i.unitPrice,
        quantity: i.quantity,
        unit: i.unit,
        lineTotal: i.lineTotal,
        note: i.note,
        sortOrder: i.sortOrder,
      })),
  };
}

/** نسخه عمومی — بدون یادداشت داخلی ادمین */
export function serializePublicQuote(q: QuoteWithItems) {
  const { adminNote, ...rest } = serializeQuote(q);
  void adminNote;
  return rest;
}

export async function getQuoteByToken(token: string) {
  return prisma.quote.findUnique({
    where: { token },
    include: { items: { orderBy: { sortOrder: 'asc' } } },
  });
}

export async function getQuoteById(id: string) {
  return prisma.quote.findUnique({
    where: { id },
    include: { items: { orderBy: { sortOrder: 'asc' } } },
  });
}

/** شماره پیش‌فاکتور از ورودی کاربر: «Q-1405-0003»، «q۱۴۰۵۰۰۰۳» یا «1405-3» → Q-1405-0003 */
export function normalizeQuoteNumber(raw: unknown) {
  const digits = String(raw ?? '').replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
  const m = digits.match(/(\d{4})\D*(\d{1,6})/);
  return m ? `Q-${m[1]}-${m[2].padStart(4, '0')}` : null;
}
