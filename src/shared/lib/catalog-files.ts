import type { CatalogFile } from '@/shared/types';

/** حداکثر تعداد کاتالوگ هر محصول — بیش از این روی صفحه شلوغ می‌شود */
const MAX_FILES = 10;
/** حداکثر صفحه هر کاتالوگ تصویری */
const MAX_PAGES = 60;

/** کاتالوگ تصویری است (صفحه دارد) نه PDF */
export function isImageCatalog(file: CatalogFile): file is CatalogFile & { pages: string[] } {
  return Array.isArray(file.pages) && file.pages.length > 0;
}

/** تعداد صفحه‌های نمایشی — PDF تعداد صفحه‌اش را از قبل نمی‌دانیم */
export function pageCount(file: CatalogFile) {
  return isImageCatalog(file) ? file.pages.length : 0;
}

/**
 * آماده‌سازی کاتالوگ‌های یک محصول برای ذخیره در دیتابیس (JSON String).
 * ردیفی که نه فایل PDF دارد نه صفحه تصویری، حذف می‌شود؛ عنوان خالی با نام فایل پر می‌شود.
 */
export function serializeCatalogs(input: unknown): string {
  if (!Array.isArray(input)) return '[]';

  const items: CatalogFile[] = input
    .map((raw) => {
      const item = raw as CatalogFile;
      const url = String(item?.url ?? '').trim();
      const pages = Array.isArray(item?.pages)
        ? item.pages.map((p) => String(p ?? '').trim()).filter(Boolean).slice(0, MAX_PAGES)
        : [];
      const title = String(item?.title ?? '').trim();
      return {
        title: title || fileNameOf(url || pages[0] || ''),
        ...(url ? { url } : {}),
        ...(pages.length ? { pages } : {}),
      };
    })
    .filter((item) => item.url || item.pages?.length)
    .slice(0, MAX_FILES);

  return JSON.stringify(items);
}

/** خواندن کاتالوگ‌ها از ستون JSON — در برابر مقدار خراب یا قدیمی امن است */
export function parseCatalogs(value: string | null | undefined): CatalogFile[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((raw) => {
        const item = raw as CatalogFile;
        const url = String(item?.url ?? '').trim();
        const pages = Array.isArray(item?.pages)
          ? item.pages.map((p) => String(p ?? '')).filter(Boolean)
          : [];
        const title = String(item?.title ?? '').trim();
        return {
          title: title || fileNameOf(url || pages[0] || ''),
          ...(url ? { url } : {}),
          ...(pages.length ? { pages } : {}),
        };
      })
      .filter((item) => item.url || item.pages?.length);
  } catch {
    return [];
  }
}

/** نام فایل از انتهای آدرس — برای وقتی ادمین عنوانی وارد نکرده است */
function fileNameOf(url: string) {
  return decodeURIComponent(url.split('?')[0].split('/').pop() ?? '') || 'کاتالوگ';
}
