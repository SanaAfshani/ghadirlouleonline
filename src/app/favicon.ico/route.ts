import { iconResponse, renderSiteIcon } from '@/shared/lib/site-icon';

// بدون این، Next فایل را موقع build یک بار می‌سازد و آیکون تازه پنل تا دیپلوی بعدی دیده نمی‌شود
export const dynamic = 'force-dynamic';

/** /favicon.ico برای مرورگرها و خزنده‌هایی که تگ icon صفحه را نمی‌خوانند — همان آیکون پنل (PNG) */
export async function GET() {
  const { png } = await renderSiteIcon(48);
  return iconResponse(png, false);
}
