import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/shared/lib/admin-auth';
import { prisma } from '@/shared/lib/prisma';
import { sanitizeTranslations } from '@/shared/lib/translations';
import { stripDangerousHtml } from '@/shared/content/sanitize';
import { revalidateLocalized } from '@/shared/i18n/server';
import { scheduleAutoTranslate } from '@/shared/lib/auto-translate';

type Props = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Props) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    const body = await request.json();

    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: {
        ...(body.name != null && { name: String(body.name) }),
        ...(body.company != null && { company: body.company }),
        ...(body.position != null && { position: body.position }),
        ...(body.content != null && { content: String(body.content) }),
        ...(body.rating != null && { rating: Number(body.rating) }),
        ...(body.avatar != null && { avatar: body.avatar }),
        ...(body.published != null && { published: Boolean(body.published) }),
        ...(body.translations !== undefined && { translations: sanitizeTranslations('testimonial', body.translations, stripDangerousHtml) }),
      },
    });

    revalidateLocalized('/');
    scheduleAutoTranslate('testimonial', testimonial.id);
    return NextResponse.json({ success: true, data: testimonial });
  } catch (error) {
    console.error('Testimonial PUT error:', error);
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Props) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    await prisma.testimonial.delete({ where: { id } });
    revalidateLocalized('/');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Testimonial DELETE error:', error);
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 });
  }
}
