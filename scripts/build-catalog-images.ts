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
import { createHash } from 'node:crypto';
import { addWatermark } from '../src/shared/lib/watermark';

const OUT = 'public/images/products';
const CAT_OUT = 'public/images/categories';
const INDEX = path.join(OUT, 'index.json');

/**
 * عکس برش‌خورده از صفحات PDF منبعِ پرجزئیات دارد و بزرگ ذخیره می‌شود.
 * نوار محصولات خیلی پهن و کم‌ارتفاع است (حدود ۵:۱) و در قاب ۴:۳ گالری از دو طرف بریده می‌شد،
 * پس وسط یک قاب ۴:۳ سفید می‌نشیند — مثل بقیه عکس‌های محصول.
 */
/**
 * هر محصول در صفحه منبع فقط ۶۲۰ تا ۹۳۰ پیکسل عرض دارد. قاب ۱۶۰۰ یعنی حدود ۱.۸ برابر
 * بزرگ‌نمایی و همان نرمیِ عکس‌ها؛ با این قاب هیچ عکسی بزرگ‌نمایی نمی‌شود.
 */
const INFRA_CANVAS = { width: 1200, height: 900 };
/** چقدر از قاب را خود محصول پر کند — حاشیه سفید زیاد، عکس را بی‌کیفیت جلوه می‌داد */
const FILL = 0.86;
/** عکس لیست قیمت از یک JPEG کوچک درمی‌آید؛ قاب بزرگ‌تر فقط حجم اضافه می‌کرد، نه جزئیات */
// قاب کوچک‌تر یعنی محصول بدون بزرگ‌نمایی بیشتر، قاب را پر می‌کند — جزئیات همان است، سفیدیِ هدررفته کمتر
const VISPAR_CANVAS = { width: 900, height: 675 };
/**
 * کارت دسته با object-cover و نسبت ۴:۳ تا ۱۶:۱۰ نمایش داده می‌شود.
 * قاب را ۱۶:۱۰ می‌سازیم ولی خود محصول را داخل ناحیه امنِ ۴:۳ وسط نگه می‌داریم،
 * تا در هیچ‌کدام از دو نسبت بریده نشود (قبلاً محصول‌های لبه از وسط نصف می‌شدند).
 */
// ناحیه امن دقیقاً هم‌اندازه قاب عکس محصول است تا عکس دسته هم بزرگ‌نمایی نشود
const CATEGORY = { width: 1440, height: 900 };
const CATEGORY_SAFE = { width: 1200, height: 900 };

/** نوشتن عکس نهایی: واترمارک سایت + WebP با کیفیت بالا */
/**
 * نوشتن عکس نهایی: واترمارک سایت + WebP، با هشِ محتوا در نام فایل.
 * هش لازم است چون با عوض شدن محتوای یک نام ثابت، هم بهینه‌ساز Next و هم مرورگر بازدیدکننده
 * نسخه قدیمی را از کش می‌دادند؛ با تغییر نام، همه فوراً نسخه تازه را می‌گیرند.
 * خروجی یکسان همان نام را می‌سازد، پس اجرای دوباره فایل تکراری درست نمی‌کند.
 */
async function write(buffer: Buffer, slug: string, index: number) {
  const webp = await sharp(buffer).webp({ quality: 92 }).toBuffer();
  const body = (await addWatermark(webp, 'image/webp')) ?? webp;
  const hash = createHash('sha1').update(body).digest('hex').slice(0, 8);
  const name = `${slug}-${index}.${hash}.webp`;
  await fs.writeFile(path.join(OUT, name), body);
  return `/images/products/${name}`;
}

/** فایل‌های نسخه قبلی همین محصول را پاک می‌کند تا پوشه با هر اجرا باد نکند */
async function clearOld(slug: string) {
  const files = await fs.readdir(OUT).catch(() => [] as string[]);
  await Promise.all(
    files.filter((f) => new RegExp(`^${slug}-\\d+\\.[0-9a-f]{8}\\.webp$`).test(f))
      .map((f) => fs.unlink(path.join(OUT, f))),
  );
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
    await clearOld(slug);
    const urls: string[] = [];
    for (const [i, [page, col, bar]] of picks.entries()) {
      const cut = await visparCutout(src, page, col, bar);
      const { width = 1, height = 1 } = await sharp(cut).metadata();
      // بزرگ‌نمایی محدود: منبع ریز است و پر کردن کل قاب محصول را له می‌کند
      const scale = Math.min(
        (VISPAR_CANVAS.width * FILL) / width,
        (VISPAR_CANVAS.height * FILL) / height,
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

      urls.push(await write(canvas, slug, i + 1));
    }
    out[slug] = urls;
    console.log(`${slug}: ${urls.length} عکس`);
  }
  return out;
}

// ───────────────────── ب) دریچه و منهول (صفحات کاتالوگ PDF) ─────────────────────

