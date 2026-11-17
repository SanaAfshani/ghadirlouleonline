import { prisma } from '@/shared/lib/prisma';
import { parseFaqs, parseJsonArray, parseJsonObject, normalizeProjectImages } from '@/shared/lib/serializers';
import { parseCatalogs } from '@/shared/lib/catalog-files';
import { parseTranslations, sanitizeTranslations, translationsFor, type TranslatableModel } from '@/shared/lib/translations';
import {
  BLOG_TRANSLATION_FIELDS,
  CATEGORY_TRANSLATION_FIELDS,
  FAQ_TRANSLATION_FIELDS,
  PRICE_ITEM_TRANSLATION_FIELDS,
  PRODUCT_TRANSLATION_FIELDS,
  PROJECT_TRANSLATION_FIELDS,
  TESTIMONIAL_TRANSLATION_FIELDS,
} from '@/shared/lib/translation-fields';
import {
  applyTranslationItems,
  missingTranslationItems,
  type EnglishTranslations,
  type TranslationFieldDef,
  type TranslationItem,
} from '@/shared/lib/translation-items';
import { LOCALIZED_KEYS, localizedSettingKey, parseCertificates, parseHeroSlides, parseTrustBadges } from '@/shared/lib/site-settings';
import { CONTENT_PAGES } from '@/shared/content/registry';
import { editableSection } from '@/shared/content/resolve';
import { applyTranslations, missingTranslations } from '@/shared/content/translate-items';
import { sanitizeSectionData, stripDangerousHtml } from '@/shared/content/sanitize';
import type { StoredBlock } from '@/shared/content/types';

/**
 * ترجمه گروهی همه محتوای فارسیِ بدون نسخه انگلیسی: هفت مدل دیتابیس، تنظیمات سایت (متن‌ها، عنوان گواهی‌ها، alt اسلایدها،
 * نام نمادهای اعتماد) و بخش‌های «محتوای صفحات» که ادمین فارسی‌شان را عوض کرده ولی انگلیسی‌شان را نه.
 *
 * فقط جاهای خالی پر می‌شوند — ترجمه‌ای که ادمین دستی نوشته یا اصلاح کرده بازنویسی نمی‌شود.
 * مترجم از بیرون داده می‌شود: در پنل و اسکریپت Claude (translate-core)، در اسکریپت هم می‌شود خروجی/ورودی فایل JSON گرفت.
 * این فایل server-only نیست تا scripts/translate-all.ts هم از آن استفاده کند.
 */

export type Translator = (items: TranslationItem[]) => Promise<Record<string, string>>;

/** یک رکورد (محصول، بخش صفحه، ...) با متن‌های ترجمه‌نشده‌اش؛ save نتیجه را (id ← متن انگلیسی) ذخیره می‌کند */
type PendingRow = { id: string; title: string; items: TranslationItem[]; save: (result: Record<string, string>) => Promise<void> };

type Target = { key: string; label: string; rows: () => Promise<PendingRow[]> };

function modelTarget<R extends { id: string; translations: string }>(opts: {
  key: string;
  label: string;
  model: TranslatableModel;
  fields: TranslationFieldDef[];
  findMany: () => Promise<R[]>;
  source: (row: R) => Record<string, unknown>;
  title: (row: R) => string;
  update: (id: string, translations: string) => Promise<unknown>;
}): Target {
  return {
    key: opts.key,
    label: opts.label,
    rows: async () =>
      (await opts.findMany()).map((row) => {
        const en = translationsFor(row.translations, 'en') as EnglishTranslations;
        const source = opts.source(row);
        return {
          id: row.id,
          title: opts.title(row),
          items: missingTranslationItems(opts.fields, source, en),
          save: async (result) => {
            const all = parseTranslations(row.translations);
            all.en = applyTranslationItems(opts.fields, source, en, result);
            await opts.update(row.id, sanitizeTranslations(opts.model, all, stripDangerousHtml));
          },
        };
      }),
  };
}

const SEO_SOURCE = (r: { metaTitle: string | null; metaDescription: string | null; ogTitle: string | null; ogDescription: string | null }) => ({
  metaTitle: r.metaTitle,
  metaDescription: r.metaDescription,
  ogTitle: r.ogTitle,
  ogDescription: r.ogDescription,
});

