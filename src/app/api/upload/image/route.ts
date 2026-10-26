import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/shared/lib/admin-auth';
import { IMAGE_PROFILES, InvalidImageError, saveImage, type ImageProfile } from '@/shared/lib/media';

export const maxDuration = 30;

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

/** کلاینت قبل از آپلود می‌پرسد آیا آپلود مستقیم به CDN ممکن است یا نه */
export async function GET() {
  return NextResponse.json({ blobEnabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN) });
}

export async function POST(request: NextRequest) {
  // آپلود فقط برای ادمین — قبلاً هر کسی می‌توانست روی سرور فایل بنویسد
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  const contentType = request.headers.get('content-type') ?? '';

  // ── Client-upload token flow (Vercel Blob) ────────────────────────────────
  if (contentType.includes('application/json')) {
    // بدون توکن، درخواست JSON نباید به شاخه FormData بیفتد — آنجا formData() روی بدنه JSON می‌ترکد
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        { success: false, code: 'BLOB_NOT_CONFIGURED', error: 'آپلود مستقیم پیکربندی نشده است' },
        { status: 501 },
      );
    }
    try {
      const { handleUpload } = await import('@vercel/blob/client');
      const body = await request.json();
      const jsonResponse = await handleUpload({
        body,
        request,
        onBeforeGenerateToken: async () => ({
          allowedContentTypes: ALLOWED_TYPES,
          maximumSizeInBytes: MAX_SIZE,
        }),
        onUploadCompleted: async ({ blob }) => {
          console.log('Image uploaded:', blob.url);
        },
      });
      return NextResponse.json(jsonResponse);
    } catch (err) {
      console.error('Blob handleUpload error:', err);
      return NextResponse.json({ success: false, error: 'خطا در تولید توکن آپلود' }, { status: 500 });
    }
  }

  // ── FormData fallback ─────────────────────────────────────────────────────
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) return NextResponse.json({ success: false, error: 'فایلی انتخاب نشده' }, { status: 400 });
    if (!ALLOWED_TYPES.includes(file.type))
      return NextResponse.json({ success: false, error: 'فقط JPG، PNG و WebP مجاز است' }, { status: 400 });
    if (file.size > MAX_SIZE)
      return NextResponse.json({ success: false, error: 'حجم تصویر نباید بیشتر از ۱۰ مگابایت باشد' }, { status: 400 });

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const { put } = await import('@vercel/blob');
      const ext = file.name.split('.').pop() ?? 'jpg';
      const blob = await put(`images/${Date.now()}.${ext}`, file, { access: 'public' });
      return NextResponse.json({ success: true, url: blob.url });
    }

    // ذخیره در دیتابیس مشترک (نه دیسک همین سرور) تا روی همه سرورها و بعد از هر دیپلوی باز شود
    // پروفایل تعیین می‌کند عکس با چه سقف اندازه و کیفیتی ذخیره شود (اسلاید هرو تمام‌عرض است)
    const asked = String(formData.get('profile') ?? 'default');
    const profile = (asked in IMAGE_PROFILES ? asked : 'default') as ImageProfile;
    return NextResponse.json({ success: true, url: await saveImage(file, profile) });
  } catch (err) {
    if (err instanceof InvalidImageError) {
      return NextResponse.json({ success: false, error: err.message }, { status: 400 });
    }
    console.error('Image upload error:', err);
    return NextResponse.json({ success: false, error: 'خطا در آپلود تصویر' }, { status: 500 });
  }
}
