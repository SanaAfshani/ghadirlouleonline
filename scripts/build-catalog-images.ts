// ساخت عکس محصول‌ها و دسته‌ها از صفحات کاتالوگ منبع.
//
// همه خروجی‌ها از یک مسیر رد می‌شوند: برش → مقیاس → واترمارک سایت → WebP کیفیت ۹۲.
// واترمارک همان addWatermark مسیر /media است، پس عکس‌های ثابت هم مثل عکس‌های آپلودی نشان‌دار می‌شوند.
//
//   npx tsx scripts/build-catalog-images.ts --vispar "<پوشه عکس‌های لیست قیمت>"
//   npx tsx scripts/build-catalog-images.ts --infra  "<پوشه خروجی pdfimages>"
//   npx tsx scripts/build-catalog-images.ts --categories
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { addWatermark } from '../src/shared/lib/watermark';

const OUT = 'public/images/products';
const CAT_OUT = 'public/images/categories';
const INDEX = path.join(OUT, 'index.json');

/**
 * عکس برش‌خورده از صفحات PDF منبعِ پرجزئیات دارد و بزرگ ذخیره می‌شود.
 * نوار محصولات خیلی پهن و کم‌ارتفاع است (حدود ۵:۱) و در قاب ۴:۳ گالری از دو طرف بریده می‌شد،
 * پس وسط یک قاب ۴:۳ سفید می‌نشیند — مثل بقیه عکس‌های محصول.
 */
const INFRA_CANVAS = { width: 2000, height: 1500 };
/** عکس لیست قیمت از یک JPEG کوچک درمی‌آید؛ قاب بزرگ‌تر فقط حجم اضافه می‌کرد، نه جزئیات */
const VISPAR_CANVAS = { width: 1200, height: 900 };
const CATEGORY = { width: 1200, height: 800 };

/** نوشتن عکس نهایی: واترمارک سایت + WebP با کیفیت بالا */
async function write(buffer: Buffer, file: string) {
  const webp = await sharp(buffer).webp({ quality: 92 }).toBuffer();
  const marked = await addWatermark(webp, 'image/webp');
  await fs.writeFile(file, marked ?? webp);
}

const readIndex = async (): Promise<Record<string, string[]>> =>
  JSON.parse(await fs.readFile(INDEX, 'utf8').catch(() => '{}'));
const writeIndex = async (patch: Record<string, string[]>) =>
  fs.writeFile(INDEX, JSON.stringify({ ...(await readIndex()), ...patch }, null, 2));

// ───────────────────── الف) شیرآلات و آبیاری (صفحات لیست قیمت) ─────────────────────

const VISPAR_PAGES = [
  '13.32.41.jpeg', '13.32.41 (1).jpeg',
  '13.32.42.jpeg', '13.32.42 (1).jpeg', '13.32.42 (2).jpeg',
  '13.32.43.jpeg', '13.32.43 (1).jpeg', '13.32.43 (2).jpeg',
];
const COLS = { R: { left: 462, width: 180 }, L: { left: 26, width: 182 } } as const;
const isTeal = (r: number, g: number, b: number) => r < 95 && g > 125 && g < 195 && b > 165 && b < 220;

/** عکس‌های انتخاب‌شده هر محصول: صفحه (۱ تا ۸)، ستون و ردیف نوار سرتیتر بلوک */
const VISPAR_PICKS: Record<string, [number, 'R' | 'L', number][]> = {
  'polymer-valves': [[1, 'R', 174], [2, 'R', 769], [2, 'L', 174], [1, 'L', 174]],
  'sprinkler-irrigation-equipment': [[3, 'R', 179], [3, 'L', 179], [3, 'L', 373], [3, 'L', 897]],
  sprinklers: [[4, 'R', 287], [4, 'R', 581], [4, 'R', 742], [4, 'L', 179]],
  // قرقره‌های صفحه ۵ لوگوی سازنده دارند و استفاده نمی‌شوند
  'layflat-hose': [[5, 'R', 205], [5, 'L', 429], [5, 'L', 835]],
  'drip-fittings': [[6, 'R', 200], [6, 'L', 200]],
  'upvc-threaded-fittings': [[7, 'L', 522], [7, 'L', 1016], [8, 'L', 884], [7, 'R', 168]],
};

