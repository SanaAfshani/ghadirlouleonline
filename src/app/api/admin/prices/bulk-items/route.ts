import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/shared/lib/admin-auth';
import { serverErrorResponse } from '@/shared/lib/api-errors';
import { bumpSelected, parseBulk } from '@/shared/lib/price-bulk';
import { text } from '@/shared/lib/price-admin';

/** تغییر درصدی قیمت ردیف‌های انتخاب‌شده در تابلوی قیمت */
export async function POST(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await request.json();
    const input = parseBulk(body);
    const ids: string[] = Array.isArray(body.ids) ? [...new Set(body.ids.map((id: unknown) => text(id, 64)).filter(Boolean) as string[])].slice(0, 2000) : [];
    if (!input || !ids.length) return NextResponse.json({ success: false, error: 'ردیف یا درصد معتبر نیست' }, { status: 400 });
    return NextResponse.json({ success: true, data: await bumpSelected(ids, input) });
  } catch (error) {
    return serverErrorResponse(error, 'Admin prices bulk-items error:');
  }
}
