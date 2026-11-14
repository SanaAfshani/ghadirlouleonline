import 'server-only';
import { cache } from 'react';
import { prisma } from '@/shared/lib/prisma';
import type { Locale } from '@/shared/i18n/config';
import { resolveSection } from './resolve';
import type { Fields, SectionDef, SectionValue, StoredBlock } from './types';

function parseBlock(raw: string): StoredBlock {
  try {
    const data = JSON.parse(raw);
    return typeof data === 'object' && data !== null && !Array.isArray(data) ? data : {};
  } catch {
    return {};
  }
}

/**
 * همه بخش‌های ذخیره‌شده با یک کوئری در هر درخواست (جدول کوچک است و صفحه‌ها چند بخش دارند).
 * خطای دیتابیس عمداً گرفته نمی‌شود: اگر متن پیش‌فرض جایش رندر می‌شد، ISR همان را تا revalidate بعدی کش می‌کرد
 * و محتوای ادمین موقتاً برمی‌گشت؛ با خطا Next نسخه سالم قبلی صفحه را نگه می‌دارد.
 */
const loadBlocks = cache(async (): Promise<Map<string, StoredBlock>> => {
  const rows = await prisma.contentBlock.findMany();
  return new Map(rows.map((row) => [row.key, parseBlock(row.data)]));
});

export async function getStoredBlock(key: string): Promise<StoredBlock | undefined> {
  return (await loadBlocks()).get(key);
}

/** محتوای یک بخش به زبان صفحه */
export async function getSection<S extends Fields>(def: SectionDef<S>, locale: Locale): Promise<SectionValue<S>> {
  return resolveSection(def, await getStoredBlock(def.key), locale);
}
