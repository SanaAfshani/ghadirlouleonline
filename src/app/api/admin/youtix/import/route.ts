import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/prisma';
import { requireAdmin } from '@/shared/lib/admin-auth';
import { serverErrorResponse } from '@/shared/lib/api-errors';
import { serializeFaqs } from '@/shared/lib/page-faqs';
import { estimateReadTimeMinutes, slugify } from '@/shared/lib/utils';
import { buildYoutixPost, getYoutixArticle, getYoutixProductArticle, YoutixError, type CategoryPathResolver } from '@/shared/lib/youtix';

export const maxDuration = 60;

/** اسلاگ آزاد: اگر مقاله‌ای با همین آدرس هست، -2، -3، ... */
async function uniqueSlug(base: string): Promise<string> {
  for (let n = 1; ; n++) {
    const slug = n === 1 ? base : `${base}-${n}`;
    if (!(await prisma.blogPost.findUnique({ where: { slug }, select: { id: true } }))) return slug;
  }
}

/** نام دسته برای مقایسه: ی/ک عربی، نیم‌فاصله و فاصله‌ها یکسان می‌شوند */
function nameKey(name: string): string {
  return name.replace(/ي/g, 'ی').replace(/ك/g, 'ک').replace(/[‌\s]+/g, '').toLowerCase();
}

/**
 * لینک دسته‌ای که یوتیکس می‌نویسد (آدرس ووکامرس) → صفحه همان دسته در این سایت، با نام دسته در متن لینک؛
 * اگر نامی جور نشد، فهرست محصولات (هرگز لینک شکسته در مقاله نمی‌ماند).
 */
async function categoryPathResolver(): Promise<CategoryPathResolver> {
  const categories = await prisma.category.findMany({ where: { published: true }, select: { name: true, slug: true } });
  const byName = categories.map((c) => ({ key: nameKey(c.name), path: `/products/${encodeURIComponent(c.slug)}` }));
  return (text) => {
    const key = nameKey(text);
    return (key && (byName.find((c) => c.key === key) ?? byName.find((c) => key.includes(c.key)))?.path) || '/products';
  };
}

/**
 * مقاله یوتیکس را به‌صورت پیش‌نویس در وبلاگ ثبت می‌کند؛ ادمین در صفحه ویرایش بازبینی و منتشر می‌کند
 * (همان‌جا IndexNow هم پینگ می‌شود). هر مقاله یوتیکس فقط یک بار وارد می‌شود (youtixId یکتا).
 * kind: 'product' مقاله «سئوی محصولات» است که از کلید و آدرس جدای خودش خوانده می‌شود.
 */
export async function POST(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await request.json().catch(() => ({}));
    const id = String(body.id ?? '').trim();
    const isProduct = body.kind === 'product';
    if (!/^[A-Za-z0-9_-]{1,64}$/.test(id)) {
      return NextResponse.json({ success: false, error: 'شناسه مقاله نامعتبر است' }, { status: 400 });
    }

    const existing = await prisma.blogPost.findUnique({ where: { youtixId: id }, select: { slug: true } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'این مقاله قبلاً وارد شده است', data: { slug: existing.slug } },
        { status: 409 },
      );
    }

    const article = isProduct ? await getYoutixProductArticle(id) : await getYoutixArticle(id);
    if (article.status && article.status !== 'completed') {
      return NextResponse.json({ success: false, error: 'تولید این مقاله در یوتیکس هنوز تمام نشده است' }, { status: 409 });
    }

    const post = await buildYoutixPost(article, isProduct ? await categoryPathResolver() : undefined);
    if (!post.content) {
      return NextResponse.json({ success: false, error: 'متن مقاله در یوتیکس خالی است' }, { status: 422 });
    }

    const author =
      (await prisma.user.findUnique({ where: { id: auth.userId }, select: { id: true } })) ??
      (await prisma.user.findFirst({ where: { role: 'ADMIN' }, orderBy: { createdAt: 'asc' }, select: { id: true } }));
    if (!author) {
      return NextResponse.json({ success: false, error: 'نویسنده یافت نشد' }, { status: 400 });
    }

    const created = await prisma.blogPost.create({
      data: {
        ...post,
        slug: await uniqueSlug(slugify(post.slug || post.title)),
        faqs: serializeFaqs(post.faqs),
        readTime: estimateReadTimeMinutes(post.content),
        published: false,
        youtixId: id,
        authorId: author.id,
      },
      select: { slug: true },
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    if (error instanceof YoutixError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    return serverErrorResponse(error, 'Youtix import error:');
  }
}
