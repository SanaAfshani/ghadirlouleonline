'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, Loader2, Download, Pencil, RefreshCw, KeyRound, FileText, Lightbulb } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate, formatPersianNumber } from '@/shared/lib/utils';
import { useConfirm } from '@/shared/ui/ConfirmDialog';
import type { YoutixProductArticleRow, YoutixProductIdeas } from '@/shared/lib/youtix';

type ArticleRow = YoutixProductArticleRow & { post: { slug: string; published: boolean } | null };

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  completed: { label: 'آماده', cls: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' },
  failed: { label: 'ناموفق', cls: 'bg-red-500/10 text-red-700 dark:text-red-400' },
  paused_credit: { label: 'توقف (کریدیت)', cls: 'bg-amber-500/10 text-amber-700 dark:text-amber-400' },
};
const IN_PROGRESS = { label: 'در حال تولید', cls: 'bg-blue-500/10 text-blue-700 dark:text-blue-400' };
const DONE = new Set(['completed', 'failed', 'paused_credit']);
/** وضعیت دسته ایده‌ها؛ بقیه یعنی یوتیکس هنوز در حال ساخت است */
const IDEAS_DONE = new Set(['done', 'completed', 'failed']);

const STYLE_LABELS: Record<string, string> = {
  price: 'قیمت و خرید',
  comparison: 'مقایسه',
  buying_guide: 'راهنمای خرید',
};

/** یوتیکس پیشنهاد می‌کند وضعیت هر ۳۰ ثانیه یک بار چک شود */
const POLL_MS = 30_000;

type ListResult =
  | { ok: true; configured: boolean; ideas: YoutixProductIdeas | null; articles: ArticleRow[] }
  | { ok: false; error: string };

async function fetchList(): Promise<ListResult> {
  try {
    const res = await fetch('/api/admin/youtix/products');
    const json = await res.json();
    if (json.success) return { ok: true, ...json.data };
    return { ok: false, error: json.error || 'بارگذاری سئوی محصولات یوتیکس ناموفق بود' };
  } catch {
    return { ok: false, error: 'خطا در ارتباط با سرور' };
  }
}

