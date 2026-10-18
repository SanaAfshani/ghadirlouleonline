import { readFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

/**
 * واترمارک «لوگو + قدیر لوله آنلاین» روی همه عکس‌ها — روی خود فایل، نه روکش CSS که با یک کلیک برداشته شود.
 * - عکس واقعی: نشان گوشه پایین چپ
 * - زمینه سفید (گواهینامه، اینفوگرافیک، عکس محصول روی سفید): نشان بدون زمینه، مورب و تکرارشونده و کم‌رنگ روی کل تصویر —
 *   متن سند خوانا می‌ماند (نشان قبلی وسط تصویر یک لکه خاکستری روی متن بود) و با بریدن یک گوشه هم پاک نمی‌شود
 * نشان‌ها از public/images/watermark.png و watermark-doc.png (ساخته‌شده با scripts/make-watermark.mjs).
 */

/** آیکون و بندانگشتی واقعاً کوچک بی‌واترمارک — نشان رویشان ناخوانا و فقط لک است */
const MIN_SIDE = 240;
/** شفافیت نشان تکرارشونده روی اسناد و تصاویر گرافیکی */
const DOC_OPACITY = 0.11;

// sharp به‌طور پیش‌فرض همه هسته‌ها را می‌گیرد؛ روی سرور کوچک واترمارک چند عکس هم‌زمان پاسخ صفحه‌ها را معطل می‌کرد
sharp.concurrency(1);

let badge: Promise<Buffer> | null = null;
const loadBadge = () => (badge ??= readFile(path.join(process.cwd(), 'public', 'images', 'watermark.png')));
let docBadge: Promise<Buffer> | null = null;
const loadDocBadge = () => (docBadge ??= readFile(path.join(process.cwd(), 'public', 'images', 'watermark-doc.png')));

/** نشان در عرض داده‌شده؛ opacity < 1 کانال آلفا را کم‌رنگ می‌کند */
async function makeMark(width: number, opacity = 1, source: () => Promise<Buffer> = loadBadge) {
  const { data, info } = await sharp(await source()).resize({ width }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  if (opacity < 1) for (let i = 3; i < data.length; i += 4) data[i] = Math.round(data[i] * opacity);
  return { data: await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer(), width: info.width, height: info.height };
}

export async function addWatermark(input: Buffer, mime: string): Promise<Buffer | null> {
  if (!/^image\/(jpe?g|png|webp)$/.test(mime)) return null;
  const img = sharp(input);
  const { width = 0, height = 0 } = await img.metadata();
  if (Math.min(width, height) < MIN_SIDE) return null;

  const { dominant } = await img.stats();
  const graphic = dominant.r > 225 && dominant.g > 225 && dominant.b > 225;

  let layer: sharp.OverlayOptions;
  if (graphic) {
    // یک کاشی: نشان مورب با فاصله دورش؛ sharp آن را روی کل تصویر تکرار می‌کند
    const mark = await makeMark(Math.round(Math.min(Math.max(width * 0.3, 180), 420)), DOC_OPACITY, loadDocBadge);
    const tile = await sharp(mark.data)
      .rotate(-28, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .extend({ top: 60, bottom: 60, left: 50, right: 50, background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    layer = { input: tile, tile: true };
  } else {
    // حدود یک‌چهارم عرض — نه آن‌قدر بزرگ که روی محصول بیفتد
    const mark = await makeMark(Math.round(Math.min(Math.max(width * 0.24, 140), 520)));
    const margin = Math.round(width * 0.025);
    // عکس عمودی در قاب افقی (گالری، کارت) از بالا و پایین بریده می‌شود — نشان پایینِ ناحیه ۴:۳ وسط عکس تا در هر دو حالت دیده شود
    const bottom = height > width * 1.05 ? Math.round(height / 2 + (width * 0.75) / 2) : height;
    layer = { input: mark.data, left: margin, top: Math.max(0, bottom - mark.height - margin) };
  }

  const out = img.composite([layer]);
  if (mime === 'image/png') return out.png().toBuffer();
  if (mime === 'image/webp') return out.webp({ quality: 88 }).toBuffer();
  return out.jpeg({ quality: 88, mozjpeg: true }).toBuffer();
}
