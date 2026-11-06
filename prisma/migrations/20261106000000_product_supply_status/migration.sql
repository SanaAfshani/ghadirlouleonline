-- وضعیت تأمین هر محصول: ready | inquiry | pending — خالی یعنی از inStock ساخته شود (src/shared/lib/supply-status.ts). فقط افزودنی
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "supplyStatus" TEXT NOT NULL DEFAULT '';
