// تعیین عکس دسته‌های تازه‌ساخته‌شده (دسته‌ای که عکس دارد دست نمی‌خورد).
//   npx tsx scripts/set-category-images.ts [--apply]
import 'dotenv/config';
import { prisma } from '../src/shared/lib/prisma';

const APPLY = process.argv.includes('--apply');
/** آدرس قبلی را هم بازنویسی کن — وقتی نام فایل‌ها با هش محتوا عوض شده */
const FORCE = process.argv.includes('--force');
const MAP: Record<string, string> = {
  'urban-furniture': '/images/categories/urban-furniture.14c54f03.webp',
  'sprinkler-irrigation-equipment': '/images/categories/sprinkler-irrigation-equipment.c70be355.webp',
  'layflat-hose': '/images/categories/layflat-hose.8671cdd0.webp',
  'polymer-valves': '/images/categories/polymer-valves.e48e9eab.webp'
};(async () => {
  for (const [slug, image] of Object.entries(MAP)) {
    const c = await prisma.category.findUnique({ where: { slug }, select: { id: true, image: true, name: true } });
    if (!c) { console.warn(`دسته ${slug} نیست`); continue; }
    if (c.image && !FORCE) { console.log(`${c.name}: عکس دارد، دست نخورد`); continue; }
    console.log(`${APPLY ? 'ثبت' : 'ثبت می‌شود'} عکس ${c.name} → ${image}`);
    if (APPLY) await prisma.category.update({ where: { id: c.id }, data: { image } });
  }
})().finally(() => prisma.$disconnect());
