import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/prisma';
import { requireAdmin } from '@/shared/lib/admin-auth';
import { serverErrorResponse } from '@/shared/lib/api-errors';
import { CONTENT_PAGES } from '@/shared/content/registry';
import { countUntranslated } from '@/shared/content/resolve';
import type { StoredBlock } from '@/shared/content/types';

/** فهرست صفحه‌ها و بخش‌های قابل‌ویرایش، با آخرین ویرایش و تعداد متن ترجمه‌نشده هر صفحه */
export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const rows = await prisma.contentBlock.findMany();
    const stored = new Map(rows.map((row) => [row.key, { data: JSON.parse(row.data) as StoredBlock, updatedAt: row.updatedAt }]));

    const pages = CONTENT_PAGES.map((page) => {
      const sections = page.sections.map((section) => {
        const block = stored.get(section.key);
        return {
          key: section.key,
          title: section.title,
          customized: Boolean(block),
          updatedAt: block?.updatedAt ?? null,
          untranslated: countUntranslated(section, block?.data, 'en'),
        };
      });
      const updates = sections.map((s) => s.updatedAt).filter((d): d is Date => d !== null);
      return {
        key: page.key,
        title: page.title,
        path: page.path ?? null,
        sections,
        updatedAt: updates.length ? new Date(Math.max(...updates.map((d) => d.getTime()))) : null,
        untranslated: sections.reduce((sum, s) => sum + s.untranslated, 0),
      };
    });

    return NextResponse.json({ success: true, data: pages });
  } catch (error) {
    return serverErrorResponse(error, 'Content list');
  }
}
