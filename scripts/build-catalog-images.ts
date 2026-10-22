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
 * هر محصول در صفحه کاتالوگ دریچه‌ها ۶۲۰ تا ۹۳۰ پیکسل عرض دارد؛ با این محدوده هیچ عکسی
 * بزرگ‌نمایی نمی‌شود (بزرگ‌نمایی جزئیات اضافه نمی‌کند، فقط نرم می‌کند).
 */
const INFRA_LIMITS = { minWidth: 760, maxWidth: 1400, maxUpscale: 1 };
/** چقدر از قاب را خود محصول پر کند — پرشدگی ناهمسان، عکس را نصفه و رهاشده نشان می‌داد */
const FILL = 0.86;

/**
 * کارت دسته با object-cover و نسبت ۴:۳ تا ۱۶:۱۰ نمایش داده می‌شود.
 * قاب را ۱۶:۱۰ می‌سازیم ولی خود محصول را داخل ناحیه امنِ ۴:۳ وسط نگه می‌داریم،
 * تا در هیچ‌کدام از دو نسبت بریده نشود.
 */
const CATEGORY = { width: 1440, height: 900 };
const CATEGORY_SAFE = { width: 1200, height: 900 };

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

// ───────────────────── الف) شیرآلات و آبیاری (کاتالوگ رسمی سازنده) ─────────────────────

/**
 * قبلاً این گروه از تصویرِ لیست قیمت بریده می‌شد و هر محصول آن‌جا فقط ۵۵ تا ۱۶۵ پیکسل بود،
 * پس هرچه قاب را تنظیم می‌کردیم باز نرم و بی‌کیفیت می‌ماند.
 * حالا از کاتالوگ رسمی سازنده (vispar.co/catalog) می‌آید: عکس استودیویی هر محصول به‌صورت
 * شیء جدا با ماسک شفافیت، که scripts/extract-vispar-photos.ts بیرون می‌کشد.
 *
 * مقدارها نام فایل خروجی همان اسکریپت است (بدون پسوند).
 */
const VISPAR_PHOTOS: Record<string, string[]> = {
  'polymer-valves': ['v-011-069', 'v-015-077', 'v-016-078', 'v-013-073'],
  'sprinkler-irrigation-equipment': ['v-047-177', 'v-038-158', 'v-035-139', 'v-051-186'],
  sprinklers: ['v-044-174', 'v-046-176', 'v-042-171', 'v-040-165'],
  'layflat-hose': ['v-027-109', 'v-028-110', 'v-029-113', 'v-048-179'],
  'drip-fittings': ['v-050-185', 'v-038-163', 'v-056-205', 'v-035-141'],
  // اتصالات رزوه‌ای سفید در همین کاتالوگ آبیاری است؛ کاتالوگ UPVC خطِ صنعتیِ خاکستری است
  'upvc-threaded-fittings': ['v-059-209', 'v-062-215', 'v-066-223', 'v-067-225'],
};

/**
 * بیشتر عکس‌های کاتالوگ رسمی ۷۰۰ تا ۱۴۵۰ پیکسل‌اند و بزرگ‌نمایی نمی‌خواهند؛ چندتایی
 * حدود ۲۸۰ پیکسل‌اند و تا ۲.۴ برابر بزرگ می‌شوند تا پرشدگی قاب بین همه یکسان بماند.
 */
const VISPAR_LIMITS = { minWidth: 900, maxWidth: 1400, maxUpscale: 2.4 };

