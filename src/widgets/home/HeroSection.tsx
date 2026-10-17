'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDown, Factory, Headphones, Search, ShieldCheck, Truck } from 'lucide-react';
import { siteConfig } from '@/shared/config/site';
import { useSiteSettings } from '@/shared/providers/SiteSettingsProvider';
import { useConsult } from '@/features/consult/ConsultProvider';
import { HeroBoard } from '@/features/prices/HeroBoard';
import type { NavCategory } from '@/shared/lib/data';
import type { PriceBoard } from '@/shared/lib/price-board-types';

/**
 * بخش اول صفحه بدون انیمیشن ورود: قبلاً متن، جستجو و تابلوی قیمت با opacity صفر رندر می‌شدند و تا اجرای
 * جاوااسکریپت دیده نمی‌شدند — روی موبایل با اینترنت کند چند ثانیه صفحه خالی (Speed Index و LCP بد).
 */
export function HeroSection({ categories, board }: { categories: NavCategory[]; board: PriceBoard }) {
  const { heroTitle, heroSubtitle } = useSiteSettings();
  const { open } = useConsult();
  const router = useRouter();
  const [q, setQ] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <section className="relative isolate overflow-hidden bg-[var(--ink)] text-white">
      {/*
        عکس روز انبار کارخانه، کامل و روشن. اصل عکس ۱۰۸۰ پیکسلی است؛ نسخه ۲۱۶۰ پیکسلی با فیلتر lanczos و شارپ
        از قبل ساخته شده تا مرورگر آن را کش ندهد و روی رتینا تیزتر بماند. قرینه شده تا لوله‌ها سمت چپِ بی‌متن بیفتند.
      */}
      <Image
        src="/images/site/hero.webp"
        alt=""
        fill
        // تصویر LCP صفحه اصلی: preload + اولویت بالا
        preload
        fetchPriority="high"
        quality={90}
        sizes="100vw"
        className="object-cover object-center -scale-x-100 -z-20"
      />
      {/* پوشش فقط پشت متن: موبایل یکنواخت (متن کل عرض را می‌گیرد)، دسکتاپ از راست تیره به چپ تقریباً شفاف */}
      <div className="absolute inset-0 -z-10 max-lg:bg-[rgba(14,18,23,0.5)] lg:bg-[linear-gradient(270deg,rgba(14,18,23,0.84)_0%,rgba(14,18,23,0.7)_35%,rgba(14,18,23,0.45)_58%,rgba(14,18,23,0.15)_80%,rgba(14,18,23,0.05)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-28 -z-10 bg-gradient-to-t from-[var(--ink)]/80 to-transparent" />

      <div className="container-main grid grid-cols-1 lg:grid-cols-[1fr_470px] items-center gap-8 lg:gap-14 pt-8 pb-16 sm:pt-12 sm:pb-20 lg:pt-20 lg:pb-28">
        <div className="min-w-0 text-legible">
          <p className="eyebrow">
            فروش مستقیم از کارخانه {siteConfig.legalName}
          </p>
          <h1
            className="mt-3 text-[1.85rem] leading-[1.4] sm:text-[2.6rem] lg:text-[3.1rem] lg:leading-[1.3] font-black tracking-tight text-white"
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
                    className="me-2 h-9 px-3.5 rounded-lg border border-white/25 bg-black/30 backdrop-blur-sm text-[13px] text-white flex items-center whitespace-nowrap"
                  >
                    {c.name}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="hidden sm:flex flex-wrap gap-2 mt-4">
            {categories.slice(0, 6).map((c) => (
              <Link key={c.slug} href={`/products/${c.slug}`} className="h-9 px-3.5 rounded-lg border border-white/25 bg-black/30 backdrop-blur-sm text-[13px] text-white flex items-center hover:bg-white hover:text-[var(--ink)] transition-colors">
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

        <div className="min-w-0">
          <HeroBoard initial={board} />
          <button onClick={() => open()} className="mt-3 w-full h-12 rounded-2xl border border-white/15 bg-white/5 backdrop-blur text-sm font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-colors">
            <Headphones className="w-4.5 h-4.5 text-[var(--accent-text)]" />
            مشاوره رایگان و استعلام قیمت عمده
          </button>
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
