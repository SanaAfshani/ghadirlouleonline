-- سایت دوزبانه و محتوای قابل‌ویرایش صفحات. فقط افزودنی
CREATE TABLE IF NOT EXISTS "ContentBlock" (
  "key" TEXT NOT NULL,
  "data" TEXT NOT NULL DEFAULT '{}',
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ContentBlock_pkey" PRIMARY KEY ("key")
);
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "translations" TEXT NOT NULL DEFAULT '{}';
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "translations" TEXT NOT NULL DEFAULT '{}';
ALTER TABLE "BlogPost" ADD COLUMN IF NOT EXISTS "translations" TEXT NOT NULL DEFAULT '{}';
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "translations" TEXT NOT NULL DEFAULT '{}';
ALTER TABLE "FAQ" ADD COLUMN IF NOT EXISTS "translations" TEXT NOT NULL DEFAULT '{}';
ALTER TABLE "Testimonial" ADD COLUMN IF NOT EXISTS "translations" TEXT NOT NULL DEFAULT '{}';
ALTER TABLE "PriceItem" ADD COLUMN IF NOT EXISTS "translations" TEXT NOT NULL DEFAULT '{}';
