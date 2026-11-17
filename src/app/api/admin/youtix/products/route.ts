import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/prisma';
import { requireAdmin } from '@/shared/lib/admin-auth';
import { serverErrorResponse } from '@/shared/lib/api-errors';
import {
  isYoutixConfigured,
  youtixFetch,
  YoutixError,
  type YoutixProductArticleRow,
  type YoutixProductIdeas,
} from '@/shared/lib/youtix';

/** ایده‌های آخرین دسته + مقاله‌های محصول یوتیکس و اینکه کدام قبلاً به وبلاگ وارد شده */
export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  if (!isYoutixConfigured('products')) {
    return NextResponse.json({ success: true, data: { configured: false, ideas: null, articles: [] } });
  }

  try {
    const [ideas, { data }] = await Promise.all([
      youtixFetch<YoutixProductIdeas>('/product-ideas', {}, 'products'),
      youtixFetch<{ data: YoutixProductArticleRow[] }>('/product-articles', {}, 'products'),
    ]);
    const posts = await prisma.blogPost.findMany({
      where: { youtixId: { in: data.map((a) => a.id) } },
      select: { youtixId: true, slug: true, published: true },
    });
    const byId = new Map(posts.map((p) => [p.youtixId, { slug: p.slug, published: p.published }]));
    const articles = data.map((a) => ({ ...a, post: byId.get(a.id) ?? null }));

    return NextResponse.json({ success: true, data: { configured: true, ideas, articles } });
  } catch (error) {
    if (error instanceof YoutixError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    return serverErrorResponse(error, 'Youtix product list error:');
  }
}
