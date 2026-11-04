'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, Loader2, Download, Pencil, RefreshCw, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '@/shared/lib/utils';
import { useConfirm } from '@/shared/ui/ConfirmDialog';

type ArticleRow = {
  id: string;
  title: string;
  status: string;
  created_at: string;
  post: { slug: string; published: boolean } | null;
};

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  completed: { label: 'آماده', cls: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' },
  failed: { label: 'ناموفق', cls: 'bg-red-500/10 text-red-700 dark:text-red-400' },
  paused_credit: { label: 'توقف (کریدیت)', cls: 'bg-amber-500/10 text-amber-700 dark:text-amber-400' },
};
const IN_PROGRESS = { label: 'در حال تولید', cls: 'bg-blue-500/10 text-blue-700 dark:text-blue-400' };

/** تسک در حال اجرا در مرورگر نگه داشته می‌شود تا با رفرش صفحه پیگیری‌اش قطع نشود */
const TASK_KEY = 'youtix_task';
/** یوتیکس پیشنهاد می‌کند وضعیت هر ۳۰ ثانیه یک بار چک شود */
const POLL_MS = 30_000;

function readTask(): string | null {
  try {
    return localStorage.getItem(TASK_KEY);
  } catch {
    return null;
  }
}

function writeTask(id: string | null) {
  try {
    if (id) localStorage.setItem(TASK_KEY, id);
    else localStorage.removeItem(TASK_KEY);
  } catch {
    // ذخیره نشد — فقط پیگیری بعد از رفرش از دست می‌رود
  }
}

type ListResult =
  | { ok: true; configured: boolean; articles: ArticleRow[] }
  | { ok: false; error: string };

async function fetchArticles(): Promise<ListResult> {
  try {
    const res = await fetch('/api/admin/youtix');
    const json = await res.json();
    if (json.success) return { ok: true, configured: json.data.configured, articles: json.data.articles };
    return { ok: false, error: json.error || 'بارگذاری مقالات یوتیکس ناموفق بود' };
  } catch {
    return { ok: false, error: 'خطا در ارتباط با سرور' };
  }
}

