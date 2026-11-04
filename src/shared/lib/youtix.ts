import { siteConfig } from '@/shared/config/site';
import { parseArticleJson, parseArticleMarkdown } from '@/shared/lib/article-import';
import { markdownToHtml } from '@/shared/lib/markdown-to-html';
import { saveImage } from '@/shared/lib/media';
import { stripHtml } from '@/shared/lib/utils';
import type { FaqItem } from '@/shared/types';

/**
 * اتصال به API یوتیکس (https://app.youtix.site/developer/api-docs).
 * یوتیکس فقط در وردپرس/میکسین منتشر می‌کند؛ برای سایت ما مقاله را خودمان از API می‌خوانیم
 * و به‌صورت پیش‌نویس در وبلاگ ثبت می‌کنیم. کلید فقط سمت سرور است و به مرورگر نمی‌رسد.
 */
const API_BASE = 'https://api.youtix.site/api/agent/v1';
/** تصاویر مقاله با مسیر نسبی /storage/... روی همین دامنه سرو می‌شوند */
const FILE_ORIGIN = 'https://api.youtix.site';
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export class YoutixError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

export function isYoutixConfigured(): boolean {
  return Boolean(process.env.YOUTIX_API_KEY);
}

export async function youtixFetch<T>(path: string, init: { method?: 'GET' | 'POST'; body?: unknown } = {}): Promise<T> {
  const key = process.env.YOUTIX_API_KEY;
  if (!key) throw new YoutixError('کلید API یوتیکس (YOUTIX_API_KEY) روی سرور تنظیم نشده است', 503);

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method: init.method ?? 'GET',
      headers: {
        'X-Agent-Key': key,
        Accept: 'application/json',
        ...(init.body !== undefined && { 'Content-Type': 'application/json' }),
      },
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
      cache: 'no-store',
      signal: AbortSignal.timeout(20_000),
    });
  } catch {
    throw new YoutixError('ارتباط با یوتیکس برقرار نشد', 502);
  }

  const json = (await res.json().catch(() => null)) as { message?: string } | null;
  if (!res.ok) {
    // یوتیکس دلیل خطا را به فارسی در message می‌دهد (کریدیت ناکافی، کلید باطل، ...)
    const message = typeof json?.message === 'string' && json.message ? json.message : `خطای یوتیکس (${res.status})`;
    throw new YoutixError(message, res.status === 401 ? 502 : res.status);
  }
  return json as T;
}

/** ردیف لیست مقاله‌ها (GET /articles) */
export type YoutixArticleRow = {
  id: string;
  title: string;
  slug: string;
  status: string;
  created_at: string;
};

export type YoutixTask = {
  id: string;
  status: 'running' | 'completed' | 'failed';
  article_id?: string;
  error?: string;
};

/** فیلدهایی از GET /articles/{id} که استفاده می‌کنیم */
type YoutixArticle = {
  id: string;
  title?: string;
  status?: string;
  content?: string;
  excerpt?: string;
  image_url?: string | null;
  image_alt?: string | null;
  sections?: { position?: number; heading?: string; content?: string }[];
  [key: string]: unknown;
};

/** لینک‌های داخلی که یوتیکس با دامنه کامل سایت می‌نویسد نسبی می‌شوند تا در همان تب باز شوند */
const OWN_LINK = new RegExp(
  `\\]\\(https?://(?:www\\.)?${new URL(siteConfig.url).hostname.replace(/\./g, '\\.')}(/[^)\\s]*)?(?=[)\\s])`,
  'gi',
);

/** متن کامل Markdown؛ اگر content خالی بود از بخش‌ها ساخته می‌شود */
function articleMarkdown(article: YoutixArticle): string {
  let markdown = typeof article.content === 'string' ? article.content : '';
  if (!markdown.trim()) {
    const sections = [...(article.sections ?? [])].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    markdown = [
      article.title ? `# ${article.title}` : '',
      ...sections.map((s) => [s.heading ? `## ${s.heading}` : '', s.content ?? ''].join('\n\n')),
    ].join('\n\n');
  }
  return markdown.replace(OWN_LINK, (_m, path?: string) => `](${path || '/'}`);
}

/**
 * تصویر شاخص را دانلود و در Media خودمان ذخیره می‌کند تا به سرور یوتیکس وابسته نماند.
 * فقط از دامنه youtix.site (جلوگیری از SSRF با آدرس دلخواه). شکست دانلود مانع وارد کردن مقاله نمی‌شود.
 */
async function importCoverImage(imageUrl: string, name: string): Promise<string | null> {
  let url: URL;
  try {
    url = new URL(imageUrl, FILE_ORIGIN);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' || !(url.hostname === 'youtix.site' || url.hostname.endsWith('.youtix.site'))) return null;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(20_000) });
    const type = res.headers.get('content-type') ?? '';
    if (!res.ok || !type.startsWith('image/')) return null;
    const data = await res.arrayBuffer();
    if (data.byteLength > MAX_IMAGE_BYTES) return null;
    return await saveImage(new File([data], name, { type }));
  } catch (error) {
    console.error('Youtix cover image import failed:', error);
    return null;
  }
}

export type YoutixPostData = {
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  focusKeyword: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  faqs: FaqItem[];
};

/**
 * مقاله یوتیکس → فیلدهای BlogPost.
 * فیلدهای سئو و faq_schema از همان نگاشت «ورود از ابزار تولید محتوا» می‌آیند؛ متن همیشه از Markdown
 * ساخته می‌شود (markdownToHtml همه چیز را escape می‌کند) — پاک‌ساز HTML فقط در مرورگر کار می‌کند.
 */
export async function buildYoutixPost(article: YoutixArticle): Promise<YoutixPostData> {
  const markdown = parseArticleMarkdown(articleMarkdown(article));
  const json = parseArticleJson(JSON.stringify({ ...article, content: '' }));
  const meta = json.ok ? json.data : null;

  // بخش «سوالات متداول» داخل متن هم هست؛ از متن جدا می‌شود تا دو بار نمایش داده نشود
  const body = markdown.ok ? markdown.data.content : markdownToHtml(articleMarkdown(article));
  const faqs = meta?.faqs.length ? meta.faqs : markdown.ok ? markdown.data.faqs : [];
  const title = meta?.title || (markdown.ok ? markdown.data.title : '') || 'مقاله یوتیکس';
  const excerpt = meta?.excerpt || (markdown.ok ? markdown.data.excerpt : '') || stripHtml(body).slice(0, 180);

  const coverImage = article.image_url
    ? await importCoverImage(article.image_url, `${meta?.slug || 'youtix'}.webp`)
    : null;

  return {
    title,
    slug: meta?.slug || (markdown.ok ? markdown.data.slug : ''),
    excerpt: excerpt || null,
    content: body,
    coverImage,
    metaTitle: meta?.metaTitle || null,
    metaDescription: meta?.metaDescription || null,
    focusKeyword: meta?.focusKeyword || null,
    ogTitle: meta?.ogTitle || null,
    ogDescription: meta?.ogDescription || null,
    faqs,
  };
}

export async function getYoutixArticle(id: string): Promise<YoutixArticle> {
  const json = await youtixFetch<{ data?: YoutixArticle } & YoutixArticle>(`/articles/${encodeURIComponent(id)}`);
  return json.data ?? json;
}