/** تنظیمات سایت یک «ردیف» است؛ id هر متن پیشوند نوعش را دارد: setting:<key>، cert:<i>، hero:<i>، badge:<i> */
async function settingsRows(): Promise<PendingRow[]> {
  const rows = await prisma.siteSettings.findMany();
  const raw = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  const items: TranslationItem[] = [];

  // فقط متن فارسیِ ثبت‌شده در پنل؛ کلید خالی یعنی متن پیش‌فرض کد که نسخه انگلیسی‌اش آماده است
  for (const key of Object.values(LOCALIZED_KEYS)) {
    if (raw[key]?.trim() && !raw[localizedSettingKey(key, 'en')]?.trim()) {
      items.push({ id: `setting:${key}`, text: raw[key], html: key === 'home_seo_content' });
    }
  }
  const certificates = parseCertificates(raw.certificates);
  certificates.forEach((c, i) => !c.titleEn && items.push({ id: `cert:${i}`, text: c.title, html: false }));
  const slides = parseHeroSlides(raw.hero_slides);
  slides.forEach((s, i) => s.alt && !s.altEn && items.push({ id: `hero:${i}`, text: s.alt, html: false }));
  const badges = parseTrustBadges(raw.trust_badges);
  badges?.forEach((b, i) => !b.nameEn && items.push({ id: `badge:${i}`, text: b.name, html: false }));

  const write = (key: string, value: string) =>
    prisma.siteSettings.upsert({ where: { key }, update: { value }, create: { key, value, type: 'text' } });

  return [
    {
      id: 'settings',
      title: 'تنظیمات سایت',
      items,
      save: async (result) => {
        const pick = (prefix: string) =>
          Object.fromEntries(Object.entries(result).filter(([id]) => id.startsWith(prefix)).map(([id, text]) => [id.slice(prefix.length), text]));
        for (const [key, text] of Object.entries(pick('setting:'))) {
          await write(localizedSettingKey(key, 'en'), key === 'home_seo_content' ? stripDangerousHtml(text) : text.slice(0, 4000));
        }
        const certs = pick('cert:');
        if (Object.keys(certs).length) {
          await write('certificates', JSON.stringify(certificates.map((c, i) => ({ ...c, titleEn: certs[i] ?? c.titleEn }))));
        }
        const heroAlts = pick('hero:');
        if (Object.keys(heroAlts).length) {
          await write('hero_slides', JSON.stringify(slides.map((s, i) => ({ ...s, altEn: heroAlts[i] ?? s.altEn }))));
        }
        const badgeNames = pick('badge:');
        if (badges && Object.keys(badgeNames).length) {
          await write('trust_badges', JSON.stringify(badges.map((b, i) => ({ ...b, nameEn: badgeNames[i] ?? b.nameEn }))));
        }
      },
    },
  ];
}

/** بخش‌های صفحات: متن پیش‌فرض کد ترجمه دارد؛ فقط جایی که ادمین فارسی را عوض کرده و انگلیسی ننوشته خالی است */
async function contentRows(): Promise<PendingRow[]> {
  const blocks = await prisma.contentBlock.findMany();
  const stored = new Map(blocks.map((b) => [b.key, JSON.parse(b.data) as StoredBlock]));
  return CONTENT_PAGES.flatMap((page) =>
    page.sections.map((section) => {
      const data = stored.get(section.key);
      const fa = editableSection(section, data, 'fa');
      const en = editableSection(section, data, 'en');
      return {
        id: section.key,
        title: `${page.title} ← ${section.title}`,
        items: missingTranslations(section.fields, fa, en),
        save: async (result: Record<string, string>) => {
          const next: StoredBlock = { ...(data ?? {}), en: sanitizeSectionData(section.fields, 'en', applyTranslations(en, result)) };
          const json = JSON.stringify(next);
          await prisma.contentBlock.upsert({ where: { key: section.key }, update: { data: json }, create: { key: section.key, data: json } });
        },
      };
    }),
  );
}

