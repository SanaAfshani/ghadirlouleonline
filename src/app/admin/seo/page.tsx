'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  AlertTriangle, ArrowLeftRight, CheckCircle2, ExternalLink, Gauge, Loader2, Pencil, Plus, RefreshCw,
  Settings2, Sparkles, Trash2, Wand2, XCircle,
} from 'lucide-react';
import { HtmlContentEditor } from '@/features/admin/editor/HtmlContentEditor';
import type { AuditItem, AuditType, Fix } from '@/shared/lib/seo-audit';
import { formatPersianNumber } from '@/shared/lib/utils';

type Tab = 'overview' | 'pages' | 'redirects' | 'settings';
type Redirect = { id: string; fromPath: string; toPath: string; createdAt: string };

const TYPE_LABEL: Record<AuditType, string> = { product: 'محصول', category: 'دسته', blog: 'مقاله', project: 'پروژه' };
const FIELD_LABEL: Record<string, string> = {
  metaDescription: 'توضیحات متا', metaTitle: 'عنوان سئو', focusKeyword: 'کلمه کلیدی', description: 'توضیحات', slug: 'آدرس',
  excerpt: 'خلاصه',
};

const card = 'bg-[var(--card)] border border-[var(--border)] rounded-2xl';
const input = 'w-full h-11 bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--accent)]';

function scoreColor(n: number) {
  return n >= 80 ? 'text-emerald-700 dark:text-emerald-400' : n >= 55 ? 'text-[var(--accent-text)]' : 'text-red-700 dark:text-red-400';
}

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, headers: { 'Content-Type': 'application/json', ...init?.headers } });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.success) throw new Error(json.error || 'خطا در ارتباط با سرور');
  return json.data as T;
}

