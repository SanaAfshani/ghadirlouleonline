import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/prisma';
import { requireAdmin } from '@/shared/lib/admin-auth';
import { serverErrorResponse } from '@/shared/lib/api-errors';

/** پیام‌های پیگیری‌نشده برای زنگوله و نشان منوی پنل — هر ۳۰ ثانیه پرسیده می‌شود، پس سبک */
export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const where = { read: false };
    const [unread, latest, pendingQuotes] = await Promise.all([
      prisma.contactMessage.count({ where }),
      prisma.contactMessage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 8,
        select: { id: true, name: true, phone: true, subject: true, sourcePath: true, createdAt: true },
      }),
      prisma.quote.count({ where: { status: 'REQUESTED' } }),
    ]);
    return NextResponse.json({ success: true, data: { unread, latest, pendingQuotes } }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return serverErrorResponse(error, 'Admin notifications error:');
  }
}
