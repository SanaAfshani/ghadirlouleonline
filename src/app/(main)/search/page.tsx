import type { Metadata } from 'next';
import Link from 'next/link';
import { SearchPageClient } from '@/features/search/SearchPageClient';

export const metadata: Metadata = {
  title: 'جستجو در محصولات و مقالات',
  description: 'جستجو در محصولات، مقالات و پروژه‌های قدیر لوله آنلاین ',
  // صفحه نتایج جستجوی داخلی — طبق راهنمای گوگل ایندکس نشود، ولی لینک‌هایش دنبال شود
  robots: { index: false, follow: true },
  alternates: { canonical: '/search' },
};

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="bg-[var(--ink)] bp-grid relative overflow-hidden">
        <div className="container-main relative z-10 py-10 md:py-14">
          <nav className="flex items-center gap-2 text-xs text-slate-500 mb-4">
            <Link href="/" className="hover:text-slate-300 transition-colors">خانه</Link>
            <span>/</span>
            <span className="text-[var(--accent-text)]">جستجو</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">جستجو</h1>
          <p className="text-slate-400 text-sm">جستجو در محصولات، مقالات و پروژه‌ها</p>
        </div>
      </div>
      <SearchPageClient />
    </div>
  );
}
