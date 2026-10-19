// تعیین عکس دسته‌های تازه‌ساخته‌شده (دسته‌ای که عکس دارد دست نمی‌خورد).
//   npx tsx scripts/set-category-images.ts [--apply]
import 'dotenv/config';
import { prisma } from '../src/shared/lib/prisma';

const APPLY = process.argv.includes('--apply');
const MAP: Record<string, string> = {
  'polymer-valves': '/images/categories/polymer-valves.webp',
  'sprinkler-irrigation-equipment': '/images/categories/sprinkler-irrigation-equipment.webp',
  'layflat-hose': '/images/categories/layflat-hose.webp',
  'urban-furniture': '/images/categories/urban-furniture.webp',
};

(async () => {
  for (const [slug, image] of Object.entries(MAP)) {
    const c = await prisma.category.findUnique({ where: { slug }, select: { id: true, image: true, name: true } });
    if (!c) { console.warn(`دسته ${slug} نیست`); continue; }
    if (c.image) { console.log(`${c.name}: عکس دارد، دست نخورد`); continue; }
    console.log(`${APPLY ? 'ثبت' : 'ثبت می‌شود'} عکس ${c.name} → ${image}`);
    if (APPLY) await prisma.category.update({ where: { id: c.id }, data: { image } });
  }
})().finally(() => prisma.$disconnect());
