/**
 * یک بار هنگام بالا آمدن سرور: ستون‌های لازمِ کد جدید را اگر دیتابیس ندارد اضافه می‌کند (shared/lib/ensure-schema)
 * و محتوای جدید را یک بار به دیتابیس همان محیط منتقل می‌کند (shared/lib/content-sync).
 * حداکثر ۲۰ ثانیه صبر — اگر دیتابیس در دسترس نبود سرور گیر نکند؛ خطا فقط لاگ می‌شود.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  const { ensureSchema } = await import('@/shared/lib/ensure-schema');
  const timeout = new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 20_000));
  try {
    await Promise.race([ensureSchema(), timeout]);
    console.log('[schema] ok');
  } catch (error) {
    console.error('[schema] ensure columns failed:', error);
  }

  // انتقال یک‌باره محتوا (shared/lib/content-sync) — در پس‌زمینه تا بالا آمدن سرور منتظر آپلود عکس‌ها نماند
  const { syncContent } = await import('@/shared/lib/content-sync');
  syncContent()
    .then((result) => console.log('[content-sync]', result))
    .catch((error) => console.error('[content-sync] failed, will retry on next start:', error));
}
