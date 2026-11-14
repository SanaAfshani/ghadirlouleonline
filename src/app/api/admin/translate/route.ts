import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/shared/lib/admin-auth';
import { stripDangerousHtml } from '@/shared/content/sanitize';
import { MAX_TRANSLATE_CHARS, TranslateError, translateToEnglish, type TranslateItem } from '@/shared/lib/translate';

// ترجمه مقاله بلند چند ده ثانیه طول می‌کشد
export const maxDuration = 300;

/** { items: [{ id, text, html? }] } ← { data: { [id]: english } } — فقط پیشنهاد برای فرم پنل؛ چیزی ذخیره نمی‌شود */
export async function POST(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  const body = await request.json().catch(() => null);
  const raw: unknown[] = Array.isArray(body?.items) ? body.items : [];
  const items: TranslateItem[] = raw
    .filter((i): i is Record<string, unknown> => typeof i === 'object' && i !== null)
    .filter((i) => typeof i.id === 'string' && typeof i.text === 'string')
    .slice(0, 300)
    .map((i) => ({ id: String(i.id).slice(0, 120), text: String(i.text), html: i.html === true }));

  if (!items.length) return NextResponse.json({ success: false, error: 'متنی برای ترجمه نیست' }, { status: 400 });
  if (items.reduce((sum, i) => sum + i.text.length, 0) > MAX_TRANSLATE_CHARS) {
    return NextResponse.json({ success: false, error: 'متن برای ترجمه یک‌جا خیلی طولانی است؛ بخش‌بخش ترجمه کنید' }, { status: 413 });
  }

  try {
    const result = await translateToEnglish(items);
    const htmlIds = new Set(items.filter((i) => i.html).map((i) => i.id));
    // خروجی مدل هم مثل ورودی پنل پاک‌سازی می‌شود
    const data = Object.fromEntries(Object.entries(result).map(([id, text]) => [id, htmlIds.has(id) ? stripDangerousHtml(text) : text]));
    return NextResponse.json({ success: true, data });
  } catch (error) {
    if (error instanceof TranslateError) return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    console.error('Translate error:', error);
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 });
  }
}
