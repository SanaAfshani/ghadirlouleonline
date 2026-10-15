'use client';

import { m as motion } from 'framer-motion';
import { Check, FileText, Headphones, Headset, Shield, Wrench } from 'lucide-react';
import { PageHero } from '@/shared/ui/PageHero';
import { useConsult } from '@/features/consult/ConsultProvider';
import { faDigits } from '@/shared/lib/utils';

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

export function ServicesContent() {
  const { open } = useConsult();

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
                className="relative p-6 sm:p-8 rounded-3xl border border-[var(--border)] bg-[var(--background)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="grid place-items-center w-12 h-12 rounded-2xl bg-[var(--ink)] text-white">
                    <Icon className="w-5 h-5" />
                  </span>
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
