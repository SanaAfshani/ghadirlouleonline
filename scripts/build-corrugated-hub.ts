// متن بلند صفحه دسته «لوله کاروگیت» از مقاله صفحه قدیمی کاروگیت (محصول منتشرنشده corrugated-pipe).
//
// آن مقاله احتمالاً برای «لوله کاروگیت» رتبه گوگل داشت و با منتشرنشدن صفحه از دید رفته بود. این اسکریپت
// بخش‌های درستش را نگه می‌دارد، آنچه با محصول فعلی تناقض دارد حذف می‌کند (SN16، سایزهای ناموجود،
// اسپیرال مسلح، لوله سوراخ‌دار، جدول مشخصات ساختگی، متن نقل‌شده از سایت دیگر) و بخش‌هایی از
// مستندات خود کارخانه (کاتالوگ و برگه مشخصات قدیر لوله پاسارگاد) اضافه می‌کند.
//
//   npx tsx scripts/build-corrugated-hub.ts                 → آزمایشی: فقط گزارش
//   npx tsx scripts/build-corrugated-hub.ts --apply         → نوشتن در Category.content (فقط اگر خالی است)
//   npx tsx scripts/build-corrugated-hub.ts --apply --force → بازنویسی، حتی اگر در پنل ویرایش شده
import 'dotenv/config';
import { prisma } from '../src/shared/lib/prisma';
import { CORRUGATED_PIPE_DIMENSIONS, corrugatedPipeSlug } from '../src/shared/lib/pipe-dimensions';
import { faDigits } from '../src/shared/lib/utils';

const APPLY = process.argv.includes('--apply');
const FORCE = process.argv.includes('--force');

/** بخش‌هایی که حذف می‌شوند — عنوان دقیق h2/h3 در مقاله قدیمی */
const DROP = new Set([
  'جدول مشخصات فنی لوله کاروگیت', // قطر داخلی و عمق دفن حدسی و SN16
  'سایزبندی لوله کاروگیت', // سایز ۱۲۵ که عرضه نمی‌شود — با فهرست سایزهای واقعی جایگزین می‌شود
  'کلاس‌های مقاومتی SN8 و SN4 و SN16',
  'لوله کاروگیت اسپیرال مسلح',
  'لوله کاروگیت فاضلابی', // SN16
  'لوله کاروگیت زهکشی سوراخ دار',
  'زهکشی', // لوله سوراخ‌دار را توصیف می‌کند
  'سیستم ‌های آبرسانی',
  'جدول انتخاب لوله کاروگیت براساس کاربرد', // SN16
]);

const sizeLinks = CORRUGATED_PIPE_DIMENSIONS.map(
  (d) => `<a href="/products/corrugated-pipes/${corrugatedPipeSlug(d.size)}">${faDigits(d.size)}</a>`,
).join('، ');

/** بعد از «مزایای استفاده از لوله کاروگیت» می‌آید؛ اعداد و استانداردها از مستندات کارخانه */
const FACTORY_SECTIONS = `
<h2>سایزهای لوله کاروگیت قدیر لوله پاسارگاد</h2>
<p>لوله کاروگیت دوجداره در ${faDigits(CORRUGATED_PIPE_DIMENSIONS.length)} سایز عرضه می‌شود و هر سایز صفحه اختصاصی با جدول ابعاد کارخانه، کلاس‌ها و قیمت روز دارد: ${sizeLinks} میلی‌متر. برای قطرهای بزرگ‌تر، <a href="/products/spiral-pipes">لوله اسپیرال</a> را ببینید.</p>

<h2>کلاس سختی حلقوی SN4 و SN8</h2>
<p>سختی حلقوی توان لوله در برابر بار خاک و ترافیک است. طبق کاتالوگ کارخانه، کلاس <strong>SN4</strong> و <strong>SN8</strong> با آزمون کوتاه‌مدت استاندارد ISO 9969 به ترتیب ۴ و ۸ کیلونیوتن بر مترمربع است. عددهای ۱۶ و ۳۱٫۵ کیلونیوتن بر مترمربع که کنار کلاس‌ها در جدول قیمت آمده، مقدار همان دو کلاس با روش استاندارد DIN 16961-2 است که کارخانه برای کنترل کیفیت به کار می‌برد؛ دو روش متفاوت برای یک کلاس، نه دو کلاس مختلف.</p>
<p>کلاس را عمق دفن، نوع خاک و بار ترافیکی مسیر تعیین می‌کند: SN4 برای مسیرهای کم‌عمق و بدون تردد سنگین و SN8 برای معابر شهری، عمق بیشتر و خطوط اصلی.</p>

<h2>اتصال و آب‌بندی</h2>
<p>طبق برگه مشخصات کارخانه، لوله‌ها به صورت <strong>کوپلر سرخود دولایه</strong> تولید می‌شوند؛ دولایه بودن کوپلر جلوی دوپهن شدن محل اتصال را می‌گیرد و واشر لاستیکی <strong>EPDM</strong> درز را آب‌بند می‌کند. رنگ بیرونی لوله مشکی و جداره داخلی زرد و ضد اشعه UV است.</p>

<h2>استانداردهای لوله کاروگیت</h2>
<p>کنترل ابعاد و سختی حلقوی طبق INSO 9116-3 و DIN 16961-2 و سایر آزمون‌ها طبق EN 13476 انجام می‌شود. استانداردهای مرجع در برگه مشخصات کارخانه: INSO 9116-1، INSO 9116-2، INSO 9116-3، DIN 16961-1، DIN 16961-2 و EN 13476. تصویر پروانه‌ها و گواهی‌ها در صفحه <a href="/certificates">مدارک و گواهینامه‌ها</a> آمده است.</p>
`;

