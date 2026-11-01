import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isAdmin } from '@/shared/lib/admin-auth';
import { prisma } from '@/shared/lib/prisma';
import { slugify } from '@/shared/lib/utils';
import { recordRedirect } from '@/shared/lib/redirects';
import { parseFaqs } from '@/shared/lib/serializers';
import { serializeFaqs } from '@/shared/lib/page-faqs';
import { pingIndexNow } from '@/shared/lib/indexnow';

type RouteContext = { params: Promise<{ slug: string }> };

/** فیلد متنی اختیاری: رشته خالی را به null تبدیل می‌کند تا fallback سئو درست کار کند */
function optionalText(value: unknown): string | null {
  if (value == null) return null;
  const text = String(value).trim();
  return text || null;
}

function decodeSlug(raw: string) {
  try { return decodeURIComponent(raw); } catch { return raw; }
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { slug: rawSlug } = await context.params;
    const slug = decodeSlug(rawSlug);
    const admin = new URL(request.url).searchParams.get('admin') === 'true' && isAdmin(request);

    const post = await prisma.blogPost.findFirst({
      where: { slug },
      include: { author: { select: { id: true, name: true, email: true } } },
    });

    if (!post || (!admin && !post.published)) {
      return NextResponse.json({ success: false, error: 'مقاله یافت نشد' }, { status: 404 });
    }

    let tags: string[] = [];
    try {
      tags = JSON.parse(post.tags) as string[];
    } catch {
      tags = [];
    }

    if (!admin) {
      await prisma.blogPost.update({
        where: { id: post.id },
        // updatedAt صریح تا شمارش بازدید تاریخ ویرایش مقاله را عوض نکند
        data: { viewCount: { increment: 1 }, updatedAt: post.updatedAt },
      });
    }

    return NextResponse.json({ success: true, data: { ...post, tags, faqs: parseFaqs(post.faqs) } });
  } catch (error) {
    console.error('Blog slug GET error:', error);
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const { slug: rawSlug } = await context.params;
    const slug = decodeSlug(rawSlug);
    const body = await request.json();

    const existing = await prisma.blogPost.findFirst({ where: { slug } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'مقاله یافت نشد' }, { status: 404 });
    }

    const post = await prisma.blogPost.update({
      where: { id: existing.id },
      data: {
        ...(body.title != null && { title: String(body.title) }),
        ...(body.slug != null && { slug: slugify(String(body.slug)) }),
        ...(body.excerpt != null && { excerpt: body.excerpt }),
        ...(body.content != null && { content: String(body.content) }),
        ...(body.coverImage != null && { coverImage: body.coverImage }),
        ...(body.pdfUrl != null && { pdfUrl: body.pdfUrl }),
        ...(body.tags != null && { tags: JSON.stringify(body.tags) }),
        ...(body.published != null && { published: Boolean(body.published) }),
        ...(body.featured != null && { featured: Boolean(body.featured) }),
        ...(body.readTime != null && { readTime: Number(body.readTime) }),
        // فیلدهای سئو — با ارسال رشته خالی پاک می‌شوند (null) تا دوباره fallback شوند
        ...(body.metaTitle !== undefined && { metaTitle: optionalText(body.metaTitle) }),
        ...(body.metaDescription !== undefined && {
          metaDescription: optionalText(body.metaDescription),
        }),
        ...(body.focusKeyword !== undefined && { focusKeyword: optionalText(body.focusKeyword) }),
        ...(body.ogTitle !== undefined && { ogTitle: optionalText(body.ogTitle) }),
        ...(body.ogDescription !== undefined && {
          ogDescription: optionalText(body.ogDescription),
        }),
        ...(body.faqs !== undefined && { faqs: serializeFaqs(body.faqs) }),
      },
      include: { author: { select: { id: true, name: true, email: true } } },
    });

    if (post.slug !== existing.slug) {
      await recordRedirect(`/blog/${existing.slug}`, `/blog/${post.slug}`);
    }

    // منتشر یا از انتشار خارج شد یا ویرایش شد — آدرس قدیم و جدید هر دو خبر داده می‌شوند
    if (post.published || existing.published) {
      pingIndexNow(['/blog', `/blog/${existing.slug}`, `/blog/${post.slug}`]);
    }

    let tags: string[] = [];
    try {
      tags = JSON.parse(post.tags) as string[];
    } catch {
      tags = [];
    }

    return NextResponse.json({ success: true, data: { ...post, tags, faqs: parseFaqs(post.faqs) } });
  } catch (error) {
    console.error('Blog slug PUT error:', error);
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const { slug: rawSlug } = await context.params;
    const slug = decodeSlug(rawSlug);

    const existing = await prisma.blogPost.findFirst({ where: { slug } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'مقاله یافت نشد' }, { status: 404 });
    }

    await prisma.blogPost.delete({ where: { id: existing.id } });

    // آدرس حالا ۴۰۴ می‌دهد — خبر دادن باعث می‌شود Bing (و ChatGPT و Copilot) زودتر از نتایج برش دارند
    if (existing.published) pingIndexNow(['/blog', `/blog/${existing.slug}`]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Blog slug DELETE error:', error);
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 });
  }
}
