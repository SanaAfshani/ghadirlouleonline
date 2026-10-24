import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isAdmin } from '@/shared/lib/admin-auth';
import { prisma } from '@/shared/lib/prisma';
import { normalizeProjectImages, serializeProject } from '@/shared/lib/serializers';
import { slugify } from '@/shared/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const admin = new URL(request.url).searchParams.get('admin') === 'true' && isAdmin(request);
    const projects = await prisma.project.findMany({
      where: admin ? {} : { published: true },
      orderBy: [{ featured: 'desc' }, { year: 'desc' }],
    });
    return NextResponse.json({
      success: true,
      data: projects.map(serializeProject),
    });
  } catch (error) {
    console.error('Projects GET error:', error);
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await request.json();
    const title = String(body.title || '').trim();
    if (!title) {
      return NextResponse.json({ success: false, error: 'عنوان الزامی است' }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        title,
        slug: slugify(String(body.slug || '').trim() || title),
        description: body.description || null,
        content: body.content || null,
        images: JSON.stringify(normalizeProjectImages(body.images)),
        location: body.location || null,
        year: body.year ? Number(body.year) : new Date().getFullYear(),
        client: body.client || null,
        published: body.published ?? true,
        featured: body.featured ?? false,
        metaTitle: body.metaTitle || null,
        metaDescription: body.metaDescription || null,
        focusKeyword: body.focusKeyword || null,
        ogTitle: body.ogTitle || null,
        ogDescription: body.ogDescription || null,
        faqs: JSON.stringify(body.faqs || []),
      },
    });

    return NextResponse.json({ success: true, data: serializeProject(project) }, { status: 201 });
  } catch (error) {
    console.error('Projects POST error:', error);
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 });
  }
}
