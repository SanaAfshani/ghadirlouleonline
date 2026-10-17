import { readFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

/**
 * واترمارک «لوگو + قدیر لوله آنلاین» روی همه عکس‌ها — روی خود فایل، نه روکش CSS که با یک کلیک برداشته شود.
 * - عکس واقعی: نشان گوشه پایین چپ
 * - زمینه سفید (اینفوگرافیک، عکس محصول روی سفید): نشان بزرگ و کم‌رنگ وسط تصویر تا روی متن گوشه‌ها نیفتد ولی پاک‌کردنش سخت باشد
 * نشان از public/images/watermark.png (ساخته‌شده با scripts/make-watermark.mjs).
 */

/** آیکون و بندانگشتی واقعاً کوچک بی‌واترمارک — نشان رویشان ناخوانا و فقط لک است */
const MIN_SIDE = 240;
/** شفافیت نشان وسط تصاویر گرافیکی */
const CENTER_OPACITY = 0.18;

let badge: Promise<Buffer> | null = null;
const loadBadge = () => (badge ??= readFile(path.join(process.cwd(), 'public', 'images', 'watermark.png')));

/** نشان در عرض داده‌شده؛ opacity < 1 کانال آلفا را کم‌رنگ می‌کند */
async function makeMark(width: number, opacity = 1) {
  const { data, info } = await sharp(await loadBadge()).resize({ width }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
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
    const mark = await makeMark(Math.round(Math.min(width * 0.55, 900)), CENTER_OPACITY);
    layer = { input: mark.data, left: Math.round((width - mark.width) / 2), top: Math.round((height - mark.height) / 2) };
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
