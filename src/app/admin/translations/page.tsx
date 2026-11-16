'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { CheckCircle2, Languages, Loader2, Sparkles, Square } from 'lucide-react';
import { IconTile } from '@/shared/ui/IconTile';
import { Skeleton } from '@/shared/ui/Skeleton';
import { cn, faDigits } from '@/shared/lib/utils';
import type { TargetCoverage } from '@/shared/lib/bulk-translate';

const card = 'bg-[var(--card)] border border-[var(--border)] rounded-2xl';

async function fetchCoverage(): Promise<TargetCoverage[]> {
  const res = await fetch('/api/admin/translations');
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.success) throw new Error(j.error || 'بارگذاری نشد');
  return j.data;
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

  const load = useCallback(async () => setCoverage(await fetchCoverage()), []);

  useEffect(() => {
    fetchCoverage()
      .then(setCoverage)
      .catch((e) => setError(e instanceof Error ? e.message : 'بارگذاری نشد'));
  }, []);

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
                disabled={!pending}
                className="h-11 px-5 rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] text-sm font-black flex items-center gap-1.5 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" /> ترجمه همه ({faDigits(pending)} متن)
              </button>
            )}
          </div>
        )}
      </div>

      <div className={cn(card, 'p-5 text-sm text-[var(--muted-foreground)] leading-7')}>
        فقط متن‌هایی که نسخه انگلیسی ندارند ترجمه می‌شوند؛ ترجمه‌هایی که دستی نوشته یا اصلاح کرده‌اید دست نمی‌خورند. هر رکوردی که نامش ترجمه شود،
        صفحه انگلیسی‌اش در گوگل ایندکس و به سایت‌مپ اضافه می‌شود. بعد از ترجمه، چند مورد را در زبانه «English» همان فرم بازبینی کنید — به‌خصوص
        نام محصولات و اصطلاحات فنی.
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
                    disabled={running !== null}
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
