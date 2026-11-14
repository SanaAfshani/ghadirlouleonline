import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/shared/lib/prisma';
import { requireSuperAdmin } from '@/shared/lib/admin-auth';
import { serverErrorResponse } from '@/shared/lib/api-errors';
import { defaultSiteSettings } from '@/shared/lib/site-settings';

/** فقط کلیدهای سئو از این مسیر قابل تغییرند */
const KEYS = ['google_site_verification', 'home_seo_content'] as const;

export async function GET(request: NextRequest) {
  const auth = requireSuperAdmin(request);
  if (auth instanceof NextResponse) return auth;
  const rows = await prisma.siteSettings.findMany({ where: { key: { in: [...KEYS] } } });
  const data: Record<string, string> = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  // همان متنی که الان روی صفحه اصلی است؛ وگرنه ذخیره فرم خالی، متن پیش‌فرض را پاک می‌کرد
  data.home_seo_content ??= defaultSiteSettings.homeSeoContent;
  return NextResponse.json({ success: true, data });
}

export async function PUT(request: NextRequest) {
  const auth = requireSuperAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const body = (await request.json()) as Record<string, unknown>;
    for (const key of KEYS) {
      if (body[key] === undefined) continue;
      let value = String(body[key] ?? '').trim();
      // کاربر ممکن است کل تگ متا را از Search Console پیست کند — فقط مقدار content را نگه می‌داریم
      if (key === 'google_site_verification') value = value.match(/content=["']([^"']+)["']/)?.[1] ?? value;
      await prisma.siteSettings.upsert({ where: { key }, update: { value }, create: { key, value, type: 'text' } });
    }
    revalidatePath('/', 'layout');
    return NextResponse.json({ success: true });
  } catch (error) {
    return serverErrorResponse(error, 'SEO settings error:');
  }
}
