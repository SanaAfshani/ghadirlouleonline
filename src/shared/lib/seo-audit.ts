import { prisma } from '@/shared/lib/prisma';
import { siteConfig } from '@/shared/config/site';
import { formatPersianNumber, slugify, stripHtml } from '@/shared/lib/utils';
import { recordRedirect } from '@/shared/lib/redirects';
import { isComingSoon } from '@/shared/lib/catalog';

export type AuditType = 'product' | 'category' | 'blog' | 'project';
export type Issue = { code: string; level: 'error' | 'warn'; message: string };
export type AuditItem = {
  type: AuditType;
  id: string;
  name: string;
  /** عنوانی که واقعاً در <title> صفحه می‌نشیند — مبنای تشخیص عنوان تکراری */
  title: string;
  url: string;
  adminUrl: string;
  score: number;
  issues: Issue[];
};
export type Fix = { type: AuditType; id: string; name: string; field: string; before: string; after: string };

const TITLE_MAX = 60;
const DESC_MIN = 70;
const DESC_MAX = 158;

const words = (html: string | null | undefined) => stripHtml(html ?? '').split(/\s+/).filter(Boolean).length;
const isAscii = (s: string) => /^[a-z0-9-]+$/.test(s);
const norm = (s: string) => s.replace(/[‌\s]+/g, ' ').trim().toLowerCase();

/** برش متن در مرز کلمه؛ برای توضیحات «…» اضافه می‌شود، برای عنوان نه */
function clip(text: string, max: number, ellipsis = true): string {
  const t = stripHtml(text);
  if (t.length <= max) return t;
  const cut = t.slice(0, max - (ellipsis ? 1 : 0)).replace(/\s+\S*$/, '').replace(/[،,:|\-–—]+$/, '').trim();
  return ellipsis ? `${cut}…` : cut;
}

function score(issues: Issue[]) {
  return Math.max(0, 100 - issues.reduce((n, i) => n + (i.level === 'error' ? 20 : 8), 0));
}

/** همان منطقی که صفحات عمومی برای ساخت عنوان/توضیحات استفاده می‌کنند — تا گزارش با خروجی واقعی یکی باشد */
async function load() {
  const [products, categories, posts, projects] = await Promise.all([
    prisma.product.findMany({ where: { published: true }, include: { category: { select: { slug: true, name: true } }, _count: { select: { priceItems: true } } } }),
    prisma.category.findMany({ where: { published: true } }),
    prisma.blogPost.findMany({ where: { published: true } }),
    prisma.project.findMany({ where: { published: true } }),
  ]);
  return { products, categories, posts, projects };
}

