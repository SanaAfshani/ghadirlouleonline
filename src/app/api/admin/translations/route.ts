import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/shared/lib/admin-auth';
import { serverErrorResponse } from '@/shared/lib/api-errors';
import { revalidateLocalized } from '@/shared/i18n/server';
import { findTarget, translateTarget, translationCoverage } from '@/shared/lib/bulk-translate';
import { TranslateError, translateToEnglish } from '@/shared/lib/translate';

// هر دور چند درخواست ترجمه پشت سر هم است
export const maxDuration = 300;

/** پوشش ترجمه انگلیسی هر بخش — فقط مدیر کل (ترجمه هزینه API دارد) */
export async function GET(request: NextRequest) {
  const auth = requireSuperAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    return NextResponse.json({ success: true, data: await translationCoverage() });
  } catch (error) {
    return serverErrorResponse(error, 'Translations GET');
  }
}

/** یک دور ترجمه برای یک بخش: { target } ← { translated, remaining } — پنل تا remaining صفر شود تکرار می‌کند */
export async function POST(request: NextRequest) {
  const auth = requireSuperAdmin(request);
  if (auth instanceof NextResponse) return auth;
  const body = await request.json().catch(() => null);
  const key = typeof body?.target === 'string' ? body.target : '';
  if (!findTarget(key)) return NextResponse.json({ success: false, error: 'بخش نامعتبر' }, { status: 400 });
  try {
    const data = await translateTarget(key, translateToEnglish);
    if (data.translated) revalidateLocalized('/', 'layout');
    return NextResponse.json({ success: true, data });
  } catch (error) {
    if (error instanceof TranslateError) return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    return serverErrorResponse(error, 'Translations POST');
  }
}
