import 'server-only';
import { after } from 'next/server';
import { revalidateLocalized } from '@/shared/i18n/server';
import { translateRow } from '@/shared/lib/bulk-translate';
import { isTranslatorConfigured, translateToEnglish } from '@/shared/lib/translate';

/**
 * ترجمه خودکار بعد از ذخیره در پنل: متن‌های فارسیِ بدون نسخه انگلیسیِ همان رکورد، بعد از فرستادن پاسخ (after)
 * ترجمه و ذخیره می‌شوند؛ ادمین منتظر نمی‌ماند و خطای سرویس ترجمه ذخیره فارسی را خراب نمی‌کند.
 * فقط وقتی سرویس ترجمه تنظیم شده باشد (TRANSLATE_API_BASE_URL یا ANTHROPIC_API_KEY)؛ ترجمه دستی دست نمی‌خورد.
 */
export function scheduleAutoTranslate(target: string, rowId: string) {
  if (!isTranslatorConfigured()) return;
  after(async () => {
    try {
      const translated = await translateRow(target, rowId, translateToEnglish);
      if (translated) revalidateLocalized('/', 'layout');
    } catch (error) {
      console.error('[auto-translate]', target, rowId, error instanceof Error ? error.message : error);
    }
  });
}