export async function runAudit(): Promise<{ items: AuditItem[]; summary: Record<string, number> }> {
  const { products, categories, posts, projects } = await load();
  const items: AuditItem[] = [];

  for (const p of products) {
    const issues: Issue[] = [];
    const title = p.metaTitle || `${p.name} | مشخصات و قیمت | ${siteConfig.name}`;
    const desc = stripHtml(p.metaDescription || p.shortDescription || p.description || '');
    if (!isAscii(p.slug)) issues.push({ code: 'slug', level: 'error', message: 'آدرس صفحه انگلیسی نیست' });
    if (!desc) issues.push({ code: 'desc-missing', level: 'error', message: 'توضیحات متا ندارد' });
    else if (desc.length < DESC_MIN) issues.push({ code: 'desc-short', level: 'warn', message: 'توضیحات متا کوتاه است' });
    // گوگل حدود ۶۰ کاراکتر نشان می‌دهد؛ عنوان پیش‌فرض نام سایت را هم دارد، پس کمی جای بیشتر می‌گیرد
    if (p.metaTitle ? p.metaTitle.length > TITLE_MAX : title.length > TITLE_MAX + 10) {
      issues.push({ code: 'title-long', level: 'warn', message: 'عنوان در گوگل بریده می‌شود' });
    }
    if (!p.focusKeyword) issues.push({ code: 'keyword', level: 'warn', message: 'کلمه کلیدی محوری ندارد' });
    if (p.images === '[]') issues.push({ code: 'image', level: 'warn', message: 'تصویر ندارد' });
    if (words(p.description) < 80) issues.push({ code: 'thin', level: 'warn', message: 'متن معرفی کمتر از ۸۰ کلمه است' });
    if (p._count.priceItems === 0) issues.push({ code: 'prices', level: 'warn', message: 'جدول قیمت ندارد' });
    if (p.faqs === '[]') issues.push({ code: 'faq', level: 'warn', message: 'سوال متداول ندارد' });
    items.push({
      type: 'product', id: p.id, name: p.name, title, url: `/products/${p.category.slug}/${p.slug}`,
      adminUrl: `/admin/products/${p.id}/edit`, score: score(issues), issues,
    });
  }

  for (const c of categories) {
    const issues: Issue[] = [];
    // همان عنوانی که صفحه دسته می‌سازد؛ عمداً با عنوان صفحه محصول هم‌پوشانی ندارد
    const title = isComingSoon(c.slug)
      ? `${c.name} | مشخصات و استعلام (به زودی)`
      : `قیمت ${c.name} | جدول سایز و خرید عمده`;
    if (!isAscii(c.slug)) issues.push({ code: 'slug', level: 'error', message: 'آدرس صفحه انگلیسی نیست' });
    if (!c.description) issues.push({ code: 'desc-missing', level: 'warn', message: 'توضیحات دسته ندارد' });
    if (!c.image) issues.push({ code: 'image', level: 'warn', message: 'تصویر ندارد' });
    items.push({ type: 'category', id: c.id, name: c.name, title, url: `/products/${c.slug}`, adminUrl: '/admin/categories', score: score(issues), issues });
  }

  for (const b of posts) {
    const issues: Issue[] = [];
    const title = b.metaTitle || b.title;
    const desc = stripHtml(b.metaDescription || b.excerpt || '');
    const w = words(b.content);
    if (!isAscii(b.slug)) issues.push({ code: 'slug', level: 'error', message: 'آدرس صفحه انگلیسی نیست' });
    if (!desc) issues.push({ code: 'desc-missing', level: 'error', message: 'توضیحات متا ندارد' });
    else if (desc.length < DESC_MIN || desc.length > DESC_MAX + 20) issues.push({ code: 'desc-length', level: 'warn', message: 'طول توضیحات متا مناسب نیست' });
    if (title.length > TITLE_MAX) issues.push({ code: 'title-long', level: 'warn', message: 'عنوان در گوگل بریده می‌شود' });
    if (!b.focusKeyword) issues.push({ code: 'keyword', level: 'warn', message: 'کلمه کلیدی محوری ندارد' });
    else if (!norm(title).includes(norm(b.focusKeyword))) issues.push({ code: 'keyword-title', level: 'warn', message: 'کلمه کلیدی در عنوان نیست' });
    if (!b.coverImage) issues.push({ code: 'image', level: 'warn', message: 'تصویر شاخص ندارد' });
    if (!b.pdfUrl && w < 100) issues.push({ code: 'thin', level: 'error', message: 'محتوا کمتر از ۱۰۰ کلمه است' });
    else if (!b.pdfUrl && w < 300) issues.push({ code: 'thin', level: 'warn', message: 'محتوا کمتر از ۳۰۰ کلمه است' });
    if (b.faqs === '[]') issues.push({ code: 'faq', level: 'warn', message: 'سوال متداول ندارد' });
    items.push({ type: 'blog', id: b.id, name: b.title, title, url: `/blog/${b.slug}`, adminUrl: `/admin/blog/${b.slug}/edit`, score: score(issues), issues });
  }

  for (const pr of projects) {
    const issues: Issue[] = [];
    if (!isAscii(pr.slug)) issues.push({ code: 'slug', level: 'error', message: 'آدرس صفحه انگلیسی نیست' });
    if (!pr.description) issues.push({ code: 'desc-missing', level: 'warn', message: 'توضیحات ندارد' });
    if (pr.images === '[]') issues.push({ code: 'image', level: 'warn', message: 'تصویر ندارد' });
    items.push({ type: 'project', id: pr.id, name: pr.title, title: pr.title, url: `/projects/${pr.slug}`, adminUrl: `/admin/projects/${pr.id}/edit`, score: score(issues), issues });
  }

  // عنوان تکراری بین صفحات — گوگل یکی را نادیده می‌گیرد.
  // مبنا عنوان واقعی <title> است نه نام موجودیت؛ قبلاً صفحه دسته و محصولِ هم‌نام تکراری شمرده
  // می‌شدند در حالی که عنوانشان از ابتدا عمداً متفاوت ساخته می‌شود.
  const seen = new Map<string, AuditItem[]>();
  for (const it of items) {
    const key = norm(it.title);
    seen.set(key, [...(seen.get(key) ?? []), it]);
  }
  for (const group of seen.values()) {
    if (group.length < 2) continue;
    for (const it of group) {
      it.issues.push({ code: 'duplicate', level: 'warn', message: `عنوان با ${formatPersianNumber(group.length - 1)} صفحه دیگر یکسان است` });
      it.score = score(it.issues);
    }
  }

  items.sort((a, b) => a.score - b.score);
  const summary: Record<string, number> = {
    pages: items.length,
    average: items.length ? Math.round(items.reduce((n, i) => n + i.score, 0) / items.length) : 100,
    errors: items.reduce((n, i) => n + i.issues.filter((x) => x.level === 'error').length, 0),
    warnings: items.reduce((n, i) => n + i.issues.filter((x) => x.level === 'warn').length, 0),
  };
  return { items, summary };
}

/**
 * بهینه‌سازی خودکار: فقط فیلدهای خالی پر می‌شوند؛ چیزی که ادمین نوشته هرگز بازنویسی نمی‌شود.
 * با dryRun فقط فهرست تغییرات برمی‌گردد.
 */
