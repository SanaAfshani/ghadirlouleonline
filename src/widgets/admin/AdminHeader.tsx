'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Bell, BellRing, ExternalLink, LogOut, Menu, Moon, Phone, Sun } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useTheme } from 'next-themes';
import { useAdminNotifications } from '@/widgets/admin/AdminNotifications';
import { phoneHref } from '@/shared/lib/site-settings';
import { faDigits, safeDecode } from '@/shared/lib/utils';

const noopSubscribe = () => () => {};
const timeAgo = new Intl.RelativeTimeFormat('fa', { numeric: 'auto' });
function ago(iso: string) {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (mins < 60) return timeAgo.format(-Math.max(mins, 0), 'minute');
  if (mins < 24 * 60) return timeAgo.format(-Math.round(mins / 60), 'hour');
  return timeAgo.format(-Math.round(mins / 1440), 'day');
}

const iconBtn =
  'relative grid place-items-center w-10 h-10 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors';

/** زنگوله: پیام‌های پیگیری‌نشده مشتری با دکمه تماس مستقیم */
function NotificationBell() {
  const { unread, latest, browserNotify, enableBrowserNotify } = useAdminNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((v) => !v)} aria-label={`اعلان‌ها${unread ? ` (${unread} پیام پیگیری‌نشده)` : ''}`} aria-expanded={open} className={iconBtn}>
        {unread ? <BellRing className="w-5 h-5 text-[var(--accent-text)]" /> : <Bell className="w-5 h-5" />}
        {unread > 0 && (
          <span className="absolute -top-0.5 -left-0.5 min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-[11px] font-bold grid place-items-center num">
            {unread > 99 ? '۹۹+' : faDigits(unread)}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed sm:absolute inset-x-3 sm:inset-x-auto top-16 sm:top-12 sm:left-0 sm:w-96 z-50 rounded-2xl border border-[var(--border)] bg-[var(--background)] shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 h-12 border-b border-[var(--border)]">
            <p className="font-bold text-sm">پیام‌های در انتظار تماس</p>
            <span className="text-xs text-[var(--muted-foreground)] num">{faDigits(unread)} مورد</span>
          </div>
          {latest.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-[var(--muted-foreground)]">پیام پیگیری‌نشده‌ای نیست</p>
          ) : (
            <ul className="max-h-[60vh] overflow-y-auto divide-y divide-[var(--border)]">
              {latest.map((m) => (
                <li key={m.id} className="flex items-center gap-3 px-4 py-3">
                  <Link href={`/admin/messages?id=${m.id}`} onClick={() => setOpen(false)} className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{m.name}</p>
                    <p className="text-xs text-[var(--muted-foreground)] truncate">
                      {m.subject || 'بدون موضوع'}
                      {m.sourcePath && <> · از <bdi dir="ltr">{safeDecode(m.sourcePath)}</bdi></>}
                    </p>
                    <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">{ago(m.createdAt)}</p>
                  </Link>
                  {m.phone && (
                    <a href={phoneHref(m.phone)} aria-label={`تماس با ${m.name}`} className="shrink-0 grid place-items-center w-10 h-10 rounded-xl bg-emerald-600 text-white">
                      <Phone className="w-4 h-4" />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-t border-[var(--border)] bg-[var(--card)]">
            <Link href="/admin/messages" onClick={() => setOpen(false)} className="text-sm font-bold text-[var(--accent-text)]">همه پیام‌ها ←</Link>
            {browserNotify === 'default' && (
              <button onClick={enableBrowserNotify} className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] underline">
                فعال‌سازی اعلان مرورگر
              </button>
            )}
            {browserNotify === 'denied' && <span className="text-[11px] text-[var(--muted-foreground)]">اعلان مرورگر مسدود است</span>}
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminHeader({ onMenu }: { onMenu: () => void }) {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  // next-themes فقط سمت کلاینت تم واقعی را می‌داند؛ آیکن تم فقط در مرورگر رندر می‌شود (بدون hydration mismatch)
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);

  const handleLogout = () => {
    document.cookie = 'admin_token=; path=/; max-age=0';
    toast.success('با موفقیت خارج شدید');
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <header className="h-16 bg-[var(--background)]/90 backdrop-blur border-b border-[var(--border)] flex items-center justify-between gap-2 px-3 sm:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-2 min-w-0">
        <button onClick={onMenu} aria-label="منو" className={`${iconBtn} lg:hidden`}>
          <Menu className="w-5 h-5" />
        </button>
        <p className="font-bold text-sm truncate">پنل مدیریت قدیر لوله آنلاین</p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Link href="/" target="_blank" aria-label="مشاهده سایت" className={`${iconBtn} sm:w-auto sm:px-3 sm:gap-1.5 sm:flex sm:items-center text-sm`}>
          <ExternalLink className="w-4 h-4" />
          <span className="hidden sm:inline">مشاهده سایت</span>
        </Link>
        <button onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')} aria-label="تغییر حالت روشن و تیره" className={iconBtn}>
          {mounted && (resolvedTheme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />)}
        </button>
        <NotificationBell />
        <button onClick={handleLogout} aria-label="خروج" title="خروج" className={`${iconBtn} hover:text-red-700 dark:hover:text-red-400 hover:bg-red-500/10`}>
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
