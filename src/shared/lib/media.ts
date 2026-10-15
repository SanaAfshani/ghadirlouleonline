import sharp from 'sharp';
import { prisma } from '@/shared/lib/prisma';

/** بزرگ‌ترین ضلع تصویر ذخیره‌شده — برای کاور و متن مقاله کافی است؛ next/image سایزهای کوچک‌تر را خودش می‌سازد */
const MAX_SIDE = 2000;

export class InvalidImageError extends Error {}

/**
 * تصویر آپلودی را فشرده (WebP) در دیتابیس ذخیره می‌کند و آدرس عمومی آن را برمی‌گرداند.
 * sharp محتوای واقعی فایل را می‌خواند؛ فایلی که فقط پسوند/نوعش تصویر است ولی تصویر نیست رد می‌شود.
 */
export async function saveImage(file: File): Promise<string> {
  const input = Buffer.from(await file.arrayBuffer());
  let output: { data: Buffer; info: sharp.OutputInfo };
  try {
    output = await sharp(input, { animated: file.type === 'image/gif' })
      .rotate() // جهت درست بر اساس EXIF عکس موبایل
      .resize({ width: MAX_SIDE, height: MAX_SIDE, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 90 })
      .toBuffer({ resolveWithObject: true });
  } catch {
    throw new InvalidImageError('فایل تصویر معتبر نیست');
  }

  const media = await prisma.media.create({
    data: {
      data: new Uint8Array(output.data),
      mime: 'image/webp',
      size: output.info.size,
      width: output.info.width,
      height: output.info.height,
      originalName: file.name.slice(0, 200),
    },
    select: { id: true },
  });
  return `/media/${media.id}.webp`;
}

/**
 * به تصاویر /media داخل HTML (توضیحات محصول) ابعاد واقعی و lazy-load اضافه می‌کند؛
 * بدون width/height جای عکس تا لود شدن صفر است و متن زیرش موقع اسکرول پرش می‌کند.
 */
export async function withImageDimensions(html: string): Promise<string> {
  const ids = [...new Set([...html.matchAll(/<img\b[^>]*\bsrc="\/media\/([a-z0-9]{20,40})\.[a-z0-9]+"/gi)].map((m) => m[1]))];
  if (!ids.length) return html;
  const rows = await prisma.media.findMany({ where: { id: { in: ids } }, select: { id: true, width: true, height: true } });
  const dims = new Map(rows.map((r) => [r.id, r]));
  return html.replace(/<img\b([^>]*)>/gi, (tag, attrs: string) => {
    if (/\bwidth=/i.test(attrs)) return tag;
    const d = dims.get(attrs.match(/\bsrc="\/media\/([a-z0-9]{20,40})\./i)?.[1] ?? '');
    if (!d?.width || !d.height) return tag;
    const lazy = /\bloading=/i.test(attrs) ? '' : ' loading="lazy" decoding="async"';
    return `<img width="${d.width}" height="${d.height}"${lazy}${attrs}>`;
  });
}
