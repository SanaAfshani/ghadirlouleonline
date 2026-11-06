// بازچینی کاتالوگ به سه محصول: لوله کاروگیت، لوله اسپیرال و اتصالات کاروگیت — مثل دیجی‌کالا هر سایز
// لوله یک صفحه جدا با توضیحات خودش، و هر نوع اتصال یک صفحه.
//
//   npx tsx scripts/restructure-catalog.ts                     → آزمایشی (فقط گزارش، هیچ نوشتنی)
//   npx tsx scripts/restructure-catalog.ts --apply             → اعمال روی DATABASE_URL
//   npx tsx scripts/restructure-catalog.ts --apply --refresh-content
//        → متن صفحه‌های ساخته‌شده را هم از نو بنویس (پیش‌فرض: متنی که ادمین بعداً ویرایش کرده دست نمی‌خورد)
//
// هیچ ردیفی حذف نمی‌شود:
// - ردیف‌های قیمت (با تاریخچه نمودارشان) از محصول قبلی به صفحه سایز منتقل می‌شوند، نه کپی؛
// - بقیه محصولات و دسته‌ها فقط منتشرنشده می‌شوند و آدرسشان با ریدایرکت ۳۰۸ به صفحه مرتبط می‌رود؛
// - قبل از هر نوشتن، وضعیت فعلی در .backups/ ذخیره می‌شود.
// سایز ۹۰۰ عرضه نمی‌شود و ردیف‌هایش روی محصول قبلیِ منتشرنشده می‌مانند.
import 'dotenv/config';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { prisma } from '../src/shared/lib/prisma';
import { recordRedirect } from '../src/shared/lib/redirects';
import { CORRUGATED_PIPE_DIMENSIONS, corrugatedPipeSlug, type PipeDimension } from '../src/shared/lib/pipe-dimensions';
import { CORRUGATED_FITTINGS, SIZE_SPEC_KEY, SPIRAL_PIPE_SIZES, spiralPipeSlug } from '../src/shared/config/product-lines';
import { siteConfig } from '../src/shared/config/site';
import { defaultSiteSettings } from '../src/shared/lib/site-settings';
import { faDigits, latinDigits } from '../src/shared/lib/utils';

const APPLY = process.argv.includes('--apply');
const REFRESH_CONTENT = process.argv.includes('--refresh-content');

/** محصولات فعلی که ردیف‌های قیمتشان بین صفحه‌های تازه پخش می‌شود */
const SOURCE = { corrugated: 'corrugated-pipe', spiral: 'spiral-corrugated-pipe', fittings: 'corrugated-fittings' };
const EXCLUDED_SIZES = new Set([900]);

const fa = (value: number | string) => faDigits(String(value));
const mm = (value: number) => `${fa(value)} میلی‌متر`;
const sizeOf = (raw: string) => parseInt(latinDigits(raw), 10);
const inchOf = (raw: string) => latinDigits(raw).match(/\((\d+)\s*اینچ\)/)?.[1];
/** کلاس وزنی ردیف قیمت → کلاس سختی حلقوی (سبک = SN4، سنگین = SN8 در برگه قیمت کارخانه) */
const snOf = (grade: string) => (grade === 'سنگین' ? 'SN8' : 'SN4');

type Faq = { question: string; answer: string };
type Row = { id: string; title: string; size: string; grade: string };
type Plan = {
  slug: string;
  categorySlug: string;
  name: string;
  shortDescription: string;
  description: string;
  specifications: Record<string, string>;
  faqs: Faq[];
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  images: string[];
  quoteOnly: boolean;
  pricePerKg: number | null;
  rows: Row[];
};

const CATEGORIES = [
  { slug: 'corrugated-pipes', name: 'لوله کاروگیت', order: 1 },
  { slug: 'spiral-pipes', name: 'لوله اسپیرال', order: 2 },
  { slug: 'corrugated-fittings', name: 'اتصالات کاروگیت', order: 3 },
] as const;

const link = (categorySlug: string, slug: string, text: string) => `<a href="/products/${categorySlug}/${slug}">${text}</a>`;
/**
 * گالری مشترک، با عکس اول متفاوت برای هر سایز — وگرنه همه کارت‌های دسته یک عکس دارند.
 * عکس اول از پنج عکس اول گالری (عکس‌های انبار) انتخاب می‌شود، نه نمودارهای آموزشی ته گالری.
 */
const leadWith = (gallery: string[], i: number) => {
  const lead = gallery[i % Math.min(5, gallery.length)];
  return lead ? [lead, ...gallery.filter((g) => g !== lead)] : gallery;
};
const categoryLink = (categorySlug: string, text: string) => `<a href="/products/${categorySlug}">${text}</a>`;
const CONTACT = `<p>برای استعلام قیمت عمده، هزینه حمل تا محل پروژه و مشاوره در انتخاب سایز و کلاس، با کارشناسان ${siteConfig.name} تماس بگیرید یا ردیف موردنظر را از جدول قیمت به پیش‌فاکتور اضافه کنید.</p>`;
/** اتصالات «فقط استعلام»اند و جدول قیمت ندارند */
const CONTACT_QUOTE = `<p>برای استعلام قیمت، موجودی و هزینه حمل تا محل پروژه با کارشناسان ${siteConfig.name} تماس بگیرید یا درخواست مشاوره ثبت کنید.</p>`;

