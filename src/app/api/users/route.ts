import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/shared/lib/admin-auth';
import { prisma } from '@/shared/lib/prisma';
import { hashPassword } from '@/shared/lib/auth';

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  avatar: true,
  createdAt: true,
  updatedAt: true,
} as const;

export async function GET(request: NextRequest) {
  const auth = requireSuperAdmin(request);
  if (auth instanceof NextResponse) return auth;
  // مدیریت کاربران فقط با نقش ADMIN — وگرنه ویرایشگر می‌توانست برای خودش حساب مدیر بسازد
  try {
    const admin = new URL(request.url).searchParams.get('admin') === 'true';
    if (!admin) {
      return NextResponse.json({ success: false, error: 'دسترسی غیرمجاز' }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: userSelect,
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error('Users GET error:', error);
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = requireSuperAdmin(request);
  if (auth instanceof NextResponse) return auth;
  // مدیریت کاربران فقط با نقش ADMIN — وگرنه ویرایشگر می‌توانست برای خودش حساب مدیر بسازد
  try {
    const body = await request.json();
    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const role = body.role as 'ADMIN' | 'EDITOR' | 'VIEWER' | undefined;

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'نام، ایمیل و رمز عبور الزامی است' },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'رمز عبور حداقل ۶ کاراکتر باشد' },
        { status: 400 },
      );
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: await hashPassword(password),
        role: role && ['ADMIN', 'EDITOR', 'VIEWER'].includes(role) ? role : 'EDITOR',
      },
      select: userSelect,
    });

    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error) {
    console.error('Users POST error:', error);
    const message =
      error instanceof Error && error.message.includes('Unique constraint')
        ? 'این ایمیل قبلاً ثبت شده است'
        : 'خطای سرور';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
