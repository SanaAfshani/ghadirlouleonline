import { readFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { prisma } from '@/shared/lib/prisma';
import { SPLIT_SKIP, splitTitle } from '@/shared/lib/price-title-split';

/**
 * انتقال یک‌باره محتوای مهر ۱۴۰۵ به دیتابیس هر محیط (سرور اصلی دیتابیس جدای خودش را دارد و این تغییرات فقط روی
 * دیتابیس توسعه انجام شده بود): عکس‌های واقعی کارخانه در گالری و دسته کاروگیت، عکس سپتیک، عکس‌های توضیحات کاروگیت،
 * پروژه اجراشده و ایمیل جدید.
 *
 * ایمن برای اجرای چندباره: هر مرحله اول بررسی می‌کند که قبلاً انجام شده یا نه؛ چیزی حذف نمی‌شود (عکس‌های قبلی گالری
 * سر جایشان می‌مانند و عکس‌های جدید جلو می‌آیند). بعد از موفقیت کامل، کلید content_sync_2026_10 در تنظیمات ثبت می‌شود.
 * عکس‌ها از content/sync-2026-10 (بیرون از public تا نسخه بی‌واترمارک قابل دانلود نباشد).
 */

const SYNC_KEY = 'content_sync_2026_10';
const DIR = path.join(process.cwd(), 'content', 'sync-2026-10');

/**
 * شناسه ثابت برای هر عکس تا اجرای دوباره عکس تکراری نسازد (باید با الگوی /media/[a-z0-9]{20,40} بخواند).
 * «z» بعد از نام لازم است: بدون آن yard3 و yard30 بعد از پر شدن با صفر یک شناسه می‌شدند.
 */
const mediaId = (name: string) => `csync2${name}z`.padEnd(25, '0');
const url = (name: string) => `/media/${mediaId(name)}.webp`;

const FILES = ['yard15', 'yard3', 'yard10', 'yard5', 'yard30', 'truck24', 'inst4', 'inst3', 'inst1', 'pickup2', 'septic5'];
const CORRUGATED_GALLERY = ['yard15', 'yard3', 'yard10', 'yard5', 'yard30', 'inst4', 'inst3', 'inst1', 'pickup2'];
const PROJECT_IMAGES = ['inst4', 'inst3', 'inst1', 'pickup2', 'truck24'];
const OLD_EMAIL = 'ghadirlouleonline@gmail.com';
const NEW_EMAIL = 'info@ghadirlouleonline.ir';

const prepend = (raw: string, add: string[]) => {
  let list: string[] = [];
  try {
    list = JSON.parse(raw || '[]');
  } catch {}
  if (list.includes(add[0])) return null; // قبلاً انجام شده
  return JSON.stringify([...add, ...list.filter((u) => !add.includes(u))]);
};

async function syncMedia() {
  const existing = new Set((await prisma.media.findMany({ where: { id: { in: FILES.map(mediaId) } }, select: { id: true } })).map((m) => m.id));
  for (const name of FILES) {
    if (existing.has(mediaId(name))) continue;
    const data = await readFile(path.join(DIR, `${name}.webp`));
    const { width, height } = await sharp(data).metadata();
    await prisma.media.create({
      data: { id: mediaId(name), data: new Uint8Array(data), mime: 'image/webp', size: data.length, width, height, originalName: `site-photo-${name}.webp` },
    });
  }
}

/** عکس‌های استوک توضیحات کاروگیت → عکس واقعی؛ عکس بارگیری زیر جدول ظرفیت حمل؛ عکس ترانشه بالای «فاضلاب شهری» */
export function syncDescription(html: string) {
  if (html.includes('csync2')) return null;
  let out = html;
  const swap = (alt: string, name: string, newAlt: string, portrait = false) => {
    const re = new RegExp(`<img src="[^"]*" alt="${alt}"[^>]*>`);
    out = out.replace(re, `<img src="${url(name)}" alt="${newAlt}"${portrait ? ' class="img-portrait"' : ''}>`);
  };
  swap('لوله کاروگیت چیست', 'yard15', 'لوله کاروگیت چیست — لوله دوجداره پلی اتیلن با جداره داخلی زرد در انبار کارخانه قدیر لوله پاسارگاد');
  swap('کاربرد لوله کاروگیت', 'yard3', 'کاربرد لوله کاروگیت در شبکه فاضلاب و زهکشی — انبار لوله کاروگیت کارخانه در گرمسار');
  swap('لوله کاروگیت فاضلابی', 'inst4', 'اجرای لوله کاروگیت فاضلابی در شبکه فاضلاب شهری', true);

  const cap = out.indexOf('جدول ظرفیت حمل');
  const tableEnd = cap >= 0 ? out.indexOf('</table>', cap) : -1;
  if (tableEnd >= 0) {
    const fig = `\n<figure><img src="${url('truck24')}" alt="بارگیری لوله کاروگیت روی کامیون برای ارسال به محل پروژه" class="img-portrait"><figcaption>بارگیری لوله کاروگیت از انبار کارخانه برای ارسال به پروژه</figcaption></figure>\n`;
    out = out.slice(0, tableEnd + 8) + fig + out.slice(tableEnd + 8);
  }
  const sewer = out.indexOf('<h3>فاضلاب شهری</h3>');
  if (sewer >= 0) {
    const fig = `<figure><img src="${url('inst1')}" alt="اجرای لوله کاروگیت زهکشی در ترانشه" class="img-portrait"><figcaption>اجرای لوله کاروگیت در ترانشه زهکشی</figcaption></figure>\n`;
    out = out.slice(0, sewer) + fig + out.slice(sewer);
  }
  return out === html ? null : out;
}

const PROJECT_CONTENT =
  '<p>تصاویر واقعی اجرای لوله کاروگیت دوجداره تولید قدیر لوله پاسارگاد در پروژه‌های شبکه فاضلاب و زهکشی: حفاری و آماده‌سازی ترانشه، چیدمان لوله‌ها در مسیر و اتصال شاخه‌ها با کوپلر و واشر آب‌بند.</p>' +
  '<h2>مراحل در تصاویر</h2><ul><li>حفر ترانشه و آماده‌سازی بستر لوله</li><li>چیدمان لوله کاروگیت در مسیر شبکه</li><li>اتصال شاخه‌ها با کوپلر و واشر آب‌بند</li><li>بارگیری از انبار کارخانه و ارسال به محل پروژه</li></ul>' +
  '<p>برای انتخاب سایز و کلاس مقاومتی مناسب پروژه خود (SN4 سبک یا SN8 سنگین) با کارشناس فروش مشورت کنید.</p>';

export async function syncContent() {
  if (await prisma.siteSettings.findUnique({ where: { key: SYNC_KEY }, select: { key: true } })) return 'already done';
  const markDone = () => prisma.siteSettings.create({ data: { key: SYNC_KEY, value: new Date().toISOString(), type: 'text' } });

  // دیتابیس توسعه همین تغییرات را دستی گرفته (آپلودهای site-photo-*.jpg) — اجرای دوباره عکس و شکل تکراری می‌ساخت
  if (await prisma.media.findFirst({ where: { originalName: { startsWith: 'site-photo-', endsWith: '.jpg' } }, select: { id: true } })) {
    await markDone();
    return 'applied manually before — skipped';
  }

  const done: string[] = [];

  await syncMedia();

  const corrugated = await prisma.product.findFirst({ where: { slug: 'corrugated-pipe' }, select: { id: true, images: true, description: true } });
  if (corrugated) {
    const images = prepend(corrugated.images, CORRUGATED_GALLERY.map(url));
    const description = corrugated.description ? syncDescription(corrugated.description) : null;
    if (images || description) {
      await prisma.product.update({ where: { id: corrugated.id }, data: { ...(images && { images }), ...(description && { description }) } });
      done.push('corrugated');
    }
  }

  const category = await prisma.category.findFirst({ where: { slug: 'corrugated-pipes' }, select: { id: true, image: true } });
  if (category && !category.image?.includes('csync2')) {
    await prisma.category.update({ where: { id: category.id }, data: { image: url('yard30') } });
    done.push('category');
  }

  const septic = await prisma.product.findFirst({ where: { slug: 'septic-tank-polyethylene' }, select: { id: true, images: true } });
  const septicImages = septic && prepend(septic.images, [url('septic5')]);
  if (septic && septicImages) {
    await prisma.product.update({ where: { id: septic.id }, data: { images: septicImages } });
    done.push('septic');
  }

  if (!(await prisma.project.findUnique({ where: { slug: 'corrugated-pipe-sewer-installation' }, select: { id: true } }))) {
    await prisma.project.create({
      data: {
        title: 'اجرای شبکه فاضلاب با لوله کاروگیت',
        slug: 'corrugated-pipe-sewer-installation',
        description: 'تصاویر واقعی اجرای لوله کاروگیت دوجداره قدیر لوله پاسارگاد در ترانشه شبکه فاضلاب و زهکشی.',
        content: PROJECT_CONTENT,
        images: JSON.stringify(PROJECT_IMAGES.map(url)),
        year: 1405,
        published: true,
        featured: true,
      },
    });
    done.push('project');
  }

  // فقط اگر هنوز ایمیل قدیمی است — اگر ادمین ایمیل دیگری گذاشته دست نمی‌خورد
  const email = await prisma.siteSettings.findUnique({ where: { key: 'contact_email' } });
  if (!email || email.value === OLD_EMAIL) {
    await prisma.siteSettings.upsert({ where: { key: 'contact_email' }, update: { value: NEW_EMAIL }, create: { key: 'contact_email', value: NEW_EMAIL, type: 'text' } });
    done.push('email');
  }

  await markDone();
  return done.join(', ') || 'nothing to change';
}

const PRICE_SPLIT_KEY = 'price_split_2026_10';
/** نسخه پشتیبان عنوان‌های قبلی — در Media تا در /api/settings (که به همه صفحات می‌رود) بار اضافه نباشد */
const PRICE_SPLIT_BACKUP_ID = 'pricesplitbackup202610z0';

/**
 * تفکیک عنوان‌های بلند ردیف‌های قیمت به مدل/سایز/کلاس (سبک/سنگین)/مشخصات/ابعاد — همان scripts/split-price-titles.mjs
 * برای دیتابیس سرور که از اینجا در دسترس نیست. فقط ردیف‌هایی که هیچ‌کدام از این ستون‌ها را ندارند؛ updatedAt دست نمی‌خورد.
 */
export async function syncPriceTitles() {
  if (await prisma.siteSettings.findUnique({ where: { key: PRICE_SPLIT_KEY }, select: { key: true } })) return 'already done';
  const rows = await prisma.priceItem.findMany({
    where: { size: '', grade: '', spec: '', dimensions: '', product: { name: { notIn: SPLIT_SKIP } } },
    select: { id: true, title: true },
  });
  const changes = rows.map((r) => ({ id: r.id, before: r.title, ...splitTitle(r.title) })).filter((c) => c.size && c.title);
  const backup = Buffer.from(JSON.stringify(changes.map(({ id, before }) => ({ id, title: before }))));

  await prisma.$transaction([
    prisma.media.upsert({
      where: { id: PRICE_SPLIT_BACKUP_ID },
      update: {},
      create: { id: PRICE_SPLIT_BACKUP_ID, data: new Uint8Array(backup), mime: 'application/json', size: backup.length, originalName: 'price-titles-backup.json' },
    }),
    prisma.$executeRaw`
      UPDATE "PriceItem" i SET title = c.title, size = c.size, grade = c.grade, spec = c.spec, dimensions = c.dimensions
      FROM jsonb_to_recordset(${JSON.stringify(changes)}::jsonb) AS c(id text, title text, size text, grade text, spec text, dimensions text)
      WHERE i.id = c.id`,
    prisma.siteSettings.create({ data: { key: PRICE_SPLIT_KEY, value: new Date().toISOString(), type: 'text' } }),
  ]);
  return `${changes.length} price rows split`;
}

const SEPTIC_PHOTO_KEY = 'septic_main_photo_2026_10';

/**
 * عکس بارگیری سپتیک روی وانت (کج، با آدم و درخت) عکس اصلی محصول شده بود — عکس اصلی باید خود مخزن روی زمینه سفید باشد.
 * همان عکس به ته گالری می‌رود (روی سرور csync2septic5، در دیتابیس توسعه آپلود دستی site-photo-b2-5.jpg). یک بار؛ چیزی حذف نمی‌شود.
 */
export async function syncSepticMainPhoto() {
  if (await prisma.siteSettings.findUnique({ where: { key: SEPTIC_PHOTO_KEY }, select: { key: true } })) return 'already done';
  const pickup = await prisma.media.findMany({
    where: { originalName: { in: ['site-photo-septic5.webp', 'site-photo-b2-5.jpg'] } },
    select: { id: true },
  });
  const pickupUrls = new Set(pickup.map((m) => `/media/${m.id}.webp`));
  const septic = await prisma.product.findFirst({ where: { slug: 'septic-tank-polyethylene' }, select: { id: true, images: true } });

  let result = 'nothing to change';
  if (septic) {
    let images: string[] = [];
    try {
      images = JSON.parse(septic.images || '[]');
    } catch {}
    if (images.length > 1 && pickupUrls.has(images[0])) {
      const reordered = [...images.filter((u) => !pickupUrls.has(u)), ...images.filter((u) => pickupUrls.has(u))];
      await prisma.product.update({ where: { id: septic.id }, data: { images: JSON.stringify(reordered) } });
      result = 'septic pickup photo moved to the end';
    }
  }
  await prisma.siteSettings.create({ data: { key: SEPTIC_PHOTO_KEY, value: new Date().toISOString(), type: 'text' } });
  return result;
}

const VAT_OFF_KEY = 'vat_off_2026_10';
const VAT_NOTES_BACKUP_ID = 'vatnotesbackup202610z0000';
/** «فروش به صورت رسمی می‌باشد + 10% ارزش افزوده» (با یا بدون نیم‌فاصله و «—» قبلش) */
const VAT_NOTE = /\s*—?\s*فروش به صورت رسمی می‌?\s?باشد\s*\+\s*10\s*%\s*ارزش افزوده/g;

/**
 * ارزش افزوده فعلاً خاموش است (quote-constants: VAT_ENABLED): متن «+ 10% ارزش افزوده» از یادداشت ردیف‌های قیمت
 * حذف می‌شود و پیش‌فاکتورهای صادرنشده‌ای که با ۱۰٪ ثبت شده‌اند بدون مالیات می‌شوند. فاکتورهای صادرشده دست نمی‌خورند.
 * یک بار؛ یادداشت‌های قبلی در Media پشتیبان می‌شوند؛ updatedAt ردیف‌ها عوض نمی‌شود.
 */
export async function syncVatOff() {
  if (await prisma.siteSettings.findUnique({ where: { key: VAT_OFF_KEY }, select: { key: true } })) return 'already done';

  const rows = await prisma.priceItem.findMany({ where: { note: { contains: 'ارزش افزوده' } }, select: { id: true, note: true } });
  const notes = rows.map((r) => ({ id: r.id, before: r.note, note: r.note.replace(VAT_NOTE, '').trim() })).filter((r) => r.note !== r.before);
  const backup = Buffer.from(JSON.stringify(notes.map(({ id, before }) => ({ id, note: before }))));

  const [, , quotes] = await prisma.$transaction([
    prisma.media.upsert({
      where: { id: VAT_NOTES_BACKUP_ID },
      update: {},
      create: { id: VAT_NOTES_BACKUP_ID, data: new Uint8Array(backup), mime: 'application/json', size: backup.length, originalName: 'price-notes-vat-backup.json' },
    }),
    prisma.$executeRaw`
      UPDATE "PriceItem" i SET note = c.note
      FROM jsonb_to_recordset(${JSON.stringify(notes)}::jsonb) AS c(id text, note text)
      WHERE i.id = c.id`,
    prisma.$executeRaw`
      UPDATE "Quote" SET "vatRate" = 0, "vatAmount" = 0, total = subtotal
      WHERE status <> 'ISSUED' AND "vatRate" > 0`,
    prisma.siteSettings.create({ data: { key: VAT_OFF_KEY, value: new Date().toISOString(), type: 'text' } }),
  ]);
  return `${notes.length} price notes, ${quotes} pending quotes without VAT`;
}

const VAT_OFF_ISSUED_KEY = 'vat_off_issued_2026_10';
const VAT_ISSUED_BACKUP_ID = 'vatissuedbackup202610z000';

/**
 * به درخواست مدیر، ارزش افزوده از پیش‌فاکتورها/فاکتورهای صادرشده هم برداشته می‌شود: نرخ و مبلغ مالیات صفر، جمع کل = جمع کالا،
 * و متن «+ 10% ارزش افزوده» از یادداشت ردیف‌های داخل پیش‌فاکتور (کپی یادداشت جدول قیمت). یک بار؛ مقادیر قبلی در Media پشتیبان.
 */
export async function syncVatOffIssued() {
  if (await prisma.siteSettings.findUnique({ where: { key: VAT_OFF_ISSUED_KEY }, select: { key: true } })) return 'already done';

  const quotes = await prisma.quote.findMany({ where: { vatRate: { gt: 0 } }, select: { id: true, number: true, vatRate: true, vatAmount: true, total: true } });
  const items = await prisma.quoteItem.findMany({ where: { note: { contains: 'ارزش افزوده' } }, select: { id: true, note: true } });
  const notes = items.map((i) => ({ id: i.id, before: i.note, note: i.note.replace(VAT_NOTE, '').trim() })).filter((i) => i.note !== i.before);
  const backup = Buffer.from(JSON.stringify({ quotes, notes: notes.map(({ id, before }) => ({ id, note: before })) }));

  const [, updatedQuotes] = await prisma.$transaction([
    prisma.media.upsert({
      where: { id: VAT_ISSUED_BACKUP_ID },
      update: {},
      create: { id: VAT_ISSUED_BACKUP_ID, data: new Uint8Array(backup), mime: 'application/json', size: backup.length, originalName: 'quotes-vat-backup.json' },
    }),
    prisma.$executeRaw`UPDATE "Quote" SET "vatRate" = 0, "vatAmount" = 0, total = subtotal WHERE "vatRate" > 0`,
    prisma.$executeRaw`
      UPDATE "QuoteItem" i SET note = c.note
      FROM jsonb_to_recordset(${JSON.stringify(notes)}::jsonb) AS c(id text, note text)
      WHERE i.id = c.id`,
    prisma.siteSettings.create({ data: { key: VAT_OFF_ISSUED_KEY, value: new Date().toISOString(), type: 'text' } }),
  ]);
  return `${updatedQuotes} quotes and ${notes.length} quote rows without VAT`;
}
