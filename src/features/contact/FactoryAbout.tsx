import Link from 'next/link';
import { BadgeCheck, Calendar, ChevronLeft, Factory, Ruler, ShieldCheck, Waves } from 'lucide-react';
import { siteConfig } from '@/shared/config/site';
import { faDigits } from '@/shared/lib/utils';
import { IconTile } from '@/shared/ui/IconTile';
import { LtrCodes } from '@/shared/ui/LtrCodes';
import type { FaqItem } from '@/shared/types';

/**
 * معرفی کارخانه در صفحه تماس — سمت سرور تا کل متن در HTML اولیه برای گوگل باشد.
 * تاریخ‌ها و بازه‌ها از اسناد خود کارخانه (پروانه استاندارد و گواهی ISO) و اطلاعات عمومی شرکت.
 */
const TIMELINE = [
  { year: '۱۳۹۱', text: 'آغاز فعالیت در شهرک صنعتی گرمسار با یک خط تولید لوله کاروگیت ۲۰۰ تا ۴۰۰ میلیمتر' },
  { year: '۱۳۹۲', text: 'دریافت پروانه کاربرد علامت استاندارد اجباری ISIRI 9116-3 از سازمان ملی استاندارد' },
  { year: '۱۴۰۱', text: 'تمدید پروانه استاندارد برای لوله‌های دیواره ساختمند پلی اتیلن، پلی پروپیلن و PVC-U' },
  { year: '۱۴۰۴', text: 'گواهینامه سیستم مدیریت کیفیت ISO 9001:2015 برای تولید لوله کاروگیت و اسپیرال' },
];

const FACTS = [
  { icon: Factory, title: 'محصولات', text: 'لوله کاروگیت دوجداره ۱۱۰ تا ۱۰۰۰ میلیمتر و لوله اسپیرال کاروگیت ۸۰۰ تا ۲۰۰۰ میلیمتر' },
  { icon: ShieldCheck, title: 'کلاس سختی حلقوی', text: 'SN4 (۱۶)، SN8 (۳۱٫۵) و SN16 (۶۴ کیلونیوتن بر مترمربع) — بر اساس عمق دفن و بار ترافیکی' },
  { icon: Waves, title: 'جنس و اتصال', text: 'پلی اتیلن سنگین HDPE، جداره داخلی صاف و روشن؛ اتصال با کوپلر و واشر آب‌بند EPDM' },
];

/** ابعاد اسمی پروفیل لوله کاروگیت (میلیمتر) */
const DIMENSIONS = [
  [160, 160, 187, 14],
  [200, 200, 232.8, 17.4],
  [250, 250, 292, 21],
  [315, 315, 368.2, 27.1],
  [400, 400, 467.5, 33.7],
  [500, 500, 584, 42],
  [600, 600, 708, 54],
];

const USES = ['شبکه جمع‌آوری فاضلاب شهری و روستایی', 'زهکشی اراضی کشاورزی و آب‌های سطحی', 'انتقال ثقلی آب', 'غلاف محافظ کابل برق و مخابرات'];

export const FACTORY_FAQS: FaqItem[] = [
  {
    question: `نماینده رسمی فروش ${siteConfig.legalName} کیست؟`,
    answer: `${siteConfig.name} ${siteConfig.exclusiveTitle} است و محصولات کارخانه را با قیمت روز و ارسال مستقیم از انبار گرمسار عرضه می‌کند.`,
  },
  {
    question: `کارخانه ${siteConfig.legalName} کجاست؟`,
    answer: `کارخانه و انبار در ${siteConfig.factoryAddress} است و دفتر مرکزی فروش در ${siteConfig.address}.`,
  },
  {
    question: `لوله‌های ${siteConfig.legalName} چه استاندارد و گواهینامه‌ای دارند؟`,
    answer: 'پروانه کاربرد علامت استاندارد اجباری ISIRI 9116-3 (تمدید ۱۴۰۱) و گواهینامه سیستم مدیریت کیفیت ISO 9001:2015. تصویر اسناد در صفحه گواهینامه‌ها آمده است.',
  },
  {
    question: 'لوله کاروگیت قدیر لوله در چه کلاس‌هایی تولید می‌شود؟',
    answer: 'در کلاس‌های سختی حلقوی SN4 (۱۶ کیلونیوتن)، SN8 (۳۱٫۵ کیلونیوتن) و SN16 (۶۴ کیلونیوتن بر مترمربع)؛ انتخاب کلاس به عمق دفن و بار ترافیکی بستگی دارد.',
  },
];

/** Organization کارخانه — تولیدکننده، با سال تأسیس و محل */
export const factorySchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: siteConfig.legalName,
  alternateName: siteConfig.legalNameEn,
  foundingDate: '2012',
  foundingLocation: { '@type': 'Place', name: 'شهرک صنعتی گرمسار، استان سمنان' },
  address: {
    '@type': 'PostalAddress',
    streetAddress: siteConfig.factory.street,
    addressLocality: siteConfig.factory.city,
    addressRegion: siteConfig.factory.region,
    addressCountry: 'IR',
  },
  description: `تولیدکننده لوله دوجداره پلی اتیلن (کاروگیت) و لوله اسپیرال در گرمسار از ۱۳۹۱، دارای پروانه استاندارد ISIRI 9116-3 و گواهینامه ISO 9001:2015. ${siteConfig.name} ${siteConfig.exclusiveTitle} است.`,
  url: `${siteConfig.url}/certificates`,
};

