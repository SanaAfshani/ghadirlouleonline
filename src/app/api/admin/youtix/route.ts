import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/prisma';
import { requireAdmin } from '@/shared/lib/admin-auth';
import { serverErrorResponse } from '@/shared/lib/api-errors';
import { slugify } from '@/shared/lib/utils';
import { isYoutixConfigured, youtixFetch, YoutixError, type YoutixArticleRow } from '@/shared/lib/youtix';

/** عنوان برای مقایسه: ی/ک عربی، نیم‌فاصله، علائم و فاصله‌ها یکسان می‌شوند */
function titleKey(title: string): string {
  return title
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[‌‏\s]+/g, '')
    .replace(/[؟?!:،,.«»"'()\-–—]/g, '')
    .toLowerCase();
}

/**
 * مقاله‌های یوتیکس + اینکه کدام قبلاً به وبلاگ وارد شده (و با چه آدرسی).
 * مقاله‌هایی که پیش از این اتصال دستی در وبلاگ گذاشته شده‌اند (هم‌عنوان یا هم‌اسلاگ، بدون youtixId)
 * در لیست نمی‌آیند تا دوباره وارد نشوند؛ فقط تعدادشان برمی‌گردد.
 */
export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  if (!isYoutixConfigured()) return NextResponse.json({ success: true, data: { configured: false, articles: [], hidden: 0 } });

  try {
    const { data } = await youtixFetch<{ data: YoutixArticleRow[] }>('/articles');
    const posts = await prisma.blogPost.findMany({ select: { youtixId: true, title: true, slug: true, published: true } });

    const byId = new Map(posts.filter((p) => p.youtixId).map((p) => [p.youtixId, p]));
    const manual = posts.filter((p) => !p.youtixId);
    const manualTitles = new Set(manual.map((p) => titleKey(p.title)));
    const manualSlugs = new Set(manual.map((p) => p.slug));

    const articles = data
      .map((a) => {
        const post = byId.get(a.id);
        return { ...a, post: post ? { slug: post.slug, published: post.published } : null };
      })
      .filter((a) => a.post || !(manualTitles.has(titleKey(a.title)) || (a.slug && manualSlugs.has(slugify(a.slug)))));

    return NextResponse.json({
      success: true,
      data: { configured: true, articles, hidden: data.length - articles.length },
    });
  } catch (error) {
    if (error instanceof YoutixError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    return serverErrorResponse(error, 'Youtix list error:');
  }
}