// ─────────────────────────── لوله کاروگیت: هر سایز یک صفحه ───────────────────────────

/** کاربرد هر سایز — از متن معرفی قبلی صفحه کاروگیت، جدا شده برای صفحه همان سایز */
const CORRUGATED_USES: Record<number, string[]> = {
  110: ['انشعاب فاضلاب ساختمان و حیاط', 'زهکشی سبک باغ و فضای سبز', 'غلاف محافظ کابل برق و مخابرات'],
  160: ['اتصال فاضلاب خانگی به شبکه شهری', 'جمع‌آوری فاضلاب کوچه‌های فرعی', 'زهکشی اراضی و محوطه'],
  200: ['شبکه فرعی فاضلاب شهری و شهرک‌ها', 'زهکشی و آب‌های سطحی محوطه', 'غلاف عبور لوله و کابل'],
  250: ['شبکه فاضلاب شهری و مجتمع‌های مسکونی', 'انتقال فاضلاب ساختمان‌های بزرگ', 'جمع‌آوری آب‌های سطحی معابر'],
  315: ['خطوط جمع‌آوری فاضلاب شهری', 'فاضلاب بیمارستان، شهرک صنعتی و مجتمع‌ها', 'زهکشی پروژه‌های بزرگ'],
  400: ['خطوط اصلی جمع‌آوری فاضلاب', 'فاضلاب صنعتی و شهرک‌های صنعتی', 'زهکشی جاده و اراضی وسیع'],
  500: ['جمع‌آوری و انتقال آب‌های سطحی', 'زهکشی جاده و زمین‌های کشاورزی', 'خطوط اصلی فاضلاب'],
  600: ['خطوط اصلی فاضلاب و آب‌های سطحی', 'شبکه‌های زیرساختی شهری', 'هدایت رواناب به کانال‌ها'],
  700: ['خطوط اصلی و کلکتورهای فاضلاب', 'آب‌های سطحی خیابان‌های اصلی', 'زهکشی پروژه‌های عمرانی بزرگ'],
  800: ['کلکتورهای فاضلاب شهری', 'کالورت و عبور آب از زیر جاده', 'انتقال حجم بالای آب‌های سطحی'],
  1000: ['کلکتور اصلی فاضلاب', 'کالورت جاده‌ای و عبور سیلاب', 'زهکشی مناطق صنعتی و رودخانه‌ای'],
  1200: ['کلکتورهای اصلی شبکه فاضلاب', 'کانال انتقال سیلاب و آب‌های سطحی', 'کالورت زیر جاده و راه‌آهن'],
};