export default function SeoCenterPage() {
  const [tab, setTab] = useState<Tab>('overview');
  const [audit, setAudit] = useState<{ items: AuditItem[]; summary: Record<string, number> } | null>(null);
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<Fix[] | null>(null);
  const [fixing, setFixing] = useState(false);
  const [typeFilter, setTypeFilter] = useState<AuditType | 'all'>('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setAudit(await api('/api/seo/audit'));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'بررسی ناموفق بود');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // بارگذاری اولیه — setState داخل then اجرا می‌شود، نه مستقیم در effect
    let alive = true;
    api<{ items: AuditItem[]; summary: Record<string, number> }>('/api/seo/audit')
      .then((d) => alive && setAudit(d))
      .catch((e) => toast.error(e instanceof Error ? e.message : 'بررسی ناموفق بود'))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const previewFix = async () => {
    setFixing(true);
    try {
      const d = await api<{ fixes: Fix[] }>('/api/seo/autofix', { method: 'POST', body: JSON.stringify({ dryRun: true }) });
      setPlan(d.fixes);
      if (!d.fixes.length) toast.success('چیزی برای اصلاح خودکار نمانده');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'خطا');
    } finally {
      setFixing(false);
    }
  };

  const applyFix = async () => {
    setFixing(true);
    try {
      const d = await api<{ fixes: Fix[] }>('/api/seo/autofix', { method: 'POST', body: JSON.stringify({ dryRun: false }) });
      toast.success(`${formatPersianNumber(d.fixes.length)} مورد اصلاح شد`);
      setPlan(null);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'خطا');
    } finally {
      setFixing(false);
    }
  };

  const items = useMemo(() => (audit?.items ?? []).filter((i) => typeFilter === 'all' || i.type === typeFilter), [audit, typeFilter]);
  const issueCounts = useMemo(() => {
    const m = new Map<string, { message: string; n: number; level: string }>();
    for (const it of audit?.items ?? []) for (const is of it.issues) {
      const cur = m.get(is.code + is.message) ?? { message: is.message, n: 0, level: is.level };
      cur.n++;
      m.set(is.code + is.message, cur);
    }
    return [...m.values()].sort((a, b) => b.n - a.n);
  }, [audit]);

  const TABS: { key: Tab; label: string; icon: typeof Gauge }[] = [
    { key: 'overview', label: 'نمای کلی', icon: Gauge },
    { key: 'pages', label: 'بررسی صفحات', icon: CheckCircle2 },
    { key: 'redirects', label: 'ریدایرکت‌ها', icon: ArrowLeftRight },
    { key: 'settings', label: 'تنظیمات سئو', icon: Settings2 },
  ];

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">مرکز سئو</h1>
          <p className="text-[var(--muted-foreground)] text-sm">بررسی خودکار همه صفحات، اصلاح یک‌کلیکی و مدیریت آدرس‌ها</p>
        </div>
        <button onClick={load} disabled={loading} className="h-10 px-4 rounded-xl bg-[var(--muted)] text-[var(--foreground)] text-sm flex items-center gap-2 hover:text-[var(--foreground)] disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> بررسی مجدد
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)} className={`h-10 px-4 rounded-xl text-sm font-bold flex items-center gap-2 whitespace-nowrap ${tab === key ? 'bg-[var(--accent)] text-[var(--accent-foreground)]' : 'bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] hover:text-white'}`}>
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-6">
          {loading && !audit ? (
            <div className="flex items-center justify-center py-20 text-[var(--muted-foreground)] gap-2"><Loader2 className="w-6 h-6 animate-spin" />در حال بررسی همه صفحات…</div>
          ) : audit && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className={`${card} p-5`}>
                  <p className="text-xs text-[var(--muted-foreground)]">امتیاز میانگین سئو</p>
                  <p className={`mt-2 text-4xl font-black ${scoreColor(audit.summary.average)}`}>{formatPersianNumber(audit.summary.average)}</p>
                </div>
                <div className={`${card} p-5`}><p className="text-xs text-[var(--muted-foreground)]">صفحات بررسی‌شده</p><p className="mt-2 text-4xl font-black text-[var(--foreground)]">{formatPersianNumber(audit.summary.pages)}</p></div>
                <div className={`${card} p-5`}><p className="text-xs text-[var(--muted-foreground)]">خطا</p><p className="mt-2 text-4xl font-black text-red-700 dark:text-red-400">{formatPersianNumber(audit.summary.errors)}</p></div>
                <div className={`${card} p-5`}><p className="text-xs text-[var(--muted-foreground)]">هشدار</p><p className="mt-2 text-4xl font-black text-[var(--accent-text)]">{formatPersianNumber(audit.summary.warnings)}</p></div>
              </div>

              <div className={`${card} p-6 bg-gradient-to-l from-[var(--accent)]/10 to-transparent border-[var(--accent)]/30`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="grid place-items-center w-11 h-11 rounded-xl bg-[var(--accent)]/20 text-[var(--accent-text)] shrink-0"><Wand2 className="w-5 h-5" /></span>
                    <div>
                      <h2 className="text-[var(--foreground)] font-bold">بهینه‌سازی خودکار</h2>
                      <p className="text-[var(--muted-foreground)] text-sm mt-1 leading-6">
                        توضیحات متا و خلاصه خالی (از جمله برای مقاله‌هایی که فقط PDF دارند)، کلمه کلیدی، عنوان‌های بلند و آدرس‌های غیرانگلیسی را خودکار می‌سازد.
                        فقط فیلدهای خالی پر می‌شوند و چیزی که خودتان نوشته‌اید دست نمی‌خورد. قبل از اعمال، فهرست تغییرات را می‌بینید.
                      </p>
                    </div>
                  </div>
                  <button onClick={previewFix} disabled={fixing} className="h-11 px-5 rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] font-bold flex items-center justify-center gap-2 shrink-0 disabled:opacity-50">
                    {fixing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} پیش‌نمایش تغییرات
                  </button>
                </div>

                {plan && plan.length > 0 && (
                  <div className="mt-5 border-t border-[var(--border)] pt-5">
                    <p className="text-sm text-[var(--foreground)] mb-3">{formatPersianNumber(plan.length)} تغییر آماده اعمال است:</p>
                    <div className="max-h-80 overflow-y-auto space-y-2">
                      {plan.map((f, i) => (
                        <div key={i} className="rounded-xl bg-[var(--muted)]/60 p-3 text-sm">
                          <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                            <span className="px-2 py-0.5 rounded bg-[var(--border)] text-[var(--foreground)]">{TYPE_LABEL[f.type]}</span>
                            <span className="font-bold text-[var(--foreground)]">{f.name}</span>
                            <span>←</span>
                            <span className="text-[var(--accent-text)]">{FIELD_LABEL[f.field] ?? f.field}</span>
                          </div>
                          {f.before && <p className="mt-1.5 text-xs text-red-300/80 line-through" dir="auto">{f.before}</p>}
                          <p className="mt-1.5 text-[var(--foreground)] leading-6" dir="auto">{f.after}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button onClick={applyFix} disabled={fixing} className="h-11 px-5 rounded-xl bg-emerald-500 text-black font-bold flex items-center gap-2 disabled:opacity-50">
                        {fixing && <Loader2 className="w-4 h-4 animate-spin" />} اعمال همه تغییرات
                      </button>
                      <button onClick={() => setPlan(null)} className="h-11 px-5 rounded-xl bg-[var(--muted)] text-[var(--foreground)]">انصراف</button>
                    </div>
                  </div>
                )}
              </div>

              <div className={`${card} p-6`}>
                <h2 className="text-[var(--foreground)] font-bold mb-4">مشکلات پرتکرار</h2>
                {issueCounts.length === 0 ? (
                  <p className="text-emerald-700 dark:text-emerald-400 text-sm flex items-center gap-2"><CheckCircle2 className="w-4 h-4" />مشکلی پیدا نشد</p>
                ) : (
                  <ul className="space-y-2">
                    {issueCounts.map((c) => (
                      <li key={c.message} className="flex items-center justify-between gap-3 text-sm">
                        <span className="flex items-center gap-2 text-[var(--foreground)]">
                          {c.level === 'error' ? <XCircle className="w-4 h-4 text-red-700 dark:text-red-400" /> : <AlertTriangle className="w-4 h-4 text-[var(--accent-text)]" />}
                          {c.message}
                        </span>
                        <span className="text-[var(--muted-foreground)]">{formatPersianNumber(c.n)} صفحه</span>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="mt-4 text-xs text-[var(--muted-foreground)] leading-6">
                  مواردی مثل «جدول قیمت ندارد»، «تصویر ندارد» یا «محتوا کم است» خودکار قابل اصلاح نیستند و باید از صفحه ویرایش همان مورد تکمیل شوند.
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {tab === 'pages' && (
        <div className="space-y-4">
          <div className="flex gap-2 overflow-x-auto">
            {(['all', 'product', 'category', 'blog', 'project'] as const).map((t) => (
              <button key={t} onClick={() => setTypeFilter(t)} className={`h-9 px-4 rounded-full text-sm whitespace-nowrap ${typeFilter === t ? 'bg-[var(--foreground)] text-[var(--background)] font-bold' : 'bg-[var(--card)] border border-[var(--border)] text-[var(--muted-foreground)]'}`}>
                {t === 'all' ? 'همه' : TYPE_LABEL[t]}
              </button>
            ))}
          </div>
          <div className={`${card} divide-y divide-[var(--border)]`}>
            {items.map((it) => (
              <div key={`${it.type}-${it.id}`} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className={`w-14 shrink-0 text-2xl font-black ${scoreColor(it.score)}`}>{formatPersianNumber(it.score)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] px-2 py-0.5 rounded bg-[var(--muted)] text-[var(--foreground)]">{TYPE_LABEL[it.type]}</span>
                    <span className="font-bold text-[var(--foreground)] truncate">{it.name}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {it.issues.length === 0 && <span className="text-xs text-emerald-700 dark:text-emerald-400">بدون مشکل</span>}
                    {it.issues.map((is, i) => (
                      <span key={i} className={`text-[11px] px-2 py-0.5 rounded-md ${is.level === 'error' ? 'bg-red-500/15 text-red-700 dark:text-red-300' : 'bg-[var(--accent)]/10 text-[var(--accent-text)]'}`}>{is.message}</span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <a href={it.url} target="_blank" rel="noopener" className="h-9 px-3 rounded-lg bg-[var(--muted)] text-[var(--foreground)] text-xs flex items-center gap-1.5 hover:text-[var(--foreground)]"><ExternalLink className="w-3.5 h-3.5" />مشاهده</a>
                  <Link href={it.adminUrl} className="h-9 px-3 rounded-lg bg-[var(--muted)] text-[var(--foreground)] text-xs flex items-center gap-1.5 hover:text-[var(--foreground)]"><Pencil className="w-3.5 h-3.5" />ویرایش</Link>
                </div>
              </div>
            ))}
            {!items.length && <p className="p-8 text-center text-[var(--muted-foreground)] text-sm">{loading ? 'در حال بررسی…' : 'موردی نیست'}</p>}
          </div>
        </div>
      )}

      {tab === 'redirects' && <RedirectsTab />}
      {tab === 'settings' && <SettingsTab />}
    </div>
  );
}

function RedirectsTab() {
  const [rows, setRows] = useState<Redirect[] | null>(null);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [busy, setBusy] = useState(false);

  const refresh = () => api<Redirect[]>('/api/redirects').then(setRows).catch((e) => toast.error(e.message));
  useEffect(() => {
    let alive = true;
    api<Redirect[]>('/api/redirects').then((d) => alive && setRows(d)).catch((e) => toast.error(e.message));
    return () => {
      alive = false;
    };
  }, []);

  const addRow = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api('/api/redirects', { method: 'POST', body: JSON.stringify({ fromPath: from, toPath: to }) });
      setFrom('');
      setTo('');
      toast.success('ریدایرکت ثبت شد');
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'خطا');
    } finally {
      setBusy(false);
    }
  };

  const del = async (id: string) => {
    await api(`/api/redirects?id=${id}`, { method: 'DELETE' }).catch((e) => toast.error(e.message));
    await refresh();
  };

  return (
    <div className="space-y-4">
      <div className={`${card} p-5`}>
        <p className="text-sm text-[var(--muted-foreground)] leading-7">
          وقتی آدرس یک صفحه عوض می‌شود، آدرس قبلی اینجا ثبت می‌شود تا لینک‌های قدیمی و رتبه گوگل از بین نرود (ریدایرکت دائمی).
          تغییر اسلاگ در پنل خودکار ثبت می‌شود؛ برای آدرس‌های دیگر (مثلاً صفحات سایت قبلی) دستی اضافه کنید.
        </p>
        <form onSubmit={addRow} className="mt-4 grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2">
          <input className={input} dir="ltr" placeholder="/old-page" value={from} onChange={(e) => setFrom(e.target.value)} />
          <input className={input} dir="ltr" placeholder="/new-page" value={to} onChange={(e) => setTo(e.target.value)} />
          <button disabled={busy || !from || !to} className="h-11 px-5 rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] font-bold flex items-center justify-center gap-2 disabled:opacity-50"><Plus className="w-4 h-4" />افزودن</button>
        </form>
      </div>
      <div className={`${card} divide-y divide-[var(--border)]`}>
        {rows === null && <p className="p-6 text-center text-[var(--muted-foreground)] text-sm">در حال بارگذاری…</p>}
        {rows?.length === 0 && <p className="p-6 text-center text-[var(--muted-foreground)] text-sm">ریدایرکتی ثبت نشده</p>}
        {rows?.map((r) => (
          <div key={r.id} className="p-4 flex items-center gap-3 text-sm">
            <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-1 sm:gap-3 items-center" dir="ltr">
              <span className="truncate text-red-300/90">{r.fromPath}</span>
              <span className="text-[var(--muted-foreground)] hidden sm:inline">→</span>
              <span className="truncate text-emerald-700 dark:text-emerald-300">{r.toPath}</span>
            </div>
            <button onClick={() => del(r.id)} aria-label="حذف" className="w-9 h-9 grid place-items-center rounded-lg text-[var(--muted-foreground)] hover:text-red-700 dark:hover:text-red-400 hover:bg-red-500/10 shrink-0"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsTab() {
  const [verification, setVerification] = useState('');
  const [homeContent, setHomeContent] = useState('');
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    api<Record<string, string>>('/api/seo/settings')
      .then((d) => {
        if (!alive) return;
        setVerification(d.google_site_verification ?? '');
        setHomeContent(d.home_seo_content ?? '');
      })
      .catch((e) => toast.error(e.message))
      .finally(() => alive && setReady(true));
    return () => {
      alive = false;
    };
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await api('/api/seo/settings', { method: 'PUT', body: JSON.stringify({ google_site_verification: verification, home_seo_content: homeContent }) });
      toast.success('ذخیره شد');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'خطا');
    } finally {
      setSaving(false);
    }
  };

  if (!ready) return <div className="py-16 text-center text-[var(--muted-foreground)]"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>;

  return (
    <div className="space-y-4">
      <div className={`${card} p-5 space-y-3`}>
        <h2 className="text-[var(--foreground)] font-bold">اتصال به Google Search Console</h2>
        <p className="text-sm text-[var(--muted-foreground)] leading-7">
          در Search Console روش تایید «HTML tag» را انتخاب کنید و تگ یا فقط مقدار content را اینجا پیست کنید. بعد از ذخیره، دکمه Verify را در گوگل بزنید و نقشه سایت زیر را ثبت کنید.
        </p>
        <input className={input} dir="ltr" placeholder='<meta name="google-site-verification" content="..." />' value={verification} onChange={(e) => setVerification(e.target.value)} />
        <div className="flex flex-wrap gap-2 text-xs">
          <a href="/sitemap.xml" target="_blank" className="h-9 px-3 rounded-lg bg-[var(--muted)] text-[var(--foreground)] flex items-center gap-1.5 hover:text-[var(--foreground)]" dir="ltr"><ExternalLink className="w-3.5 h-3.5" />/sitemap.xml</a>
          <a href="/robots.txt" target="_blank" className="h-9 px-3 rounded-lg bg-[var(--muted)] text-[var(--foreground)] flex items-center gap-1.5 hover:text-[var(--foreground)]" dir="ltr"><ExternalLink className="w-3.5 h-3.5" />/robots.txt</a>
        </div>
      </div>

      <div className={`${card} p-5`}>
        <h2 className="text-[var(--foreground)] font-bold mb-1">متن سئوی صفحه اصلی</h2>
        <p className="text-sm text-[var(--muted-foreground)] mb-4 leading-7">متن پایین صفحه اصلی (با «ادامه مطلب»). خالی بگذارید تا نمایش داده نشود.</p>
        <HtmlContentEditor value={homeContent} onChange={setHomeContent} rows={12} />
      </div>

      <button onClick={save} disabled={saving} className="h-12 px-8 rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] font-bold flex items-center gap-2 disabled:opacity-50">
        {saving && <Loader2 className="w-4 h-4 animate-spin" />} ذخیره تنظیمات سئو
      </button>
    </div>
  );
}
