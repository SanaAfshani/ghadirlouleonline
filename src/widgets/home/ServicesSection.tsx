'use client';

import { m as motion } from 'framer-motion';
import { FileText, Headphones, MessageCircle, Phone, Scissors, ShieldCheck, Truck } from 'lucide-react';
import { useSiteSettings } from '@/shared/providers/SiteSettingsProvider';
import { useConsult } from '@/features/consult/ConsultProvider';
import { faDigits } from '@/shared/lib/utils';

/** همان خدماتی که در صفحه «خدمات» سایت اعلام شده */
const services = [
  { icon: Headphones, title: 'مشاوره فنی رایگان', desc: 'انتخاب جنس، سایز و فشار کاری مناسب پروژه با کمک کارشناسان.' },
  { icon: Truck, title: 'ارسال به سراسر ایران', desc: 'بارگیری و ارسال سفارش به محل پروژه در هر نقطه از کشور.' },
  { icon: FileText, title: 'گواهینامه کیفیت', desc: 'ارائه گواهینامه‌های کیفی (ISIRI, ISO, EN) و Mill Certificate.' },
  { icon: ShieldCheck, title: 'ضمانت اصالت کالا', desc: 'تامین مستقیم از کارخانه‌های معتبر ایرانی و خارجی.' },
  { icon: Scissors, title: 'برش و تبدیل لوله', desc: 'آماده‌سازی لوله در طول و اتصال مورد نیاز پروژه.' },
];

export function ServicesSection() {
  const { phone, phoneHref, whatsappUrl } = useSiteSettings();
  const { open } = useConsult();

  return (
    <section className="section-padding" aria-labelledby="why-title">
      <div className="container-main">
        <div className="relative overflow-hidden rounded-[var(--radius-panel)] bg-[var(--ink)] text-white">
          <div className="absolute inset-0 bp-grid opacity-70" />

          <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-8 lg:gap-12 p-6 sm:p-10 lg:p-14">
            <div className="flex flex-col min-w-0">
              <span className="eyebrow">چرا ما</span>
              <h2 id="why-title" className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-black leading-snug text-white">
                خرید مطمئن لوله و اتصالات، از مشاوره تا تحویل
              </h2>
              <p className="mt-4 text-slate-300 leading-8">
                فرم مشاوره را پر کنید تا کارشناسان ما برای انتخاب محصول، استعلام قیمت روز و زمان ارسال با شما تماس بگیرند.
              </p>
              <div className="mt-7 space-y-3 w-full max-w-md">
                <button
                  onClick={() => open()}
                  className="w-full min-h-13 py-3 px-6 rounded-2xl bg-[var(--accent)] text-[var(--accent-foreground)] font-black flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <Headphones className="w-5 h-5 shrink-0" />
                  ثبت درخواست مشاوره
                </button>
                <div className="grid grid-cols-1 min-[400px]:grid-cols-[1.45fr_1fr] gap-3">
                  <a href={phoneHref} className="min-w-0 h-12 px-3 rounded-2xl border border-white/15 bg-white/5 font-bold flex items-center justify-center gap-2 hover:bg-white/10">
                    <Phone className="w-4 h-4 shrink-0 text-[var(--accent-text)]" />
                    <span dir="ltr" className="num text-sm truncate">{faDigits(phone)}</span>
                  </a>
                  <a href={whatsappUrl} target="_blank" rel="noopener" className="min-w-0 h-12 px-3 rounded-2xl border border-white/15 bg-white/5 font-bold flex items-center justify-center gap-2 hover:bg-[#128C7E] hover:border-transparent">
                    <MessageCircle className="w-4 h-4 shrink-0" />
                    <span className="text-sm">واتس‌اپ</span>
                  </a>
                </div>
              </div>
            </div>

            <ul className="grid grid-cols-2 gap-2.5 sm:gap-3">
              {services.map(({ icon: Icon, title, desc }, i) => (
                <motion.li
                  key={title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className={`rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur p-3.5 sm:p-5 ${i === services.length - 1 ? 'col-span-2' : ''}`}
                >
                  <span className="grid place-items-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[var(--accent)]/15 text-[var(--accent-text)]">
                    <Icon className="w-5 h-5" />
                  </span>
                  <h3 className="mt-2.5 sm:mt-3 font-bold text-[14px] sm:text-base text-white leading-6">{title}</h3>
                  <p className="mt-1 text-xs sm:text-sm text-slate-400 leading-6 sm:leading-7">{desc}</p>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
