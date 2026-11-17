import { NextRequest, NextResponse } from 'next/server';
import { revalidateLocalized } from '@/shared/i18n/server';
import { prisma } from '@/shared/lib/prisma';
import { requireSuperAdmin } from '@/shared/lib/admin-auth';
import { EDITABLE_SETTING_KEYS } from '@/shared/lib/site-settings';
import { scheduleAutoTranslate } from '@/shared/lib/auto-translate';

export async function GET() {
  try {
    const settings = await prisma.siteSettings.findMany();
    const settingsMap = settings.reduce(
      (acc, s) => ({ ...acc, [s.key]: s.value }),
      {} as Record<string, string>
    );
    return NextResponse.json({ success: true, data: settingsMap });
  } catch (error) {
    console.error('Settings GET error:', error);
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // تغییر تلفن و آدرس سایت فقط برای ادمین — وگرنه هر کسی می‌توانست شماره تماس سایت را عوض کند
  const auth = requireSuperAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ success: false, error: 'داده نامعتبر' }, { status: 400 });
    }
    const unknown = Object.keys(body).filter((key) => !EDITABLE_SETTING_KEYS.has(key));
    if (unknown.length) {
      return NextResponse.json({ success: false, error: `کلید نامعتبر: ${unknown.join('، ')}` }, { status: 400 });
    }
    const updates = await Promise.all(
      Object.entries(body).map(([key, value]) =>
        prisma.siteSettings.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value), type: 'text' },
        })
      )
    );

    scheduleAutoTranslate('settings', 'settings');
    revalidateLocalized('/', 'layout');
    revalidateLocalized('/contact');

    return NextResponse.json({ success: true, data: updates });
  } catch (error) {
    console.error('Settings POST error:', error);
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 });
  }
}