function corrugatedPlan(d: PipeDimension, rows: Row[], gallery: string[], pricePerKg: number | null, i: number): Plan {
  const n = fa(d.size);
  const inch = rows.map((r) => inchOf(r.size)).find(Boolean);
  const classes = [...new Set(rows.map((r) => snOf(r.grade)))].sort();
  const classText = classes.length ? classes.join(' و ') : 'SN4 و SN8';
  const uses = CORRUGATED_USES[d.size];
  const prev = CORRUGATED_PIPE_DIMENSIONS[i - 1];
  const next = CORRUGATED_PIPE_DIMENSIONS[i + 1];
  const sizeLink = (x: PipeDimension) => link('corrugated-pipes', corrugatedPipeSlug(x.size), `لوله کاروگیت ${fa(x.size)}`);
  const name = `لوله کاروگیت ${n} میلی‌متر`;

  return {
    slug: corrugatedPipeSlug(d.size),
    categorySlug: 'corrugated-pipes',
    name,
    shortDescription: `لوله کاروگیت دوجداره ${mm(d.size)}${inch ? ` (${fa(inch)} اینچ)` : ''} با قطر خارجی ${mm(d.outerDiameter)}، در کلاس ${classText} همراه با واشر آب‌بند ${d.washer}؛ مناسب ${uses[0]} و ${uses[1]}. قیمت روز هر متر، مستقیم از کارخانه ${siteConfig.legalName}.`,
    description: `<p><strong>لوله کاروگیت ${n} میلی‌متر</strong> یک لوله دوجداره از پلی اتیلن سنگین (HDPE) است: جداره بیرونی موج‌دار که سختی حلقوی و تحمل بار خاک را تأمین می‌کند، و جداره داخلی صاف که جریان فاضلاب را روان نگه می‌دارد و جلوی رسوب را می‌گیرد. این سایز در کارخانه ${siteConfig.legalName} با قطر خارجی ${mm(d.outerDiameter)} تولید می‌شود.</p>

<h2>ابعاد و مشخصات فنی لوله کاروگیت ${n}</h2>
<p>طبق برگه مشخصات کارخانه، قطر خارجی این سایز ${mm(d.outerDiameter)}، ضخامت لایه داخلی ${mm(d.innerLayer)} و ضخامت مجموع لایه‌ها ${mm(d.totalLayers)} است. آب‌بندی اتصال با واشر لاستیکی ${d.washer} انجام می‌شود و لوله در کلاس ${classText} عرضه می‌شود. جدول کامل ابعاد پایین همین صفحه آمده است.</p>

<h2>کاربرد لوله کاروگیت ${n}</h2>
<ul>
${uses.map((u) => `<li>${u}</li>`).join('\n')}
</ul>

<h2>کلاس SN4 یا SN8؟</h2>
<p>کلاس سختی حلقوی از روی عمق دفن، نوع خاک و بار ترافیکی مسیر انتخاب می‌شود، نه از روی قطر لوله. <strong>SN4</strong> (کلاس سبک) برای مسیرهای کم‌عمق و بدون تردد سنگین اقتصادی‌تر است و <strong>SN8</strong> (کلاس سنگین) برای معابر شهری، عمق دفن بیشتر یا خاک ضعیف پیشنهاد می‌شود. SN8 مواد بیشتری در هر متر دارد و به همین نسبت گران‌تر است.</p>

<h2>اتصال و آب‌بندی</h2>
<p>دو شاخه لوله کاروگیت ${n} با ${link('corrugated-fittings', 'corrugated-coupler', 'کوپلر هم‌سایز')} و ${link('corrugated-fittings', 'corrugated-epdm-gasket', `واشر ${d.washer}`)} به هم وصل می‌شوند. برای تغییر مسیر و انشعاب، زانو، سه‌راهی و درپوش هم در بخش ${categoryLink('corrugated-fittings', 'اتصالات کاروگیت')} موجود است.</p>

<h2>قیمت لوله کاروگیت ${n}</h2>
<p>قیمت هر متر از وزن همان کلاس × قیمت روز هر کیلو مواد اولیه حساب می‌شود؛ جدول قیمت بالای صفحه هر روز با قیمت کارخانه به‌روز می‌شود و تاریخ آخرین تغییر کنار هر ردیف آمده است.${prev || next ? ` اگر سایز دیگری لازم دارید: ${[prev, next].filter((x): x is PipeDimension => !!x).map(sizeLink).join(' یا ')}.` : ''}</p>
${CONTACT}`,
    specifications: {
      [SIZE_SPEC_KEY]: mm(d.size),
      ...(inch ? { 'سایز اینچی': `${fa(inch)} اینچ` } : {}),
      'قطر خارجی': mm(d.outerDiameter),
      'ضخامت لایه داخلی': mm(d.innerLayer),
      'ضخامت مجموع لایه‌ها': mm(d.totalLayers),
      'کلاس سختی حلقوی': classText,
      جنس: 'پلی اتیلن سنگین HDPE دوجداره',
      'اتصال و آب‌بندی': `کوپلر با واشر ${d.washer}`,
      استاندارد: 'ISIRI 9116-3',
    },
    faqs: [
      {
        question: `قطر خارجی لوله کاروگیت ${n} چقدر است؟`,
        answer: `طبق برگه مشخصات کارخانه ${mm(d.outerDiameter)}؛ ضخامت لایه داخلی ${mm(d.innerLayer)} و ضخامت مجموع لایه‌ها ${mm(d.totalLayers)} است.`,
      },
      {
        question: `لوله کاروگیت ${n} با چه اتصالی وصل می‌شود؟`,
        answer: `با کوپلر هم‌سایز و واشر لاستیکی ${d.washer} که در دره موج لوله می‌نشیند و درز اتصال را آب‌بند می‌کند.`,
      },
      {
        question: `قیمت لوله کاروگیت ${n} چطور محاسبه می‌شود؟`,
        answer: 'قیمت هر متر برابر وزن هر متر همان کلاس ضرب در قیمت روز هر کیلو است؛ به همین دلیل SN8 از SN4 گران‌تر است. قیمت روز هر دو کلاس در جدول همین صفحه آمده است.',
      },
    ],
    metaTitle: `قیمت لوله کاروگیت ${n} | ${classText}، مشخصات و خرید`,
    metaDescription: `قیمت روز لوله کاروگیت ${n} میلی‌متر در کلاس ${classText}، قطر خارجی ${mm(d.outerDiameter)} و واشر ${d.washer}. خرید مستقیم از کارخانه و ارسال به سراسر ایران.`,
    focusKeyword: `لوله کاروگیت ${d.size}`,
    images: leadWith(gallery, i),
    quoteOnly: false,
    pricePerKg,
    rows,
  };
}

// ─────────────────────────── لوله اسپیرال: هر سایز یک صفحه ───────────────────────────

