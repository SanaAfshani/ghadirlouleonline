import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { prisma } from '@/shared/lib/prisma';
import { addWatermark } from '@/shared/lib/watermark';

/**
 * کش نسخه واترمارک‌دار عکس‌های آپلودی. قبلاً هر درخواست /media/<id> عکس را از دیتابیس می‌خواند و دوباره واترمارک
 * می‌کرد — روی سرور اصلی ۷ تا ۱۸ ثانیه برای هر عکس؛ گالری محصول با کلیک روی هر عکس همین‌قدر منتظر می‌ماند.
 * حالا هر عکس یک بار ساخته می‌شود: روی دیسک (.next/cache، تا دیپلوی بعدی) + حافظه برای عکس‌های پرتکرار.
 * پیش‌ساخت همه عکس‌ها هنگام بالا آمدن سرور حذف شد: روی سرور کوچک CPU را چند دقیقه کامل می‌گرفت و صفحه‌ها بالا نمی‌آمدند.
 * محتوای هر id هرگز عوض نمی‌شود؛ با تغییر واترمارک فقط VERSION را عوض کنید.
 */
const VERSION = 'wm2';
const DIR = path.join(process.cwd(), '.next', 'cache', 'media-wm');
const MEMORY_LIMIT = 64 * 1024 * 1024;

type Entry = { body: Buffer; mime: string };

const memory = new Map<string, Entry>();
let memoryBytes = 0;
const inflight = new Map<string, Promise<Entry | null>>();

function remember(id: string, entry: Entry) {
  if (entry.body.length > MEMORY_LIMIT / 8) return;
  memory.set(id, entry);
  memoryBytes += entry.body.length;
  // قدیمی‌ترین‌ها اول بیرون می‌روند (Map ترتیب درج را نگه می‌دارد)
  for (const [key, value] of memory) {
    if (memoryBytes <= MEMORY_LIMIT) break;
    memory.delete(key);
    memoryBytes -= value.body.length;
  }
}

const filePath = (id: string) => path.join(DIR, `${VERSION}-${id}`);

async function fromDisk(id: string): Promise<Entry | null> {
  try {
    const [body, mime] = await Promise.all([readFile(filePath(id)), readFile(`${filePath(id)}.mime`, 'utf8')]);
    return { body, mime };
  } catch {
    return null;
  }
}

async function build(id: string): Promise<Entry | null> {
  const media = await prisma.media.findUnique({ where: { id }, select: { data: true, mime: true } });
  if (!media) return null;
  const original = Buffer.from(media.data);
  const body = (await addWatermark(original, media.mime).catch(() => null)) ?? original;
  const entry = { body, mime: media.mime };
  // نوشتن روی دیسک نباید پاسخ را معطل یا خراب کند
  mkdir(DIR, { recursive: true })
    .then(() => Promise.all([writeFile(filePath(id), body), writeFile(`${filePath(id)}.mime`, media.mime)]))
    .catch((error) => console.error('[media-cache] write failed:', error));
  return entry;
}

/** عکس واترمارک‌دار: حافظه ← دیسک ← ساخت (درخواست‌های هم‌زمان برای یک عکس فقط یک بار می‌سازند) */
export async function getMedia(id: string): Promise<Entry | null> {
  const hot = memory.get(id);
  if (hot) return hot;
  const pending = inflight.get(id);
  if (pending) return pending;

  const task = (async () => {
    const entry = (await fromDisk(id)) ?? (await build(id));
    if (entry) remember(id, entry);
    return entry;
  })().finally(() => inflight.delete(id));
  inflight.set(id, task);
  return task;
}
