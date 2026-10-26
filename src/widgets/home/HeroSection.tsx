'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronLeft, Factory, Headphones, Search, ShieldCheck, Truck } from 'lucide-react';
import { siteConfig } from '@/shared/config/site';
import { useSiteSettings } from '@/shared/providers/SiteSettingsProvider';
import { useConsult } from '@/features/consult/ConsultProvider';
import { HeroPipes } from '@/widgets/home/HeroPipes';
import { HeroSlides } from '@/widgets/home/HeroSlides';
import type { NavCategory } from '@/shared/lib/data';

/**
 * بخش اول صفحه بدون انیمیشن ورود: قبلاً متن، جستجو و تابلوی قیمت با opacity صفر رندر می‌شدند و تا اجرای
 * جاوااسکریپت دیده نمی‌شدند — روی موبایل با اینترنت کند چند ثانیه صفحه خالی (Speed Index و LCP بد).
 *
 * چیدمان دوستونی است، نه عکسِ تمام‌عرض. دو دلیل:
 * ۱) کیفیت — قاب عکس حدود ۴۷۰ پیکسل است و با چگالی ۲ به ۹۴۰ پیکسل نیاز دارد؛ عکس‌های واقعی کارخانه
 *    همین حدود هستند، پس در اندازه طبیعی خودشان دیده می‌شوند. عکسِ تمام‌عرض ۳۸۳۰ پیکسل می‌خواست و
 *    همان عکس‌ها را سه تا پنج برابر کش می‌داد.
 * ۲) خوانایی — متن روی پس‌زمینه یکدست می‌نشیند و دیگر به لایه تیره روی عکس وابسته نیست.
 *
 * تابلوی قیمت از اینجا برداشته شد چون همان جدول کامل بلافاصله در بخش بعد (LatestPrices) هست؛ اینجا
 * فقط یک لینک به آن می‌ماند تا هرو یک پیام و یک دکمه اصلی داشته باشد.
 */