function spiralPlan(size: number, rows: Row[], gallery: string[], pricePerKg: number | null, i: number): Plan {
  const n = fa(size);
  const classes = [...new Set(rows.map((r) => snOf(r.grade)))].sort();
  const classText = classes.length ? classes.join(' و ') : 'SN4 و SN8';
  const others = [SPIRAL_PIPE_SIZES[i - 1], SPIRAL_PIPE_SIZES[i + 1]].filter((x): x is (typeof SPIRAL_PIPE_SIZES)[number] => !!x);

  return {
    slug: spiralPipeSlug(size),
    categorySlug: 'spiral-pipes',
    name: `لوله اسپیرال ${n} میلی‌متر`,
    shortDescription: `لوله اسپیرال پلی اتیلن با قطر اسمی ${mm(size)} در کلاس ${classText}، برای کلکتورهای اصلی فاضلاب، کالورت و انتقال حجم بالای آب‌های سطحی. قیمت روز هر متر، مستقیم از کارخانه ${siteConfig.legalName}.`,
    description: `<p><strong>لوله اسپیرال ${n} میلی‌متر</strong> یک لوله پلی اتیلن با دیواره ساختمند مارپیچ است که برای قطرهای بزرگ‌تر از لوله کاروگیت دوجداره تولید می‌شود. پروفیل مارپیچ بدنه، سختی حلقوی لازم برای تحمل بار خاک را با وزن کمتر از لوله بتنی یا فلزی هم‌قطر فراهم می‌کند و جداره داخلی صاف، جریان را روان نگه می‌دارد.</p>

<h2>کاربرد لوله اسپیرال ${n}</h2>
<ul>
<li>کلکتورها و خطوط انتقال اصلی شبکه فاضلاب</li>
<li>کانال انتقال سیلاب و آب‌های سطحی شهری</li>
<li>کالورت و عبور آب از زیر جاده و راه‌آهن</li>
</ul>

<h2>کلاس سختی حلقوی</h2>
<p>این سایز در کلاس ${classText} عرضه می‌شود. کلاس مناسب از روی عمق دفن، نوع خاک و بار ترافیکی مسیر انتخاب می‌شود: SN4 (کلاس سبک) برای مسیرهای کم‌عمق و بدون تردد سنگین و SN8 (کلاس سنگین) برای معابر پرتردد و عمق دفن بیشتر.</p>

<h2>قیمت لوله اسپیرال ${n}</h2>
<p>قیمت هر متر از وزن همان کلاس × قیمت روز هر کیلو مواد اولیه حساب می‌شود و در جدول قیمت بالای صفحه با تاریخ آخرین تغییر آمده است. ابعاد دقیق پروفیل و طول شاخه را پیش از سفارش از کارشناسان بپرسید.${others.length ? ` سایزهای نزدیک: ${others.map((x) => link('spiral-pipes', spiralPipeSlug(x), `لوله اسپیرال ${fa(x)}`)).join(' و ')}.` : ''}</p>
${CONTACT}`,
    specifications: {
      [SIZE_SPEC_KEY]: mm(size),
      'کلاس سختی حلقوی': classText,
      جنس: 'پلی اتیلن HDPE',
      'نوع دیواره': 'ساختمند مارپیچ (اسپیرال)',
    },
    faqs: [
      {
        question: `لوله اسپیرال ${n} برای چه پروژه‌هایی مناسب است؟`,
        answer: 'برای کلکتورهای اصلی فاضلاب، کانال‌های انتقال سیلاب و آب‌های سطحی و کالورت زیر جاده؛ جاهایی که قطر لوله کاروگیت دوجداره کافی نیست.',
      },
      {
        question: `قیمت لوله اسپیرال ${n} چطور محاسبه می‌شود؟`,
        answer: 'قیمت هر متر برابر وزن هر متر همان کلاس ضرب در قیمت روز هر کیلو است و در جدول همین صفحه آمده است.',
      },
    ],
    metaTitle: `قیمت لوله اسپیرال ${n} | ${classText}، مشخصات و خرید`,
    metaDescription: `قیمت روز لوله اسپیرال ${n} میلی‌متر در کلاس ${classText} برای کلکتور فاضلاب، سیلاب و کالورت. خرید مستقیم از کارخانه و ارسال به سراسر ایران.`,
    focusKeyword: `لوله اسپیرال ${size}`,
    images: leadWith(gallery, i),
    quoteOnly: false,
    pricePerKg,
    rows,
  };
}

// ─────────────────────────── اتصالات کاروگیت: هر نوع یک صفحه ───────────────────────────

/** عنوان ردیف قیمت فعلی → صفحه نوع اتصال */
function fittingSlugFor(title: string): string | undefined {
  const t = title.trim();
  if (t === 'کوپلر') return 'corrugated-coupler';
  if (/^واشر/.test(t)) return 'corrugated-epdm-gasket';
  if (t === 'زانو 45 درجه دوسر کوپلر') return 'corrugated-elbow-45';
  if (t === 'زانو 90 درجه دوسر کوپلر') return 'corrugated-elbow-90';
  if (t === 'زانو 90 درجه یک سر کوپلر') return 'corrugated-elbow-90-single';
  if (t === 'سه راهی 45 درجه سه سر کوپلر') return 'corrugated-tee-45';
  if (t === 'سه راهی 90 درجه سه سر کوپلر') return 'corrugated-tee-90';
  if (t === 'چهار راهی') return 'corrugated-cross';
  if (/^تبدیل/.test(t)) return 'corrugated-reducer';
  if (t === 'درپوش') return 'corrugated-end-cap';
  return undefined;
}