export const TRANSLATION_TARGETS: Target[] = [
  modelTarget({
    key: 'category',
    label: 'دسته‌بندی‌ها',
    model: 'category',
    fields: CATEGORY_TRANSLATION_FIELDS,
    findMany: () => prisma.category.findMany({ orderBy: { order: 'asc' } }),
    source: (r) => ({ name: r.name, description: r.description, content: r.content }),
    title: (r) => r.name,
    update: (id, translations) => prisma.category.update({ where: { id }, data: { translations } }),
  }),
  modelTarget({
    key: 'product',
    label: 'محصولات',
    model: 'product',
    fields: PRODUCT_TRANSLATION_FIELDS,
    findMany: () => prisma.product.findMany({ orderBy: { createdAt: 'asc' } }),
    source: (r) => ({
      name: r.name,
      shortDescription: r.shortDescription,
      description: r.description,
      ...SEO_SOURCE(r),
      faqs: parseFaqs(r.faqs),
      specifications: parseJsonObject(r.specifications),
      catalogTitles: parseCatalogs(r.catalogs).map((c) => c.title),
    }),
    title: (r) => r.name,
    update: (id, translations) => prisma.product.update({ where: { id }, data: { translations } }),
  }),
  modelTarget({
    key: 'priceItem',
    label: 'ردیف‌های جدول قیمت',
    model: 'priceItem',
    fields: PRICE_ITEM_TRANSLATION_FIELDS,
    findMany: () => prisma.priceItem.findMany({ orderBy: [{ productId: 'asc' }, { sortOrder: 'asc' }] }),
    source: (r) => ({ title: r.title, spec: r.spec, note: r.note }),
    title: (r) => r.title,
    update: (id, translations) => prisma.priceItem.update({ where: { id }, data: { translations } }),
  }),
  modelTarget({
    key: 'blogPost',
    label: 'مقالات',
    model: 'blogPost',
    fields: BLOG_TRANSLATION_FIELDS,
    findMany: () => prisma.blogPost.findMany({ orderBy: { createdAt: 'asc' } }),
    source: (r) => ({ title: r.title, excerpt: r.excerpt, content: r.content, ...SEO_SOURCE(r), faqs: parseFaqs(r.faqs), tags: parseJsonArray(r.tags) }),
    title: (r) => r.title,
    update: (id, translations) => prisma.blogPost.update({ where: { id }, data: { translations } }),
  }),
  modelTarget({
    key: 'project',
    label: 'پروژه‌ها',
    model: 'project',
    fields: PROJECT_TRANSLATION_FIELDS,
    findMany: () => prisma.project.findMany({ orderBy: { createdAt: 'asc' } }),
    source: (r) => ({
      title: r.title,
      description: r.description,
      content: r.content,
      location: r.location,
      client: r.client,
      ...SEO_SOURCE(r),
      faqs: parseFaqs(r.faqs),
      imageAlts: normalizeProjectImages(r.images).map((img) => img.alt),
    }),
    title: (r) => r.title,
    update: (id, translations) => prisma.project.update({ where: { id }, data: { translations } }),
  }),
  modelTarget({
    key: 'faq',
    label: 'سوالات متداول',
    model: 'faq',
    fields: FAQ_TRANSLATION_FIELDS,
    findMany: () => prisma.fAQ.findMany({ orderBy: { order: 'asc' } }),
    source: (r) => ({ question: r.question, answer: r.answer, category: r.category }),
    title: (r) => r.question,
    update: (id, translations) => prisma.fAQ.update({ where: { id }, data: { translations } }),
  }),
  modelTarget({
    key: 'testimonial',
    label: 'نظرات مشتریان',
    model: 'testimonial',
    fields: TESTIMONIAL_TRANSLATION_FIELDS,
    findMany: () => prisma.testimonial.findMany({ orderBy: { createdAt: 'asc' } }),
    source: (r) => ({ name: r.name, company: r.company, position: r.position, content: r.content }),
    title: (r) => r.name,
    update: (id, translations) => prisma.testimonial.update({ where: { id }, data: { translations } }),
  }),
  { key: 'settings', label: 'تنظیمات سایت (گواهی‌ها، اسلایدها، نمادها)', rows: settingsRows },
  { key: 'content', label: 'محتوای صفحات (متن‌های ویرایش‌شده)', rows: contentRows },
];

export function findTarget(key: string): Target | undefined {
  return TRANSLATION_TARGETS.find((t) => t.key === key);
}

export type TargetCoverage = { key: string; label: string; total: number; complete: number; pendingTexts: number };

/** پوشش ترجمه هر بخش: چند رکورد کامل ترجمه شده‌اند و چند متن مانده */
export async function translationCoverage(): Promise<TargetCoverage[]> {
  return Promise.all(
    TRANSLATION_TARGETS.map(async (target) => {
      const rows = await target.rows();
      return {
        key: target.key,
        label: target.label,
        total: rows.length,
        complete: rows.filter((r) => !r.items.length).length,
        pendingTexts: rows.reduce((sum, r) => sum + r.items.length, 0),
      };
    }),
  );
}

