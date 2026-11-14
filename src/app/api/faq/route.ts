import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isAdmin } from '@/shared/lib/admin-auth';
import { prisma } from '@/shared/lib/prisma';
import { sanitizeTranslations } from '@/shared/lib/translations';
import { stripDangerousHtml } from '@/shared/content/sanitize';
import { revalidateLocalized } from '@/shared/i18n/server';

export async function GET(request: NextRequest) {
  try {
    const admin = new URL(request.url).searchParams.get('admin') === 'true' && isAdmin(request);
    const faqs = await prisma.fAQ.findMany({
      where: admin ? {} : { published: true },
      orderBy: { order: 'asc' },
    });
    return NextResponse.json({ success: true, data: faqs });
  } catch (error) {
    console.error('FAQ GET error:', error);
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await request.json();
    const faq = await prisma.fAQ.create({
      data: {
        ...body,
        // ترجمه هیچ‌وقت خام از body ذخیره نمی‌شود
        translations: body.translations !== undefined ? sanitizeTranslations('faq', body.translations, stripDangerousHtml) : undefined,
      },
    });
    revalidateLocalized('/faq');
    return NextResponse.json({ success: true, data: faq }, { status: 201 });
  } catch (error) {
    console.error('FAQ POST error:', error);
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 });
  }
}