/** کار هر نوع اتصال و عکسی که آن را نشان می‌دهد (از گالری صفحه قبلی اتصالات) */
const FITTING_COPY: Record<string, { what: string; uses: string[]; image: number; connection: string }> = {
  'corrugated-coupler': {
    what: 'کوپلر (رابط) دو شاخه لوله کاروگیت هم‌سایز را به هم وصل می‌کند. لوله تا انتها داخل کوپلر می‌نشیند و درز اتصال با واشر EPDM که روی دره موج لوله قرار می‌گیرد آب‌بند می‌شود.',
    uses: ['اتصال دو شاخه لوله در طول مسیر', 'تعمیر و جایگزینی بخشی از خط', 'اتصال لوله به سایر اتصالات کوپلری'],
    image: 3,
    connection: 'کوپلری با واشر EPDM',
  },
  'corrugated-epdm-gasket': {
    what: 'واشر لاستیکی EPDM روی اولین دره موج لوله کاروگیت می‌نشیند و وقتی لوله داخل کوپلر یا اتصال جا می‌رود، درز را کاملاً آب‌بند می‌کند. EPDM در برابر فاضلاب، گازهای خورنده و پیرشدگی مقاوم است.',
    uses: ['آب‌بندی اتصال کوپلری لوله کاروگیت', 'جلوگیری از نشت فاضلاب به خاک', 'جلوگیری از نفوذ آب زیرزمینی و ریشه گیاه به شبکه'],
    image: 0,
    connection: 'جاگذاری روی دره موج لوله',
  },
  'corrugated-elbow-45': {
    what: 'زانو ۴۵ درجه دوسر کوپلر مسیر لوله کاروگیت را ۴۵ درجه تغییر می‌دهد. تغییر مسیر ملایم‌تر، افت جریان و احتمال گرفتگی کمتری نسبت به زانو ۹۰ درجه دارد.',
    uses: ['تغییر مسیر ملایم شبکه فاضلاب', 'دور زدن موانع زیرزمینی', 'ساخت قوس‌های بزرگ با دو زانو ۴۵'],
    image: 2,
    connection: 'دوسر کوپلر با واشر EPDM',
  },
  'corrugated-elbow-90': {
    what: 'زانو ۹۰ درجه دوسر کوپلر مسیر لوله کاروگیت را با زاویه قائمه تغییر می‌دهد و هر دو سرش کوپلری است، پس بدون قطعه اضافه به دو شاخه لوله وصل می‌شود.',
    uses: ['تغییر مسیر قائم شبکه فاضلاب و زهکشی', 'اتصال خط به منهول یا ساختمان', 'مسیرهای محدود و گوشه‌دار'],
    image: 2,
    connection: 'دوسر کوپلر با واشر EPDM',
  },
  'corrugated-elbow-90-single': {
    what: 'زانو ۹۰ درجه یک سر کوپلر برای سایزهای بزرگ لوله کاروگیت تولید می‌شود؛ یک سر آن کوپلری است و سر دیگر مستقیم داخل کوپلر یا اتصال بعدی می‌نشیند.',
    uses: ['تغییر مسیر قائم خطوط اصلی با قطر بزرگ', 'اتصال کلکتورها و خطوط انتقال'],
    image: 2,
    connection: 'یک سر کوپلر با واشر EPDM',
  },
  'corrugated-tee-45': {
    what: 'سه راهی ۴۵ درجه سه سر کوپلر یک انشعاب با زاویه ۴۵ درجه از خط اصلی لوله کاروگیت می‌گیرد. ورود مایل انشعاب، جریان را روان‌تر از سه راهی ۹۰ به خط اصلی می‌رساند.',
    uses: ['اتصال انشعاب فرعی به خط اصلی فاضلاب', 'جمع‌آوری آب‌های سطحی از چند مسیر', 'شبکه‌های زهکشی شاخه‌ای'],
    image: 1,
    connection: 'سه سر کوپلر با واشر EPDM',
  },
  'corrugated-tee-90': {
    what: 'سه راهی ۹۰ درجه سه سر کوپلر یک انشعاب عمود از خط اصلی لوله کاروگیت می‌گیرد و هر سه سرش کوپلری است.',
    uses: ['انشعاب‌گیری عمود از خط اصلی', 'اتصال انشعاب‌های خانگی به شبکه', 'شبکه‌های زهکشی و آب‌های سطحی'],
    image: 1,
    connection: 'سه سر کوپلر با واشر EPDM',
  },
  'corrugated-cross': {
    what: 'چهار راهی کاروگیت دو انشعاب روبه‌روی هم را در یک نقطه به خط اصلی وصل می‌کند و جای دو سه‌راهی پشت سر هم را می‌گیرد.',
    uses: ['اتصال دو انشعاب در یک نقطه', 'شبکه‌های جمع‌آوری آب‌های سطحی', 'تقاطع مسیرهای زهکشی'],
    image: 1,
    connection: 'کوپلری با واشر EPDM',
  },
  'corrugated-reducer': {
    what: 'تبدیل کاروگیت دو لوله با سایزهای مختلف را به هم وصل می‌کند؛ مثلاً جایی که شبکه فرعی ۳۱۵ به خط اصلی ۴۰۰ می‌رسد.',
    uses: ['اتصال شبکه فرعی به خط اصلی بزرگ‌تر', 'افزایش قطر خط با بیشتر شدن دبی', 'اتصال دو پروژه با سایزهای متفاوت'],
    image: 4,
    connection: 'کوپلری با واشر EPDM',
  },
  'corrugated-end-cap': {
    what: 'درپوش کاروگیت انتهای لوله یا انشعابی را که فعلاً استفاده نمی‌شود می‌بندد تا خاک و آب وارد شبکه نشود.',
    uses: ['بستن انتهای خط', 'انشعاب رزرو برای توسعه آینده', 'تست آب‌بندی مسیر پیش از بهره‌برداری'],
    image: 4,
    connection: 'جاگذاری روی سر لوله با واشر EPDM',
  },
};