/** حجم هر درخواست ترجمه — مقاله بلند تنها می‌رود، متن‌های کوتاه چند رکورد با هم */
const BATCH_CHARS = 24000;

/**
 * یک دور ترجمه برای یک بخش: رکوردهای بدون ترجمه تا سقف maxChars (چند درخواست) ترجمه و ذخیره می‌شوند.
 * پنل هر بار یک دور را صدا می‌زند (تا زمان درخواست HTTP کوتاه بماند) و تا remaining صفر شود تکرار می‌کند.
 */
export async function translateTarget(key: string, translate: Translator, maxChars = BATCH_CHARS * 3) {
  const target = findTarget(key);
  if (!target) throw new Error(`unknown target: ${key}`);
  const pending = (await target.rows()).filter((r) => r.items.length);

  const picked: PendingRow[] = [];
  let chars = 0;
  for (const row of pending) {
    const size = row.items.reduce((sum, i) => sum + i.text.length, 0);
    if (picked.length && chars + size > maxChars) break;
    picked.push(row);
    chars += size;
  }

  await translateRows(picked, translate);
  return { translated: picked.length, remaining: pending.length - picked.length };
}

/** رکوردهای داده‌شده را با چند درخواست ترجمه و ذخیره می‌کند */
async function translateRows(picked: PendingRow[], translate: Translator) {
  // شناسه هر متن در درخواست: «اندیس رکورد:مسیر فیلد» تا نتیجه به رکورد خودش برگردد
  const all = picked.flatMap((row, r) => row.items.map((item) => ({ ...item, id: `${r}:${item.id}` })));
  const results: Record<string, string> = {};
  let batch: TranslationItem[] = [];
  let batchChars = 0;
  const flush = async () => {
    if (!batch.length) return;
    Object.assign(results, await translate(batch));
    batch = [];
    batchChars = 0;
  };
  for (const item of all) {
    if (batch.length && batchChars + item.text.length > BATCH_CHARS) await flush();
    batch.push(item);
    batchChars += item.text.length;
  }
  await flush();

  for (const [r, row] of picked.entries()) {
    const prefix = `${r}:`;
    const result = Object.fromEntries(Object.entries(results).filter(([id]) => id.startsWith(prefix)).map(([id, text]) => [id.slice(prefix.length), text]));
    if (Object.keys(result).length) await row.save(result);
  }
}

/** ترجمه متن‌های خالی یک رکورد (ترجمه خودکار بعد از ذخیره در پنل) — تعداد متن‌های ترجمه‌شده */
export async function translateRow(key: string, rowId: string, translate: Translator): Promise<number> {
  const target = findTarget(key);
  if (!target) throw new Error(`unknown target: ${key}`);
  const row = (await target.rows()).find((r) => r.id === rowId && r.items.length);
  if (!row) return 0;
  await translateRows([row], translate);
  return row.items.length;
}

/** برای ترجمه بیرون از برنامه (اسکریپت): همه متن‌های بدون ترجمه با نشانی کامل */
export type ExportedItem = { target: string; row: string; title: string; id: string; html: boolean; text: string; translation?: string };

export async function exportPending(): Promise<ExportedItem[]> {
  const out: ExportedItem[] = [];
  for (const target of TRANSLATION_TARGETS) {
    for (const row of await target.rows()) {
      for (const item of row.items) out.push({ target: target.key, row: row.id, title: row.title, id: item.id, html: item.html, text: item.text });
    }
  }
  return out;
}

/** ترجمه‌های فایل خروجی (فیلد translation پر شده) را در همان رکوردها ذخیره می‌کند */
export async function importTranslations(entries: ExportedItem[]): Promise<number> {
  let saved = 0;
  for (const target of TRANSLATION_TARGETS) {
    const mine = entries.filter((e) => e.target === target.key && e.translation?.trim());
    if (!mine.length) continue;
    for (const row of await target.rows()) {
      const result = Object.fromEntries(mine.filter((e) => e.row === row.id).map((e) => [e.id, e.translation!.trim()]));
      if (!Object.keys(result).length) continue;
      await row.save(result);
      saved += Object.keys(result).length;
    }
  }
  return saved;
}
