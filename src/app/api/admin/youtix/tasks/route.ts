import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/shared/lib/admin-auth';
import { serverErrorResponse } from '@/shared/lib/api-errors';
import { youtixFetch, YoutixError, type YoutixTask } from '@/shared/lib/youtix';

/** تولید مقاله تازه با تنظیمات ایجنت سایت در یوتیکس (موضوع را خود یوتیکس از ایده‌ها انتخاب می‌کند) — کریدیت مصرف می‌شود */
export async function POST(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const task = await youtixFetch<YoutixTask>('/article-generation-tasks', { method: 'POST' });
    return NextResponse.json({ success: true, data: task }, { status: 202 });
  } catch (error) {
    if (error instanceof YoutixError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    return serverErrorResponse(error, 'Youtix task create error:');
  }
}
