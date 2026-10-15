import { Building2, Factory, Navigation, Phone } from 'lucide-react';
import { siteConfig } from '@/shared/config/site';
import { phoneHref, type SiteSettings } from '@/shared/lib/site-settings';
import { faDigits } from '@/shared/lib/utils';

const STEPS = [
  { title: 'ثبت سفارش یا استعلام', desc: 'آنلاین از جدول قیمت یا تماس با دفتر فروش' },
  { title: 'بارگیری از انبار کارخانه', desc: 'شهرک صنعتی گرمسار، استان سمنان' },
  { title: 'ارسال به محل پروژه', desc: 'حمل به سراسر کشور پس از هماهنگی' },
];

type Props = Pick<SiteSettings, 'address' | 'factoryAddress' | 'companyPhones' | 'mapUrl'>;

/** این سایت فروش آنلاین کارخانه است — مسیر کالا از انبار تا مشتری و آدرس‌های واقعی (سئوی محلی) */
export function FactorySection({ address, factoryAddress, companyPhones, mapUrl }: Props) {
  return (
    <section className="relative bg-[var(--ink)] text-white overflow-hidden" aria-labelledby="factory-title">
      <div className="absolute inset-0 bp-grid" aria-hidden />
      <div className="relative h-1.5 hazard" aria-hidden />

      <div className="relative container-main py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-10 lg:gap-14 items-start">
        <div>
          <p className="eyebrow">کارخانه و انبار</p>
          <h2 id="factory-title" className="mt-2 text-[1.35rem] sm:text-2xl lg:text-3xl font-black text-white leading-snug">
            فروش مستقیم از کارخانه {siteConfig.legalName}
          </h2>
          <p className="mt-3 text-sm sm:text-[15px] leading-8 text-slate-300 max-w-xl">
            {siteConfig.name} فروشگاه آنلاین کارخانه {siteConfig.legalName}، تولیدکننده لوله دوجداره پلی اتیلن است. سفارش‌ها مستقیم از انبار
            کارخانه بارگیری و بدون واسطه به سراسر کشور ارسال می‌شوند.
          </p>

          <ol className="mt-8 grid grid-cols-1 sm:grid-cols-3 border border-white/10 rounded-2xl overflow-hidden">
            {STEPS.map((s, i) => (
              <li key={s.title} className="p-4 border-b sm:border-b-0 sm:border-s first:border-s-0 border-white/10 last:border-b-0 bg-white/[0.03]">
                <span className="text-2xl font-black text-[var(--accent-text)] num leading-none">{faDigits(String(i + 1).padStart(2, '0'))}</span>
                <p className="mt-2 font-bold text-sm text-white">{s.title}</p>
                <p className="mt-1 text-xs leading-6 text-slate-400">{s.desc}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="grid gap-3">
          <article className="corner-marks rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-start gap-3.5">
              <span className="grid place-items-center w-11 h-11 rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] shrink-0"><Factory className="w-5 h-5" /></span>
              <div className="min-w-0">
                <h3 className="font-black text-white">کارخانه و انبار</h3>
                <p className="mt-1 text-sm leading-7 text-slate-300">{factoryAddress}</p>
              </div>
            </div>
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 h-11 rounded-xl bg-white text-[var(--ink)] text-sm font-bold flex items-center justify-center gap-2"
            >
              <Navigation className="w-4 h-4" /> مسیریابی در گوگل مپ
            </a>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-start gap-3.5">
              <span className="grid place-items-center w-11 h-11 rounded-xl bg-white/10 text-[var(--accent-text)] shrink-0"><Building2 className="w-5 h-5" /></span>
              <div className="min-w-0">
                <h3 className="font-black text-white">دفتر مرکزی و فروش</h3>
                <p className="mt-1 text-sm leading-7 text-slate-300 num">{faDigits(address)}</p>
              </div>
            </div>
            {companyPhones.length > 0 && (
              <div className="mt-4 grid grid-cols-1 min-[400px]:grid-cols-2 min-[400px]:[&>:last-child:nth-child(odd)]:col-span-2 gap-2">
                {companyPhones.map((p) => (
                  <a key={p} href={phoneHref(p)} className="h-11 rounded-xl border border-white/15 flex items-center justify-center gap-2 text-sm font-bold hover:bg-white/10 transition-colors">
                    <Phone className="w-4 h-4 text-[var(--accent-text)]" />
                    <span dir="ltr" className="num">{faDigits(p)}</span>
                  </a>
                ))}
              </div>
            )}
          </article>
        </div>
      </div>
    </section>
  );
}
