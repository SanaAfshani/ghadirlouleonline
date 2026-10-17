import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/shared/lib/admin-auth';
import { serverErrorResponse } from '@/shared/lib/api-errors';
import { bumpProduct, parseBulk } from '@/shared/lib/price-bulk';

/** افزایش/کاهش درصدی همه قیمت‌های یک محصول — برای وقتی کل بازار یک کالا جابه‌جا می‌شود */
export async function POST(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await request.json();
    const input = parseBulk(body);
    if (!body.productId || !input) return NextResponse.json({ success: false, error: 'درصد معتبر نیست' }, { status: 400 });
    return NextResponse.json({ success: true, data: await bumpProduct(String(body.productId), input) });
  } catch (error) {
    return serverErrorResponse(error, 'Admin prices bulk error:');
  }
}
