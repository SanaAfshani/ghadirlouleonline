'use client';

import { m as motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Check, Eye, Heart, Target } from 'lucide-react';
import { PageHero } from '@/shared/ui/PageHero';
import { siteConfig } from '@/shared/config/site';
import { IconTile, type IconTone } from '@/shared/ui/IconTile';

/**
 * فقط واقعیت‌های قابل بررسی — آمار قبلی (۵۰۰۰ نوع محصول، ۵۰۰ مشتری، ۲۰۰ پروژه) مستند نبود و حذف شد.
 * منبع: سایت رسمی کارخانه، گواهینامه‌ها و فهرست سایزهای همین سایت.
 */
const stats = [
  { value: '۱۳۹۱', label: 'آغاز تولید کارخانه در گرمسار' },
  { value: '۱۲', label: 'سایز لوله کاروگیت؛ ۱۱۰ تا ۱۲۰۰' },
  { value: '۵', label: 'سایز لوله اسپیرال؛ ۹۰۰ تا ۲۰۰۰' },
  { value: 'ISO 9001', label: 'و پروانه استاندارد ISIRI 9116-3' },
];

const values = [
  { icon: Target, title: 'ماموریت ما', desc: 'تامین با کیفیت‌ترین لوله فاضلاب و آب‌های سطحی — لوله کاروگیت دوجداره، لوله اسپیرال و اتصالات کاروگیت — با قیمت رقابتی و خدمات حرفه‌ای.' },
  { icon: Eye, title: 'چشم‌انداز ما', desc: 'مرجع تخصصی خرید و تأمین لوله کاروگیت و اسپیرال برای پیمانکاران، مهندسان مشاور و پروژه‌های عمرانی ایران.' },
  { icon: Heart, title: 'ارزش‌های ما', desc: 'صداقت، کیفیت تضمین‌شده، تحویل به‌موقع و رضایت مشتری اصول اساسی ما هستند.' },
];

const TONES: IconTone[] = ['accent', 'sky', 'emerald', 'violet', 'rose', 'slate'];

/** مدیر مجموعه طبق پیام رسمی کارخانه؛ مدیران کارخانه طبق سایت رسمی قدیر لوله پاسارگاد */
const team = [
  { name: siteConfig.salesExpert.name, role: `مدیر ${siteConfig.name}`, desc: 'فروش و تأمین، اعلام قیمت روز، صدور پیش‌فاکتور و پیگیری سفارش' },
  { name: 'دکتر جمشید شاطری', role: `مدیرعامل ${siteConfig.legalName}`, desc: 'امضاکننده پیام رسمی معرفی نمایندگی' },
  { name: 'دکتر نادر شاطری', role: `مدیر فروش ${siteConfig.legalName}`, desc: 'واحد فروش کارخانه' },
];

const advantages = [
  `تأمین مستقیم از کارخانه ${siteConfig.legalName}، بدون واسطه`,
  'نماینده رسمی و اختصاصی با گواهی نمایندگی کارخانه',
  'مدارک کیفیت: ISO 9001، پروانه ISIRI 9116-3 و گزارش آزمون',
  'بارگیری از انبار کارخانه در گرمسار',
  'مشاوره انتخاب سایز و کلاس SN برای پروژه',
  'ارسال به سراسر ایران',
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
        description={`نماینده رسمی و اختصاصی فروش و عرضه آنلاین محصولات ${siteConfig.legalName}: لوله کاروگیت دوجداره، لوله اسپیرال و اتصالات کاروگیت`}
      />

      {/* آمار — یک ردیف آرام با جداکننده، نه کارت‌های رنگی */}
      <section className="border-b border-[var(--border)]">
        <div className="container-main">
          <dl className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[var(--border)] border-x border-[var(--border)]">
            {stats.map((s, i) => (
              <motion.div key={s.label} {...reveal} transition={{ ...reveal.transition, delay: i * 0.06 }} className="py-8 sm:py-10 px-4 text-center bg-[var(--background)]">
                <dd className="text-3xl sm:text-4xl font-black num tracking-tight">{s.value}</dd>
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
            <h2 className="mt-3 text-2xl sm:text-[2rem] font-black leading-snug">نماینده رسمی کارخانه‌ای که از ۱۳۹۱ لوله دوجداره می‌سازد</h2>
            <p className="mt-5 text-[15px] leading-8 text-[var(--muted-foreground)]">
              شرکت تولیدی و بازرگانی {siteConfig.legalName} در اوایل سال ۱۳۹۱ در شهرک صنعتی گرمسار با یک خط تولید ۲۰۰ تا ۴۰۰ میلیمتر شروع به کار کرد و
              امروز لوله دوجداره کاروگیت و لوله اسپیرال تولید می‌کند. کارخانه گواهینامه ISO 9001 و پروانه استاندارد اجباری ISIRI 9116-3 دارد و در دی ۱۴۰۲
              تفاهم‌نامه همکاری فنی با شرکتی از تاجیکستان امضا کرده است.
            </p>
            <p className="mt-4 text-[15px] leading-8 text-[var(--muted-foreground)]">
              {siteConfig.name} به مدیریت {siteConfig.salesExpert.name}، طبق{' '}
              <Link href="/official-representative" className="font-bold text-[var(--accent-text)] hover:underline">پیام رسمی کارخانه</Link>، نماینده رسمی و
              اختصاصی فروش و عرضه آنلاین محصولات {siteConfig.legalName} است. تمرکز ما روی سه محصول است: لوله کاروگیت دوجداره، لوله اسپیرال و اتصالات
              کاروگیت؛ همه مستقیم از کارخانه و با قیمت روز.
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
              <motion.div key={title} {...reveal} transition={{ ...reveal.transition, delay: i * 0.08 }} className="group flex gap-4 p-5 sm:p-6 rounded-3xl border border-[var(--border)] transition-colors hover:border-[var(--accent)]/40">
                <IconTile icon={Icon} tone={TONES[i % TONES.length]} />
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
            <span className="eyebrow">مدیریت</span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-black">مدیریت مجموعه و کارخانه</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5">
            {team.map((m, i) => (
              <motion.div key={m.name} {...reveal} transition={{ ...reveal.transition, delay: i * 0.08 }} className="p-6 rounded-3xl bg-[var(--background)] border border-[var(--border)]">
                <span className="grid place-items-center w-12 h-12 rounded-full bg-[var(--ink)] text-white font-black">
                  {m.name.replace(/^(مهندس|خانم|آقای|دکتر)\s+/, '').charAt(0)}
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
