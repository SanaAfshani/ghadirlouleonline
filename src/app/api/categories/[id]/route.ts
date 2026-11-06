import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/shared/lib/admin-auth';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/shared/lib/prisma';
import { serverErrorResponse } from '@/shared/lib/api-errors';
import { slugify } from '@/shared/lib/utils';
import { recordRedirect } from '@/shared/lib/redirects';

type Props = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Props) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    const body = await request.json();

    const before = await prisma.category.findUnique({ where: { id }, select: { slug: true } });

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(body.name != null && { name: String(body.name) }),
        ...(body.slug != null && { slug: slugify(String(body.slug)) }),
        ...(body.description != null && { description: body.description }),
        ...(body.content != null && { content: String(body.content) }),
        ...(body.image != null && { image: body.image }),
        ...(body.icon != null && { icon: body.icon }),
        ...(body.order != null && { order: Number(body.order) }),
        ...(body.published != null && { published: Boolean(body.published) }),
      },
    });

    // محصولات این دسته ریدایرکت جدا نمی‌خواهند: صفحه محصول با اسلاگ یکتا آدرس درست را پیدا می‌کند
    if (before && before.slug !== category.slug) {
      await recordRedirect(`/products/${before.slug}`, `/products/${category.slug}`);
    }

    revalidatePath('/categories');
    revalidatePath('/products', 'layout');

    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    return serverErrorResponse(error, 'Category PUT error:');
  }
}

export async function DELETE(request: NextRequest, { params }: Props) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });

    if (!category) {
      return NextResponse.json({ success: false, error: 'دسته‌بندی یافت نشد' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      if (category._count.products > 0) {
        await tx.product.deleteMany({ where: { categoryId: id } });
      }
      await tx.category.delete({ where: { id } });
    });

    revalidatePath('/categories');
    revalidatePath('/products', 'layout');
    revalidatePath('/');

    return NextResponse.json({
      success: true,
      deletedProducts: category._count.products,
    });
  } catch (error) {
    return serverErrorResponse(error, 'Category DELETE error:');
  }
}