export default function AdminYoutixPage() {
  const router = useRouter();
  const confirm = useConfirm();

  const [configured, setConfigured] = useState(true);
  const [articles, setArticles] = useState<ArticleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [importing, setImporting] = useState<string | null>(null);

  const applyArticles = useCallback((result: ListResult) => {
    if (result.ok) {
      setConfigured(result.configured);
      setArticles(result.articles);
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  }, []);

  const loadArticles = useCallback(() => {
    setLoading(true);
    fetchArticles().then(applyArticles);
  }, [applyArticles]);

  useEffect(() => {
    fetchArticles().then((result) => {
      applyArticles(result);
      setTaskId(readTask());
    });
  }, [applyArticles]);

  useEffect(() => {
    if (!taskId) return;
    const check = async () => {
      try {
        const res = await fetch(`/api/admin/youtix/tasks/${encodeURIComponent(taskId)}`);
        const json = await res.json();
        if (!json.success) return;
        if (json.data.status === 'completed') {
          toast.success('مقاله جدید در یوتیکس آماده شد');
        } else if (json.data.status === 'failed') {
          toast.error(json.data.error || 'تولید مقاله در یوتیکس ناموفق بود');
        } else {
          return;
        }
        writeTask(null);
        setTaskId(null);
        loadArticles();
      } catch {
        // خطای شبکه — دور بعد دوباره چک می‌شود
      }
    };
    const timer = setInterval(check, POLL_MS);
    return () => clearInterval(timer);
  }, [taskId, loadArticles]);

  const handleGenerate = async () => {
    if (!(await confirm({ title: 'مقاله جدید در یوتیکس تولید شود؟ (از کریدیت اشتراک کم می‌شود)' }))) return;
    setCreating(true);
    try {
      const res = await fetch('/api/admin/youtix/tasks', { method: 'POST' });
      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error || 'شروع تولید مقاله ناموفق بود');
        return;
      }
      writeTask(json.data.id);
      setTaskId(json.data.id);
      toast.success('تولید مقاله شروع شد — چند دقیقه طول می‌کشد');
    } catch {
      toast.error('خطا در ارتباط با سرور');
    } finally {
      setCreating(false);
    }
  };

  const handleImport = async (article: ArticleRow) => {
    setImporting(article.id);
    try {
      const res = await fetch('/api/admin/youtix/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: article.id }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error || 'وارد کردن مقاله ناموفق بود');
        if (res.status === 409) loadArticles();
        return;
      }
      toast.success('مقاله به‌صورت پیش‌نویس وارد شد — بازبینی و منتشر کنید');
      router.push(`/admin/blog/${encodeURIComponent(json.data.slug)}/edit`);
    } catch {
      toast.error('خطا در ارتباط با سرور');
    } finally {
      setImporting(null);
    }
  };

  if (!loading && !configured) {
    return (
      <div className="max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">یوتیکس</h1>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 space-y-3 text-sm text-[var(--muted-foreground)] leading-7">
          <div className="flex items-center gap-2 text-[var(--foreground)] font-bold">
            <KeyRound className="w-5 h-5 text-[var(--accent-text)]" />
            اتصال یوتیکس تنظیم نشده است
          </div>
          <p>
            در پنل یوتیکس از بخش «مستندات API» یک کلید بسازید و آن را با نام{' '}
            <code dir="ltr" className="px-1.5 py-0.5 rounded bg-[var(--muted)] text-[var(--foreground)]">YOUTIX_API_KEY</code>{' '}
            در متغیرهای محیطی سرور قرار دهید و سرویس را دوباره راه‌اندازی کنید.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">یوتیکس</h1>
          <p className="text-[var(--muted-foreground)] text-sm mt-1">
            مقاله‌های تولیدشده در یوتیکس را به‌صورت پیش‌نویس به وبلاگ وارد کنید
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadArticles}
            disabled={loading}
            title="بارگذاری دوباره"
            className="w-10 h-10 rounded-xl bg-[var(--muted)] flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={creating || Boolean(taskId)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] font-semibold hover:bg-[var(--accent)]/90 transition-colors text-sm disabled:opacity-50"
          >
            {creating || taskId ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {taskId ? 'در حال تولید مقاله...' : 'تولید مقاله جدید'}
          </button>
        </div>
      </div>

      {taskId && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl px-5 py-4 text-sm text-blue-700 dark:text-blue-400">
          یوتیکس در حال نوشتن مقاله است. وضعیت هر ۳۰ ثانیه چک می‌شود و بعد از آماده شدن در لیست زیر می‌آید.
        </div>
      )}

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-[var(--muted-foreground)] gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            بارگذاری مقالات یوتیکس...
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-16 text-[var(--muted-foreground)]">هنوز مقاله‌ای در یوتیکس ساخته نشده است.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[40rem] text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)] text-right">
                  <th className="px-6 py-4 font-medium">عنوان</th>
                  <th className="px-6 py-4 font-medium">تاریخ</th>
                  <th className="px-6 py-4 font-medium">وضعیت یوتیکس</th>
                  <th className="px-6 py-4 font-medium">وبلاگ سایت</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article) => {
                  const status = STATUS_LABELS[article.status] ?? IN_PROGRESS;
                  return (
                    <tr key={article.id} className="border-b border-[var(--border)]/50 hover:bg-[var(--muted)]/30 transition-colors">
                      <td className="px-6 py-4 text-[var(--foreground)] font-medium">{article.title}</td>
                      <td className="px-6 py-4 text-[var(--muted-foreground)] whitespace-nowrap">{formatDate(article.created_at)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${status.cls}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {article.post ? (
                          <Link
                            href={`/admin/blog/${encodeURIComponent(article.post.slug)}/edit`}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--accent-text)] hover:underline whitespace-nowrap"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            {article.post.published ? 'منتشر شده' : 'پیش‌نویس'} — ویرایش
                          </Link>
                        ) : article.status === 'completed' ? (
                          <button
                            type="button"
                            onClick={() => handleImport(article)}
                            disabled={importing !== null}
                            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold hover:bg-emerald-500/25 transition-colors disabled:opacity-50 whitespace-nowrap"
                          >
                            {importing === article.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                            ورود به وبلاگ
                          </button>
                        ) : (
                          <span className="text-xs text-[var(--muted-foreground)]">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
