-- شناسه مقاله یوتیکس روی BlogPost — فقط افزودنی
ALTER TABLE "BlogPost" ADD COLUMN IF NOT EXISTS "youtixId" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "BlogPost_youtixId_key" ON "BlogPost"("youtixId");