async function visparCutout(src: string, page: number, colName: 'R' | 'L', bar: number) {
  const file = path.join(src, `WhatsApp Image 2026-10-18 at ${VISPAR_PAGES[page - 1]}`);
  const col = COLS[colName];
  const { data, info } = await sharp(file)
    .extract({ left: col.left, top: 0, width: col.width, height: 1280 })
    .raw().toBuffer({ resolveWithObject: true });
  const ch = info.channels;

  const teal: boolean[] = [], white: boolean[] = [];
  for (let y = 0; y < info.height; y++) {
    let t = 0, w = 0;
    for (let x = 0; x < info.width; x++) {
      const i = (y * info.width + x) * ch;
      const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
      if (isTeal(r, g, b)) t++;
      if (r > 233 && g > 233 && b > 233) w++;
    }
    teal[y] = t / info.width > 0.4;
    white[y] = w / info.width > 0.985;
  }

  // بالای نوار: فاصله سفید، بعد خود عکس، تا فاصله سفید بعدی
  let y = bar - 3;
  while (y > 0 && white[y]) y--;
  const bottom = y;
  let gap = 0;
  while (y > 0 && gap < 9) { y--; gap = white[y] ? gap + 1 : 0; }
  const top = Math.max(y + gap, 104);

  let barEnd = bar;
  while (barEnd < info.height && teal[barEnd]) barEnd++;
  const height = Math.min(bottom + (barEnd - bar) + 4, 1280) - top;

  const raw = await sharp(file)
    .extract({ left: col.left, top, width: col.width, height })
    .raw().toBuffer({ resolveWithObject: true });
  const px = raw.data, rc = raw.info.channels;

  // ۸ ردیف بالاتر از شروع نوار هم پاک می‌شود؛ لبه نوار ضدپله است و خط نازک فیروزه‌ای جا می‌گذارد.
  // فقط رنگِ خود نوار پاک می‌شود تا اتصالات سفید و دسته‌های زرد محصول بریده نشوند.
  for (let yy = Math.max(0, bar - top - 8); yy < raw.info.height; yy++) {
    for (let xx = 0; xx < raw.info.width; xx++) {
      const i = (yy * raw.info.width + xx) * rc;
      const [r, g, b] = [px[i], px[i + 1], px[i + 2]];
      if (b - r > 30 && g - r > 18) { px[i] = 255; px[i + 1] = 255; px[i + 2] = 255; }
    }
  }

  return sharp(px, { raw: { width: raw.info.width, height: raw.info.height, channels: rc } })
    .trim({ threshold: 12 }).png().toBuffer();
}

async function buildVispar(src: string) {
  const out: Record<string, string[]> = {};
  for (const [slug, picks] of Object.entries(VISPAR_PICKS)) {
    const urls: string[] = [];
    for (const [i, [page, col, bar]] of picks.entries()) {
      const cut = await visparCutout(src, page, col, bar);
      const { width = 1, height = 1 } = await sharp(cut).metadata();
      // بزرگ‌نمایی محدود: منبع ریز است و پر کردن کل قاب محصول را له می‌کند
      const scale = Math.min(
        (VISPAR_CANVAS.width * 0.72) / width,
        (VISPAR_CANVAS.height * 0.72) / height,
        5,
      );
      const w = Math.round(width * scale), h = Math.round(height * scale);
      const product = await sharp(cut).resize(w, h, { kernel: 'lanczos3' }).sharpen({ sigma: 1.1 }).toBuffer();
      const canvas = await sharp({
        create: { ...VISPAR_CANVAS, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } },
      })
        .composite([{ input: product, left: Math.round((VISPAR_CANVAS.width - w) / 2), top: Math.round((VISPAR_CANVAS.height - h) / 2) }])
        .png()
        .toBuffer();

      const name = `${slug}-${i + 1}.webp`;
      await write(canvas, path.join(OUT, name));
      urls.push(`/images/products/${name}`);
    }
    out[slug] = urls;
    console.log(`${slug}: ${urls.length} عکس`);
  }
  return out;
}

// ───────────────────── ب) دریچه و منهول (صفحات کاتالوگ PDF) ─────────────────────

/** p-000 = صفحه ۱۰ فایل منبع؛ هر محصول خانواده‌ای کدام صفحه‌ها را می‌گیرد */
const INFRA_FAMILIES: Record<string, string[]> = {
  'composite-manhole-covers': ['000', '001', '002', '003', '004', '005'],
  'urban-furniture-composite': ['007', '008', '009', '010', '011', '012'],
  'telecom-covers': ['014', '015', '016'],
  'industrial-park-covers': ['018'],
  'electrical-duct-boxes': ['020'],
  'gas-covers-manholes': ['022', '023', '024', '025', '026', '027', '028', '029'],
};