/**
 * عکسی که باید اول گالری بیاید (پیش‌فرض ۱).
 * روی بعضی عکس‌ها نام سازنده داخل قالبِ خود محصول حک شده؛ جایی که روی عکس اول خواناست،
 * عکس تمیزتری جلو انداخته می‌شود تا تصویر شاخصِ محصول و کارت‌ها آن را نشان ندهد.
 */
const LEAD: Record<string, number> = {};

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

/**
 * شکستن نوار به محصول‌های جداگانه.
 * قبلاً کل نوار یک عکس می‌شد: هر محصول کوچک وسط یک قاب سفید می‌افتاد (بی‌کیفیت به نظر می‌رسید)
 * و در کارت ۴:۳ و عکس دسته، محصول‌های لبه از وسط بریده می‌شدند.
 * محصول‌ها با فاصله سفید عمودی از هم جدا شده‌اند و برچسب هر کدام بالای خودش است.
 */
async function splitProducts(file: string, band: { left: number; top: number; width: number; height: number }) {
  const page = await sharp(file).metadata();
  // تشخیص روی خودِ نوار انجام می‌شود؛ بلندتر گرفتنش زمینه خاکستری صفحه را وارد می‌کرد و
  // آن‌وقت همه ستون‌ها «محتوا» داشتند و محصول‌ها از هم جدا نمی‌شدند.
  // حاشیه لازم برای سایه را pad در انتها اضافه می‌کند.
  const box = band;
  const PROBE = 1000;
  const probe = await sharp(file).extract(box).resize({ width: PROBE }).raw().toBuffer({ resolveWithObject: true });
  const { data, info } = probe;
  const ch = info.channels;
  const isWhite = (x: number, y: number) => {
    const i = (y * info.width + x) * ch;
    return data[i] > 235 && data[i + 1] > 235 && data[i + 2] > 235;
  };

  /** بازه‌های پیوسته‌ای که در آن‌ها محتوا هست */
  const runs = (n: number, hasContent: (i: number) => boolean, minGap: number) => {
    const out: [number, number][] = [];
    let start: number | null = null, gap = 0;
    for (let i = 0; i <= n; i++) {
      if (i < n && hasContent(i)) {
        if (start === null) start = i;
        gap = 0;
      } else if (start !== null) {
        // فاصله کوتاه داخل یک محصول (مثل سایه) نباید آن را دو تکه کند
        if (++gap > minGap || i === n) { out.push([start, i - gap]); start = null; gap = 0; }
      }
    }
    return out;
  };

  const colHasContent = (x: number) => {
    for (let y = 0; y < info.height; y++) if (!isWhite(x, y)) return true;
    return false;
  };
  const columns = runs(info.width, colHasContent, Math.round(info.width * 0.005))
    .filter(([a, b]) => b - a > info.width * 0.04);

  const scale = box.width / info.width;
  const boxes: { left: number; top: number; width: number; height: number }[] = [];

  for (const [x0, x1] of columns) {
    // داخل هر ستون، پایین‌ترین بلوک محتوا خودِ محصول است؛ بلوک‌های بالاتر برچسب‌اند
    const rowHasContent = (y: number) => {
      for (let x = x0; x <= x1; x++) if (!isWhite(x, y)) return true;
      return false;
    };
    const rows = runs(info.height, rowHasContent, Math.round(info.height * 0.03));
    if (!rows.length) continue;
    const [y0, y1] = rows[rows.length - 1];
    if (y1 - y0 < info.height * 0.12) continue;

    // حاشیه دور محصول: بدون آن لبه و سایه زیر محصول دقیقاً روی مرز برش می‌افتاد و بریده دیده می‌شد
    const pad = Math.round((x1 - x0) * scale * 0.06);
    const left = Math.max(0, box.left + Math.round(x0 * scale) - pad);
    const top = Math.max(0, box.top + Math.round(y0 * scale) - pad);
    boxes.push({
      left,
      top,
      // حاشیه نباید از لبه صفحه منبع بیرون بزند
      width: Math.max(1, Math.min(Math.round((x1 - x0 + 1) * scale) + pad * 2, (page.width ?? left) - left)),
      height: Math.max(1, Math.min(Math.round((y1 - y0 + 1) * scale) + pad * 2, (page.height ?? top) - top)),
    });
  }

  // راست‌به‌چپ، هم‌ترتیب با برچسب‌های فارسی صفحه
  return boxes.sort((a, b) => b.left - a.left);
}

