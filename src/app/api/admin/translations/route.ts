import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/shared/lib/admin-auth';
import { serverErrorResponse } from '@/shared/lib/api-errors';
import { revalidateLocalized } from '@/shared/i18n/server';
import { exportPending, findTarget, importTranslations, translateTarget, translationCoverage, type ExportedItem } from '@/shared/lib/bulk-translate';
import { TranslateError, translateToEnglish } from '@/shared/lib/translate';

// هر دور چند درخواست ترجمه پشت سر هم است
export const maxDuration = 300;

/**
 * پوشش ترجمه انگلیسی هر بخش — فقط مدیر کل (ترجمه هزینه API دارد).
 * ?export=1 فایل JSON همه متن‌های بدون ترجمه را می‌دهد تا بیرون از سایت ترجمه و با POST { import } برگردانده شود.
 */
export async function GET(request: NextRequest) {
  const auth = requireSuperAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    if (request.nextUrl.searchParams.get('export')) {
      return new NextResponse(JSON.stringify(await exportPending(), null, 1), {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Content-Disposition': `attachment; filename="untranslated-${new Date().toISOString().slice(0, 10)}.json"`,
        },
      });
    }
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

  // فایل ترجمه‌شده: همان خروجی export با فیلد translation پرشده
  if (Array.isArray(body?.import)) {
    const entries: ExportedItem[] = (body.import as unknown[])
      .filter((e): e is Record<string, unknown> => typeof e === 'object' && e !== null)
      .filter((e) => ['target', 'row', 'id', 'translation'].every((k) => typeof e[k] === 'string'))
      .slice(0, 20000)
      .map((e) => ({ target: String(e.target), row: String(e.row), title: '', id: String(e.id), html: e.html === true, text: '', translation: String(e.translation) }));
    try {
      const saved = await importTranslations(entries);
      if (saved) revalidateLocalized('/', 'layout');
      return NextResponse.json({ success: true, data: { saved } });
    } catch (error) {
      return serverErrorResponse(error, 'Translations import');
    }
  }

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
