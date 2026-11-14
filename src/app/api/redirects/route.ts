import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/prisma';
import { requireSuperAdmin } from '@/shared/lib/admin-auth';
import { recordRedirect } from '@/shared/lib/redirects';
import { serverErrorResponse } from '@/shared/lib/api-errors';

/** مسیر داخلی: با / شروع شود، بدون دامنه؛ برای ذخیره decode می‌شود (همان شکلی که صفحات جستجو می‌کنند) */
function cleanPath(value: unknown): string | null {
  let s = String(value ?? '').trim();
  try {
    s = decodeURIComponent(new URL(s, 'http://x').pathname);
  } catch {
    return null;
  }
  s = s.replace(/\/+$/, '') || '/';
  return s.startsWith('/') && !s.startsWith('//') ? s : null;
}

export async function GET(request: NextRequest) {
  const auth = requireSuperAdmin(request);
  if (auth instanceof NextResponse) return auth;
  const data = await prisma.redirect.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ success: true, data });
}

export async function POST(request: NextRequest) {
  const auth = requireSuperAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await request.json();
    const from = cleanPath(body.fromPath);
    const to = cleanPath(body.toPath);
    if (!from || !to) return NextResponse.json({ success: false, error: 'مسیرها باید با / شروع شوند' }, { status: 400 });
    if (from === to) return NextResponse.json({ success: false, error: 'مبدا و مقصد یکی است' }, { status: 400 });
    await recordRedirect(from, to);
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    return serverErrorResponse(error, 'Redirect POST error:');
  }
}

export async function DELETE(request: NextRequest) {
  const auth = requireSuperAdmin(request);
  if (auth instanceof NextResponse) return auth;
  const id = new URL(request.url).searchParams.get('id');
  if (!id) return NextResponse.json({ success: false, error: 'شناسه لازم است' }, { status: 400 });
  await prisma.redirect.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ success: true });
}
