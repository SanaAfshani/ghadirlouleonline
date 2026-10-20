import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { prisma } from '@/shared/lib/prisma';
import { CATALOGS, type CatalogDef } from '@/shared/config/catalogs';
import { renderCatalogPdf } from '@/shared/lib/catalog-pdf';

/**
 * کش کاتالوگ PDF. قبلاً هر بار که کسی «مشاهده» را می‌زد، سرور عکس‌ها را دوباره تبدیل و کل PDF را
 * از نو رندر می‌کرد — روی سرور کوچک تا دو دقیقه طول می‌کشید و iframe تمام این مدت سفید می‌ماند
 * (و CPU را می‌گرفت، تا جایی که بقیه صفحه‌ها هم تایم‌اوت می‌خوردند).
 * حالا هر نسخه یک بار ساخته می‌شود: روی دیسک (.next/cache، تا دیپلوی بعدی) + حافظه.
 * کلید کش شامل آخرین updatedAt محصول‌های همان کاتالوگ است، پس با ویرایش محصول خودکار از نو ساخته می‌شود.
 */
const VERSION = 'cat1';
const DIR = path.join(process.cwd(), '.next', 'cache', 'catalog-pdf');

const memory = new Map<string, Buffer>();
const inflight = new Map<string, Promise<Buffer | null>>();

/** کلید نسخه: با تغییر محصولات همین کاتالوگ عوض می‌شود */
async function stamp(def: CatalogDef) {
  const rows = await prisma.product.findMany({
    where: { slug: { in: def.products }, published: true },
    select: { updatedAt: true },
    orderBy: { updatedAt: 'desc' },
    take: 1,
  });
  return `${rows.length ? rows[0].updatedAt.getTime() : 0}-${def.products.length}`;
}

const filePath = (key: string) => path.join(DIR, `${VERSION}-${key}.pdf`);

export async function getCatalogPdf(slug: string): Promise<Buffer | null> {
  const def = CATALOGS[slug];
  if (!def) return null;

  const key = `${slug}-${await stamp(def)}`;
  const hot = memory.get(key);
  if (hot) return hot;
  const pending = inflight.get(key);
  if (pending) return pending;

  const task = (async () => {
    const cached = await readFile(filePath(key)).catch(() => null);
    if (cached) return cached;

    const buffer = await renderCatalogPdf(def);
    if (!buffer) return null;
    // نوشتن روی دیسک نباید پاسخ را معطل یا خراب کند
    mkdir(DIR, { recursive: true })
      .then(() => writeFile(filePath(key), buffer))
      .catch((error) => console.error('[catalog-cache] write failed:', error));
    return buffer;
  })()
    .then((buffer) => {
      // فقط یک نسخه از هر کاتالوگ در حافظه می‌ماند؛ نسخه قدیمی با کلید جدید بی‌مصرف است
      if (buffer) {
        for (const k of memory.keys()) if (k.startsWith(`${slug}-`)) memory.delete(k);
        memory.set(key, buffer);
      }
      return buffer;
    })
    .finally(() => inflight.delete(key));

  inflight.set(key, task);
  return task;
}
