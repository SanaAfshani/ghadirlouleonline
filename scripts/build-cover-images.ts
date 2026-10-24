// ساخت عکس محصول‌های کامپوزیتی (دریچه، منهول، مبلمان شهری) از نوارهای کاتالوگ در assets/catalog-bands.
//
// چرا جدا از build-catalog-images.ts: آن اسکریپت از صفحه‌های خام PDF (p-NNN.jpg) شروع می‌کرد و
// اول نوار سفید را پیدا می‌کرد. آن صفحه‌ها دیگر موجود نیستند و تشخیص نوار هم محصول را وسط بدنه
// می‌بُرید. این‌جا ورودی خودِ نوار است و برش از روی ماسکِ «خاکستری خنثی» ساخته می‌شود.
//
//   npx tsx scripts/build-cover-images.ts [--dry] [--apply]
//
// --apply فقط ستون images همین شش محصول را در دیتابیس می‌نویسد. عمداً از
// add-infra-products.ts استفاده نمی‌کند: آن اسکریپت نام و توضیح و مشخصات را هم بازنویسی
// می‌کند و ویرایش‌های ادمین را برمی‌گرداند.
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { createHash } from 'node:crypto';
import { prisma } from '../src/shared/lib/prisma';

const BANDS = 'assets/catalog-bands';
const OUT = 'public/images/products';
const INDEX = path.join(OUT, 'index.json');

/** ترتیب خانواده‌ها = ترتیب گالری محصول؛ شماره نوار از نام فایل خوانده می‌شود */
const FAMILIES = [
  'composite-manhole-covers',
  'urban-furniture-composite',
  'telecom-covers',
  'industrial-park-covers',
  'electrical-duct-boxes',
  'gas-covers-manholes',
] as const;

/**
 * نوارهایی که خودِ فایل منبع بریده است — هیچ برشی نجاتشان نمی‌دهد.
 *
 * composite-manhole-covers-4: نیمه پایینِ هر سه محصول (درب ۶۳، ۶۴ و ۶۵) در فایل نیست؛ موقع
 * ساخت نوار در کامیت 1130d5f بریده شده و صفحه اصلی کاتالوگ هم دیگر موجود نیست. عکس نصفه
 * بدتر از نبودن عکس است، پس منتشر نمی‌شود.
 *
 * تشخیص خودکارش را امتحان کردم و جواب نداد: «کف صافِ پهن» نشانه بریدگی نیست — کف یک مکعب
 * بتنی هم همین‌قدر پهن است و آن محصول‌ها سالم‌اند.
 */
const CUT_BANDS = new Set(['composite-manhole-covers-4']);

/**
 * ماسک محتوا: هر پیکسلی که واضحاً تیره‌تر از زمینه سفید باشد — بدون شرط رنگ.
 *
 * اول «خاکستریِ خنثی» را شرط کرده بودم تا برچسب بنفش کاتالوگ داخل کادر نیفتد؛ ولی دریچه‌های
 * گاز زرد و سطل‌های شهری سبزند و کلاً از ماسک بیرون می‌ماندند (دو نوار هیچ محصولی نمی‌داد).
 * برچسب حالا با فاصله عمودی‌اش از محصول جدا می‌شود، نه با رنگ.
 */
const DARK = 222;
/** چقدر از قاب ۴:۳ را خود محصول پر کند */
const FILL = 0.86;

type Box = { left: number; top: number; width: number; height: number };

