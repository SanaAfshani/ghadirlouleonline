// تعیین عکس دسته‌های تازه‌ساخته‌شده (دسته‌ای که عکس دارد دست نمی‌خورد).
//   npx tsx scripts/set-category-images.ts [--apply]
import 'dotenv/config';
import { prisma } from '../src/shared/lib/prisma';

const APPLY = process.argv.includes('--apply');
/** آدرس قبلی را هم بازنویسی کن — وقتی نام فایل‌ها با هش محتوا عوض شده */
const FORCE = process.argv.includes('--force');
const MAP: Record<string, string> = {
  'sprinkler-irrigation-equipment': '/images/categories/sprinkler-irrigation-equipment.c70be355.webp',
  'polymer-valves': '/images/categories/polymer-valves.03755a8f.webp',
  'layflat-hose': '/images/categories/layflat-hose.25bdfc31.webp',
  'urban-furniture': '/images/categories/urban-furniture.4e6a6eb9.webp'
};async () => {
  for (const [slug, image] of Object.entries(MAP)) {
    const c = await prisma.category.findUnique({ where: { slug }, select: { id: true, image: true, name: true } });
    if (!c) { console.warn(`دسته ${slug} نیست`); continue; }
    if (c.image && !FORCE) { console.log(`${c.name}: عکس دارد، دست نخورد`); continue; }
    console.log(`${APPLY ? 'ثبت' : 'ثبت می‌شود'} عکس ${c.name} → ${image}`);
    if (APPLY) await prisma.category.update({ where: { id: c.id }, data: { image } });
  }
})().finally(() => prisma.$disconnect());