function fittingPlan(fitting: (typeof CORRUGATED_FITTINGS)[number], rows: Row[], gallery: string[]): Plan {
  const copy = FITTING_COPY[fitting.slug];
  // ردیف تبدیل «تبدیل × 400» با سایز 315 یعنی ۴۰۰×۳۱۵؛ بقیه فقط سایز
  const labels =
    fitting.slug === 'corrugated-reducer'
      ? [...new Set(rows.map((r) => `${fa(sizeOf(r.title.replace(/^\D+/, '')))}×${fa(sizeOf(r.size))}`))]
      : [...new Set(rows.map((r) => sizeOf(r.size)).filter(Number.isFinite))].sort((a, b) => a - b).map(fa);
  const sizeText = labels.length ? labels.join('، ') : 'استعلام';
  // عکس اختصاصی این نوع اول، بعد بقیه گالری
  const images = [...new Set([gallery[copy.image], ...gallery].filter(Boolean))];

  return {
    slug: fitting.slug,
    categorySlug: 'corrugated-fittings',
    name: fitting.name,
    shortDescription: `${copy.what.split('.')[0]}. سایزهای موجود: ${sizeText} میلی‌متر؛ قیمت روز با استعلام از کارخانه.`,
    description: `<h2>${fitting.name} چیست؟</h2>
<p>${copy.what}</p>

<h2>کاربرد</h2>
<ul>
${copy.uses.map((u) => `<li>${u}</li>`).join('\n')}
</ul>

<h2>سایزها و مشخصات</h2>
<p>${fitting.slug === 'corrugated-epdm-gasket' ? 'این واشر از لاستیک EPDM و مخصوص' : 'این اتصال از پلی اتیلن HDPE و هم‌خوان با'} ${categoryLink('corrugated-pipes', 'لوله کاروگیت دوجداره')} تولید می‌شود. سایزهای موجود: <strong>${sizeText} میلی‌متر</strong>. قیمت اتصالات به سایز و تعداد سفارش بستگی دارد و با استعلام اعلام می‌شود.</p>
${CONTACT_QUOTE}`,
    specifications: {
      جنس: fitting.slug === 'corrugated-epdm-gasket' ? 'لاستیک EPDM' : 'پلی اتیلن HDPE',
      'سایزهای موجود': `${sizeText} میلی‌متر`,
      'نوع اتصال': copy.connection,
    },
    faqs: [
      {
        question: `${fitting.name} در چه سایزهایی موجود است؟`,
        answer: `${sizeText} میلی‌متر. قیمت روز هر سایز را از کارشناسان فروش استعلام بگیرید.`,
      },
    ],
    metaTitle: `قیمت ${fitting.name} | سایزها و خرید`,
    metaDescription: `${fitting.name} در سایزهای ${sizeText} میلی‌متر با قیمت روز کارخانه. ${copy.uses[0]}. ارسال به سراسر ایران.`,
    focusKeyword: fitting.name,
    images,
    quoteOnly: true,
    pricePerKg: null,
    rows,
  };
}

// ─────────────────────────── اجرا ───────────────────────────

async function loadSource(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { priceItems: { orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] } },
  });
  if (!product) throw new Error(`محصول مبدأ ${slug} پیدا نشد`);
  return { ...product, gallery: JSON.parse(product.images || '[]') as string[] };
}

