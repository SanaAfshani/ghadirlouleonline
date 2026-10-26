import { isBlobEnabled } from '@/shared/lib/blob-support';

const ENDPOINT = '/api/upload/image';
const MAX_MB = 10;
const ALLOWED = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

export async function uploadImage(file: File, profile?: string): Promise<string> {
  if (file.size > MAX_MB * 1024 * 1024)
    throw new Error(`حجم تصویر نباید بیشتر از ${MAX_MB} مگابایت باشد`);
  if (!ALLOWED.includes(file.type)) throw new Error('فقط JPG، PNG و WebP مجاز است');

  // آپلود مستقیم به CDN فقط وقتی سرور تاییدش کند — در غیر این صورت مستقیم سراغ سرور می‌رویم
  if (await isBlobEnabled(ENDPOINT)) {
    const { upload } = await import('@vercel/blob/client');
    const ext = file.name.split('.').pop() ?? 'jpg';
    const blob = await upload(`images/${Date.now()}.${ext}`, file, {
      access: 'public',
      handleUploadUrl: ENDPOINT,
    });
    return blob.url;
  }

  const fd = new FormData();
  fd.append('file', file);
  if (profile) fd.append('profile', profile);
  const res = await fetch(ENDPOINT, { method: 'POST', body: fd });
  const json = (await res.json().catch(() => ({}))) as {
    success?: boolean;
    url?: string;
    error?: string;
  };
  if (!res.ok || !json.success) throw new Error(json.error ?? 'آپلود ناموفق بود');
  return json.url!;
}
