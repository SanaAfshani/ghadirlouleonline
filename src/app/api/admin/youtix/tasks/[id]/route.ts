import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/shared/lib/admin-auth';
import { serverErrorResponse } from '@/shared/lib/api-errors';
import { youtixFetch, YoutixError, type YoutixTask } from '@/shared/lib/youtix';

type Props = { params: Promise<{ id: string }> };

/** وضعیت تسک تولید مقاله: running / completed (+article_id) / failed (+error) */
export async function GET(request: NextRequest, { params }: Props) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  try {
    const task = await youtixFetch<YoutixTask>(`/article-generation-tasks/${encodeURIComponent(id)}`);
    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    if (error instanceof YoutixError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    return serverErrorResponse(error, 'Youtix task status error:');
  }
}
