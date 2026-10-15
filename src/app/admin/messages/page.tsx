'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Check, Loader2, Mail, MailOpen, MessageCircle, Phone, RotateCcw, Search, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn, faDigits, formatDate, safeDecode } from '@/shared/lib/utils';
import { phoneHref, whatsappFromMobile } from '@/shared/lib/site-settings';
import { useAdminNotifications } from '@/widgets/admin/AdminNotifications';
import { useConfirm } from '@/shared/ui/ConfirmDialog';

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
  /** true یعنی «پیگیری شد» (با مشتری تماس گرفته شده) */
  read: boolean;
  sourcePath?: string | null;
  createdAt: string;
};

type Filter = 'pending' | 'done' | 'all';
const FILTERS: { key: Filter; label: string }[] = [
  { key: 'pending', label: 'در انتظار تماس' },
  { key: 'done', label: 'پیگیری‌شده' },
  { key: 'all', label: 'همه' },
];

function MessagesInbox() {
  const confirm = useConfirm();

  const router = useRouter();
  const selected = useSearchParams().get('id');
  const { refresh: refreshBell } = useAdminNotifications();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('pending');
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetch('/api/contact', { cache: 'no-store' })
      .then((res) => res.json())
      .then((json) => {
        if (!alive) return;
        if (json.success) setMessages(json.data);
        else toast.error(json.error || 'بارگذاری پیام‌ها ناموفق بود');
      })
      .catch(() => alive && toast.error('خطا در ارتباط با سرور'))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const select = (id: string | null) => router.replace(id ? `/admin/messages?id=${id}` : '/admin/messages', { scroll: false });

  const pending = messages.filter((m) => !m.read).length;
  const term = search.trim();
  const filtered = messages.filter(
    (m) =>
      (filter === 'all' || (filter === 'pending' ? !m.read : m.read)) &&
      (!term || m.name.includes(term) || m.subject?.includes(term) || m.phone?.includes(term) || m.message.includes(term)),
  );
  const current = messages.find((m) => m.id === selected);

  /** باز کردن پیام دیگر آن را «پیگیری‌شده» نمی‌کند — فقط دکمه صریح، تا مشتری‌ای که هنوز تماس نگرفته‌ایم گم نشود */
  const setHandled = async (id: string, read: boolean) => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/contact/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);
      setMessages((list) => list.map((m) => (m.id === id ? { ...m, read } : m)));
      toast.success(read ? 'به پیگیری‌شده‌ها منتقل شد' : 'به «در انتظار تماس» برگشت');
      void refreshBell();
    } catch {
      toast.error('ذخیره نشد');
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id: string) => {
    if (!(await confirm({ title: 'این پیام برای همیشه حذف شود؟' }))) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/contact/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);
      toast.success('پیام حذف شد');
      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (selected === id) select(null);
      void refreshBell();
    } catch {
      toast.error('حذف ناموفق بود');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-[var(--muted-foreground)] gap-2">
        <Loader2 className="w-6 h-6 animate-spin" />
        بارگذاری پیام‌ها...
      </div>
    );
  }

  const whatsapp = current?.phone ? whatsappFromMobile(current.phone) : undefined;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">پیام‌ها و درخواست‌های مشتری</h1>
          <p className="text-[var(--muted-foreground)] text-sm mt-1 num">{faDigits(pending)} مشتری در انتظار تماس</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* فهرست — در موبایل وقتی پیامی باز است پنهان می‌شود */}
        <div className={cn('lg:col-span-2 space-y-3', current && 'hidden lg:block')}>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={cn(
                  'h-9 px-3.5 rounded-lg text-sm font-bold whitespace-nowrap',
                  filter === f.key ? 'bg-[var(--foreground)] text-[var(--background)]' : 'bg-[var(--muted)] text-[var(--muted-foreground)]',
                )}
              >
                {f.label}
                {f.key === 'pending' && pending > 0 && <span className="num"> ({faDigits(pending)})</span>}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجوی نام، شماره یا متن…"
              className="w-full h-11 bg-[var(--card)] border border-[var(--border)] rounded-xl pr-10 pl-3 placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--accent)] text-sm"
            />
          </div>

          <div className="space-y-2">
            {filtered.map((msg) => (
              <button
                key={msg.id}
                type="button"
                onClick={() => select(msg.id)}
                className={cn(
                  'w-full text-right p-4 rounded-xl border transition-colors',
                  selected === msg.id ? 'bg-[var(--accent)]/10 border-[var(--accent)]/40' : 'bg-[var(--card)] border-[var(--border)] hover:border-[var(--foreground)]/20',
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {!msg.read && <span className="w-2 h-2 rounded-full bg-red-600 flex-shrink-0" aria-label="در انتظار تماس" />}
                      <span className="text-sm font-bold truncate">{msg.name}</span>
                    </div>
                    <div className="text-xs text-[var(--muted-foreground)] mt-1 truncate">{msg.subject || 'بدون موضوع'}</div>
                  </div>
                  <div className="text-xs text-[var(--muted-foreground)] flex-shrink-0">{formatDate(msg.createdAt)}</div>
                </div>
              </button>
            ))}
            {!filtered.length && (
              <p className="py-10 text-center text-sm text-[var(--muted-foreground)]">
                {filter === 'pending' && !term ? 'همه مشتری‌ها پیگیری شده‌اند 👌' : 'پیامی پیدا نشد'}
              </p>
            )}
          </div>
        </div>

        <div className={cn('lg:col-span-3', !current && 'hidden lg:block')}>
          {current ? (
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 sm:p-6 lg:sticky lg:top-20">
              <button onClick={() => select(null)} className="lg:hidden mb-4 flex items-center gap-1.5 text-sm text-[var(--muted-foreground)]">
                <ArrowRight className="w-4 h-4" /> بازگشت به فهرست
              </button>

              <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
                <div className="min-w-0">
                  <span className={cn('inline-flex h-6 px-2 rounded-md text-[11px] font-bold items-center', current.read ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-red-500/10 text-red-700 dark:text-red-400')}>
                    {current.read ? 'پیگیری شد' : 'در انتظار تماس'}
                  </span>
                  <h2 className="mt-2 font-bold text-lg">{current.subject || 'بدون موضوع'}</h2>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                    {current.name}
                    {current.sourcePath && (
                      <>
                        {' · از صفحه '}
                        <a href={current.sourcePath} target="_blank" rel="noopener" className="underline hover:text-[var(--accent-text)]">
                          <bdi dir="ltr">{safeDecode(current.sourcePath)}</bdi>
                        </a>
                      </>
                    )}
                  </p>
                </div>
                <span className="text-xs text-[var(--muted-foreground)]">{formatDate(current.createdAt)}</span>
              </div>

              <div className="bg-[var(--muted)] rounded-xl p-4 text-sm leading-7 mb-5 whitespace-pre-line">{current.message}</div>

              {/* اقدام اصلی: تماس — در موبایل دکمه‌های بزرگ تمام‌عرض */}
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                {current.phone && (
                  <a href={phoneHref(current.phone)} className="h-12 px-4 rounded-xl bg-emerald-600 text-white text-sm font-bold flex items-center justify-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span dir="ltr" className="num">{faDigits(current.phone)}</span>
                  </a>
                )}
                {whatsapp && (
                  <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="h-12 px-4 rounded-xl bg-[#128C7E] text-white text-sm font-bold flex items-center justify-center gap-2">
                    <MessageCircle className="w-4 h-4" /> واتس‌اپ
                  </a>
                )}
                {current.email && (
                  <a href={`mailto:${current.email}`} className="h-12 px-4 rounded-xl bg-[var(--muted)] text-sm font-bold flex items-center justify-center gap-2">
                    <Mail className="w-4 h-4" /> ایمیل
                  </a>
                )}
              </div>

              <div className="mt-5 pt-5 border-t border-[var(--border)] flex flex-wrap items-center gap-2">
                {current.read ? (
                  <button disabled={busyId === current.id} onClick={() => setHandled(current.id, false)} className="h-11 px-4 rounded-xl bg-[var(--muted)] text-sm font-bold flex items-center gap-2 disabled:opacity-50">
                    <RotateCcw className="w-4 h-4" /> برگرداندن به «در انتظار تماس»
                  </button>
                ) : (
                  <button disabled={busyId === current.id} onClick={() => setHandled(current.id, true)} className="h-11 px-4 rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] text-sm font-bold flex items-center gap-2 disabled:opacity-50">
                    {busyId === current.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} پیگیری شد
                  </button>
                )}
                <button
                  type="button"
                  disabled={busyId === current.id}
                  onClick={() => remove(current.id)}
                  aria-label="حذف پیام"
                  className="mr-auto w-11 h-11 rounded-xl bg-red-500/10 text-red-700 dark:text-red-400 flex items-center justify-center hover:bg-red-500/20 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-12 flex flex-col items-center justify-center text-center">
              <MailOpen className="w-12 h-12 text-[var(--muted-foreground)] mb-3" />
              <p className="text-[var(--muted-foreground)]">یک پیام را برای مشاهده انتخاب کنید</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** useSearchParams در Next باید داخل Suspense باشد */
export default function AdminMessagesPage() {
  return (
    <Suspense fallback={null}>
      <MessagesInbox />
    </Suspense>
  );
}