export function FactoryAbout() {
  return (
    <section className="section-padding-sm" aria-labelledby="factory-about-title">
      <div className="container-main">
        <p className="eyebrow">درباره کارخانه</p>
        <h2 id="factory-about-title" className="mt-2 text-xl sm:text-2xl lg:text-3xl font-black leading-snug">
          {siteConfig.legalName}؛ تولیدکننده لوله کاروگیت در گرمسار
        </h2>

        <div className="mt-5 rounded-3xl border-2 border-[var(--accent)]/50 bg-[var(--accent)]/[0.07] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <p className="flex items-start gap-3 text-base sm:text-lg leading-8">
            <ShieldCheck className="w-7 h-7 shrink-0 mt-0.5 text-[var(--accent-text)]" />
            <span>
              <strong className="font-black">{siteConfig.name}، {siteConfig.exclusiveTitle} است.</strong>{' '}
              <span className="text-[var(--muted-foreground)] text-sm sm:text-base">برای خرید، استعلام قیمت و سفارش پروژه‌ای با دفتر فروش ما تماس بگیرید.</span>
            </span>
          </p>
          <Link href="/certificates" className="shrink-0 inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-[var(--foreground)] text-[var(--background)] text-sm font-bold">
            <BadgeCheck className="w-4 h-4" />
            گواهینامه‌ها
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="text-sm sm:text-[15px] leading-8 text-[var(--muted-foreground)]">
              <LtrCodes
                text={`شرکت تولیدی و بازرگانی ${siteConfig.legalName} از سال ۱۳۹۱ در شهرک صنعتی گرمسار لوله دوجداره پلی اتیلن (کاروگیت) تولید می‌کند. کارخانه با یک خط ۲۰۰ تا ۴۰۰ میلیمتر شروع کرد و با افزودن خطوط جدید و خط لوله اسپیرال، امروز لوله کاروگیت تا ۱۰۰۰ میلیمتر و لوله اسپیرال تا ۲۰۰۰ میلیمتر را برای پروژه‌های فاضلاب، زهکشی و آب‌های سطحی تأمین می‌کند.`}
              />
            </p>

            <ol className="mt-6 relative border-s-2 border-[var(--border)] ms-3 space-y-5">
              {TIMELINE.map((t) => (
                <li key={t.year} className="ps-6 relative">
                  <span className="absolute -start-[0.6rem] top-1 w-4 h-4 rounded-full bg-[var(--accent)] ring-4 ring-[var(--background)]" />
                  <p className="flex items-center gap-1.5 text-sm font-black num"><Calendar className="w-4 h-4 text-[var(--accent-text)]" />{t.year}</p>
                  <p className="mt-0.5 text-sm leading-7 text-[var(--muted-foreground)]"><LtrCodes text={t.text} /></p>
                </li>
              ))}
            </ol>

            <ul className="mt-6 grid gap-3">
              {FACTS.map((f) => (
                <li key={f.title} className="flex items-start gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
                  <IconTile icon={f.icon} size="sm" />
                  <div className="min-w-0">
                    <p className="font-black text-sm">{f.title}</p>
                    <p className="mt-0.5 text-sm leading-7 text-[var(--muted-foreground)] num"><LtrCodes text={f.text} /></p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-6 content-start">
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
              <p className="flex items-center gap-2 px-5 py-4 border-b border-[var(--border)] font-black text-sm">
                <Ruler className="w-4 h-4 text-[var(--accent-text)]" />
                ابعاد لوله کاروگیت {siteConfig.legalName} (میلیمتر)
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm num">
                  <caption className="sr-only">ابعاد اسمی لوله کاروگیت: قطر داخلی، قطر خارجی و ارتفاع پروفیل</caption>
                  <thead className="bg-[var(--muted)] text-[var(--muted-foreground)] text-xs">
                    <tr>
                      <th scope="col" className="px-4 py-2.5 text-right font-bold">سایز اسمی</th>
                      <th scope="col" className="px-4 py-2.5 text-right font-bold">قطر داخلی</th>
                      <th scope="col" className="px-4 py-2.5 text-right font-bold">قطر خارجی</th>
                      <th scope="col" className="px-4 py-2.5 text-right font-bold">ارتفاع پروفیل</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DIMENSIONS.map(([dn, id, od, h]) => (
                      <tr key={dn} className="border-t border-[var(--border)]">
                        <th scope="row" className="px-4 py-2.5 text-right font-black">{faDigits(String(dn))}</th>
                        <td className="px-4 py-2.5">{faDigits(String(id))}</td>
                        <td className="px-4 py-2.5">{faDigits(String(od))}</td>
                        <td className="px-4 py-2.5">{faDigits(String(h))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="px-5 py-3 text-[11px] leading-6 text-[var(--muted-foreground)] border-t border-[var(--border)]">
                ابعاد اسمی؛ هنگام سفارش متعلقات، کوپلر و واشر را متناسب با قطر خارجی همین لوله بخواهید.
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5">
              <p className="font-black text-sm">کاربردها</p>
              <ul className="mt-3 grid sm:grid-cols-2 gap-2">
                {USES.map((u) => (
                  <li key={u} className="flex items-start gap-2 text-sm leading-7 text-[var(--muted-foreground)]">
                    <BadgeCheck className="w-4 h-4 mt-1.5 shrink-0 text-emerald-600" />
                    {u}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
