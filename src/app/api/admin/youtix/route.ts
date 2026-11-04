import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/prisma';
import { requireAdmin } from '@/shared/lib/admin-auth';
import { serverErrorResponse } from '@/shared/lib/api-errors';
import { isYoutixConfigured, youtixFetch, YoutixError, type YoutixArticleRow } from '@/shared/lib/youtix';

/** مقاله‌های یوتیکس + اینکه کدام قبلاً به وبلاگ وارد شده (و با چه آدرسی) */
export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  if (!isYoutixConfigured()) return NextResponse.json({ success: true, data: { configured: false, articles: [] } });

  try {
    const { data } = await youtixFetch<{ data: YoutixArticleRow[] }>('/articles');
    const imported = await prisma.blogPost.findMany({
      where: { youtixId: { in: data.map((a) => a.id) } },
      select: { youtixId: true, slug: true, published: true },
    });
    const byId = new Map(imported.map((p) => [p.youtixId, p]));
    const articles = data.map((a) => {
      const post = byId.get(a.id);
      return { ...a, post: post ? { slug: post.slug, published: post.published } : null };
    });
    return NextResponse.json({ success: true, data: { configured: true, articles } });
  } catch (error) {
    if (error instanceof YoutixError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    return serverErrorResponse(error, 'Youtix list error:');
  }
}