export default function AdminYoutixProductsPage() {
  const router = useRouter();
  const confirm = useConfirm();

  const [configured, setConfigured] = useState(true);
  const [ideas, setIdeas] = useState<YoutixProductIdeas | null>(null);
  const [articles, setArticles] = useState<ArticleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [prompt, setPrompt] = useState('');
  const [busy, setBusy] = useState<string | null>(null);

  const apply = useCallback((result: ListResult) => {
    if (result.ok) {
      setConfigured(result.configured);
      setIdeas(result.ideas);
      setArticles(result.articles);
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    fetchList().then(apply);
  }, [apply]);

  useEffect(() => {
    fetchList().then(apply);
  }, [apply]);

  // تا وقتی ایده یا مقاله‌ای در حال ساخت است، وضعیت بی‌صدا تازه می‌شود
  const pending = Boolean(ideas && !IDEAS_DONE.has(ideas.status)) || articles.some((a) => !DONE.has(a.status));
  useEffect(() => {
    if (!pending) return;
    const timer = setInterval(() => fetchList().then(apply), POLL_MS);
    return () => clearInterval(timer);
  }, [pending, apply]);

  const post = async (url: string, body: unknown, success: string, failure: string) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      toast.error(json.error || failure);
      return null;
    }
    toast.success(success);
    return json.data;
  };

  const handleIdeas = async () => {
    if (!(await confirm({ title: 'ایده‌های تازه مقاله محصول در یوتیکس ساخته شود؟ (از کریدیت اشتراک کم می‌شود)' }))) return;
    setBusy('ideas');
    try {
      if (await post('/api/admin/youtix/products/ideas', { prompt }, 'ساخت ایده‌ها شروع شد — چند دقیقه طول می‌کشد', 'ساخت ایده ناموفق بود')) {
        setPrompt('');
        load();
      }
    } catch {
      toast.error('خطا در ارتباط با سرور');
    } finally {
      setBusy(null);
    }
  };

  const handleArticle = async (ideaId: string) => {
    if (!(await confirm({ title: 'از این ایده مقاله نوشته شود؟ (از کریدیت اشتراک کم می‌شود)' }))) return;
    setBusy(ideaId);
    try {
      const url = `/api/admin/youtix/products/ideas/${encodeURIComponent(ideaId)}/article`;
      if (await post(url, {}, 'نوشتن مقاله شروع شد — بعد از آماده شدن در جدول پایین می‌آید', 'شروع نوشتن مقاله ناموفق بود')) load();
    } catch {
      toast.error('خطا در ارتباط با سرور');
    } finally {
      setBusy(null);
    }
  };

  const handleImport = async (article: ArticleRow) => {
    setBusy(article.id);
    try {
      const res = await fetch('/api/admin/youtix/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: article.id, kind: 'product' }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error || 'وارد کردن مقاله ناموفق بود');
        if (res.status === 409) load();
        return;
      }
      toast.success('مقاله به‌صورت پیش‌نویس وارد شد — بازبینی و منتشر کنید');
      router.push(`/admin/blog/${encodeURIComponent(json.data.slug)}/edit`);
    } catch {
      toast.error('خطا در ارتباط با سرور');
    } finally {
      setBusy(null);
    }
  };

  if (!loading && !configured) {
    return (
      <div className="max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">سئوی محصولات یوتیکس</h1>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 space-y-3 text-sm text-[var(--muted-foreground)] leading-7">
          <div className="flex items-center gap-2 text-[var(--foreground)] font-bold">
            <KeyRound className="w-5 h-5 text-[var(--accent-text)]" />
            اتصال یوتیکس تنظیم نشده است
          </div>
          <p>
            در یوتیکس سایتی را که محصولات را دارد انتخاب کنید، از «مستندات API» برایش کلید بسازید و آن را با نام{' '}
            <code dir="ltr" className="px-1.5 py-0.5 rounded bg-[var(--muted)] text-[var(--foreground)]">YOUTIX_PRODUCT_API_KEY</code>{' '}
            در متغیرهای محیطی سرور قرار دهید و سرویس را دوباره راه‌اندازی کنید.
          </p>
        </div>
      </div>
    );
  }

  const ideasBusy = Boolean(ideas && !IDEAS_DONE.has(ideas.status));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">سئوی محصولات یوتیکس</h1>
          <p className="text-[var(--muted-foreground)] text-sm mt-1">
            یوتیکس برای محصولات سایت ایده مقاله می‌سازد و از هر ایده مقاله‌ای با لینک به همان محصولات می‌نویسد؛ مقاله
            به‌صورت پیش‌نویس به وبلاگ وارد می‌شود.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/youtix"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--muted)] text-[var(--foreground)] text-sm hover:bg-[var(--muted)]/70 transition-colors"
          >
            <FileText className="w-4 h-4" />
            مقاله‌های وبلاگ
          </Link>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            title="بارگذاری دوباره"
            className="w-10 h-10 rounded-xl bg-[var(--muted)] flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 space-y-3">
        <label htmlFor="youtix-prompt" className="block text-sm font-medium text-[var(--foreground)]">
          چه مقاله‌ای می‌خواهید؟ <span className="text-[var(--muted-foreground)] font-normal">(خالی بگذارید تا یوتیکس خودش پیشنهاد بدهد)</span>
        </label>
        <textarea
          id="youtix-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          maxLength={500}
          rows={2}
          placeholder="مثلاً: مقایسه سایزهای پرفروش لوله کاروگیت برای فاضلاب شهری"
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40"
        />
        <div className="flex flex-wrap items-center justify-end gap-3">
          {/* فقط نمایش؛ یوتیکس گاهی وضعیت دسته را بعد از آماده شدن ایده‌ها هم «در حال ساخت» نگه می‌دارد */}
          {ideasBusy && (
            <span className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              یوتیکس هنوز در حال ساخت ایده‌هاست
            </span>
          )}
          <button
            type="button"
            onClick={handleIdeas}
            disabled={busy !== null}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] font-semibold hover:bg-[var(--accent)]/90 transition-colors text-sm disabled:opacity-50"
          >
            {busy === 'ideas' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            تولید ایده
          </button>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-lg font-bold text-[var(--foreground)]">
          <Lightbulb className="w-5 h-5 text-[var(--accent-text)]" />
          ایده‌ها
        </h2>
        {loading ? (
          <div className="flex items-center justify-center py-10 text-[var(--muted-foreground)] gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            بارگذاری...
          </div>
        ) : !ideas?.data.length ? (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl text-center py-10 text-sm text-[var(--muted-foreground)]">
            {ideasBusy ? 'یوتیکس در حال ساخت ایده‌هاست؛ وضعیت هر ۳۰ ثانیه چک می‌شود.' : 'هنوز ایده‌ای ساخته نشده است.'}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {ideas.data.map((idea) => (
              <div key={idea.id} className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 flex flex-col gap-3">
                {idea.content_style && (
                  <span className="self-start px-2.5 py-1 rounded-full text-xs bg-[var(--muted)] text-[var(--muted-foreground)]">
                    {STYLE_LABELS[idea.content_style] ?? idea.content_style}
                  </span>
                )}
                <h3 className="font-bold text-[var(--foreground)] leading-7">{idea.title}</h3>
                <ul className="text-sm text-[var(--muted-foreground)] space-y-1 flex-1">
                  {idea.products.map((product) => (
                    <li key={product.id}>{product.name}</li>
                  ))}
                </ul>
                {idea.article_id ? (
                  <span className={`self-start inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${(STATUS_LABELS[idea.article_status ?? ''] ?? IN_PROGRESS).cls}`}>
                    مقاله: {(STATUS_LABELS[idea.article_status ?? ''] ?? IN_PROGRESS).label}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleArticle(idea.id)}
                    disabled={busy !== null}
                    className="inline-flex items-center justify-center gap-1.5 h-9 rounded-xl bg-[var(--accent)]/15 border border-[var(--accent)]/30 text-[var(--accent-text)] text-sm font-semibold hover:bg-[var(--accent)]/25 transition-colors disabled:opacity-50"
                  >
                    {busy === idea.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    تولید مقاله
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-lg font-bold text-[var(--foreground)]">
          <FileText className="w-5 h-5 text-[var(--accent-text)]" />
          مقاله‌های محصول
          {articles.length > 0 && (
            <span className="text-sm font-normal text-[var(--muted-foreground)]">({formatPersianNumber(articles.length)})</span>
          )}
        </h2>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
          {loading ? null : articles.length === 0 ? (
            <div className="text-center py-10 text-sm text-[var(--muted-foreground)]">هنوز مقاله محصولی نوشته نشده است.</div>
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
                        <td className="px-6 py-4 text-[var(--foreground)] font-medium">
                          {article.title}
                          {article.status === 'failed' && article.error_message && (
                            <p className="mt-1 text-xs font-normal text-red-700 dark:text-red-400">{article.error_message}</p>
                          )}
                        </td>
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
                              disabled={busy !== null}
                              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold hover:bg-emerald-500/25 transition-colors disabled:opacity-50 whitespace-nowrap"
                            >
                              {busy === article.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
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
      </section>
    </div>
  );
}
