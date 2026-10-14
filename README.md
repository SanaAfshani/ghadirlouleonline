# قدیرلوله آنلاین

وب‌سایت فروش و معرفی لوله و اتصالات آب و فاضلاب — Next.js، Prisma، PostgreSQL.

## پیش‌نیاز

- Node.js 20+
- دیتابیس PostgreSQL (مثلاً [Neon](https://neon.tech))

## راه‌اندازی محلی

```bash
cp .env.example .env
# DATABASE_URL و JWT_SECRET را در .env تنظیم کنید

npm install
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

ادمین پیش‌فرض (بعد از seed): `admin@luleonline.ir` / `admin123456`

## Deploy

پروژه برای [Vercel](https://vercel.com) آماده است. متغیرهای محیطی را طبق `.env.example` در داشبورد Vercel تنظیم کنید.
