import 'server-only';
import type { Metadata } from 'next';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { prisma } from '@/shared/lib/prisma';
import { getSiteSettingsMap } from '@/shared/lib/site-settings-store';
import { DEFAULT_ICON, siteIconSource } from '@/shared/lib/site-settings';

/** اندازه‌های آیکون سایت: favicon، آیکون آیفون (۱۸۰) و آیکون اندروید/گوگل */
export const ICON_SIZES = [32, 48, 180, 192, 512] as const;
export type IconSize = (typeof ICON_SIZES)[number];

async function sourceBytes(src: string): Promise<Buffer> {
  const media = src.match(/^\/media\/([a-z0-9]{20,40})\./i);
  if (media) {
    // خود فایل آپلودی، نه نسخه واترمارک‌دار /media
    const row = await prisma.media.findUnique({ where: { id: media[1] }, select: { data: true } });
    if (row) return Buffer.from(row.data);
  } else if (/^\/images\/[\w./-]+$/.test(src) && !src.includes('..')) {
    return readFile(path.join(process.cwd(), 'public', src));
  }
  return readFile(path.join(process.cwd(), 'public', DEFAULT_ICON));
}

/**
 * آیکون سایت در اندازه خواسته‌شده، PNG مربعی با پس‌زمینه شفاف. آپلود پنل WebP است و آیکون آیفون و بعضی مرورگرها
 * WebP نمی‌پذیرند، پس این‌جا تبدیل می‌شود. منبع: «تنظیمات ← لوگو و آیکون» (آیکون جدا یا همان لوگو).
 */
export async function renderSiteIcon(size: IconSize): Promise<{ png: Buffer; version: string }> {
  const src = siteIconSource(await getSiteSettingsMap());
  const input = await sourceBytes(src).catch(() => sourceBytes(DEFAULT_ICON));
  const png = await sharp(input)
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  return { png, version: iconVersionOf(src) };
}

/** همان نسخه‌ای که mergeSiteSettings در iconVersion می‌گذارد */
function iconVersionOf(src: string): string {
  return src.replace(/[^\w]/g, '').slice(-24);
}

export function iconResponse(png: Buffer, cacheable: boolean): Response {
  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      // آدرس نسخه‌دار (?v=) با هر آیکون تازه عوض می‌شود، پس کش طولانی امن است؛ بدون نسخه یک ساعت
      'Cache-Control': cacheable ? 'public, max-age=31536000, immutable' : 'public, max-age=3600',
    },
  });
}

/** تگ‌های icon و apple-touch-icon صفحه — جای فایل‌های ثابت icon.png/apple-icon.png که از پنل قابل تغییر نبودند */
export function iconMetadata(version: string): NonNullable<Metadata['icons']> {
  const url = (size: IconSize) => `/api/brand/icon/${size}?v=${version}`;
  return {
    icon: [
      { url: url(32), sizes: '32x32', type: 'image/png' },
      { url: url(192), sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: url(180), sizes: '180x180', type: 'image/png' }],
  };
}
