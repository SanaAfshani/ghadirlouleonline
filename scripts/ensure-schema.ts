// قبل از next build: ستون‌های لازمِ کد جدید را اگر دیتابیس ندارد اضافه می‌کند (همان ensureSchema که موقع بالا آمدن سرور اجرا می‌شود).
// build صفحات وبلاگ/محصول را از دیتابیس پیش‌رندر می‌کند و Prisma همه ستون‌های مدل را می‌خواند؛ دیپلوی Runflare
// migrate deploy اجرا نمی‌کند، پس بدون این مرحله ستون تازه (مثل BlogPost.youtixId) قبل از build وجود ندارد و build می‌شکند.
// فقط ADD COLUMN / CREATE INDEX IF NOT EXISTS — هیچ داده‌ای تغییر یا حذف نمی‌شود.
import 'dotenv/config';
import { ensureSchema } from '../src/shared/lib/ensure-schema';
import { prisma } from '../src/shared/lib/prisma';

ensureSchema()
  .then(() => console.log('[schema] ok'))
  // بدون دیتابیس (مثلاً build محلی) build را متوقف نمی‌کنیم؛ اگر صفحه‌ای دیتابیس بخواهد خودش خطای روشن می‌دهد
  .catch((error) => console.error('[schema] ensure columns failed:', error instanceof Error ? error.message : error))
  .finally(() => prisma.$disconnect());
