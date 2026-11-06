import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { BadgeCheck, ChevronLeft, ClipboardList, Factory, Globe, MapPin, PlayCircle, Ruler, ShieldCheck, Truck } from 'lucide-react';
import { IconTile } from '@/shared/ui/IconTile';
import { JsonLd } from '@/shared/ui/JsonLd';
import { LtrCodes } from '@/shared/ui/LtrCodes';
import { FaqAccordion } from '@/shared/ui/FaqAccordion';
import { siteConfig } from '@/shared/config/site';
import { SPIRAL_PIPE_SIZES } from '@/shared/config/product-lines';
import { CORRUGATED_PIPE_DIMENSIONS } from '@/shared/lib/pipe-dimensions';
import { absoluteUrl, breadcrumbSchema, faqPageSchema } from '@/shared/lib/seo';
import { faDigits } from '@/shared/lib/utils';
import { FACTORY_PHOTO_GROUPS, FACTORY_VIDEOS } from '@/shared/config/factory-media';
import { FactoryGallery, FactoryVideos } from '@/features/factory/FactoryMedia';
import type { FaqItem } from '@/shared/types';

const TITLE = `کارخانه تولید لوله کاروگیت و اسپیرال ${siteConfig.legalName} در گرمسار`;
const META_TITLE = 'کارخانه لوله کاروگیت و اسپیرال در گرمسار';
const DESCRIPTION = `کارخانه ${siteConfig.legalName} در شهرک صنعتی گرمسار از ۱۳۹۱: خط تولید لوله کاروگیت دوجداره ۱۱۰ تا ۱۲۰۰ و لوله اسپیرال ۹۰۰ تا ۲۰۰۰ میلی‌متر، کنترل کیفیت طبق ISIRI 9116-3، فیلم و عکس واقعی تولید، انبار و بارگیری.`;

