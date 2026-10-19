# CLAUDE.md — لوله مشهد

## معرفی پروژه
وب‌سایت فروشگاهی **لوله مشهد** — فروش لوله، اتصالات، شیرآلات و تجهیزات مرتبط.  
فریم‌ورک: **Next.js 16** (App Router) + **Prisma** (PostgreSQL) + **Tailwind CSS v4**.

## ساختار پوشه‌ها

```
src/
  app/
    (main)/          ← صفحات عمومی سایت
    admin/           ← پنل ادمین (بدون layout عمومی)
    api/             ← API Routes (REST)
  features/          ← کامپوننت‌های پیچیده هر بخش
  widgets/           ← ویجت‌های مشترک (Header, Footer, AdminSidebar)
  shared/
    lib/             ← prisma, auth, data fetching, utils
    types/           ← تایپ‌های مشترک TypeScript
    ui/              ← کامپوننت‌های UI پایه (Button, Input, Card, ...)
    hooks/           ← custom hooks
    providers/       ← Context providers (Theme, SiteSettings)
  generated/prisma/  ← خودکار توسط prisma generate
```

## مدل‌های دیتابیس (Prisma)

| مدل | توضیح |
|-----|-------|
| User | کاربران ادمین (ADMIN / EDITOR / VIEWER) |
| Category | دسته‌بندی محصولات (درختی با parentId) |
| Product | محصولات، images و specifications به صورت JSON String |
| BlogPost | مقالات وبلاگ، content به صورت HTML |
| Project | پروژه‌های انجام‌شده |
| FAQ | سوالات متداول |
| Testimonial | نظرات مشتریان |
| SiteSettings | تنظیمات سایت (key/value) |
| ContactMessage | پیام‌های تماس |

## نکات مهم فنی

- **Auth:** JWT در cookie به نام `token`. هر API ادمین باید از `verifyToken` در `src/shared/lib/auth.ts` استفاده کند.
- **دیتابیس:** PostgreSQL (محلی از طریق `DATABASE_URL` در `.env`).  
  برای اعمال تغییر schema: `npx prisma db push` یا `npx prisma migrate dev`.
- **آپلود فایل:** فایل‌های آپلودی در `public/uploads/` ذخیره می‌شوند و از مسیر `/uploads/...` قابل دسترسی هستند.
- **تصاویر:** Next.js Image با `fill` و `object-cover` برای تصاویر پوشش.
- **RTL:** سایت فارسی و RTL است. در فرم‌ها `dir="ltr"` فقط برای فیلدهای slug/url.
- **رنگ accent:** `var(--accent)` = amber-500، استایل دارک با کلاس‌های `slate-*`.

## دستورات مفید

```bash
npm run dev          # اجرای محلی
npm run build        # build نهایی
npx prisma db push   # اعمال تغییرات schema بدون migration
npx prisma studio    # رابط گرافیکی دیتابیس
npm run db:seed      # seed داده‌های اولیه
```

## فیچرهای پیاده‌سازی‌شده

- [ ] آپلود PDF در پست‌های وبلاگ و نمایش در صفحه پست (پیاده‌سازی شده در `pdfUrl` روی BlogPost)
- [x] قیمت روز هر کیلو (`pricePerKg` روی Product): قیمت هر متر = وزن ردیف × قیمت روز؛ از تابلوی قیمت ادمین تنظیم می‌شود (`src/shared/lib/price-per-kg.ts`)
- [x] مشخصات جدای ردیف قیمت (`size`، `grade` سبک/نیمه‌سنگین/سنگین، `spec`، `dimensions` روی PriceItem): title فقط «مدل» است و نام کامل با `itemLabel` در `src/shared/lib/price-item.ts`؛ جدول سایت و تابلوی ادمین بر اساس کلاس/سایز/قیمت مرتب و تفکیک می‌شوند
- [x] کاتالوگ محصول (`catalogs` روی Product — آرایه JSON از {title, url?, pages?}): آپلود کاتالوگ **PDF** یا **تصویری** (چند عکس = چند صفحه) در فرم ادمین (`src/features/admin/catalogs/CatalogEditor.tsx`) و نمایش در بخش «کاتالوگ و مدارک فنی» صفحه محصول با پیش‌نمایش تاشو و لایت‌باکس (`src/features/products/ProductCatalogs.tsx`)
- [x] کاتالوگ دریچه و منهول کامپوزیتی با برند خودمان: `GET /api/catalogs/composite-covers/pdf` از روی همان محصولات دیتابیس رندر می‌شود، پس کاتالوگ و سایت هیچ‌وقت از هم عقب نمی‌افتند
- [x] عکس محصول و دسته از صفحات کاتالوگ: `scripts/build-catalog-images.ts` (برش + واترمارک سایت + WebP) و `scripts/add-irrigation-products.ts` / `scripts/add-infra-products.ts` برای ثبت محصولات
- [x] پیش‌فاکتور آنلاین: سبد مشتری از جدول قیمت → درخواست → تأیید ادمین → صفحه `/q/[token]` + PDF (`Quote` / `QuoteItem`)
