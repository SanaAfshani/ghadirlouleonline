'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
import toast from 'react-hot-toast';

export type PendingMessage = {
  id: string;
  name: string;
  phone: string | null;
  subject: string | null;
  sourcePath: string | null;
  createdAt: string;
};

type State = { unread: number; latest: PendingMessage[]; pendingQuotes: number };
type Ctx = State & {
  refresh: () => Promise<void>;
  /** اعلان مرورگر (حتی وقتی تب پنل در پس‌زمینه است) — فقط با کلیک کاربر قابل درخواست است */
  browserNotify: NotificationPermission | 'unsupported';
  enableBrowserNotify: () => Promise<void>;
};

const NotificationsContext = createContext<Ctx>({
  unread: 0, latest: [], pendingQuotes: 0, refresh: async () => {}, browserNotify: 'unsupported', enableBrowserNotify: async () => {},
});

export const useAdminNotifications = () => useContext(NotificationsContext);

const POLL_MS = 30_000;
const noopSubscribe = () => () => {};
const readPermission = (): Ctx['browserNotify'] => (typeof Notification === 'undefined' ? 'unsupported' : Notification.permission);

/**
 * پیام‌های جدید مشتری (فرم مشاوره و تماس) را برای کل پنل می‌پرسد: زنگوله هدر، نشان منو و صفحه پیام‌ها
 * همه از همین یک درخواست می‌خوانند. پیام تازه ← toast + شمارنده در عنوان تب + اعلان مرورگر (اگر اجازه داده شده).
 */
export function AdminNotificationsProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>({ unread: 0, latest: [], pendingQuotes: 0 });
  // اجازه فعلی مرورگر؛ بعد از درخواست کاربر، پاسخ همان درخواست جایگزینش می‌شود
  const current = useSyncExternalStore(noopSubscribe, readPermission, () => 'unsupported' as const);
  const [requested, setRequested] = useState<NotificationPermission | null>(null);
  const browserNotify = requested ?? current;
  const seen = useRef<Set<string> | null>(null);
  const pathname = usePathname();

  /** فقط خواندن؛ setState جدا در apply تا داخل effect فقط در then صدا زده شود */
  const load = useCallback(async (): Promise<State | null> => {
    try {
      const res = await fetch('/api/admin/notifications', { cache: 'no-store' });
      const json = await res.json();
      return res.ok && json.success ? (json.data as State) : null;
    } catch {
      return null; // شبکه قطع — دور بعدی دوباره تلاش می‌شود
    }
  }, []);

  const apply = useCallback((next: State | null) => {
    if (!next) return;
    // بار اول فقط وضعیت فعلی را ثبت می‌کنیم؛ اعلان فقط برای پیام‌هایی که بعد از باز شدن پنل رسیده‌اند
    if (seen.current) {
      const fresh = next.latest.filter((m) => !seen.current!.has(m.id));
      for (const m of fresh.reverse()) {
        toast(`پیام جدید از ${m.name}${m.subject ? ` — ${m.subject}` : ''}`, { icon: '🔔', duration: 8000 });
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          new Notification('پیام جدید مشتری', { body: `${m.name}${m.phone ? ` · ${m.phone}` : ''}`, tag: m.id, dir: 'rtl', lang: 'fa' });
        }
      }
    }
    seen.current = new Set(next.latest.map((m) => m.id));
    setState(next);
  }, []);

  const refresh = useCallback(() => load().then(apply), [load, apply]);

  useEffect(() => {
    load().then(apply);
    // در پس‌زمینه هم ادامه می‌دهد تا اعلان مرورگر برسد (مرورگر خودش تایمرهای تب پنهان را کند می‌کند)
    const timer = setInterval(() => load().then(apply), POLL_MS);
    const onFocus = () => load().then(apply);
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', onFocus);
    };
  }, [load, apply]);

  // شمارنده در عنوان تب؛ Next عنوان را با هر جابه‌جایی صفحه بازنویسی می‌کند، پس بعد از تغییر مسیر دوباره اضافه می‌شود.
  // (MutationObserver روی <head> با مدیریت عنوان خود Next رفت‌وبرگشت بی‌پایان می‌ساخت)
  useEffect(() => {
    const apply = () => {
      const base = document.title.replace(/^\(\d+\)\s*/, '');
      document.title = state.unread ? `(${state.unread}) ${base}` : base;
    };
    apply();
    const timer = setTimeout(apply, 300);
    return () => clearTimeout(timer);
  }, [state.unread, pathname]);

  const enableBrowserNotify = useCallback(async () => {
    if (typeof Notification === 'undefined') return;
    setRequested(await Notification.requestPermission());
  }, []);

  return (
    <NotificationsContext.Provider value={{ ...state, refresh, browserNotify, enableBrowserNotify }}>
      {children}
    </NotificationsContext.Provider>
  );
}
