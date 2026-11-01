import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isAdmin } from '@/shared/lib/admin-auth';
import { prisma } from '@/shared/lib/prisma';
import { parseFaqs } from '@/shared/lib/serializers';
import { estimateReadTimeMinutes, slugify } from '@/shared/lib/utils';
import { serializeFaqs } from '@/shared/lib/page-faqs';
import { pingIndexNow } from '@/shared/lib/indexnow';

/** فیلد متنی اختیاری: رشته خالی را به null تبدیل می‌کند تا fallback سئو درست کار کند */
function optionalText(value: unknown): string | null {
  if (value == null) return null;
  const text = String(value).trim();
  return text || null;
}

function mapPost<T extends { tags: string; faqs?: string }>(post: T) {
  let tags: string[] = [];
  try {
    tags = JSON.parse(post.tags) as string[];
  } catch {
    tags = [];
  }
  return { ...post, tags, faqs: parseFaqs(post.faqs) };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '9', 10);
    const featured = searchParams.get('featured') === 'true';
    const admin = searchParams.get('admin') === 'true' && isAdmin(request);

    const where: { published?: boolean; featured?: boolean } = {};
    if (!admin) where.published = true;
    if (featured) where.featured = true;

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        include: { author: { select: { id: true, name: true, email: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
      }),
      prisma.blogPost.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: posts.map(mapPost),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Blog GET error:', error);
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await request.json();
    const title = String(body.title || '').trim();

    if (!title) {
      return NextResponse.json({ success: false, error: 'عنوان الزامی است' }, { status: 400 });
    }

    const content = String(body.content || '').trim();
    const slug = slugify(String(body.slug || '').trim() || title);

    let authorId = body.authorId as string | undefined;
    if (!authorId) {
      const adminUser = await prisma.user.findFirst({
        where: { role: 'ADMIN' },
        orderBy: { createdAt: 'asc' },
      });
      authorId = adminUser?.id;
    }

    if (!authorId) {
      return NextResponse.json(
        { success: false, error: 'نویسنده یافت نشد. ابتدا seed یا کاربر ادمین بسازید.' },
        { status: 400 },
      );
    }

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        excerpt: body.excerpt ? String(body.excerpt) : null,
        content: content || '<p></p>',
        coverImage: body.coverImage ? String(body.coverImage) : null,
        pdfUrl: body.pdfUrl ? String(body.pdfUrl) : null,
        tags: JSON.stringify(body.tags || []),
        published: Boolean(body.published),
        featured: Boolean(body.featured),
        readTime: body.readTime ? Number(body.readTime) : estimateReadTimeMinutes(content),
        metaTitle: optionalText(body.metaTitle),
        metaDescription: optionalText(body.metaDescription),
        focusKeyword: optionalText(body.focusKeyword),
        ogTitle: optionalText(body.ogTitle),
        ogDescription: optionalText(body.ogDescription),
        faqs: serializeFaqs(body.faqs),
        authorId,
      },
      include: { author: { select: { id: true, name: true, email: true } } },
    });

    // مقاله تازه همان روز به Bing (و از آن به ChatGPT و Copilot) می‌رسد، نه هفته‌ها بعد
    if (post.published) pingIndexNow([`/blog/${post.slug}`, '/blog']);

    return NextResponse.json({ success: true, data: mapPost(post) }, { status: 201 });
  } catch (error) {
    console.error('Blog POST error:', error);
    const message =
      error instanceof Error && error.message.includes('Unique constraint')
        ? 'این آدرس (slug) قبلاً استفاده شده است'
        : 'خطای سرور';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
