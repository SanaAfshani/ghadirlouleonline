import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isAdmin } from '@/shared/lib/admin-auth';
import { prisma } from '@/shared/lib/prisma';
import { serializeProduct } from '@/shared/lib/serializers';
import { serializeFaqs } from '@/shared/lib/page-faqs';
import { serializeCatalogs } from '@/shared/lib/catalog-files';
import { slugify } from '@/shared/lib/utils';
import { recordRedirect } from '@/shared/lib/redirects';

type Props = { params: Promise<{ id: string }> };

/** فیلد متنی اختیاری: رشته خالی را به null تبدیل می‌کند تا fallback سئو درست کار کند */
function optionalText(value: unknown): string | null {
  if (value == null) return null;
  const text = String(value).trim();
  return text || null;
}

export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const admin = new URL(request.url).searchParams.get('admin') === 'true' && isAdmin(request);

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
        ...(admin ? {} : { published: true }),
      },
      include: { category: true },
    });

    if (!product) {
      return NextResponse.json({ success: false, error: 'محصول یافت نشد' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: serializeProduct(product) });
  } catch (error) {
    console.error('Product GET error:', error);
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: Props) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    const body = await request.json();

    const data: Record<string, unknown> = {};
    if (body.name != null) data.name = String(body.name);
    if (body.slug != null) data.slug = slugify(String(body.slug));
    if (body.description != null) data.description = body.description;
    if (body.shortDescription != null) data.shortDescription = body.shortDescription;
    if (body.categoryId != null) data.categoryId = body.categoryId;
    if (body.inStock != null) data.inStock = Boolean(body.inStock);
    if (body.featured != null) data.featured = Boolean(body.featured);
    if (body.published != null) data.published = Boolean(body.published);
    if (body.images != null) data.images = JSON.stringify(body.images);
    if (body.specifications != null) data.specifications = JSON.stringify(body.specifications);
    if (body.price !== undefined) {
      data.price = body.price != null && body.price !== '' ? parseFloat(String(body.price)) : null;
    }
    // فیلدهای سئو — با ارسال رشته خالی پاک می‌شوند (null) تا دوباره fallback شوند
    if (body.metaTitle !== undefined) data.metaTitle = optionalText(body.metaTitle);
    if (body.metaDescription !== undefined) data.metaDescription = optionalText(body.metaDescription);
    if (body.focusKeyword !== undefined) data.focusKeyword = optionalText(body.focusKeyword);
    if (body.ogTitle !== undefined) data.ogTitle = optionalText(body.ogTitle);
    if (body.ogDescription !== undefined) data.ogDescription = optionalText(body.ogDescription);
    if (body.faqs !== undefined) data.faqs = serializeFaqs(body.faqs);
    if (body.catalogs !== undefined) data.catalogs = serializeCatalogs(body.catalogs);

    const before = await prisma.product.findUnique({
      where: { id },
      select: { slug: true, category: { select: { slug: true } } },
    });

    const product = await prisma.product.update({
      where: { id },
      data,
      include: { category: true },
    });

    // تغییر دسته به ریدایرکت نیاز ندارد: صفحه محصول با اسلاگ یکتا آدرس درست را پیدا می‌کند
    if (before && before.slug !== product.slug) {
      await recordRedirect(
        `/products/${before.category.slug}/${before.slug}`,
        `/products/${product.category.slug}/${product.slug}`,
      );
    }

    return NextResponse.json({ success: true, data: serializeProduct(product) });
  } catch (error) {
    console.error('Product PUT error:', error);
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Props) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'محصول حذف شد' });
  } catch (error) {
    console.error('Product DELETE error:', error);
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 });
  }
}
