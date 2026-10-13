import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/prisma';
import { requireAdmin } from '@/shared/lib/admin-auth';
import { serverErrorResponse } from '@/shared/lib/api-errors';
import { serializeQuote } from '@/shared/lib/quotes';
import type { QuoteStatus } from '@/generated/prisma/client';

const STATUSES: QuoteStatus[] = ['DRAFT', 'REQUESTED', 'ISSUED', 'REJECTED', 'EXPIRED'];

/** فهرست پیش‌فاکتورها برای پنل ادمین */
export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const status = request.nextUrl.searchParams.get('status');
    const where = status && STATUSES.includes(status as QuoteStatus) ? { status: status as QuoteStatus } : {};
    const quotes = await prisma.quote.findMany({
      where,
      include: { items: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    const pending = await prisma.quote.count({ where: { status: 'REQUESTED' } });
    return NextResponse.json({
      success: true,
      data: { quotes: quotes.map(serializeQuote), pending },
    });
  } catch (error) {
    return serverErrorResponse(error, 'Admin quotes GET error:');
  }
}
