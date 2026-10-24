-- فیلدهای سئوی پروژه، هم‌تراز با مقاله و محصول (همه اختیاری) — فقط افزودنی
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "metaTitle" TEXT;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "metaDescription" TEXT;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "focusKeyword" TEXT;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "ogTitle" TEXT;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "ogDescription" TEXT;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "faqs" TEXT NOT NULL DEFAULT '[]';
