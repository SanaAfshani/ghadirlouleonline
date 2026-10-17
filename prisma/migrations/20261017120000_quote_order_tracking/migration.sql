-- پیگیری سفارش روی پیش‌فاکتور — فقط افزودنی
ALTER TABLE "Quote" ADD COLUMN IF NOT EXISTS "orderStatus" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Quote" ADD COLUMN IF NOT EXISTS "orderLog" TEXT NOT NULL DEFAULT '[]';
ALTER TABLE "Quote" ADD COLUMN IF NOT EXISTS "trackingNote" TEXT NOT NULL DEFAULT '';
