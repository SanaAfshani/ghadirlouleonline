import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isAdmin } from '@/shared/lib/admin-auth';
import { prisma } from '@/shared/lib/prisma';
import { sanitizeTranslations } from '@/shared/lib/translations';
import { stripDangerousHtml } from '@/shared/content/sanitize';
import { revalidateLocalized } from '@/shared/i18n/server';

export async function GET(request: NextRequest) {
  try {
    const admin = new URL(request.url).searchParams.get('admin') === 'true' && isAdmin(request);
    const testimonials = await prisma.testimonial.findMany({
      where: admin ? {} : { published: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: testimonials });
  } catch (error) {
    console.error('Testimonials GET error:', error);
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await request.json();
    const testimonial = await prisma.testimonial.create({
      data: {
        name: String(body.name || ''),
        company: body.company || null,
        position: body.position || null,
        content: String(body.content || ''),
        rating: body.rating ? Number(body.rating) : 5,
        avatar: body.avatar || null,
        published: body.published ?? true,
        ...(body.translations !== undefined && { translations: sanitizeTranslations('testimonial', body.translations, stripDangerousHtml) }),
      },
    });
    // نظرها فقط در صفحه اصلی نمایش داده می‌شوند
    revalidateLocalized('/');
    return NextResponse.json({ success: true, data: testimonial }, { status: 201 });
  } catch (error) {
    console.error('Testimonials POST error:', error);
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 });
  }
}