export const metadata: Metadata = {
  title: META_TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${siteConfig.url}/factory` },
  openGraph: {
    title: `${META_TITLE} | ${siteConfig.name}`,
    description: DESCRIPTION,
    url: `${siteConfig.url}/factory`,
    images: [{ url: FACTORY_PHOTO_GROUPS[0].photos[0].src, alt: FACTORY_PHOTO_GROUPS[0].photos[0].alt }],
  },
};

const CORRUGATED_SIZES = CORRUGATED_PIPE_DIMENSIONS.map((d) => d.size);
const HERO_PHOTO = FACTORY_PHOTO_GROUPS[0].photos[0];

const STATS = [
  { value: '۱۳۹۱', label: 'آغاز تولید در گرمسار' },
  { value: faDigits(CORRUGATED_SIZES.length), label: `سایز کاروگیت؛ ${faDigits(CORRUGATED_SIZES[0])} تا ${faDigits(CORRUGATED_SIZES.at(-1)!)}` },
  { value: faDigits(SPIRAL_PIPE_SIZES.length), label: `سایز اسپیرال؛ ${faDigits(SPIRAL_PIPE_SIZES[0])} تا ${faDigits(SPIRAL_PIPE_SIZES.at(-1)!)}` },
  { value: 'ISO 9001', label: 'و پروانه ISIRI 9116-3' },
];

const SECTIONS = [
  { id: 'about', label: 'معرفی کارخانه' },
  { id: 'process', label: 'فرایند تولید' },
  { id: 'quality', label: 'کنترل کیفیت' },
  { id: 'videos', label: 'فیلم خط تولید' },
  { id: 'gallery', label: 'عکس‌ها' },
  { id: 'supply', label: 'تأمین و ارسال' },
  { id: 'faq', label: 'سوالات متداول' },
];

/** مراحل تولید لوله کاروگیت دوجداره — هر مرحله در فیلم‌های خط تولید همین صفحه دیده می‌شود */
const PROCESS = [
  { title: 'مواد اولیه پلی اتیلن', text: 'گرانول پلی اتیلن سنگین (HDPE) خشک و با مستربچ رنگ مخلوط می‌شود؛ جداره بیرونی مشکی برای مقاومت در برابر UV و جداره داخلی روشن برای بازرسی تصویری شبکه.' },
  { title: 'اکستروژن دو لایه', text: 'دو اکسترودر هم‌زمان مذاب دو جداره را به یک قالب مشترک می‌رسانند تا لایه داخلی صاف و لایه بیرونی موج‌دار در یک مرحله شکل بگیرند.' },
  { title: 'شکل‌دهی موج در کاروگیتور', text: 'زنجیره قالب‌های موج‌دار کاروگیتور با مکش خلأ، جداره بیرونی را به شکل موج درمی‌آورد و به جداره داخلی جوش می‌دهد؛ همین پروفیل است که سختی حلقوی لوله را می‌سازد.' },
  { title: 'خنک‌کاری، برش و سرسازی', text: 'لوله پس از خنک‌کاری روی میز خط به طول سفارش برش می‌خورد و سر آن برای اتصال کوپلری با واشر آب‌بند EPDM آماده می‌شود.' },
  { title: 'لوله اسپیرال قطر بزرگ', text: 'برای قطرهای ۹۰۰ تا ۲۰۰۰، پروفیل پلی اتیلن به‌صورت مارپیچ پیچیده و جوش داده می‌شود؛ اتصال این لوله‌ها با جوش اکستروژنی است، نه کوپلر.' },
];

/** آزمون‌هایی که استاندارد لوله دیواره ساختمند پلی اتیلن الزام می‌کند */
const QC_TESTS = [
  { title: 'سختی حلقوی (SN)', text: 'تعیین کلاس SN4 یا SN8 طبق ISO 9969 — مهم‌ترین عدد برای انتخاب لوله بر اساس عمق دفن و بار ترافیکی.' },
  { title: 'انعطاف‌پذیری حلقوی', text: 'لوله تا ۳۰٪ قطر فشرده می‌شود و نباید ترک، جداشدگی لایه‌ها یا تغییر شکل دائمی نشان دهد.' },
  { title: 'مقاومت ضربه', text: 'آزمون ضربه وزنه سقوطی برای اطمینان از سلامت لوله در حمل، تخلیه و کارگذاری.' },
  { title: 'ابعاد و ضخامت جداره', text: 'کنترل قطر داخلی و خارجی، ضخامت لایه داخلی و ارتفاع پروفیل در برابر جدول ابعاد کارخانه.' },
];

const FAQS: FaqItem[] = [
  {
    question: `کارخانه ${siteConfig.legalName} کجاست؟`,
    answer: `کارخانه و انبار در ${siteConfig.factoryAddress} است. خرید، استعلام قیمت و هماهنگی بارگیری از طریق ${siteConfig.name}، ${siteConfig.exclusiveTitle}، انجام می‌شود.`,
  },
  {
    question: 'کارخانه چه سایزهایی تولید می‌کند؟',
    answer: `لوله کاروگیت دوجداره در سایزهای ${CORRUGATED_SIZES.map(faDigits).join('، ')} میلی‌متر با کلاس SN4 و SN8، لوله اسپیرال ${SPIRAL_PIPE_SIZES.map(faDigits).join('، ')} میلی‌متر و اتصالات کاروگیت (کوپلر، زانو، سه‌راهی، درپوش و…).`,
  },
  {
    question: 'آیا لوله مستقیم از کارخانه بارگیری می‌شود؟',
    answer: 'بله. سفارش‌ها از انبار کارخانه در گرمسار بارگیری و با وانت، کامیون یا تریلی (بسته به سایز و متراژ) به شهر و محل پروژه ارسال می‌شوند.',
  },
  {
    question: 'لوله‌های کارخانه چه استاندارد و گواهینامه‌ای دارند؟',
    answer: 'پروانه کاربرد علامت استاندارد اجباری ISIRI 9116-3 برای لوله‌های دیواره ساختمند و گواهینامه سیستم مدیریت کیفیت ISO 9001:2015. تصویر مدارک در صفحه مدارک نمایندگی و تأییدیه‌های فنی آمده است.',
  },
  {
    question: 'برای سفارش پروژه‌ای چه اطلاعاتی لازم است؟',
    answer: 'سایز، کلاس SN، متراژ هر سایز، شهر پروژه و زمان تحویل. این موارد را در فرم استعلام پروژه‌ای ثبت کنید تا پیش‌فاکتور با قیمت روز کارخانه صادر شود.',
  },
];

const prose = 'text-sm sm:text-[15px] leading-8 text-[var(--muted-foreground)]';

function SectionTitle({ id, eyebrow, title }: { id: string; eyebrow: string; title: string }) {
  return (
    <>
      <span className="eyebrow">{eyebrow}</span>
      <h2 id={id} className="mt-2 text-xl sm:text-2xl lg:text-[1.75rem] font-black leading-snug">{title}</h2>
    </>
  );
}

export default function FactoryPage() {
  const url = `${siteConfig.url}/factory`;
  const photos = FACTORY_PHOTO_GROUPS.flatMap((g) => g.photos);

  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: 'کارخانه و توانمندی تأمین', path: '/factory' }])} />
      <JsonLd data={faqPageSchema(FAQS)} />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          name: TITLE,
          description: DESCRIPTION,
          url,
          inLanguage: 'fa-IR',
          about: {
            '@type': 'Organization',
            name: siteConfig.legalName,
            alternateName: siteConfig.legalNameEn,
            foundingDate: '2012',
            url: siteConfig.manufacturerUrl,
            address: {
              '@type': 'PostalAddress',
              streetAddress: siteConfig.factory.street,
              addressLocality: siteConfig.factory.city,
              addressRegion: siteConfig.factory.region,
              addressCountry: 'IR',
            },
          },
          image: photos.map((p) => ({ '@type': 'ImageObject', contentUrl: absoluteUrl(p.src), caption: p.alt })),
          video: FACTORY_VIDEOS.map((v) => ({
            '@type': 'VideoObject',
            name: v.title,
            description: `${v.title} — خط تولید ${siteConfig.legalName}`,
            contentUrl: absoluteUrl(v.src),
            thumbnailUrl: absoluteUrl(v.poster),
            duration: `PT${v.duration}S`,
            uploadDate: '2026-11-06',
          })),
        }}
      />

      {/* هیرو با عکس واقعی کارخانه — بازدیدکننده از همان اول کارخانه را می‌بیند، نه فقط متن */}
      <section className="relative overflow-hidden bg-[var(--ink)] text-white">
        <div className="absolute inset-0 bp-grid bp-grid-fade" />
        <div className="container-main relative z-10 py-10 sm:py-14 lg:py-16 grid gap-8 lg:grid-cols-[1.15fr_1fr] items-center">
          <div>
            <span className="eyebrow">کارخانه و توانمندی تأمین</span>
            <h1 className="mt-2 text-[1.6rem] sm:text-3xl md:text-[2.4rem] font-black leading-snug sm:leading-tight">{TITLE}</h1>
            <p className="mt-4 text-slate-300 text-sm sm:text-base leading-8">
              <LtrCodes text={`از ۱۳۹۱ لوله دوجداره پلی اتیلن در شهرک صنعتی گرمسار تولید می‌شود؛ امروز لوله کاروگیت تا ۱۲۰۰ و لوله اسپیرال تا ۲۰۰۰ میلی‌متر، با پروانه ISIRI 9116-3 و گواهینامه ISO 9001:2015. ${siteConfig.name} ${siteConfig.exclusiveTitle} است.`} />
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/project-inquiry" className="inline-flex items-center gap-2 h-12 px-5 rounded-[var(--radius-control)] bg-[var(--accent)] text-[var(--accent-foreground)] font-bold">
                <ClipboardList className="w-4 h-4" />استعلام پروژه‌ای
              </Link>
              <a href="#videos" className="inline-flex items-center gap-2 h-12 px-5 rounded-[var(--radius-control)] border border-white/20 font-bold hover:bg-white/10">
                <PlayCircle className="w-4 h-4" />فیلم خط تولید
              </a>
            </div>
          </div>
          <div className="relative aspect-[4/3] lg:aspect-square max-h-[420px] w-full rounded-[var(--radius-sheet)] overflow-hidden border border-white/10">
            <Image src={HERO_PHOTO.src} alt={HERO_PHOTO.alt} fill priority sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
            <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-lg bg-black/55 backdrop-blur px-2.5 py-1 text-xs font-bold">
              <MapPin className="w-3.5 h-3.5" />{siteConfig.factoryAddress}
            </span>
          </div>
        </div>
        <div className="relative z-10 border-t border-white/10">
          <dl className="container-main grid grid-cols-2 lg:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="py-4 sm:py-5 px-2 text-center border-white/10 [&:not(:last-child)]:border-e max-lg:[&:nth-child(2)]:border-e-0 max-lg:[&:nth-child(-n+2)]:border-b">
                <dd className="text-xl sm:text-2xl font-black num" dir="auto">{s.value}</dd>
                <dt className="mt-0.5 text-xs sm:text-sm text-slate-400 num">{s.label}</dt>
              </div>
            ))}
          </dl>
        </div>
        <div className="absolute bottom-0 right-0 h-1.5 w-28 sm:w-40 hazard" aria-hidden />
      </section>

      {/* پرش سریع بین بخش‌ها — زیر هدر می‌چسبد */}
      <nav aria-label="بخش‌های صفحه" className="sticky top-[var(--nav-height)] z-20 bg-[var(--background)]/90 backdrop-blur-xl border-b border-[var(--border)]">
        <div className="container-main py-3 snap-row">
          {SECTIONS.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="h-9 px-4 rounded-lg border border-[var(--border)] text-sm font-bold flex items-center whitespace-nowrap hover:border-[var(--foreground)]/40">
              {s.label}
            </a>
          ))}
        </div>
      </nav>

      <section id="about" className="section-padding-sm scroll-mt-32" aria-labelledby="about-title">
        <div className="container-main grid gap-8 lg:grid-cols-[1.2fr_1fr] items-start">
          <div>
            <SectionTitle id="about-title" eyebrow="معرفی" title={`${siteConfig.legalName}؛ از یک خط ۲۰۰ تا ۴۰۰ تا لوله ۲۰۰۰ میلی‌متری`} />
            <div className={`mt-4 space-y-4 ${prose}`}>
              <p>
                <LtrCodes text={`شرکت تولیدی و بازرگانی ${siteConfig.legalName} در سال ۱۳۹۱ با یک خط تولید لوله کاروگیت ۲۰۰ تا ۴۰۰ میلی‌متر در شهرک صنعتی گرمسار (استان سمنان) شروع به کار کرد. با اضافه شدن خطوط قطر بزرگ و خط لوله اسپیرال، امروز طیف کامل لوله فاضلاب و آب‌های سطحی پروژه‌های عمرانی — از انشعاب ۱۱۰ تا کلکتور اصلی ۲۰۰۰ میلی‌متری — در همین کارخانه تولید می‌شود.`} />
              </p>
              <p>
                <LtrCodes text="محصولات کارخانه در شبکه جمع‌آوری فاضلاب شهری و روستایی، زهکشی اراضی کشاورزی، دفع آب‌های سطحی و غلاف کابل برق و مخابرات به کار می‌روند. لوله کاروگیت در دو کلاس سختی حلقوی SN4 و SN8 عرضه می‌شود تا برای عمق دفن و بار ترافیکی هر پروژه، لوله اقتصادی و مطمئن انتخاب شود." />
              </p>
              <p>
                {siteConfig.name} {siteConfig.exclusiveTitle} است و قیمت روز، پیش‌فاکتور، هماهنگی بارگیری از انبار کارخانه و ارسال به پروژه را انجام می‌دهد.{' '}
                <Link href="/official-representative" className="font-bold text-[var(--accent-text)]">پیام رسمی کارخانه درباره نمایندگی</Link>
              </p>
            </div>
          </div>
          <ul className="grid gap-3">
            {[
              { icon: Factory, title: 'محل تولید', text: `${siteConfig.factoryAddress}؛ تولید، انبار و بارگیری در یک محوطه` },
              { icon: Ruler, title: 'محصولات', text: 'لوله کاروگیت دوجداره، لوله اسپیرال قطر بزرگ و اتصالات کاروگیت هم‌سایز' },
              { icon: ShieldCheck, title: 'استاندارد', text: 'پروانه ISIRI 9116-3 و گواهینامه ISO 9001:2015' },
              { icon: Truck, title: 'ارسال', text: 'بارگیری مستقیم از انبار کارخانه به سراسر ایران' },
            ].map((c) => (
              <li key={c.title} className="flex items-start gap-3 rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--card)] p-4">
                <IconTile icon={c.icon} size="sm" />
                <div className="min-w-0">
                  <p className="font-black text-sm">{c.title}</p>
                  <p className="mt-1 text-sm leading-7 text-[var(--muted-foreground)] num"><LtrCodes text={c.text} /></p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="process" className="section-padding-sm scroll-mt-32 bg-[var(--card)] border-y border-[var(--border)]" aria-labelledby="process-title">
        <div className="container-main">
          <SectionTitle id="process-title" eyebrow="فرایند تولید" title="لوله کاروگیت دوجداره چطور تولید می‌شود؟" />
          <p className={`mt-3 max-w-3xl ${prose}`}>
            مراحل تولید در خط کارخانه گرمسار، از گرانول تا لوله آماده بارگیری — همه این مراحل را در فیلم‌های پایین همین صفحه می‌بینید.
          </p>
          <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PROCESS.map((p, i) => (
              <li key={p.title} className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--background)] p-5">
                <span className="w-9 h-9 rounded-lg bg-[var(--accent)] text-[var(--accent-foreground)] grid place-items-center font-black num">{faDigits(i + 1)}</span>
                <h3 className="mt-3 font-black">{p.title}</h3>
                <p className="mt-1.5 text-sm leading-7 text-[var(--muted-foreground)] num"><LtrCodes text={p.text} /></p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="quality" className="section-padding-sm scroll-mt-32" aria-labelledby="quality-title">
        <div className="container-main grid gap-8 lg:grid-cols-[1fr_1.2fr] items-start">
          <div>
            <SectionTitle id="quality-title" eyebrow="کنترل کیفیت" title="آزمایشگاه کنترل کیفیت و استاندارد ISIRI 9116-3" />
            <p className={`mt-4 ${prose}`}>
              <LtrCodes text="لوله‌های دیواره ساختمند پلی اتیلن مشمول استاندارد اجباری ملی ISIRI 9116-3 هستند. نمونه‌های تولید در آزمایشگاه کارخانه آزمون می‌شوند و کارخانه علاوه بر پروانه کاربرد علامت استاندارد، گواهینامه سیستم مدیریت کیفیت ISO 9001:2015 دارد." />
            </p>
            <p className={`mt-3 ${prose}`}>
              <LtrCodes text="نکته کلاس SN: عدد ۱۶ و ۳۱٫۵ کیلونیوتن بر مترمربع که در بعضی اسناد آمده، همان SN4 و SN8 است که با روش DIN 16961-2 اندازه‌گیری شده؛ روش ISO 9969 همین کلاس‌ها را ۴ و ۸ گزارش می‌کند." />
            </p>
            <Link href="/certificates" className="mt-5 inline-flex items-center gap-2 h-11 px-5 rounded-[var(--radius-control)] border border-[var(--border)] text-sm font-bold hover:border-[var(--accent)]">
              <BadgeCheck className="w-4 h-4 text-[var(--accent-text)]" />مدارک و تأییدیه‌های فنی<ChevronLeft className="w-4 h-4" />
            </Link>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {QC_TESTS.map((t) => (
              <li key={t.title} className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--card)] p-5">
                <h3 className="font-black text-sm flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-600" />{t.title}</h3>
                <p className="mt-1.5 text-sm leading-7 text-[var(--muted-foreground)] num"><LtrCodes text={t.text} /></p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="videos" className="section-padding-sm scroll-mt-32 bg-[var(--card)] border-y border-[var(--border)]" aria-labelledby="videos-title">
        <div className="container-main">
          <SectionTitle id="videos-title" eyebrow="فیلم" title="فیلم‌های خط تولید لوله کاروگیت" />
          <p className={`mt-3 mb-6 max-w-3xl ${prose}`}>
            از قالب‌های کاروگیتور و شکل‌گیری موج تا خروج لوله قطر بزرگ از خط و سرسازی برای اتصال؛ همه فیلم‌ها در کارخانه گرمسار گرفته شده‌اند.
          </p>
          <FactoryVideos videos={FACTORY_VIDEOS} />
        </div>
      </section>

      <section id="gallery" className="section-padding-sm scroll-mt-32" aria-labelledby="gallery-title">
        <div className="container-main">
          <SectionTitle id="gallery-title" eyebrow="عکس" title="عکس‌های کارخانه، انبار و بارگیری" />
          <p className={`mt-3 mb-6 max-w-3xl ${prose}`}>عکس‌های واقعی کارخانه، انبار روباز، بارگیری سفارش‌ها، اجرای لوله در پروژه و اتصالات کاروگیت.</p>
          <FactoryGallery groups={FACTORY_PHOTO_GROUPS} />
        </div>
      </section>

      <section id="supply" className="section-padding-sm scroll-mt-32 bg-[var(--card)] border-y border-[var(--border)]" aria-labelledby="supply-title">
        <div className="container-main grid gap-8 lg:grid-cols-2 items-start">
          <div>
            <SectionTitle id="supply-title" eyebrow="تأمین و ارسال" title="از انبار کارخانه تا محل پروژه" />
            <div className={`mt-4 space-y-3 ${prose}`}>
              <p>
                موجودی لوله کاروگیت در محوطه روباز کارخانه دپو می‌شود و سفارش‌ها مستقیم از همین انبار بارگیری می‌شوند؛ بدون واسطه و انبار میانی، که هم زمان تحویل را کوتاه می‌کند و هم قیمت را به قیمت کارخانه نزدیک نگه می‌دارد.
              </p>
              <p>
                وسیله حمل بر اساس سایز و متراژ انتخاب می‌شود: سایزهای کوچک با وانت، سفارش‌های متوسط با کامیون و لوله‌های قطر بزرگ و اسپیرال با تریلی. هماهنگی حمل تا شهر و محل پروژه در سراسر کشور با واحد فروش است.
              </p>
            </div>
          </div>
          <ol className="grid gap-3">
            {[
              { title: 'ثبت استعلام', text: 'سایز، کلاس SN، متراژ، شهر پروژه و زمان تحویل' },
              { title: 'پیش‌فاکتور با قیمت روز', text: 'قیمت روز کارخانه و شرایط پرداخت' },
              { title: 'بارگیری از انبار گرمسار', text: 'آماده‌سازی و بارگیری سفارش در کارخانه' },
              { title: 'تحویل در محل پروژه', text: 'حمل با وانت، کامیون یا تریلی بسته به سفارش' },
            ].map((s, i) => (
              <li key={s.title} className="flex items-center gap-4 rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--background)] p-4">
                <span className="w-9 h-9 shrink-0 rounded-full border-2 border-[var(--accent)] text-[var(--accent-text)] grid place-items-center font-black num">{faDigits(i + 1)}</span>
                <div>
                  <p className="font-black text-sm">{s.title}</p>
                  <p className="mt-0.5 text-sm text-[var(--muted-foreground)]">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <div id="faq" className="container-main scroll-mt-32 [&>section]:mt-4">
        <FaqAccordion faqs={FAQS} />
      </div>

      <section className="section-padding-sm">
        <div className="container-main">
          <div className="rounded-[var(--radius-sheet)] bg-[var(--ink)] text-white p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div>
              <p className="text-lg sm:text-xl font-black">{siteConfig.name}، {siteConfig.exclusiveTitle}</p>
              <p className="mt-2 text-sm leading-7 text-slate-300">برای قیمت روز و سفارش پروژه‌ای، استعلام بفرستید یا محصولات را ببینید.</p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <a href={siteConfig.manufacturerUrl} target="_blank" rel="noopener" className="inline-flex items-center gap-2 h-11 px-5 rounded-[var(--radius-control)] border border-white/20 text-sm font-bold hover:bg-white/10">
                <Globe className="w-4 h-4" />سایت کارخانه
              </a>
              <Link href="/products" className="inline-flex items-center gap-2 h-11 px-5 rounded-[var(--radius-control)] border border-white/20 text-sm font-bold hover:bg-white/10">
                مشاهده محصولات
              </Link>
              <Link href="/project-inquiry" className="inline-flex items-center gap-2 h-11 px-5 rounded-[var(--radius-control)] bg-[var(--accent)] text-[var(--accent-foreground)] text-sm font-bold">
                استعلام پروژه‌ای<ChevronLeft className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
