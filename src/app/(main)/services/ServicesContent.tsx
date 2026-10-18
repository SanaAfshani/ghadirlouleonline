'use client';

import { m as motion } from 'framer-motion';
import Link from 'next/link';
import { BadgeCheck, Check, ChevronLeft, Factory, FileText, Headphones, Headset, Shield, ShieldCheck, Wrench } from 'lucide-react';
import { PageHero } from '@/shared/ui/PageHero';
import { useConsult } from '@/features/consult/ConsultProvider';
import { faDigits } from '@/shared/lib/utils';
import { IconTile, type IconTone } from '@/shared/ui/IconTile';
import { siteConfig } from '@/shared/config/site';
import { useSiteSettings } from '@/shared/providers/SiteSettingsProvider';
import { CertificateStrip } from '@/features/certificates/Certificates';
import { LtrCodes } from '@/shared/ui/LtrCodes';

/** آنچه از گواهینامه‌های کارخانه قطعی است — همان متن صفحه گواهینامه‌ها، کوتاه‌تر */
const FACTORY_FACTS = [
  { title: 'تولید لوله کاروگیت دوجداره', desc: 'قطر ۱۱۰ تا ۱۰۰۰ میلیمتر، کلاس سبک SN4 و سنگین SN8' },
  { title: 'تولید لوله اسپیرال کاروگیت', desc: 'قطر ۸۰۰ تا ۲۰۰۰ میلیمتر برای خطوط اصلی فاضلاب و آب‌های سطحی' },
  { title: 'استاندارد ملی ISIRI 9116-3', desc: 'پروانه کاربرد علامت استاندارد اجباری از سازمان ملی استاندارد ایران' },
  { title: 'ISO 9001:2015', desc: 'سیستم مدیریت کیفیت با آزمایشگاه کنترل کیفیت در کارخانه' },
];

const services = [
  {
    icon: Headphones,
    title: 'مشاوره تخصصی رایگان',
    desc: 'کارشناسان فنی ما با بیش از ۲۰ سال تجربه، آماده ارائه مشاوره رایگان در انتخاب مناسب‌ترین لوله و اتصالات برای پروژه شما هستند.',
    features: ['مشاوره تلفنی رایگان', 'بررسی مدارک فنی', 'پیشنهاد بهینه محصول', 'محاسبه نیاز پروژه'],
  },
  {
    icon: Wrench,
    title: 'خدمات برش و تبدیل',
    desc: 'برش لوله در ابعاد و اندازه‌های دلخواه با تجهیزات پیشرفته CNC. دقت بالا و کیفیت برش تضمین شده.',
    features: ['برش با دقت بالا', 'تجهیزات CNC', 'ابعاد سفارشی', 'صدور گواهینامه'],
  },
  {
    icon: FileText,
    title: 'مستندات فنی',
    desc: 'ارائه آنالیز مواد، گواهینامه کیفیت Mill Certificate، تست‌های فنی و سایر مستندات مورد نیاز پروژه.',
    features: ['Mill Certificate', 'آنالیز شیمیایی', 'گواهی کیفیت', 'تست هیدرواستاتیک'],
  },
  {
    icon: Shield,
    title: 'گارانتی و پشتیبانی',
    desc: 'تضمین کیفیت تمامی محصولات و خدمات پس از فروش. در صورت عدم تطابق با مشخصات، تعویض یا استرداد وجه.',
    features: ['گارانتی کیفیت', 'خدمات پس از فروش', 'امکان مرجوعی', 'پشتیبانی ۲۴ ساعته'],
  },
];

const TONES: IconTone[] = ['accent', 'sky', 'emerald', 'violet', 'rose', 'slate'];