async function buildVispar(src: string) {
  const out: Record<string, string[]> = {};
  for (const [slug, photos] of Object.entries(VISPAR_PHOTOS)) {
    await clearOld(slug);
    const urls: string[] = [];
    for (const [i, photo] of photos.entries()) {
      const file = path.join(src, `${photo}.png`);
      if (!(await fs.stat(file).catch(() => null))) { console.warn(`${slug}: ${photo} نیست`); continue; }
      const meta = await sharp(file).metadata();
      const box = { left: 0, top: 0, width: meta.width ?? 1, height: meta.height ?? 1 };
      urls.push(await write(await framed(file, box, VISPAR_LIMITS), slug, i + 1));
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
/**
 * بریدن «کفِ» خاکستری کاتالوگ.
 *
 * در صفحه منبع هر محصول روی یک نوار خاکستری افقی (حدود RGB 144، خنثی و یکنواخت)
 * نشسته است. این نوار داخل برش می‌افتاد و در کارت مثل بریدگیِ وسط عکس دیده می‌شد.
 *
 * سفید کردنِ پیکسل‌های نوار جواب نداد: بتنِ خود محصول در سایه هم همان خاکستری است
 * و لبه پایین محصول خورده می‌شد. به‌جایش تصویر دقیقاً بالای نوار بریده می‌شود —
 * همان‌جایی که محصول روی زمین می‌نشیند.
 */
async function cropAboveShelf(input: Buffer) {
  const { data, info } = await sharp(input).raw().toBuffer({ resolveWithObject: true });
  const ch = info.channels;
  const isShelf = (i: number) => {
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
    if (Math.max(r, g, b) - Math.min(r, g, b) > 10) return false;
    const light = (r + g + b) / 3;
    return light >= 118 && light <= 180;
  };

  // فقط یک‌سوم پایینی را می‌گردیم؛ بالاتر از آن، خاکستریِ پهن یعنی خود محصول
  const from = Math.floor(info.height * 0.62);
  let top: number | null = null, run = 0;
  for (let y = from; y < info.height; y++) {
    let shelf = 0;
    for (let x = 0; x < info.width; x++) if (isShelf((y * info.width + x) * ch)) shelf++;
    if (shelf / info.width >= 0.6) {
      if (run === 0) top = y;
      run++;
    } else if (run) {
      if (run >= 4) break;
      run = 0; top = null;
    }
  }
  if (top === null || run < 4) return input;

  const height = Math.max(1, top);
  return sharp(input).extract({ left: 0, top: 0, width: info.width, height }).png().toBuffer();
}

/**
 * محصول وسط یک قاب ۴:۳، طوری که همیشه همان کسر از قاب را پر کند.
 *
 * قاب ثابت کار نمی‌کرد: اندازه منبعِ محصول‌ها خیلی فرق دارد، پس سقف بزرگ‌نمایی برای
 * ریزها زودتر فعال می‌شد و پرشدگی بین ۳۲٪ تا ۸۵٪ در نوسان بود — همان چیزی که
 * «نصفه» دیده می‌شد. حالا اندازه قاب از خود محصول حساب می‌شود تا پرشدگی یکسان بماند.
 */
async function framed(
  file: string,
  box: { left: number; top: number; width: number; height: number },
  limits: { minWidth: number; maxWidth: number; maxUpscale: number },
) {
  // trim لبه و سایه زیر محصول را می‌بُرید؛ خودِ جعبه تشخیص‌داده‌شده با کمی حاشیه برش می‌خورد
  const cut = await cropAboveShelf(await sharp(file).extract(box).png().toBuffer());
  const { width = 1, height = 1 } = await sharp(cut).metadata();

  // بزرگ‌نمایی فقط تا جایی که قاب به کف اندازه برسد؛ بیشتر از آن جزئیات اضافه نمی‌کند
  const needed = Math.max(width / FILL, (height / FILL) * (4 / 3));
  const canvasWidth = Math.round(Math.min(limits.maxWidth, Math.max(limits.minWidth, needed)));
  const canvas = { width: canvasWidth, height: Math.round((canvasWidth * 3) / 4) };

  const fit = Math.min(
    (canvas.width * FILL) / width,
    (canvas.height * FILL) / height,
    limits.maxUpscale,
  );
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
        urls.push(await write(await framed(file, product, INFRA_LIMITS), slug, ++n));
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
