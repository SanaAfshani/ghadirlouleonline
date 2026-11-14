import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isAdmin } from '@/shared/lib/admin-auth';
import { revalidateLocalized } from '@/shared/i18n/server';
import { prisma } from '@/shared/lib/prisma';
import { slugify } from '@/shared/lib/utils';
import { serverErrorResponse } from '@/shared/lib/api-errors';
import { sanitizeTranslations } from '@/shared/lib/translations';
import { stripDangerousHtml } from '@/shared/content/sanitize';

export async function GET(request: NextRequest) {
  try {
    const admin = new URL(request.url).searchParams.get('admin') === 'true' && isAdmin(request);
    const categories = await prisma.category.findMany({
      where: admin ? {} : { published: true },
      include: { _count: { select: { products: true } } },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    return serverErrorResponse(error, 'Categories GET error:');
  }
}

export async function POST(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await request.json();
    const category = await prisma.category.create({
      data: {
        ...body,
        slug: slugify(String(body.slug || '').trim() || String(body.name || '')),
        // ترجمه هیچ‌وقت خام از body ذخیره نمی‌شود
        translations: body.translations !== undefined ? sanitizeTranslations('category', body.translations, stripDangerousHtml) : undefined,
      },
    });

    revalidateLocalized('/categories');
    revalidateLocalized('/products', 'layout');

    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error) {
    return serverErrorResponse(error, 'Categories POST error:');
  }
}
