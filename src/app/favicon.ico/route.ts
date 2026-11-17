import { iconResponse, renderSiteIcon } from '@/shared/lib/site-icon';

/** /favicon.ico برای مرورگرها و خزنده‌هایی که تگ icon صفحه را نمی‌خوانند — همان آیکون پنل (PNG) */
export async function GET() {
  const { png } = await renderSiteIcon(48);
  return iconResponse(png, false);
}
