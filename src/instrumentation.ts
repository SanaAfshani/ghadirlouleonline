/**
 * یک بار هنگام بالا آمدن سرور: ستون‌های لازمِ کد جدید را اگر دیتابیس ندارد اضافه می‌کند (shared/lib/ensure-schema).
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
}