export async function runAutofix(dryRun: boolean): Promise<Fix[]> {
  const { products, categories, posts, projects } = await load();
  const fixes: Fix[] = [];
  const add = (f: Fix) => fixes.push(f);

  for (const p of products) {
    const name = p.name.trim();
    if (!p.metaDescription) {
      const source = p.shortDescription || stripHtml(p.description ?? '');
      const after = source.length >= DESC_MIN
        ? clip(source, DESC_MAX)
        : clip(`خرید ${name} با قیمت روز از ${siteConfig.name}؛ ${source ? `${source}. ` : ''}مشخصات فنی، جدول قیمت، مشاوره رایگان و ارسال به سراسر کشور.`, DESC_MAX);
      add({ type: 'product', id: p.id, name, field: 'metaDescription', before: '', after });
    }
    if (!p.focusKeyword) add({ type: 'product', id: p.id, name, field: 'focusKeyword', before: '', after: name });
    if (!isAscii(p.slug)) add({ type: 'product', id: p.id, name, field: 'slug', before: p.slug, after: slugify(p.slug) });
  }

  for (const c of categories) {
    if (!c.description) {
      add({
        type: 'category', id: c.id, name: c.name, field: 'description', before: '',
        after: `خرید انواع ${c.name} با قیمت روز و ارسال به سراسر کشور. مشخصات فنی، جدول قیمت و مشاوره رایگان خرید از ${siteConfig.name}.`,
      });
    }
    if (!isAscii(c.slug)) add({ type: 'category', id: c.id, name: c.name, field: 'slug', before: c.slug, after: slugify(c.slug) });
  }

  for (const b of posts) {
    // متن واقعی مقاله؛ مقاله‌ای که فقط PDF دارد content آن «<p></p>» است و قبلاً توضیحات خالی برایش ساخته می‌شد
    const text = stripHtml(b.content);
    // PDFهای فعلی یا اسکن‌اند یا انگلیسی، پس متنی برای خلاصه‌کردن ندارند — متن کلی ولی درست درباره همان فایل
    const pdfOnly = !text && Boolean(b.pdfUrl);
    if (!b.metaDescription && !b.excerpt && (text || pdfOnly)) {
      const after = text
        ? clip(text, DESC_MAX)
        : clip(`مشاهده فایل PDF «${b.title.trim()}» از ${siteConfig.legalName}؛ برای استعلام قیمت و مشاوره خرید با ${siteConfig.name} تماس بگیرید.`, DESC_MAX);
      add({ type: 'blog', id: b.id, name: b.title, field: 'metaDescription', before: '', after });
    }
    // خلاصه در فهرست مقالات و کارت‌ها نمایش داده می‌شود
    if (!b.excerpt && (text || pdfOnly)) {
      const after = text ? clip(text, 200) : `فایل PDF «${b.title.trim()}» از ${siteConfig.legalName} را به صورت آنلاین مشاهده کنید.`;
      add({ type: 'blog', id: b.id, name: b.title, field: 'excerpt', before: '', after });
    }
    if (!b.focusKeyword) {
      const kw = b.title.replace(/[؟?!:،.|].*$/, '').trim();
      if (kw && kw.length <= 45) add({ type: 'blog', id: b.id, name: b.title, field: 'focusKeyword', before: '', after: kw });
    }
    if (b.title.length > TITLE_MAX && !b.metaTitle) {
      add({ type: 'blog', id: b.id, name: b.title, field: 'metaTitle', before: '', after: clip(b.title, TITLE_MAX, false) });
    }
    if (!isAscii(b.slug)) add({ type: 'blog', id: b.id, name: b.title, field: 'slug', before: b.slug, after: slugify(b.slug) });
  }

  for (const pr of projects) {
    if (!pr.description && pr.content) {
      add({ type: 'project', id: pr.id, name: pr.title, field: 'description', before: '', after: clip(pr.content, DESC_MAX) });
    }
    if (!isAscii(pr.slug)) add({ type: 'project', id: pr.id, name: pr.title, field: 'slug', before: pr.slug, after: slugify(pr.slug) });
  }

  if (dryRun || !fixes.length) return fixes;

  const productCategory = new Map(products.map((p) => [p.id, p.category.slug]));
  for (const f of fixes) {
    const data = { [f.field]: f.after };
    if (f.type === 'product') {
      await prisma.product.update({ where: { id: f.id }, data });
      if (f.field === 'slug') await recordRedirect(`/products/${productCategory.get(f.id)}/${f.before}`, `/products/${productCategory.get(f.id)}/${f.after}`);
    } else if (f.type === 'category') {
      await prisma.category.update({ where: { id: f.id }, data });
      if (f.field === 'slug') await recordRedirect(`/products/${f.before}`, `/products/${f.after}`);
    } else if (f.type === 'blog') {
      await prisma.blogPost.update({ where: { id: f.id }, data });
      if (f.field === 'slug') await recordRedirect(`/blog/${f.before}`, `/blog/${f.after}`);
    } else {
      await prisma.project.update({ where: { id: f.id }, data });
      if (f.field === 'slug') await recordRedirect(`/projects/${f.before}`, `/projects/${f.after}`);
    }
  }
  return fixes;
}
