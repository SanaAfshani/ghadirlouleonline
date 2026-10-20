// اجرای یک‌جای همه اسکریپت‌های داده روی دیتابیس لایو، با پشتیبان و حالت آزمایشی.
//
// دیتابیس لایو (Runflare) با DATABASE_URL داخل .env یکی نیست، پس آدرسش را موقع اجرا بدهید:
//   DATABASE_URL="<آدرس دیتابیس لایو>" npx tsx scripts/apply-live.ts           → آزمایشی
//   DATABASE_URL="<آدرس دیتابیس لایو>" npx tsx scripts/apply-live.ts --apply   → اعمال
//
// هیچ ردیفی حذف نمی‌شود: محصول‌ها با اسلاگ upsert می‌شوند و دسته‌ها فقط اگر نباشند ساخته می‌شوند.
import 'dotenv/config';
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { prisma } from '../src/shared/lib/prisma';

const APPLY = process.argv.includes('--apply');

const STEPS = [
  'scripts/add-irrigation-products.ts',
  'scripts/add-infra-products.ts',
  'scripts/set-category-images.ts',
];

/** عکس وضعیت فعلی، قبل از هر نوشتن — اگر چیزی اشتباه شد مرجع مقایسه داریم */
async function backup() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      select: { slug: true, name: true, categoryId: true, images: true, catalogs: true, published: true },
      orderBy: { slug: 'asc' },
    }),
    prisma.category.findMany({
      select: { slug: true, name: true, image: true, order: true, published: true },
      orderBy: { slug: 'asc' },
    }),
  ]);
  const dir = path.join('.backups');
  mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `live-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  writeFileSync(file, JSON.stringify({ takenAt: new Date().toISOString(), products, categories }, null, 2));
  console.log(`پشتیبان: ${file}  (${products.length} محصول، ${categories.length} دسته)\n`);
  return { products: products.length, categories: categories.length };
}

function run(script: string) {
  const args = ['tsx', script, ...(APPLY ? ['--apply'] : [])];
  const res = spawnSync('npx', args, { stdio: 'inherit', env: process.env });
  if (res.status !== 0) throw new Error(`${script} با خطا تمام شد`);
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL ست نشده — آدرس دیتابیس لایو را موقع اجرا بدهید');
  // فقط میزبان را نشان می‌دهیم تا مطمئن شوید روی دیتابیس درست اجرا می‌شود
  console.log(`دیتابیس: ${new URL(url).host}`);
  console.log(APPLY ? '>>> حالت اعمال\n' : '>>> حالت آزمایشی (بدون تغییر)\n');

  const before = await backup();

  for (const step of STEPS) {
    console.log(`\n── ${step} ──`);
    run(step);
  }

  if (!APPLY) {
    console.log('\nبرای اعمال، همین دستور را با --apply تکرار کنید.');
    return;
  }

  const [products, categories] = await Promise.all([prisma.product.count(), prisma.category.count()]);
  console.log(
    `\nنتیجه: محصول ${before.products} → ${products}، دسته ${before.categories} → ${categories}`,
  );
  console.log('حالا کاتالوگ‌ها را روی لایو چک کنید:');
  console.log('  https://ghadirlouleonline.ir/api/catalogs/irrigation-valves/pdf');
  console.log('  https://ghadirlouleonline.ir/api/catalogs/composite-covers/pdf');
}

main()
  .catch((e) => {
    console.error('\n✗', e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
