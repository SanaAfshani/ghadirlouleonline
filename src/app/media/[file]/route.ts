import { NextResponse } from 'next/server';
import { getMedia } from '@/shared/lib/media-cache';

type Props = { params: Promise<{ file: string }> };

/**
 * سرو تصاویر آپلودی از دیتابیس: /media/<id>.webp
 * محتوای هر آدرس هرگز عوض نمی‌شود (آپلود جدید = id جدید)، پس کش یک‌ساله immutable امن است.
 * عکس‌های بزرگ لوگوی سایت را به‌صورت واترمارک می‌گیرند (shared/lib/watermark)؛ نسخه واترمارک‌دار یک بار ساخته و
 * روی سرور کش می‌شود (shared/lib/media-cache) — قبلاً هر درخواست چند ثانیه دیتابیس و واترمارک می‌خواست.
 */
export async function GET(_request: Request, { params }: Props) {
  const { file } = await params;
  const id = file.replace(/\.[a-z0-9]+$/i, '');
  if (!/^[a-z0-9]{20,40}$/i.test(id)) return new NextResponse('Not found', { status: 404 });

  const media = await getMedia(id);
  if (!media) return new NextResponse('Not found', { status: 404 });
  const { body } = media;

  return new NextResponse(new Uint8Array(body), {
    headers: {
      'Content-Type': media.mime,
      'Content-Length': String(body.length),
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
