import { NextRequest, NextResponse } from 'next/server';
import { getBoardVersion, getPriceBoard } from '@/shared/lib/price-board';
import { serverErrorResponse } from '@/shared/lib/api-errors';
import { defaultLocale, isLocale } from '@/shared/i18n/config';

export const dynamic = 'force-dynamic';

/**
 * تابلوی قیمت لحظه‌ای — کلاینت هر چند ثانیه با ?v=<نسخه فعلی> می‌پرسد.
 * اگر تغییری نبوده فقط { unchanged: true } برمی‌گردد (چند بایت)، وگرنه کل تابلو.
 * ?locale=en نام‌ها و عنوان ردیف‌ها را انگلیسی می‌دهد (پیش‌فرض فارسی).
 * polling به جای WebSocket: روی هر هاستی (serverless یا کانتینر) بدون سرور اختصاصی کار می‌کند.
 */
export async function GET(request: NextRequest) {
  try {
    const known = request.nextUrl.searchParams.get('v');
    const param = request.nextUrl.searchParams.get('locale') ?? undefined;
    const locale = isLocale(param) ? param : defaultLocale;
    const version = await getBoardVersion();
    const headers = { 'Cache-Control': 'no-store, max-age=0' };
    if (known && known === version) {
      return NextResponse.json({ success: true, unchanged: true, version }, { headers });
    }
    return NextResponse.json({ success: true, data: await getPriceBoard(locale) }, { headers });
  } catch (error) {
    return serverErrorResponse(error, 'Live prices error:');
  }
}
