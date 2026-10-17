import { prisma } from '@/shared/lib/prisma';

/**
 * ستون‌هایی که کد جدید لازم دارد، اگر دیتابیس هنوز نداشته باشد (همان SQL مایگریشن‌های prisma/migrations، idempotent).
 * دیپلوی سرور اصلی (Runflare) فقط build می‌گیرد و migrate deploy اجرا نمی‌کند؛ بدون این، با دیپلوی کد جدید روی
 * دیتابیس قدیمی هر کوئری PriceItem/Quote خطای ۵۰۰ می‌داد. فقط ADD COLUMN IF NOT EXISTS — هیچ داده‌ای تغییر/حذف نمی‌شود.
 * مایگریشن جدید که اضافه شد، دستورهایش را این‌جا هم بگذارید.
 */
const STATEMENTS = [
  // 20261017000000_price_item_specs
  `ALTER TABLE "PriceItem" ADD COLUMN IF NOT EXISTS "size" TEXT NOT NULL DEFAULT ''`,
  `ALTER TABLE "PriceItem" ADD COLUMN IF NOT EXISTS "grade" TEXT NOT NULL DEFAULT ''`,
  `ALTER TABLE "PriceItem" ADD COLUMN IF NOT EXISTS "spec" TEXT NOT NULL DEFAULT ''`,
  `ALTER TABLE "PriceItem" ADD COLUMN IF NOT EXISTS "dimensions" TEXT NOT NULL DEFAULT ''`,
  // 20261017120000_quote_order_tracking
  `ALTER TABLE "Quote" ADD COLUMN IF NOT EXISTS "orderStatus" TEXT NOT NULL DEFAULT ''`,
  `ALTER TABLE "Quote" ADD COLUMN IF NOT EXISTS "orderLog" TEXT NOT NULL DEFAULT '[]'`,
  `ALTER TABLE "Quote" ADD COLUMN IF NOT EXISTS "trackingNote" TEXT NOT NULL DEFAULT ''`,
];

export async function ensureSchema() {
  for (const sql of STATEMENTS) await prisma.$executeRawUnsafe(sql);
}
