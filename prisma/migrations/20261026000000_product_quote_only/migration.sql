-- محصولی که فقط استعلام قیمت می‌گیرد و قیمتش عمومی نیست — فقط افزودنی
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "quoteOnly" BOOLEAN NOT NULL DEFAULT false;