export function HeroSection({ categories }: { categories: NavCategory[] }) {
  const { heroTitle, heroSubtitle, heroSlides } = useSiteSettings();
  const { open } = useConsult();
  const router = useRouter();
  const [q, setQ] = useState('');
  const glow = useRef<HTMLDivElement>(null);

  // نور پس‌زمینه دنبال نشانگر می‌آید — با lerp تا حرکتش نرم باشد و با rAF تا فریم‌ها جا نیفتند
  useEffect(() => {
    const el = glow.current;
    const section = el?.parentElement;
    if (!el || !section) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const at = { x: 0.18, y: 0.04 };
    const to = { ...at };
    let raf = 0;

    const move = (e: PointerEvent) => {
      const r = section.getBoundingClientRect();
      to.x = (e.clientX - r.left) / r.width;
      to.y = (e.clientY - r.top) / r.height;
    };
    const tick = () => {
      at.x += (to.x - at.x) * 0.06;
      at.y += (to.y - at.y) * 0.06;
      el.style.setProperty('--gx', `${(at.x * 100).toFixed(2)}%`);
      el.style.setProperty('--gy', `${(at.y * 100).toFixed(2)}%`);
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', move, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', move);
    };
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <section className="relative isolate overflow-hidden bg-[var(--ink)] text-white">
      {/*
        پس‌زمینه: یک نور نرم که با نشانگر جابه‌جا می‌شود، و چند لوله کم‌رنگ که با همان حرکت
        پارالاکس می‌خورند (جزئیات در HeroPipes). هر دو نرم‌شده‌اند تا به‌جای پریدن، آرام دنبال موس
        بیایند. بدون موس (موبایل) هر دو همان‌جای اولشان می‌مانند.
      */}
      <div
        ref={glow}
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(58rem_34rem_at_var(--gx,18%)_var(--gy,4%),rgba(245,158,11,0.17),transparent_62%)]"
      >
        <HeroPipes />
      </div>

      <div className="container-main grid grid-cols-1 lg:grid-cols-[1fr_470px] items-center gap-8 lg:gap-14 pt-8 pb-16 sm:pt-12 sm:pb-20 lg:pt-20 lg:pb-28">
        <div className="min-w-0">
          {/* جایگاه اصلی برند — اولین چیزی که دیده می‌شود؛ به صفحه گواهینامه‌ها می‌رود */}
          <Link
            href="/certificates"
            className="group inline-flex items-center gap-3 rounded-2xl border border-[var(--accent)]/60 bg-[rgba(14,18,23,0.6)] backdrop-blur-md p-1.5 pe-4 shadow-[0_12px_32px_-12px_rgba(245,158,11,0.55)] transition-colors hover:border-[var(--accent)]"
          >
            <span className="relative grid place-items-center w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] shrink-0">
              <ShieldCheck className="w-6 h-6" aria-hidden />
              <span aria-hidden className="absolute -inset-1 rounded-[0.9rem] border border-[var(--accent)]/50 animate-pulse" />
            </span>
            <strong className="leading-tight text-right">
              <span className="block text-[11px] sm:text-xs font-bold text-[var(--accent-text)]">تنها نماینده انحصاری</span>
              <span className="block mt-0.5 text-base sm:text-lg font-black text-white">{siteConfig.legalName}</span>
            </strong>
            <span className="hidden sm:flex items-center gap-1.5 ms-1 ps-3 border-s border-white/15 text-[11px] font-bold text-slate-200">
              <span className="h-6 px-2 rounded-md bg-white/10 grid place-items-center">ISO 9001</span>
              <span className="h-6 px-2 rounded-md bg-white/10 grid place-items-center">ISIRI 9116</span>
              <ChevronLeft className="w-4 h-4 text-[var(--accent-text)] transition-transform group-hover:-translate-x-0.5" aria-hidden />
            </span>
          </Link>
          <h1
            className="mt-5 text-[1.85rem] leading-[1.4] sm:text-[2.6rem] lg:text-[3.1rem] lg:leading-[1.3] font-black tracking-tight text-white"
          >
            {heroTitle}
          </h1>
          <p className="mt-4 text-[15px] sm:text-lg leading-8 text-white/90 max-w-xl">
            {heroSubtitle}
          </p>

          <form onSubmit={submit} className="mt-7 relative max-w-xl">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="نام محصول یا سایز…"
              enterKeyHint="search"
              aria-label="جستجوی محصول"
              className="w-full h-14 rounded-2xl bg-white text-[var(--ink)] placeholder:text-slate-400 pr-12 pl-28 shadow-2xl"
            />
            <button type="submit" className="absolute left-2 top-2 bottom-2 px-5 rounded-xl bg-[var(--ink)] text-white font-bold text-sm">
              جستجو
            </button>
          </form>

          {/* موبایل: نوار گردشی بی‌پایان (لیست دوبار تکرار شده و نصف عرضش جابه‌جا می‌شود) */}
          <div className="sm:hidden mt-4 -mx-4 overflow-hidden motion-reduce:overflow-x-auto [mask-image:linear-gradient(to_left,transparent,black_6%,black_94%,transparent)]">
            <div className="flex w-max animate-[hero-marquee_28s_linear_infinite] motion-reduce:animate-none active:[animation-play-state:paused]">
              {[...categories, ...categories].map((c, i) => {
                const copy = i >= categories.length;
                return (
                  <Link
                    key={`${c.slug}-${i}`}
                    href={`/products/${c.slug}`}
                    aria-hidden={copy || undefined}
                    tabIndex={copy ? -1 : undefined}
                    className="me-2 h-9 px-3.5 rounded-lg border border-white/20 bg-white/[0.06] text-[13px] text-white flex items-center whitespace-nowrap"
                  >
                    {c.name}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="hidden sm:flex flex-wrap gap-2 mt-4">
            {categories.slice(0, 6).map((c) => (
              <Link key={c.slug} href={`/products/${c.slug}`} className="h-9 px-3.5 rounded-lg border border-white/20 bg-white/[0.06] text-[13px] text-white flex items-center hover:bg-white hover:text-[var(--ink)] transition-colors">
                {c.name}
              </Link>
            ))}
          </div>

          <ul className="mt-8 hidden sm:flex flex-wrap gap-x-7 gap-y-3 text-sm text-white/90">
            <li className="flex items-center gap-2"><Factory className="w-4.5 h-4.5 text-[var(--accent-text)]" />بارگیری از انبار کارخانه گرمسار</li>
            <li className="flex items-center gap-2"><ShieldCheck className="w-4.5 h-4.5 text-[var(--accent-text)]" />خرید بدون واسطه از تولیدکننده</li>
            <li className="flex items-center gap-2"><Truck className="w-4.5 h-4.5 text-[var(--accent-text)]" />ارسال به سراسر کشور</li>
          </ul>
        </div>

        {/*
          عکس‌های واقعی حیاط کارخانه از پنل «اسلایدر هرو» می‌آیند؛ تابلوی «قدیر لوله پاسارگاد» خودش
          داخل قاب است، پس هیچ ترکیب‌سازی روی عکس انجام نمی‌شود. نقطه کانونی هر عکس جدا ذخیره
          می‌شود چون قاب روی موبایل افقی و روی دسکتاپ عمودی است و هر جا جور دیگری بریده می‌شود.
        */}
        <div className="min-w-0">
          <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-black/40 shadow-[0_30px_60px_-24px_rgba(0,0,0,0.75)] aspect-[4/3] lg:aspect-[13/16]">
            <HeroSlides slides={heroSlides} />
          </div>
          <button onClick={() => open()} className="mt-3 w-full h-12 rounded-2xl bg-[var(--accent)] text-[var(--accent-foreground)] text-sm font-bold flex items-center justify-center gap-2 hover:bg-[var(--accent)]/90 transition-colors">
            <Headphones className="w-4.5 h-4.5" />
            مشاوره رایگان و استعلام قیمت عمده
          </button>
          <a
            href="#prices"
            className="mt-2 w-full h-11 rounded-2xl border border-white/15 bg-white/5 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
          >
            دیدن قیمت روز لوله‌ها
            <ChevronDown className="w-4 h-4 text-[var(--accent-text)]" aria-hidden />
          </a>
        </div>
      </div>

      {/* لبه منحنی پایین — هم‌رنگ پس‌زمینه بخش بعد (قیمت روز) */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 -bottom-px leading-[0] text-[var(--card)]">
        <svg viewBox="0 0 1351 52.39" preserveAspectRatio="none" fill="currentColor" className="hidden sm:block w-full h-11 lg:h-[52px]">
          <path d="M709.5,11.22h0a57.13,57.13,0,0,0-68,0h0a140.24,140.24,0,0,1-86.18,27.5C347.74,34.67,161.05,20.57,0,2.75V52.39H1351V2.75c-161.19,17.84-347.64,31.94-555.32,36A140.24,140.24,0,0,1,709.5,11.22Z" />
        </svg>
        <svg viewBox="0 0 711.85 52.39" preserveAspectRatio="none" fill="currentColor" className="sm:hidden w-full h-9">
          <path d="M389.93,11.23l0,0a57.11,57.11,0,0,0-68,0h0A126.87,126.87,0,0,1,237.75,35.8,1738.72,1738.72,0,0,1,0,2.75V52.39H711.85V2.75A1736.55,1736.55,0,0,1,474.12,35.81,126.79,126.79,0,0,1,389.93,11.23Z" />
        </svg>
      </div>
      <a
        href="#prices"
        aria-label="رفتن به قیمت روز"
        className="absolute bottom-1 lg:bottom-2 left-1/2 -translate-x-1/2 grid place-items-center w-8 h-8 text-[var(--accent)] motion-safe:animate-bounce"
      >
        <ChevronDown className="w-5 h-5" strokeWidth={3} />
      </a>
    </section>
  );
}
