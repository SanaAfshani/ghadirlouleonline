// افزودن عکس‌های واقعی کارخانه (src/shared/config/factory-media.ts) به گالری محصولات و عکس دسته‌ها.
//
//   npx tsx scripts/add-factory-photos.ts           → آزمایشی (فقط گزارش)
//   npx tsx scripts/add-factory-photos.ts --apply   → اعمال روی DATABASE_URL
//
// عکس‌های قبلی گالری حذف نمی‌شوند؛ اجرای دوباره عکس تکراری اضافه نمی‌کند.
// عکس اختصاصی (مثلاً سه راهی ۴۵) اول گالری همان محصول می‌نشیند؛ عکس عمومی اتصالات برای نوعی که
// عکس خودش را ندارد ته گالری می‌رود تا با خود آن محصول اشتباه گرفته نشود.
import 'dotenv/config';
import { prisma } from '../src/shared/lib/prisma';
import { CORRUGATED_PIPE_DIMENSIONS, corrugatedPipeSlug } from '../src/shared/lib/pipe-dimensions';
import { CORRUGATED_FITTINGS } from '../src/shared/config/product-lines';

const APPLY = process.argv.includes('--apply');
const img = (name: string) => `/images/factory/${name}.webp`;

/** عکس‌های انبار و بارگیری لوله؛ عکس اول هر سایز می‌چرخد تا کارت‌های دسته یک عکس تکراری نداشته باشند */
const PIPE_PHOTOS = ['yard-rows', 'yard-factory', 'yard-stack', 'loading-truck-large', 'loading-pickup', 'loading-truck', 'loading-trailer'].map(img);

type Plan = { slug: string; lead: string[]; tail: string[] };

const plans: Plan[] = [
  ...CORRUGATED_PIPE_DIMENSIONS.map((d, i) => {
    const rotated = [...PIPE_PHOTOS.slice(i % 3), ...PIPE_PHOTOS.slice(0, i % 3)];
    // مقطع لوله قطر بزرگ فقط برای سایزهای بزرگ — روی صفحه ۱۱۰ گمراه‌کننده است
    return { slug: corrugatedPipeSlug(d.size), lead: d.size >= 600 ? [img('pipe-large'), ...rotated] : rotated, tail: [] };
  }),
  { slug: 'corrugated-tee-45', lead: [img('fitting-tee-45'), img('fittings-tees-caps')], tail: [] },
  { slug: 'corrugated-elbow-45', lead: [img('fitting-elbow-45'), img('fittings-elbows')], tail: [] },
  { slug: 'corrugated-elbow-90', lead: [img('fittings-elbows')], tail: [] },
  { slug: 'corrugated-elbow-90-single', lead: [img('fittings-elbows')], tail: [] },
  { slug: 'corrugated-end-cap', lead: [img('fittings-end-caps'), img('fittings-tees-caps')], tail: [] },
  // بقیه انواع عکس اختصاصی ندارند
  ...CORRUGATED_FITTINGS.filter(
    (f) => !['corrugated-tee-45', 'corrugated-elbow-45', 'corrugated-elbow-90', 'corrugated-elbow-90-single', 'corrugated-end-cap'].includes(f.slug),
  ).map((f) => ({ slug: f.slug, lead: [], tail: [img('fittings-elbows'), img('fittings-tees-caps')] })),
];

const CATEGORY_IMAGES: Record<string, string> = {
  'corrugated-pipes': img('yard-rows'),
  'corrugated-fittings': img('fittings-elbows'),
};

async function main() {
  console.log(`دیتابیس: ${new URL(process.env.DATABASE_URL!).host}`);
  console.log(APPLY ? '>>> حالت اعمال\n' : '>>> حالت آزمایشی (بدون تغییر)\n');

  for (const p of plans) {
    const product = await prisma.product.findUnique({ where: { slug: p.slug }, select: { id: true, images: true } });
    if (!product) {
      console.log(`  ⚠ محصول ${p.slug} پیدا نشد`);
      continue;
    }
    const current = JSON.parse(product.images || '[]') as string[];
    const rest = current.filter((u) => !p.lead.includes(u) && !p.tail.includes(u));
    const next = [...p.lead, ...rest, ...p.tail];
    const changed = JSON.stringify(next) !== JSON.stringify(current);
    console.log(`  ${changed ? '✎' : '='} ${p.slug}: ${p.lead.length} عکس اول، ${p.tail.length} عکس آخر (${current.length} → ${next.length})`);
    if (APPLY && changed) await prisma.product.update({ where: { id: product.id }, data: { images: JSON.stringify(next) } });
  }

  for (const [slug, image] of Object.entries(CATEGORY_IMAGES)) {
    console.log(`  دسته ${slug} → ${image}`);
    if (APPLY) await prisma.category.update({ where: { slug }, data: { image } });
  }

  if (!APPLY) console.log('\nبرای اعمال، همین دستور را با --apply تکرار کنید.');
}

main()
  .catch((e) => {
    console.error('\n✗', e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
