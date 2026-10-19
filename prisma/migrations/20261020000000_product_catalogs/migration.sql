-- کاتالوگ و مدارک فنی محصول (آرایه JSON از {title, url}) — فقط افزودنی
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "catalogs" TEXT NOT NULL DEFAULT '[]';