/** محصول بریده‌شده وسط یک قاب ۴:۳، طوری که قاب را پر کند */
async function framed(file: string, box: { left: number; top: number; width: number; height: number }, canvas: { width: number; height: number }) {
  // trim لبه و سایه زیر محصول را می‌بُرید؛ خودِ جعبه تشخیص‌داده‌شده با کمی حاشیه برش می‌خورد
  const cut = await sharp(file).extract(box).png().toBuffer();
  const { width = 1, height = 1 } = await sharp(cut).metadata();
  // سقف ۱: بزرگ‌نمایی جزئیاتی اضافه نمی‌کند، فقط عکس را نرم می‌کند
  const fit = Math.min((canvas.width * FILL) / width, (canvas.height * FILL) / height, 1);
  const w = Math.max(1, Math.round(width * fit));
  const h = Math.max(1, Math.round(height * fit));
  const product = await sharp(cut)
    .resize(w, h, { kernel: 'lanczos3' })
    .sharpen({ sigma: 0.6 })
    .toBuffer();
  return sharp({ create: { ...canvas, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } } })
    .composite([{ input: product, left: Math.round((canvas.width - w) / 2), top: Math.round((canvas.height - h) / 2) }])
    .png()
    .toBuffer();
}

async function buildInfra(src: string) {
  const out: Record<string, string[]> = {};
  for (const [slug, pages] of Object.entries(INFRA_FAMILIES)) {
    await clearOld(slug);
    const urls: string[] = [];
    let n = 0;
    for (const page of pages) {
      const file = path.join(src, `p-${page}.jpg`);
      const box = await whiteBand(file);
      if (!box || box.height < 200) { console.warn(`${slug}: نوار سفید صفحه ${page} پیدا نشد`); continue; }

      const products = await splitProducts(file, box);
      if (!products.length) { console.warn(`${slug}: محصولی در صفحه ${page} جدا نشد`); continue; }

      for (const product of products) {
        urls.push(await write(await framed(file, product, INFRA_CANVAS), slug, ++n));
      }
    }
    const lead = LEAD[slug];
    if (lead && urls[lead - 1]) urls.unshift(...urls.splice(lead - 1, 1));

    out[slug] = urls;
    console.log(`${slug}: ${urls.length} عکس${lead ? ` (عکس ${lead} اول آمد)` : ''}`);
  }
  return out;
}

// ───────────────────────────── ج) عکس دسته‌ها ─────────────────────────────

/**
 * دسته‌های تازه‌ساخته‌شده عکس ندارند و کارتشان جای خالی نشان می‌دهد.
 * مقدار = [اسلاگ محصول، شماره عکس] و خود فایل از index.json خوانده می‌شود،
 * چون نام فایل‌ها هش محتوا دارند و ثابت نیستند.
 */
const CATEGORY_SOURCE: Record<string, [string, number]> = {
  'polymer-valves': ['polymer-valves', 1],
  'sprinkler-irrigation-equipment': ['sprinklers', 1],
  'layflat-hose': ['layflat-hose', 1],
  'urban-furniture': ['urban-furniture-composite', 9],
};

async function buildCategories() {
  await fs.mkdir(CAT_OUT, { recursive: true });
  const index = await readIndex();

  for (const [slug, [productSlug, nth]] of Object.entries(CATEGORY_SOURCE)) {
    const url = (index[productSlug] ?? [])[nth - 1];
    if (!url) { console.warn(`${slug}: عکس ${nth} محصول ${productSlug} در index.json نیست`); continue; }
    const file = path.join(process.cwd(), 'public', url.replace(/^\//, ''));
    if (!(await fs.stat(file).catch(() => null))) { console.warn(`${slug}: فایل ${url} نیست`); continue; }

    // عکس محصول خودش یک قاب ۴:۳ است که محصول FILL آن را پر کرده و از قبل واترمارک دارد.
    // trim این‌جا بی‌اثر است (واترمارک تا لبه‌ها می‌رسد)، پس مستقیم به اندازه ناحیه امن ۴:۳
    // می‌رسانیمش — نتیجه: در برش ۴:۳ کارت، محصول همان FILL را پر می‌کند.
    const inner = await sharp(file)
      .resize(CATEGORY_SAFE.width, CATEGORY_SAFE.height, { fit: 'fill', kernel: 'lanczos3' })
      .toBuffer();
    const meta = await sharp(inner).metadata();
    const buf = await sharp({
      create: { ...CATEGORY, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } },
    })
      .composite([{
        input: inner,
        left: Math.round((CATEGORY.width - (meta.width ?? 0)) / 2),
        top: Math.round((CATEGORY.height - (meta.height ?? 0)) / 2),
      }])
      .webp({ quality: 92 })
      .toBuffer();

    const hash = createHash('sha1').update(buf).digest('hex').slice(0, 8);
    // نسخه قبلی همین دسته پاک شود تا پوشه باد نکند
    for (const f of await fs.readdir(CAT_OUT).catch(() => [] as string[])) {
      if (new RegExp(`^${slug}\\.[0-9a-f]{8}\\.webp$`).test(f)) await fs.unlink(path.join(CAT_OUT, f));
    }
    const name = `${slug}.${hash}.webp`;
    await fs.writeFile(path.join(CAT_OUT, name), buf);
    console.log(`دسته ${slug}: /images/categories/${name}`);
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
