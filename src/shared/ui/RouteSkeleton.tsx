'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { SkeletonArticle, SkeletonGridPage, SkeletonHome, SkeletonProductPage, SkeletonTextPage } from './Skeleton';

/** شکل اسکلت بر اساس مسیر مقصد */
function pick(path: string) {
  if (path === '/') return <SkeletonHome />;
  if (/^\/products\/[^/]+\/[^/]+/.test(path)) return <SkeletonProductPage />;
  if (/^\/(blog|projects)\/[^/]+/.test(path)) return <SkeletonArticle />;
  if (/^\/(products|blog|projects|categories|search)(\/|$)/.test(path)) return <SkeletonGridPage />;
  return <SkeletonTextPage />;
}

/**
 * اسکلت هنگام جابه‌جایی بین صفحات سایت.
 * به جای loading.tsx: آن روی مسیرهایی که notFound دارند پاسخ ۴۰۴ واقعی را ۲۰۰ می‌کرد (soft 404 برای گوگل).
 * این فقط سمت کلاینت و فقط هنگام کلیک روی لینک داخلی نمایش داده می‌شود؛ HTML اولیه و کد وضعیت دست نمی‌خورد.
 * ۱۲۰ میلی‌ثانیه صبر می‌کند تا ناوبری‌های سریع (صفحه از قبل prefetch شده) چشمک نزنند.
 */
export function RouteSkeleton() {
  const pathname = usePathname();
  const [target, setTarget] = useState<string | null>(null);
  const [shown, setShown] = useState(false);
  const [from, setFrom] = useState(pathname);

  // صفحه جدید رسید — اسکلت جمع شود
  if (pathname !== from) {
    setFrom(pathname);
    setTarget(null);
    setShown(false);
  }

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      // defaultPrevented چک نمی‌شود: Link خود Next برای ناوبری کلاینتی preventDefault می‌کند (برای همین capture)
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement).closest('a');
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      // فایل‌ها، API و پنل ادمین مسیر جدای خودشان را دارند
      if (/^\/(api|media|admin|uploads)\//.test(url.pathname) || /\.\w+$/.test(url.pathname)) return;
      setTarget(url.pathname);
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  useEffect(() => {
    if (!target) return;
    const show = setTimeout(() => setShown(true), 120);
    // اگر ناوبری لغو شد (مثلاً خطای شبکه) اسکلت گیر نکند
    const giveUp = setTimeout(() => setTarget(null), 15_000);
    const back = () => setTarget(null);
    window.addEventListener('popstate', back);
    return () => {
      clearTimeout(show);
      clearTimeout(giveUp);
      window.removeEventListener('popstate', back);
    };
  }, [target]);

  if (!target || !shown) return null;
  return (
    <div role="status" aria-label="در حال بارگذاری صفحه" className="fixed inset-x-0 top-[var(--nav-height)] bottom-0 z-30 overflow-hidden bg-[var(--background)] animate-[fade-in_0.2s_ease-out_both]">
      {pick(target)}
    </div>
  );
}
