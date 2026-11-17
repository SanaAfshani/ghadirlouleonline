import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/shared/lib/admin-auth';
import { serverErrorResponse } from '@/shared/lib/api-errors';
import { youtixFetch, YoutixError } from '@/shared/lib/youtix';

type Props = { params: Promise<{ id: string }> };

/** نوشتن مقاله از یک ایده (کریدیت مصرف می‌شود)؛ اگر قبلاً ساخته شده باشد یوتیکس همان را برمی‌گرداند */
export async function POST(request: NextRequest, { params }: Props) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(id)) {
    return NextResponse.json({ success: false, error: 'شناسه ایده نامعتبر است' }, { status: 400 });
  }
  try {
    const result = await youtixFetch<{ message?: string; started?: boolean; article_id?: string }>(
      `/product-ideas/${encodeURIComponent(id)}/article`,
      { method: 'POST', body: {} },
      'products',
    );
    return NextResponse.json({ success: true, data: result }, { status: 202 });
  } catch (error) {
    if (error instanceof YoutixError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    return serverErrorResponse(error, 'Youtix product article error:');
  }
}