/** نوار سفید محصولات در صفحه کاتالوگ — سربرگ و لوگوی منبع بیرون از آن می‌ماند */
async function whiteBand(file: string) {
  const { data, info } = await sharp(file).resize({ width: 700 }).raw().toBuffer({ resolveWithObject: true });
  const ch = info.channels;
  const isWhite = (i: number) => data[i] > 232 && data[i + 1] > 232 && data[i + 2] > 232;

  const longestRun = (test: (y: number) => boolean) => {
    let best: [number, number] | null = null, start: number | null = null;
    for (let i = 0; i <= info.height; i++) {
      const on = i < info.height && test(i);
      if (on && start === null) start = i;
      if (!on && start !== null) {
        if (!best || i - start > best[1] - best[0]) best = [start, i];
        start = null;
      }
    }
    return best;
  };

  // گذر اول: ردیف‌های عمدتاً سفید → جای تقریبی کادر و محدوده افقی آن
  const rough = longestRun((y) => {
    let w = 0;
    for (let x = 0; x < info.width; x++) if (isWhite((y * info.width + x) * ch)) w++;
    return w / info.width > 0.45;
  });
  if (!rough) return null;

  let left = info.width, right = 0;
  for (let x = 0; x < info.width; x++) {
    let w = 0;
    for (let y = rough[0]; y < rough[1]; y++) if (isWhite((y * info.width + x) * ch)) w++;
    if (w / (rough[1] - rough[0]) > 0.5) { left = Math.min(left, x); right = Math.max(right, x); }
  }
  if (right <= left) return null;

  // گذر دوم: ارتفاع واقعی از ستون‌های داخلِ خودِ کادر. گذر اول با بدنه تیره محصول زود تمام
  // می‌شد و نیمه پایین دریچه‌ها بریده می‌شد؛ روی این ستون‌ها محصولی نیست.
  const inset = Math.max(3, Math.round((right - left) * 0.02));
  const cols = [left + inset, left + inset * 2, right - inset * 2, right - inset];
  const exact = longestRun((y) => cols.filter((x) => isWhite((y * info.width + x) * ch)).length >= 3);
  const best = exact && exact[1] - exact[0] > (rough[1] - rough[0]) * 0.8 ? exact : rough;

  const scale = ((await sharp(file).metadata()).width ?? info.width) / info.width;
  return {
    left: Math.round(left * scale),
    top: Math.round(best[0] * scale),
    width: Math.round((right - left + 1) * scale),
    height: Math.round((best[1] - best[0]) * scale),
  };
}

async function buildInfra(src: string) {
  const out: Record<string, string[]> = {};
  for (const [slug, pages] of Object.entries(INFRA_FAMILIES)) {
    const urls: string[] = [];
    for (const [i, page] of pages.entries()) {
      const file = path.join(src, `p-${page}.jpg`);
      const box = await whiteBand(file);
      if (!box || box.height < 200) { console.warn(`${slug}: نوار سفید صفحه ${page} پیدا نشد`); continue; }
      const bandW = Math.round(INFRA_CANVAS.width * 0.96);
      const band = await sharp(file)
        .extract(box)
        .resize({ width: bandW, withoutEnlargement: true, kernel: 'lanczos3' })
        .sharpen({ sigma: 0.6 })
        .png()
        .toBuffer();
      const meta = await sharp(band).metadata();
      const canvas = await sharp({
        create: { ...INFRA_CANVAS, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } },
      })
        .composite([{
          input: band,
          left: Math.round((INFRA_CANVAS.width - (meta.width ?? bandW)) / 2),
          top: Math.round((INFRA_CANVAS.height - (meta.height ?? 0)) / 2),
        }])
        .png()
        .toBuffer();
      const name = `${slug}-${i + 1}.webp`;
      await write(canvas, path.join(OUT, name));
      urls.push(`/images/products/${name}`);
    }
    out[slug] = urls;
    console.log(`${slug}: ${urls.length} عکس`);
  }
  return out;
}

// ───────────────────────────── ج) عکس دسته‌ها ─────────────────────────────

/** دسته‌های تازه‌ساخته‌شده عکس ندارند و کارتشان جای خالی نشان می‌دهد */
const CATEGORY_SOURCE: Record<string, string> = {
  'polymer-valves': 'polymer-valves-1.webp',
  'sprinkler-irrigation-equipment': 'sprinklers-1.webp',
  'layflat-hose': 'layflat-hose-1.webp',
  'urban-furniture': 'urban-furniture-composite-5.webp',
};

async function buildCategories() {
  await fs.mkdir(CAT_OUT, { recursive: true });
  for (const [slug, source] of Object.entries(CATEGORY_SOURCE)) {
    const file = path.join(OUT, source);
    if (!(await fs.stat(file).catch(() => null))) { console.warn(`${slug}: منبع ${source} نیست`); continue; }
    // عکس محصول از قبل واترمارک دارد؛ دوباره نمی‌زنیم
    const buf = await sharp(file)
      // cover حاشیه سفیدِ قاب محصول را می‌برد تا خود محصول کارت دسته را پر کند
      .resize({ ...CATEGORY, fit: 'cover' })
      .webp({ quality: 92 })
      .toBuffer();
    await fs.writeFile(path.join(CAT_OUT, `${slug}.webp`), buf);
    console.log(`دسته ${slug}: /images/categories/${slug}.webp`);
  }
}

// ───────────────────────────────── اجرا ─────────────────────────────────

const arg = (flag: string) => {
  const i = process.argv.indexOf(flag);
  return i === -1 ? null : process.argv[i + 1] ?? '';
};

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  const vispar = arg('--vispar');
  const infra = arg('--infra');
  const categories = process.argv.includes('--categories');

  if (!vispar && !infra && !categories) {
    console.error('یکی از --vispar <dir> / --infra <dir> / --categories را بدهید');
    process.exit(1);
  }
  if (vispar) await writeIndex(await buildVispar(vispar));
  if (infra) await writeIndex(await buildInfra(infra));
  if (categories) await buildCategories();
  console.log('\nتمام شد.');
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