/** مقاله را به بخش‌های «عنوان + بدنه» می‌شکند؛ هر بخش از یک h2/h3 تا عنوان بعدی */
function sections(html: string) {
  return html.split(/(?=<h[23][^>]*>)/).map((part) => ({
    title: part.match(/^<h[23][^>]*>([^<]+)<\/h[23]>/)?.[1]?.trim() ?? '',
    html: part,
  }));
}

function clean(html: string) {
  const out: string[] = [];
  for (const s of sections(html)) {
    if (DROP.has(s.title)) continue;
    let part = s.html;
    if (s.title === 'عوامل موثر در قیمت لوله کاروگیت') {
      part = part.replace(/<li>(?:(?!<\/li>)[\s\S])*نوع لوله \(اسپیرال، مسلح، سوراخ[\s\S]*?<\/li>\s*/, '');
    }
    if (s.title === 'لوله کاروگیت SN4') {
      // نقل‌قول از سایت دیگر
      part = part.replace(/<blockquote>[\s\S]*?<\/blockquote>\s*/g, '');
    }
    if (s.title === 'لوله کاروگیت اسپیرال') {
      part = part.replace(/<\/p>\s*$/, ` قطرهای عرضه‌شده و قیمت روز در صفحه <a href="/products/spiral-pipes">لوله اسپیرال</a> آمده است.</p>\n`);
    }
    if (s.title === 'جدول ظرفیت حمل لوله های کاروگیت در خودروهای مختلف') {
      // ۹۰۰ و ۱۴۰۰ کاروگیت عرضه نمی‌شوند
      part = part.replace(/<tr><td>(?:900|1400)<\/td>[\s\S]*?<\/tr>/g, '');
    }
    out.push(part);
    if (s.title === 'مزایای استفاده از لوله کاروگیت') out.push(FACTORY_SECTIONS);
  }
  return out.join('').trim();
}

async function main() {
  console.log(`دیتابیس: ${new URL(process.env.DATABASE_URL!).host}`);
  console.log(APPLY ? '>>> حالت اعمال\n' : '>>> حالت آزمایشی (بدون تغییر)\n');

  const source = await prisma.product.findUnique({ where: { slug: 'corrugated-pipe' }, select: { description: true } });
  if (!source?.description) throw new Error('مقاله صفحه قدیمی کاروگیت پیدا نشد');
  const category = await prisma.category.findUnique({ where: { slug: 'corrugated-pipes' }, select: { id: true, content: true } });
  if (!category) throw new Error('دسته corrugated-pipes پیدا نشد');

  const content = clean(source.description);
  const kept = sections(content).map((s) => s.title).filter(Boolean);
  console.log(`بخش‌های نهایی (${kept.length}):`);
  for (const t of kept) console.log(`  · ${t}`);
  for (const bad of ['SN16', 'sorplastik', 'مسلح', '125 میلیمتر', '3000']) {
    if (content.includes(bad)) console.log(`  ⚠ هنوز در متن است: ${bad}`);
  }
  console.log(`\nطول: ${source.description.length} → ${content.length} نویسه`);

  if (category.content && !FORCE) {
    console.log('\nمتن دسته از قبل پر است (شاید در پنل ویرایش شده) — بدون --force دست نمی‌خورد.');
    return;
  }
  if (!APPLY) {
    console.log('\nبرای اعمال، همین دستور را با --apply تکرار کنید.');
    return;
  }
  await prisma.category.update({ where: { id: category.id }, data: { content } });
  console.log('\nانجام شد.');
}

main()
  .catch((e) => {
    console.error('\n✗', e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