export function ServicesContent() {
  const { open } = useConsult();
  const { certificates } = useSiteSettings();

  return (
    <>
      <PageHero
        label="خدمات ما"
        title="خدمات جامع آب و فاضلاب"
        description="از مشاوره تخصصی تا تحویل درب کارگاه — همه مراحل را با تیم ما طی کنید"
      />

      <section className="section-padding">
        <div className="container-main">
          <ol className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-5">
            {services.map(({ icon: Icon, title, desc, features }, i) => (
              <motion.li
                key={title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: i * 0.06, duration: 0.5 }}
                className="group relative p-6 sm:p-8 rounded-3xl border border-[var(--border)] bg-[var(--background)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-[var(--accent)]/40"
              >
                <div className="flex items-start justify-between gap-4">
                  <IconTile icon={Icon} tone={TONES[i % TONES.length]} size="lg" />
                  <span className="text-4xl font-black text-[var(--border)] num leading-none">{faDigits(String(i + 1).padStart(2, '0'))}</span>
                </div>
                <h2 className="mt-5 text-lg sm:text-xl font-black">{title}</h2>
                <p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">{desc}</p>
                <ul className="mt-5 pt-5 border-t border-[var(--border)] grid grid-cols-2 gap-y-2.5 gap-x-4">
                  {features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-[var(--accent-text)] shrink-0" strokeWidth={2.5} />
                      {f}
                    </li>
                  ))}
                </ul>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      {/* کارخانه‌ای که نماینده انحصاری آن هستیم + ارجاع به گواهینامه‌ها */}
      <section className="section-padding-sm" aria-labelledby="factory-title">
        <div className="container-main">
          <div className="rounded-[var(--radius-panel)] border-2 border-[var(--accent)]/40 bg-[var(--card)] overflow-hidden">
            <div className="p-6 sm:p-10 grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-start">
              <div>
                <p className="eyebrow">کارخانه تولیدکننده</p>
                <h2 id="factory-title" className="mt-2 flex items-center gap-3 text-xl sm:text-2xl font-black">
                  <IconTile icon={Factory} size="sm" />
                  {siteConfig.legalName}
                </h2>
                <p className="mt-4 text-sm sm:text-[15px] leading-8 text-[var(--muted-foreground)]">
                  <LtrCodes
                    text={`${siteConfig.legalName} در شهرک صنعتی گرمسار (استان سمنان) لوله دوجداره پلی اتیلن (کاروگیت) و لوله اسپیرال برای شبکه فاضلاب، زهکشی و آب‌های سطحی تولید می‌کند. محصولات این کارخانه با پروانه استاندارد ملی ISIRI 9116-3 و گواهینامه سیستم مدیریت کیفیت ISO 9001:2015 عرضه می‌شوند و آزمایشگاه کنترل کیفیت کارخانه آزمون‌های ابعاد، سختی حلقوی، دوده، MFI و آب‌بندی لوله را انجام می‌دهد.`}
                  />
                </p>
                <p className="mt-4 flex items-start gap-2.5 rounded-2xl bg-[var(--accent)]/10 border border-[var(--accent)]/30 p-4 text-sm sm:text-base leading-8">
                  <ShieldCheck className="w-6 h-6 mt-1 shrink-0 text-[var(--accent-text)]" />
                  <span>
                    <strong className="font-black">{siteConfig.name}، {siteConfig.exclusiveTitle} است.</strong> خرید از ما یعنی کالای اصل کارخانه با همین
                    گواهینامه‌ها، قیمت روز کارخانه و ارسال مستقیم از انبار گرمسار.
                  </span>
                </p>
                <Link href="/certificates" className="mt-5 inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-[var(--foreground)] text-[var(--background)] text-sm font-bold">
                  <BadgeCheck className="w-4 h-4" />
                  مشاهده گواهینامه‌ها و مجوزها
                  <ChevronLeft className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid gap-3">
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {FACTORY_FACTS.map((f) => (
                    <li key={f.title} className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4">
                      <p className="flex items-start gap-2 font-black text-sm leading-6 num">
                        <Check className="w-4 h-4 mt-1 shrink-0 text-[var(--accent-text)]" strokeWidth={2.5} />
                        <span><LtrCodes text={f.title} /></span>
                      </p>
                      <p className="mt-1 text-xs leading-6 text-[var(--muted-foreground)] num"><LtrCodes text={f.desc} /></p>
                    </li>
                  ))}
                </ul>
                {certificates.length > 0 && (
                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4">
                    <CertificateStrip certificates={certificates} title={`گواهینامه‌های ${siteConfig.legalName}`} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding-sm">
        <div className="container-main">
          <div className="rounded-[var(--radius-panel)] bg-[var(--ink)] text-white p-8 sm:p-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <span className="hidden sm:grid place-items-center w-12 h-12 rounded-2xl bg-white/10 shrink-0"><Headset className="w-5 h-5" /></span>
              <div>
                <h2 className="text-2xl font-black text-white">برای مشاوره رایگان تماس بگیرید</h2>
                <p className="mt-2 text-slate-300">تیم کارشناسان ما شنبه تا پنجشنبه آماده پاسخگویی هستند</p>
              </div>
            </div>
            <button onClick={() => open()} className="shrink-0 h-12 px-8 rounded-2xl bg-white text-[var(--ink)] font-bold">
              درخواست مشاوره رایگان
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
