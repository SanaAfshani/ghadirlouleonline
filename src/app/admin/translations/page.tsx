'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { CheckCircle2, Download, Languages, Loader2, Sparkles, Square, Upload } from 'lucide-react';
import { IconTile } from '@/shared/ui/IconTile';
import { Skeleton } from '@/shared/ui/Skeleton';
import { cn, faDigits } from '@/shared/lib/utils';
import type { TargetCoverage } from '@/shared/lib/bulk-translate';

const card = 'bg-[var(--card)] border border-[var(--border)] rounded-2xl';

async function fetchCoverage(): Promise<{ coverage: TargetCoverage[]; auto: boolean }> {
  const res = await fetch('/api/admin/translations');
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.success) throw new Error(j.error || 'بارگذاری نشد');
  return { coverage: j.data, auto: Boolean(j.auto) };
}

/**
 * پوشش ترجمه انگلیسی کل سایت و ترجمه گروهی: هر بخش دور به دور (هر دور یک درخواست کوتاه) ترجمه می‌شود
 * تا وقتی چیزی نماند؛ فقط جاهای خالی — ترجمه‌های دستی بازنویسی نمی‌شوند.
 */
export default function AdminTranslationsPage() {
  const [coverage, setCoverage] = useState<TargetCoverage[] | null>(null);
  const [running, setRunning] = useState<string | null>(null);
  const [error, setError] = useState('');
  const stop = useRef(false);

  const [auto, setAuto] = useState<boolean | null>(null);
  const apply = useCallback((r: { coverage: TargetCoverage[]; auto: boolean }) => {
    setCoverage(r.coverage);
    setAuto(r.auto);
  }, []);
  const load = useCallback(async () => apply(await fetchCoverage()), [apply]);

  useEffect(() => {
    fetchCoverage()
      .then(apply)
      .catch((e) => setError(e instanceof Error ? e.message : 'بارگذاری نشد'));
  }, [apply]);

  /** یک بخش تا آخر؛ false یعنی خطا یا توقف */
  const runTarget = async (key: string): Promise<boolean> => {
    setRunning(key);
    try {
      for (;;) {
        if (stop.current) return false;
        const res = await fetch('/api/admin/translations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ target: key }),
        });
        const j = await res.json().catch(() => ({}));
        if (!res.ok || !j.success) throw new Error(j.error || 'ترجمه انجام نشد');
        await load();
        if (!j.data.remaining) return true;
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'ترجمه انجام نشد');
      return false;
    } finally {
      setRunning(null);
    }
  };

  const runAll = async () => {
    stop.current = false;
    for (const c of coverage ?? []) {
      if (!c.pendingTexts) continue;
      if (!(await runTarget(c.key))) return;
    }
    toast.success('همه محتوا ترجمه شد — نسخه انگلیسی سایت به‌روز است');
  };

  const runOne = async (key: string) => {
    stop.current = false;
    if (await runTarget(key)) toast.success('ترجمه این بخش کامل شد');
  };

  const pending = coverage?.reduce((sum, c) => sum + c.pendingTexts, 0) ?? 0;

  /** فایل ترجمه‌شده (خروجی «دانلود» با فیلد translation پرشده) */
  const importFile = async (file: File | undefined) => {
    if (!file) return;
    setRunning('import');
    try {
      const entries = JSON.parse(await file.text());
      if (!Array.isArray(entries)) throw new Error('فایل باید همان فایل دانلودشده باشد');
      const res = await fetch('/api/admin/translations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ import: entries }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j.success) throw new Error(j.error || 'بارگذاری نشد');
      await load();
      toast.success(`${faDigits(j.data.saved)} ترجمه ذخیره شد`);
    } catch (e) {
      toast.error(e instanceof SyntaxError ? 'فایل JSON معتبر نیست' : e instanceof Error ? e.message : 'بارگذاری نشد');
    } finally {
      setRunning(null);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <IconTile icon={Languages} />
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">ترجمه انگلیسی</h1>
          <p className="text-[var(--muted-foreground)] text-sm">وضعیت ترجمه همه محتوای سایت و ترجمه خودکار یک‌جا</p>
        </div>
        {coverage && (
          <div className="ms-auto flex gap-2">
            {running ? (
              <button
                type="button"
                onClick={() => (stop.current = true)}
                className="h-11 px-5 rounded-xl border border-[var(--border)] text-sm font-bold flex items-center gap-1.5 hover:border-red-500"
              >
                <Square className="w-4 h-4" /> توقف بعد از این دور
              </button>
            ) : (
              <button
                type="button"
                onClick={runAll}
                disabled={!pending || auto === false}
                title={auto === false ? 'سرویس ترجمه تنظیم نشده است' : undefined}
                className="h-11 px-5 rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] text-sm font-black flex items-center gap-1.5 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" /> ترجمه همه ({faDigits(pending)} متن)
              </button>
            )}
          </div>
        )}
      </div>

      {auto !== null && (
        <div
          className={cn(
            'flex items-start gap-3 p-4 rounded-2xl border text-sm leading-7',
            auto ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-amber-500/30 bg-amber-500/10',
          )}
        >
          {auto ? <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" /> : <Languages className="w-5 h-5 shrink-0 text-amber-600" />}
          <p>
            {auto
              ? 'ترجمه خودکار فعال است: هر بار محصول، مقاله، دسته، پروژه، سوال، نظر، تنظیمات یا محتوای صفحه‌ای را ذخیره کنید، متن‌های انگلیسیِ خالی همان مورد چند ثانیه بعد خودکار ترجمه می‌شوند.'
              : 'ترجمه خودکار غیرفعال است (سرویس ترجمه روی سرور تنظیم نشده). تا وقتی فعال نشده، از «دانلود متن‌های بدون ترجمه / بارگذاری فایل ترجمه» پایین همین صفحه استفاده کنید. برای فعال‌سازی، متغیرهای TRANSLATE_API_BASE_URL، TRANSLATE_API_KEY و TRANSLATE_MODEL را در رانفلر تنظیم کنید.'}
          </p>
        </div>
      )}

      <div className={cn(card, 'p-5 text-sm text-[var(--muted-foreground)] leading-7')}>
        فقط متن‌هایی که نسخه انگلیسی ندارند ترجمه می‌شوند؛ ترجمه‌هایی که دستی نوشته یا اصلاح کرده‌اید دست نمی‌خورند. هر رکوردی که نامش ترجمه شود،
        صفحه انگلیسی‌اش در گوگل ایندکس و به سایت‌مپ اضافه می‌شود. بعد از ترجمه، چند مورد را در زبانه «English» همان فرم بازبینی کنید — به‌خصوص
        نام محصولات و اصطلاحات فنی.
      </div>

      <div className={cn(card, 'p-5 space-y-3')}>
        <p className="font-bold text-[var(--foreground)]">ترجمه بیرون از سایت (بدون کلید API)</p>
        <p className="text-sm text-[var(--muted-foreground)] leading-7">
          فایل متن‌های بدون ترجمه را دانلود کنید، فیلد <code dir="ltr">translation</code> هر ردیف را با ترجمه انگلیسی پر کنید (یا فایل را به مترجم بدهید)
          و همان فایل را بارگذاری کنید. فقط ردیف‌هایی که ترجمه دارند ذخیره می‌شوند.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            // پاسخ API فایل دانلودی است (Content-Disposition)، نه صفحه
            onClick={() => window.location.assign('/api/admin/translations?export=1')}
            disabled={!pending}
            className="h-10 px-4 rounded-xl border border-[var(--border)] text-sm font-bold flex items-center gap-1.5 hover:border-[var(--accent)] disabled:opacity-50"
          >
            <Download className="w-4 h-4" /> دانلود متن‌های بدون ترجمه
          </button>
          <label
            className={cn(
              'h-10 px-4 rounded-xl border border-[var(--border)] text-sm font-bold flex items-center gap-1.5 hover:border-[var(--accent)] cursor-pointer',
              running !== null && 'pointer-events-none opacity-50',
            )}
          >
            {running === 'import' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            بارگذاری فایل ترجمه
            <input type="file" accept="application/json,.json" className="hidden" onChange={(e) => importFile(e.target.files?.[0]).finally(() => (e.target.value = ''))} />
          </label>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {!coverage && !error ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-16 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className={cn(card, 'divide-y divide-[var(--border)]')}>
          {coverage?.map((c) => {
            const percent = c.total ? Math.round((c.complete / c.total) * 100) : 100;
            const done = !c.pendingTexts;
            return (
              <div key={c.key} className="flex flex-wrap items-center gap-4 p-4 sm:p-5">
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-[var(--foreground)]">{c.label}</p>
                  <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                    {faDigits(c.complete)} از {faDigits(c.total)} کامل
                    {!done && ` · ${faDigits(c.pendingTexts)} متن بدون ترجمه`}
                  </p>
                  <div className="mt-2 h-1.5 rounded-full bg-[var(--muted)] overflow-hidden">
                    <div className={cn('h-full rounded-full transition-all', done ? 'bg-emerald-500' : 'bg-[var(--accent)]')} style={{ width: `${percent}%` }} />
                  </div>
                </div>
                {done ? (
                  <span className="flex items-center gap-1.5 text-sm font-bold text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" /> کامل
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => runOne(c.key)}
                    disabled={running !== null || auto === false}
                    className="h-10 px-4 rounded-xl border border-[var(--border)] text-sm font-bold flex items-center gap-1.5 hover:border-[var(--accent)] disabled:opacity-50"
                  >
                    {running === c.key ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {running === c.key ? 'در حال ترجمه…' : 'ترجمه'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
