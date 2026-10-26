import { siteConfig } from '@/shared/config/site';

/**
 * IndexNow — به‌جای انتظار برای خزنده، خودمان خبر می‌دهیم که چه آدرسی عوض شده.
 *
 * قیمت این سایت روزانه تغییر می‌کند و خزنده ممکن است هفته‌ها بعد سر بزند؛ تا آن موقع عددی که
 * Bing و از طریق آن ChatGPT و Copilot نشان می‌دهند قدیمی است. با یک درخواست، همان روز به‌روز می‌شود.
 *
 * کلید باید روی همان دامنه و در مسیر /<key>.txt با همان محتوا در دسترس باشد — فایلش در public است.
 * اگر کلید تنظیم نشده باشد تابع بی‌صدا هیچ کاری نمی‌کند، پس محیط توسعه و تست چیزی نمی‌فرستند.
 */
const KEY = process.env.INDEXNOW_KEY ?? '';
const ENDPOINT = 'https://api.indexnow.org/indexnow';
/** سقف هر درخواست در مستندات IndexNow */
const MAX_URLS = 10_000;

/**
 * خبردادن تغییر چند آدرس. مسیرها نسبی‌اند («/prices») و اینجا کامل می‌شوند.
 *
 * عمداً هیچ خطایی بیرون نمی‌دهد و منتظرش هم نمی‌مانیم: اگر سرویس IndexNow پایین باشد یا کلید
 * اشتباه باشد، نباید ذخیره‌شدن قیمت در پنل ادمین شکست بخورد یا کند شود.
 */
export function pingIndexNow(paths: string[]): void {
  if (!KEY || paths.length === 0) return;

  const host = new URL(siteConfig.url).host;
  const urlList = [...new Set(paths)]
    .slice(0, MAX_URLS)
    .map((p) => (p.startsWith('http') ? p : `${siteConfig.url}${p.startsWith('/') ? p : `/${p}`}`));

  fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host,
      key: KEY,
      keyLocation: `${siteConfig.url}/${KEY}.txt`,
      urlList,
    }),
  }).catch((error) => console.error('[indexnow] ping failed:', error));
}