async function productsOf(file: string): Promise<Box[]> {
  const { data, info } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: ch } = info;
  const on = (x: number, y: number) => {
    const i = (y * W + x) * ch;
    return (data[i] + data[i + 1] + data[i + 2]) / 3 < DARK;
  };

  // خط کفِ کاتالوگ: تنها ردیف‌های تقریباً تمام‌عرض. کنار گذاشتنشان لازم است وگرنه
  // همه محصول‌های یک صفحه از طریق همین خط به هم وصل می‌شوند و یک تکه دیده می‌شوند.
  const shelf = new Set<number>();
  for (let y = 0; y < H; y++) {
    let n = 0;
    const levels: number[] = [];
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * ch;
      if (on(x, y)) { n++; levels.push((data[i] + data[i + 1] + data[i + 2]) / 3); }
    }
    if (n / W <= 0.6) continue;
    // شرط یکدستی: سطری که از وسط سه دریچه کنار هم می‌گذرد هم پوشش بالایی دارد، ولی
    // رنگش پر نوسان است. بدون این شرط، همان سطر «خط کف» شمرده می‌شد و محصول‌ها از
    // وسط بدنه بریده می‌شدند — همان ایرادی که روی دریچه‌های گاز دیده می‌شد.
    const mean = levels.reduce((a, b) => a + b, 0) / levels.length;
    const sd = Math.sqrt(levels.reduce((a, b) => a + (b - mean) ** 2, 0) / levels.length);
    if (sd <= 12) shelf.add(y);
  }

  const colCount = new Array<number>(W).fill(0);
  for (let y = 0; y < H; y++) {
    if (shelf.has(y)) continue;
    for (let x = 0; x < W; x++) if (on(x, y)) colCount[x]++;
  }

  // آستانه ستون نسبت به ارتفاع نوار: با ماسک رنگ‌مستقل، سایه‌های کم‌رنگِ بین دو محصول
  // ستون‌ها را به هم وصل می‌کردند و دو محصول کنار هم یک تکه دیده می‌شدند.
  const minCol = Math.max(4, Math.round(H * 0.012));
  const runs: [number, number][] = [];
  let start: number | null = null;
  let gap = 0;
  for (let x = 0; x <= W; x++) {
    const hit = x < W && colCount[x] >= minCol;
    if (hit) {
      if (start === null) start = x;
      gap = 0;
    } else if (start !== null && ++gap > 24) {
      if (x - gap - start >= 120) runs.push([start, x - gap]);
      start = null;
    }
  }

  const boxes: Box[] = [];
  for (const [x0, x1] of runs) {
    // عمداً کوچک: لبه بالا و پایینِ یک دایره فقط چند پیکسل عرض دارد. آستانه بزرگ‌تر
    // همان لبه‌ها را می‌خورد و دریچه گرد را صاف و «بریده» نشان می‌داد.
    // برچسبِ بالای محصول با فاصله عمودی جدا می‌شود، نه با این آستانه.
    const need = 3;
    const widths: number[] = [];
    for (let y = 0; y < H; y++) {
      if (shelf.has(y)) { widths.push(0); continue; }
      let n = 0;
      for (let x = x0; x <= x1; x++) if (on(x, y)) n++;
      widths.push(n >= need ? n : 0);
    }

    // برچسب کاتالوگ بالای محصول و با فاصله سفید از آن نشسته. به‌جای تشخیص رنگی،
    // بلوک‌های عمودیِ محتوا جدا می‌شوند و پرمساحت‌ترین بلوک = خود محصول.
    const blocks: { top: number; bottom: number; area: number }[] = [];
    let open: { top: number; bottom: number; area: number } | null = null;
    let blank = 0;
    for (let y = 0; y < H; y++) {
      if (widths[y] > 0) {
        if (!open) open = { top: y, bottom: y, area: 0 };
        open.bottom = y;
        open.area += widths[y];
        blank = 0;
      } else if (open && ++blank > 12) {
        blocks.push(open);
        open = null;
      }
    }
    if (open) blocks.push(open);
    if (!blocks.length) continue;
    const body = blocks.reduce((a, b) => (b.area > a.area ? b : a));

    // بلوک‌های ریز = تکه‌ای از برچسب یا آیکن صفحه، نه محصول
    const height = body.bottom - body.top + 1;
    if (height < H * 0.08) continue;
    boxes.push({ left: x0, top: body.top, width: x1 - x0 + 1, height });
  }
  return boxes;
}