async function backup() {
  const [categories, products, priceItems, redirects, settings, faqs] = await Promise.all([
    prisma.category.findMany(),
    prisma.product.findMany(),
    prisma.priceItem.findMany({ select: { id: true, productId: true, title: true, size: true, grade: true } }),
    prisma.redirect.findMany(),
    prisma.siteSettings.findMany(),
    prisma.fAQ.findMany(),
  ]);
  mkdirSync('.backups', { recursive: true });
  const file = path.join('.backups', `restructure-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  writeFileSync(file, JSON.stringify({ takenAt: new Date().toISOString(), categories, products, priceItems, redirects, settings, faqs }, null, 2));
  console.log(`پشتیبان: ${file}\n`);
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL ست نشده');
  console.log(`دیتابیس: ${new URL(url).host}`);
  console.log(APPLY ? '>>> حالت اعمال\n' : '>>> حالت آزمایشی (بدون تغییر)\n');

  const [corrugated, spiral, fittings] = await Promise.all([
    loadSource(SOURCE.corrugated),
    loadSource(SOURCE.spiral),
    loadSource(SOURCE.fittings),
  ]);

  // ردیف‌هایی که اجرای قبلی همین اسکریپت منتقل کرده: در اجرای دوباره هم جزو صفحه‌اند، وگرنه متن صفحه
  // (سایزها، کلاس‌ها) از روی فهرست خالی ساخته می‌شد و ردیف تکراری اتصالات هم منتقل می‌شد
  const placedRows = await prisma.priceItem.findMany({
    where: {
      product: {
        slug: {
          in: [
            ...CORRUGATED_PIPE_DIMENSIONS.map((d) => corrugatedPipeSlug(d.size)),
            ...SPIRAL_PIPE_SIZES.map(spiralPipeSlug),
            ...CORRUGATED_FITTINGS.map((f) => f.slug),
          ],
        },
      },
    },
    select: { id: true, title: true, size: true, grade: true, product: { select: { slug: true } } },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  });
  const placed = (slug: string): Row[] => placedRows.filter((r) => r.product.slug === slug);

  const plans: Plan[] = [
    ...CORRUGATED_PIPE_DIMENSIONS.map((d, i) =>
      corrugatedPlan(
        d,
        [...placed(corrugatedPipeSlug(d.size)), ...corrugated.priceItems.filter((r) => sizeOf(r.size) === d.size)],
        corrugated.gallery,
        corrugated.pricePerKg,
        i,
      ),
    ),
    ...SPIRAL_PIPE_SIZES.map((size, i) =>
      spiralPlan(
        size,
        [...placed(spiralPipeSlug(size)), ...spiral.priceItems.filter((r) => sizeOf(r.size) === size)],
        spiral.gallery,
        spiral.pricePerKg,
        i,
      ),
    ),
  ];

  // اتصالات: هر ردیف به صفحه نوعش؛ ردیف تکراری (همان عنوان و سایز) و سایز ۹۰۰ روی محصول قبلی می‌ماند
  const fittingRows = new Map<string, Row[]>(CORRUGATED_FITTINGS.map((f) => [f.slug, placed(f.slug)]));
  const seen = new Set([...fittingRows.values()].flat().map((r) => `${r.title.trim()}|${r.size.trim()}`));
  for (const r of fittings.priceItems) {
    const slug = fittingSlugFor(r.title);
    const key = `${r.title.trim()}|${r.size.trim()}`;
    if (!slug) console.log(`  ⚠ ردیف بدون نوع اتصال، منتقل نمی‌شود: ${r.title} ${r.size}`);
    else if (EXCLUDED_SIZES.has(sizeOf(r.size))) console.log(`  — سایز ۹۰۰ منتقل نمی‌شود: ${r.title} ${r.size}`);
    else if (seen.has(key)) console.log(`  — ردیف تکراری منتقل نمی‌شود: ${r.title} ${r.size}`);
    else {
      seen.add(key);
      fittingRows.set(slug, [...(fittingRows.get(slug) ?? []), r]);
    }
  }
  plans.push(...CORRUGATED_FITTINGS.map((f) => fittingPlan(f, fittingRows.get(f.slug) ?? [], fittings.gallery)));

  // ردیف‌هایی که روی محصول قبلیِ منتشرنشده می‌مانند
  const moved = new Set(plans.flatMap((p) => p.rows.map((r) => r.id)));
  for (const src of [corrugated, spiral]) {
    for (const r of src.priceItems.filter((r) => !moved.has(r.id))) {
      console.log(`  — روی ${src.slug} می‌ماند (عرضه نمی‌شود): ${r.title} ${r.size} ${r.grade}`);
    }
  }

  console.log('\nدسته‌ها:');
  for (const c of CATEGORIES) console.log(`  ${c.order}. ${c.name} (${c.slug})`);
  console.log('\nصفحه‌های محصول:');
  for (const p of plans) console.log(`  /products/${p.categorySlug}/${p.slug} — ${p.name} (${p.rows.length} ردیف قیمت)`);

  const keep = new Set(plans.map((p) => p.slug));
  const keepCategories = new Set<string>(CATEGORIES.map((c) => c.slug));
  const [hideProducts, hideCategories, oldFaqs] = await Promise.all([
    prisma.product.findMany({ where: { published: true, slug: { notIn: [...keep] } }, select: { id: true, slug: true, name: true, category: { select: { slug: true } } } }),
    prisma.category.findMany({ where: { published: true, slug: { notIn: [...keepCategories] } }, select: { id: true, slug: true, name: true } }),
    // پرسش‌های عمومی درباره محصولاتی که دیگر فروخته نمی‌شوند
    prisma.fAQ.findMany({ where: { published: true, OR: [{ question: { contains: 'پلیکا' } }, { question: { contains: 'پلی اتیلن' } }, { question: { contains: 'آب‌رسانی' } }] }, select: { id: true, question: true } }),
  ]);

  /** آدرس قبلی → صفحه مرتبط تازه؛ بقیه به فهرست محصولات */
  const productTarget = (slug: string) =>
    slug === SOURCE.corrugated ? '/products/corrugated-pipes' : slug === SOURCE.spiral ? '/products/spiral-pipes' : slug === SOURCE.fittings ? '/products/corrugated-fittings' : '/products';
  const categoryTarget = (slug: string) => (slug === 'fittings' ? '/products/corrugated-fittings' : '/products');

  console.log('\nمنتشرنشده می‌شوند (با ریدایرکت):');
  for (const p of hideProducts) console.log(`  محصول ${p.name}: /products/${p.category.slug}/${p.slug} → ${productTarget(p.slug)}`);
  for (const c of hideCategories) console.log(`  دسته ${c.name}: /products/${c.slug} → ${categoryTarget(c.slug)}`);
  for (const f of oldFaqs) console.log(`  سوال متداول: ${f.question}`);

  if (!APPLY) {
    console.log('\nبرای اعمال، همین دستور را با --apply تکرار کنید.');
    return;
  }

  await backup();

  const categoryIds: Record<string, string> = {};
  for (const c of CATEGORIES) {
    const descriptions: Record<string, string> = {
      'corrugated-pipes': `لوله کاروگیت دوجداره پلی اتیلن (HDPE) در ${fa(CORRUGATED_PIPE_DIMENSIONS.length)} سایز ${fa(CORRUGATED_PIPE_DIMENSIONS[0].size)} تا ${fa(CORRUGATED_PIPE_DIMENSIONS[CORRUGATED_PIPE_DIMENSIONS.length - 1].size)} میلی‌متر و دو کلاس SN4 و SN8 با واشر EPDM؛ هر سایز صفحه، مشخصات و قیمت روز خودش را دارد.`,
      'spiral-pipes': `لوله اسپیرال پلی اتیلن در قطرهای ${fa(SPIRAL_PIPE_SIZES[0])} تا ${fa(SPIRAL_PIPE_SIZES[SPIRAL_PIPE_SIZES.length - 1])} میلی‌متر برای کلکتورهای اصلی فاضلاب، کالورت و انتقال آب‌های سطحی؛ هر سایز صفحه و قیمت روز خودش را دارد.`,
      'corrugated-fittings': 'اتصالات لوله کاروگیت: کوپلر، واشر EPDM، زانو ۴۵ و ۹۰ درجه، سه راهی، چهار راهی، تبدیل و درپوش؛ هر نوع با صفحه، سایزها و قیمت روز خودش، مستقیم از کارخانه.',
    };
    const image = c.slug === 'spiral-pipes' ? spiral.gallery[0] : c.slug === 'corrugated-fittings' ? fittings.gallery[0] : undefined;
    const row = await prisma.category.upsert({
      where: { slug: c.slug },
      create: { slug: c.slug, name: c.name, order: c.order, description: descriptions[c.slug], image, published: true },
      update: { name: c.name, order: c.order, description: descriptions[c.slug], published: true, ...(image ? { image } : {}) },
    });
    categoryIds[c.slug] = row.id;
  }

  for (const p of plans) {
    const content = {
      name: p.name,
      shortDescription: p.shortDescription,
      description: p.description,
      specifications: JSON.stringify(p.specifications),
      faqs: JSON.stringify(p.faqs),
      metaTitle: p.metaTitle,
      metaDescription: p.metaDescription,
      focusKeyword: p.focusKeyword,
      ogTitle: p.metaTitle,
      ogDescription: p.metaDescription,
      images: JSON.stringify(p.images),
    };
    const structure = { categoryId: categoryIds[p.categorySlug], published: true, quoteOnly: p.quoteOnly, pricePerKg: p.pricePerKg };
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      create: { slug: p.slug, ...content, ...structure, inStock: true },
      update: { ...structure, ...(REFRESH_CONTENT ? content : {}) },
    });
    if (p.rows.length) {
      await prisma.priceItem.updateMany({ where: { id: { in: p.rows.map((r) => r.id) } }, data: { productId: product.id } });
    }
  }

  await prisma.product.updateMany({ where: { id: { in: hideProducts.map((p) => p.id) } }, data: { published: false } });
  await prisma.category.updateMany({ where: { id: { in: hideCategories.map((c) => c.id) } }, data: { published: false } });
  await prisma.fAQ.updateMany({ where: { id: { in: oldFaqs.map((f) => f.id) } }, data: { published: false } });
  for (const p of hideProducts) await recordRedirect(`/products/${p.category.slug}/${p.slug}`, productTarget(p.slug));
  for (const c of hideCategories) await recordRedirect(`/products/${c.slug}`, categoryTarget(c.slug));

  // متن‌های صفحه اول که در پنل ذخیره شده‌اند و هنوز پلی اتیلن، منهول و سپتیک را معرفی می‌کنند
  const settings: Record<string, string> = {
    site_description: siteConfig.description,
    hero_title: siteConfig.tagline,
    hero_subtitle: 'لوله کاروگیت دوجداره ۱۱۰ تا ۱۲۰۰، لوله اسپیرال و اتصالات کاروگیت — مستقیم از کارخانه',
    home_seo_content: defaultSiteSettings.homeSeoContent,
  };
  for (const [key, value] of Object.entries(settings)) {
    await prisma.siteSettings.upsert({ where: { key }, create: { key, value }, update: { value } });
  }

  console.log(`\nانجام شد: ${fa(plans.length)} صفحه محصول، ${fa(hideProducts.length)} محصول و ${fa(hideCategories.length)} دسته منتشرنشده شد.`);
}

main()
  .catch((e) => {
    console.error('\n✗', e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
