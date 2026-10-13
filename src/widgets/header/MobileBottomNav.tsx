'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { m as motion } from 'framer-motion';
import { Headphones, Home, LayoutGrid, Phone, Tag } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useSiteSettings } from '@/shared/providers/SiteSettingsProvider';
import { useConsult } from '@/features/consult/ConsultProvider';

const ITEMS = [
  { href: '/', label: 'خانه', icon: Home },
  { href: '/categories', label: 'دسته‌ها', icon: LayoutGrid },
  null, // جای دکمه تماس وسط
  { href: '/prices', label: 'قیمت روز', icon: Tag },
] as const;

/** صفحه جزئیات محصول نوار اقدام مخصوص خودش (تماس، واتس‌اپ، مشاوره) را دارد */
const PRODUCT_DETAIL = /^\/products\/[^/]+\/[^/]+/;

export function MobileBottomNav() {
  const pathname = usePathname();
  const { phoneHref } = useSiteSettings();
  const { open } = useConsult();

  if (PRODUCT_DETAIL.test(pathname)) return null;

  const active = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <nav
      aria-label="ناوبری پایین"
      className="lg:hidden fixed inset-x-0 bottom-0 z-40 bg-[var(--ink)] border-t border-white/10 pb-[env(safe-area-inset-bottom)] print:hidden"
    >
      <div className="relative mx-auto max-w-md h-[64px] grid grid-cols-5 items-stretch">
        {ITEMS.map((item) =>
          item === null ? (
            <div key="call" className="flex justify-center items-start">
              <a
                href={phoneHref}
                aria-label="تماس تلفنی"
                className="-mt-5 grid place-items-center w-[54px] h-[54px] rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] shadow-accent ring-4 ring-[var(--ink)] active:scale-95 transition-transform"
              >
                <Phone className="w-6 h-6" />
              </a>
            </div>
          ) : (
            <Link key={item.href} href={item.href} aria-current={active(item.href) ? 'page' : undefined} className="relative flex flex-col items-center justify-center gap-1">
              {active(item.href) && (
                <motion.span layoutId="bottom-nav-active" className="absolute top-0 inset-x-4 h-[3px] bg-[var(--accent)]" transition={{ type: 'spring', damping: 26, stiffness: 380 }} />
              )}
              <item.icon className={cn('w-[22px] h-[22px]', active(item.href) ? 'text-[var(--accent)]' : 'text-slate-400')} />
              <span className={cn('text-[10.5px] font-bold', active(item.href) ? 'text-white' : 'text-slate-400')}>{item.label}</span>
            </Link>
          ),
        )}
        <button onClick={() => open()} className="flex flex-col items-center justify-center gap-1" aria-label="درخواست مشاوره">
          <Headphones className="w-[22px] h-[22px] text-slate-400" />
          <span className="text-[10.5px] font-bold text-slate-400">مشاوره</span>
        </button>
      </div>
    </nav>
  );
}
