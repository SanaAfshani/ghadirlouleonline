// تعیین عکس دسته‌های تازه‌ساخته‌شده.
//
// نام فایل‌ها هش محتوا دارد و با هر ساخت تازه عوض می‌شود، پس به‌جای فهرست دستی،
// از روی خودِ پوشه public/images/categories خوانده می‌شود. (در زمان اجرای سرور،
// همین کار را syncGeneratedImages در content-sync خودکار انجام می‌دهد.)
//
//   npx tsx scripts/set-category-images.ts [--apply] [--force]
import 'dotenv/config';
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { prisma } from '../src/shared/lib/prisma';

const APPLY = process.argv.includes('--apply');
/** آدرس قبلی را هم بازنویسی کن — وقتی نام فایل‌ها با هش محتوا عوض شده */
const FORCE = process.argv.includes('--force');

/** فقط دسته‌هایی که عکسشان را خودمان ساخته‌ایم */
const SLUGS = ['polymer-valves', 'sprinkler-irrigation-equipment', 'layflat-hose', 'urban-furniture'];

async function main() {
  const dir = path.join(process.cwd(), 'public', 'images', 'categories');
  const files = await readdir(dir).catch(() => [] as string[]);

  const map = new Map<string, string>();
  for (const file of files) {
    const match = /^(.+)\.[0-9a-f]{8}\.webp$/.exec(file);
    if (match && SLUGS.includes(match[1])) map.set(match[1], `/images/categories/${file}`);
  }
  if (!map.size) {
    console.warn('عکس دسته‌ای پیدا نشد — اول build-catalog-images.ts --categories را اجرا کنید');
    return;
  }

  for (const [slug, image] of map) {
    const category = await prisma.category.findUnique({
      where: { slug },
      select: { id: true, image: true, name: true },
    });
    if (!category) { console.warn(`دسته ${slug} نیست`); continue; }
    if (category.image === image) { console.log(`${category.name}: همین عکس را دارد`); continue; }
    if (category.image && !FORCE) { console.log(`${category.name}: عکس دارد، دست نخورد (با --force بازنویسی می‌شود)`); continue; }

    console.log(`${APPLY ? 'ثبت' : 'ثبت می‌شود'} عکس ${category.name} → ${image}`);
    if (APPLY) await prisma.category.update({ where: { id: category.id }, data: { image } });
  }

  if (!APPLY) console.log('\nبرای اعمال: همین دستور با --apply');
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
