import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/prisma';
import { requireAdmin } from '@/shared/lib/admin-auth';
import { serverErrorResponse } from '@/shared/lib/api-errors';
import { isLocale, locales } from '@/shared/i18n/config';
import { revalidateLocalized } from '@/shared/i18n/server';
import { findSection } from '@/shared/content/registry';
import { countUntranslated, editableSection } from '@/shared/content/resolve';
import { sanitizeSectionData } from '@/shared/content/sanitize';
import type { StoredBlock } from '@/shared/content/types';
import { scheduleAutoTranslate } from '@/shared/lib/auto-translate';

type Props = { params: Promise<{ key: string }> };

async function loadStored(key: string): Promise<StoredBlock> {
  const row = await prisma.contentBlock.findUnique({ where: { key } });
  if (!row) return {};
  try {
    return JSON.parse(row.data) as StoredBlock;
  } catch {
    return {};
  }
}

/** تعریف بخش + مقدار فرم هر زبان (متن ترجمه‌نشده خالی) + متن پیش‌فرض برای «بازگشت به پیش‌فرض» */
async function sectionPayload(key: string) {
  const def = findSection(key)!;
  const stored = await loadStored(key);
  return {
    key: def.key,
    title: def.title,
    description: def.description ?? null,
    fields: def.fields,
    values: Object.fromEntries(locales.map((l) => [l, editableSection(def, stored, l)])),
    customized: Object.fromEntries(locales.map((l) => [l, Boolean(stored[l])])),
    untranslated: countUntranslated(def, stored, 'en'),
  };
}

export async function GET(request: NextRequest, { params }: Props) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  const { key } = await params;
  if (!findSection(key)) return NextResponse.json({ success: false, error: 'بخش یافت نشد' }, { status: 404 });
  try {
    return NextResponse.json({ success: true, data: await sectionPayload(key) });
  } catch (error) {
    return serverErrorResponse(error, 'Content GET');
  }
}

/** ذخیره یک زبان از یک بخش: { locale, data } — زبان دیگر دست نمی‌خورد */
export async function PUT(request: NextRequest, { params }: Props) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  const { key } = await params;
  const def = findSection(key);
  if (!def) return NextResponse.json({ success: false, error: 'بخش یافت نشد' }, { status: 404 });
  try {
    const body = await request.json();
    const locale: unknown = body?.locale;
    if (typeof locale !== 'string' || !isLocale(locale)) return NextResponse.json({ success: false, error: 'زبان نامعتبر' }, { status: 400 });

    const stored = await loadStored(key);
    stored[locale] = sanitizeSectionData(def.fields, locale, body.data);
    const data = JSON.stringify(stored);
    await prisma.contentBlock.upsert({ where: { key }, update: { data }, create: { key, data } });

    // متن فارسی تازه ← نسخه انگلیسیِ خالی خودکار ترجمه می‌شود
    if (locale === 'fa') scheduleAutoTranslate('content', key);
    // بخش‌ها در layout (هدر/فوتر) و صفحه‌های مختلف استفاده می‌شوند؛ کل سایت هر دو زبان تازه می‌شود
    revalidateLocalized('/', 'layout');
    return NextResponse.json({ success: true, data: await sectionPayload(key) });
  } catch (error) {
    return serverErrorResponse(error, 'Content PUT');
  }
}

/** بازگشت یک زبان به متن پیش‌فرض: ?locale=fa|en */
export async function DELETE(request: NextRequest, { params }: Props) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  const { key } = await params;
  const locale = request.nextUrl.searchParams.get('locale') ?? undefined;
  if (!findSection(key)) return NextResponse.json({ success: false, error: 'بخش یافت نشد' }, { status: 404 });
  if (!isLocale(locale)) return NextResponse.json({ success: false, error: 'زبان نامعتبر' }, { status: 400 });
  try {
    const stored = await loadStored(key);
    delete stored[locale];
    if (Object.keys(stored).length) {
      await prisma.contentBlock.update({ where: { key }, data: { data: JSON.stringify(stored) } });
    } else {
      await prisma.contentBlock.deleteMany({ where: { key } });
    }
    revalidateLocalized('/', 'layout');
    return NextResponse.json({ success: true, data: await sectionPayload(key) });
  } catch (error) {
    return serverErrorResponse(error, 'Content DELETE');
  }
}
