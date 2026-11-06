-- متن بلند صفحه دسته (HTML) — زیر محصولات صفحه دسته نمایش داده می‌شود. فقط افزودنی
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "content" TEXT;
