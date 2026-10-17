-- مشخصات جدای ردیف قیمت (سایز، کلاس سبک/سنگین، مشخصه فنی، ابعاد) — فقط افزودنی
ALTER TABLE "PriceItem" ADD COLUMN IF NOT EXISTS "size" TEXT NOT NULL DEFAULT '';
ALTER TABLE "PriceItem" ADD COLUMN IF NOT EXISTS "grade" TEXT NOT NULL DEFAULT '';
ALTER TABLE "PriceItem" ADD COLUMN IF NOT EXISTS "spec" TEXT NOT NULL DEFAULT '';
ALTER TABLE "PriceItem" ADD COLUMN IF NOT EXISTS "dimensions" TEXT NOT NULL DEFAULT '';
