import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/shared/lib/admin-auth';
import { serverErrorResponse } from '@/shared/lib/api-errors';
import { youtixFetch, YoutixError } from '@/shared/lib/youtix';

/** دسته تازه ایده مقاله محصول — یوتیکس در پس‌زمینه می‌سازد؛ prompt اختیاری جهت ایده‌ها را تعیین می‌کند */
export async function POST(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await request.json().catch(() => ({}));
    // سقف یوتیکس ۵۰۰ کاراکتر است
    const prompt = typeof body.prompt === 'string' ? body.prompt.trim().slice(0, 500) : '';
    const result = await youtixFetch<{ message?: string; batch?: number }>(
      '/product-ideas',
      { method: 'POST', body: prompt ? { prompt } : {} },
      'products',
    );
    return NextResponse.json({ success: true, data: result }, { status: 202 });
  } catch (error) {
    if (error instanceof YoutixError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    return serverErrorResponse(error, 'Youtix product ideas error:');
  }
}
