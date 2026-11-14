import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/shared/lib/admin-auth';
import { prisma } from '@/shared/lib/prisma';
import { hashPassword } from '@/shared/lib/auth';
import { serverErrorResponse } from '@/shared/lib/api-errors';

type Props = { params: Promise<{ id: string }> };

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  avatar: true,
  createdAt: true,
  updatedAt: true,
} as const;

export async function PUT(request: NextRequest, { params }: Props) {
  const auth = requireSuperAdmin(request);
  if (auth instanceof NextResponse) return auth;
  // مدیریت کاربران فقط با نقش ADMIN — وگرنه ویرایشگر می‌توانست برای خودش حساب مدیر بسازد
  try {
    const { id } = await params;
    const body = await request.json();

    const data: {
      name?: string;
      email?: string;
      role?: 'ADMIN' | 'EDITOR' | 'VIEWER';
      password?: string;
    } = {};

    if (body.name != null) data.name = String(body.name).trim();
    if (body.email != null) data.email = String(body.email).trim().toLowerCase();
    if (body.role != null && ['ADMIN', 'EDITOR', 'VIEWER'].includes(body.role)) {
      data.role = body.role;
    }
    if (body.password) {
      if (String(body.password).length < 6) {
        return NextResponse.json(
          { success: false, error: 'رمز عبور حداقل ۶ کاراکتر باشد' },
          { status: 400 },
        );
      }
      data.password = await hashPassword(String(body.password));
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      select: userSelect,
    });

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    return serverErrorResponse(error, 'User PUT error:');
  }
}

export async function DELETE(request: NextRequest, { params }: Props) {
  const auth = requireSuperAdmin(request);
  if (auth instanceof NextResponse) return auth;
  // مدیریت کاربران فقط با نقش ADMIN — وگرنه ویرایشگر می‌توانست برای خودش حساب مدیر بسازد
  try {
    const { id } = await params;

    const target = await prisma.user.findUnique({
      where: { id },
      include: { _count: { select: { posts: true } } },
    });
    if (!target) {
      return NextResponse.json({ success: false, error: 'کاربر یافت نشد' }, { status: 404 });
    }

    if (target.role === 'ADMIN') {
      const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
      if (adminCount <= 1) {
        return NextResponse.json(
          { success: false, error: 'حداقل یک مدیر باید در سیستم باقی بماند' },
          { status: 400 },
        );
      }
    }

    await prisma.$transaction(async (tx) => {
      if (target._count.posts > 0) {
        await tx.blogPost.deleteMany({ where: { authorId: id } });
      }
      await tx.user.delete({ where: { id } });
    });

    return NextResponse.json({ success: true, deletedPosts: target._count.posts });
  } catch (error) {
    return serverErrorResponse(error, 'User DELETE error:');
  }
}
