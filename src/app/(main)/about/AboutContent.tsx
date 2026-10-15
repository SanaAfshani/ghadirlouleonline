'use client';

import { m as motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Check, Eye, Heart, Target } from 'lucide-react';
import { PageHero } from '@/shared/ui/PageHero';

const stats = [
  { value: 20, label: 'سال تجربه' },
  { value: 500, label: 'مشتری فعال' },
  { value: 5000, label: 'نوع محصول' },
  { value: 200, label: 'پروژه موفق' },
];

const values = [
  { icon: Target, title: 'ماموریت ما', desc: 'تامین با کیفیت‌ترین لوله آب و فاضلاب — پلیکا، پلی‌اتیلن، چدن داکتیل و منهول — با قیمت رقابتی و خدمات حرفه‌ای.' },
  { icon: Eye, title: 'چشم‌انداز ما', desc: 'تبدیل شدن به بزرگ‌ترین و معتمدترین تامین‌کننده لوله آب و فاضلاب در خراسان رضوی و سراسر ایران.' },
  { icon: Heart, title: 'ارزش‌های ما', desc: 'صداقت، کیفیت تضمین‌شده، تحویل به‌موقع و رضایت مشتری اصول اساسی ما هستند.' },
];

const team = [
  { name: 'مهندس الهی', role: 'مدیرعامل', desc: '۲۰ سال تجربه در صنعت لوله آب و فاضلاب' },
  { name: 'مهندس کاظمی', role: 'مدیر فنی', desc: 'متخصص در انواع لوله‌های PVC، PE و چدن' },
  { name: 'خانم محمدی', role: 'مدیر فروش', desc: 'کارشناس ارشد فروش با ۱۵ سال تجربه' },
];

const advantages = [
  'تامین مستقیم از کارخانه‌های معتبر ایران و اروپا',
  'ارائه گواهینامه کیفیت (Mill Certificate) برای تمام محصولات',
  'انبار با موجودی بالا برای تحویل فوری',
  'تیم مشاوره فنی متخصص',
  'ارسال به سراسر ایران با حمل‌ونقل اختصاصی',
  'قیمت‌گذاری شفاف و رقابتی',
];

const reveal = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
};

export function AboutContent() {
  return (
    <>
      <PageHero
        label="درباره ما"
        title="قدیر لوله آنلاین"
        description="بیش از ۲۰ سال تجربه در تامین انواع لوله آب و فاضلاب، اتصالات و شیرآلات صنعتی برای پروژه‌های عمرانی و ساختمانی"
      />

      {/* آمار — یک ردیف آرام با جداکننده، نه کارت‌های رنگی */}
      <section className="border-b border-[var(--border)]">
        <div className="container-main">
          <dl className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[var(--border)] border-x border-[var(--border)]">
            {stats.map((s, i) => (
              <motion.div key={s.label} {...reveal} transition={{ ...reveal.transition, delay: i * 0.06 }} className="py-8 sm:py-10 px-4 text-center bg-[var(--background)]">
                <dd className="text-3xl sm:text-4xl font-black num tracking-tight">
                  {s.value.toLocaleString('fa-IR')}<span className="text-[var(--accent-text)]">+</span>
                </dd>
                <dt className="mt-1 text-sm text-[var(--muted-foreground)]">{s.label}</dt>
              </motion.div>
            ))}
          </dl>
        </div>
      </section>

      {/* داستان */}
      <section className="section-padding">
        <div className="container-main grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-16 items-start">
          <motion.div {...reveal}>
            <span className="eyebrow">داستان ما</span>
            <h2 className="mt-3 text-2xl sm:text-[2rem] font-black leading-snug">از انبار کوچک تا تامین‌کننده بزرگ خراسان</h2>
            <p className="mt-5 text-[15px] leading-8 text-[var(--muted-foreground)]">
              قدیر لوله آنلاین در سال ۱۳۸۳ با هدف تامین لوله‌های با کیفیت برای پروژه‌های عمرانی تاسیس شد. در ابتدا با تمرکز بر لوله‌های PVC (پلیکا) فعالیت آغاز کردیم.
            </p>
            <p className="mt-4 text-[15px] leading-8 text-[var(--muted-foreground)]">
              امروز با گسترش دامنه محصولات به لوله پلی‌اتیلن، چدن داکتیل، منهول، اتصالات و شیرآلات صنعتی، به یکی از بزرگ‌ترین عرضه‌کنندگان آب و فاضلاب در شمال‌شرق ایران تبدیل شده‌ایم.
            </p>
            <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
              {advantages.map((adv) => (
                <li key={adv} className="flex items-start gap-2.5 text-sm leading-7">
                  <span className="mt-1.5 grid place-items-center w-4 h-4 rounded-full bg-[var(--foreground)] text-[var(--background)] shrink-0">
                    <Check className="w-2.5 h-2.5" strokeWidth={3} />
                  </span>
                  {adv}
                </li>
              ))}
            </ul>
          </motion.div>

          <div className="space-y-3">
            {values.map(({ icon: Icon, title, desc }, i) => (
              <motion.div key={title} {...reveal} transition={{ ...reveal.transition, delay: i * 0.08 }} className="flex gap-4 p-5 sm:p-6 rounded-3xl border border-[var(--border)]">
                <span className="grid place-items-center w-11 h-11 rounded-2xl bg-[var(--muted)] shrink-0">
                  <Icon className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-bold">{title}</h3>
                  <p className="mt-1 text-sm leading-7 text-[var(--muted-foreground)]">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* تیم */}
      <section className="section-padding bg-[var(--card)] border-y border-[var(--border)]">
        <div className="container-main">
          <div className="mb-8">
            <span className="eyebrow">تیم ما</span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-black">متخصصان ما</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5">
            {team.map((m, i) => (
              <motion.div key={m.name} {...reveal} transition={{ ...reveal.transition, delay: i * 0.08 }} className="p-6 rounded-3xl bg-[var(--background)] border border-[var(--border)]">
                <span className="grid place-items-center w-12 h-12 rounded-full bg-[var(--ink)] text-white font-black">
                  {m.name.replace(/^(مهندس|خانم|آقای)\s+/, '').charAt(0)}
                </span>
                <p className="mt-4 font-bold">{m.name}</p>
                <p className="text-sm text-[var(--accent-text)] font-semibold">{m.role}</p>
                <p className="mt-2 text-xs leading-6 text-[var(--muted-foreground)]">{m.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* دعوت به تماس */}
      <section className="section-padding-sm">
        <div className="container-main">
          <div className="rounded-[var(--radius-panel)] bg-[var(--ink)] text-white p-8 sm:p-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-black text-white">با ما در تماس باشید</h2>
              <p className="mt-2 text-slate-300">برای استعلام قیمت و مشاوره رایگان با کارشناسان ما تماس بگیرید</p>
            </div>
            <Link href="/contact" className="shrink-0 inline-flex items-center justify-center gap-2 h-12 px-8 rounded-2xl bg-white text-[var(--ink)] font-bold">
              تماس با ما <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