/** محصول وسط قاب ۴:۳ با پرشدگی یکسان و بدون بزرگ‌نمایی */
async function frame(file: string, box: Box) {
  const meta = await sharp(file).metadata();
  const pad = Math.round(Math.max(box.width, box.height) * 0.04);
  const cut = {
    left: Math.max(0, box.left - pad),
    top: Math.max(0, box.top - pad),
    width: Math.min(box.width + pad * 2, (meta.width ?? 0) - Math.max(0, box.left - pad)),
    height: Math.min(box.height + pad * 2, (meta.height ?? 0) - Math.max(0, box.top - pad)),
  };
  const piece = await sharp(file).extract(cut).png().toBuffer();

  const needed = Math.max(cut.width / FILL, (cut.height / FILL) * (4 / 3));
  const cw = Math.round(Math.min(1400, Math.max(760, needed)));
  const canvas = { width: cw, height: Math.round((cw * 3) / 4) };
  const fit = Math.min((canvas.width * FILL) / cut.width, (canvas.height * FILL) / cut.height, 1);
  const w = Math.round(cut.width * fit);
  const h = Math.round(cut.height * fit);
  const product = await sharp(piece).resize(w, h, { kernel: 'lanczos3' }).sharpen({ sigma: 0.6 }).toBuffer();

  // واترمارک دوباره زده نمی‌شود: نوارها از قبل نشان سایت را دارند و لایه دوم با
  // کاشی‌بندیِ جابه‌جا روی هم می‌افتاد.
  return sharp({ create: { ...canvas, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } } })
    .composite([{ input: product, left: Math.round((canvas.width - w) / 2), top: Math.round((canvas.height - h) / 2) }])
    .webp({ quality: 92 })
    .toBuffer();
}

/** نسخه قبلی همین محصول پاک می‌شود تا پوشه با هر اجرا باد نکند */
async function clearOld(slug: string) {
  const files = await fs.readdir(OUT).catch(() => [] as string[]);
  await Promise.all(
    files
      .filter((f) => new RegExp(`^${slug}-\\d+\\.[0-9a-f]{8}\\.webp$`).test(f))
      .map((f) => fs.unlink(path.join(OUT, f))),
  );
}

async function main() {
  const dry = process.argv.includes('--dry');
  const all = (await fs.readdir(BANDS)).filter((f) => f.endsWith('.webp'));
  const index: Record<string, string[]> = JSON.parse(await fs.readFile(INDEX, 'utf8').catch(() => '{}'));

  for (const slug of FAMILIES) {
    const bands = all
      .filter((f) => new RegExp(`^${slug}-\\d+\\.webp$`).test(f))
      .sort((a, b) => Number(a.match(/-(\d+)\./)![1]) - Number(b.match(/-(\d+)\./)![1]));
    if (!bands.length) {
      console.warn(`${slug}: نواری در ${BANDS} نیست`);
      continue;
    }

    if (!dry) await clearOld(slug);
    const urls: string[] = [];
    for (const band of bands) {
      if (CUT_BANDS.has(band.replace('.webp', ''))) {
        console.warn(`  ${band}: رد شد — نوار منبع بریده است`);
        continue;
      }
      const file = path.join(BANDS, band);
      for (const box of await productsOf(file)) {
        const body = await frame(file, box);
        const hash = createHash('sha1').update(body).digest('hex').slice(0, 8);
        const name = `${slug}-${urls.length + 1}.${hash}.webp`;
        if (!dry) await fs.writeFile(path.join(OUT, name), body);
        urls.push(`/images/products/${name}`);
      }
    }
    index[slug] = urls;
    console.log(`${slug}: ${bands.length} نوار → ${urls.length} عکس`);
  }

  if (dry) {
    console.log('\n(dry — چیزی نوشته نشد)');
    return;
  }
  await fs.writeFile(INDEX, JSON.stringify(index, null, 2) + '\n');
  console.log(`\n${INDEX} به‌روز شد.`);

  if (!process.argv.includes('--apply')) {
    console.log('برای نوشتن در دیتابیس: همین دستور با --apply');
    return;
  }
  for (const slug of FAMILIES) {
    const urls = index[slug];
    if (!urls?.length) continue;
    const { count } = await prisma.product.updateMany({
      where: { slug },
      data: { images: JSON.stringify(urls) },
    });
    console.log(`  ${slug}: ${count ? `${urls.length} عکس نوشته شد` : 'محصولی با این اسلاگ نیست'}`);
  }
  await prisma.$disconnect();
}

main();
