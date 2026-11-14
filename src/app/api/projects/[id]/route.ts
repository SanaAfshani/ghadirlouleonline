import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isAdmin } from '@/shared/lib/admin-auth';
import { prisma } from '@/shared/lib/prisma';
import { normalizeProjectImages, serializeProject } from '@/shared/lib/serializers';
import { slugify } from '@/shared/lib/utils';
import { recordRedirect } from '@/shared/lib/redirects';
import { sanitizeTranslations } from '@/shared/lib/translations';
import { stripDangerousHtml } from '@/shared/content/sanitize';
import { revalidateLocalized } from '@/shared/i18n/server';

type Props = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    // پروژه منتشرنشده فقط برای ادمین — مثل محصول و مقاله
    const project = await prisma.project.findFirst({
      where: { OR: [{ id }, { slug: id }], ...(isAdmin(request) ? {} : { published: true }) },
    });

    if (!project) {
      return NextResponse.json({ success: false, error: 'پروژه یافت نشد' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: serializeProject(project) });
  } catch (error) {
    console.error('Project GET error:', error);
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: Props) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    const body = await request.json();

    const before = await prisma.project.findUnique({ where: { id }, select: { slug: true } });

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(body.title != null && { title: String(body.title) }),
        ...(body.slug != null && { slug: slugify(String(body.slug)) }),
        ...(body.description != null && { description: body.description }),
        ...(body.content != null && { content: body.content }),
        ...(body.images != null && { images: JSON.stringify(normalizeProjectImages(body.images)) }),
        ...(body.location != null && { location: body.location }),
        ...(body.year != null && { year: Number(body.year) }),
        ...(body.client != null && { client: body.client }),
        ...(body.published != null && { published: Boolean(body.published) }),
        ...(body.featured != null && { featured: Boolean(body.featured) }),
        ...(body.metaTitle != null && { metaTitle: body.metaTitle || null }),
        ...(body.metaDescription != null && { metaDescription: body.metaDescription || null }),
        ...(body.focusKeyword != null && { focusKeyword: body.focusKeyword || null }),
        ...(body.ogTitle != null && { ogTitle: body.ogTitle || null }),
        ...(body.ogDescription != null && { ogDescription: body.ogDescription || null }),
        ...(body.faqs != null && { faqs: JSON.stringify(body.faqs) }),
        ...(body.translations !== undefined && { translations: sanitizeTranslations('project', body.translations, stripDangerousHtml) }),
      },
    });

    if (before && before.slug !== project.slug) {
      await recordRedirect(`/projects/${before.slug}`, `/projects/${project.slug}`);
    }

    // صفحه‌ها با ISR ساخته می‌شوند — تغییر همین حالا دیده شود، نه بعد از تایمر revalidate
    if (before && before.slug !== project.slug) revalidateLocalized(`/projects/${before.slug}`);
    revalidateLocalized(`/projects/${project.slug}`);
    revalidateLocalized('/projects');

    return NextResponse.json({ success: true, data: serializeProject(project) });
  } catch (error) {
    console.error('Project PUT error:', error);
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Props) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    const project = await prisma.project.delete({ where: { id }, select: { slug: true } });
    revalidateLocalized(`/projects/${project.slug}`);
    revalidateLocalized('/projects');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Project DELETE error:', error);
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 });
  }
}
