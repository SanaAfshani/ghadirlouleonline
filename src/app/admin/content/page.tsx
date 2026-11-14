'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, FileText, Languages } from 'lucide-react';
import { IconTile } from '@/shared/ui/IconTile';
import { Skeleton } from '@/shared/ui/Skeleton';
import { faDigits, formatDate } from '@/shared/lib/utils';

type PageSummary = {
  key: string;
  title: string;
  path: string | null;
  sections: { key: string }[];
  updatedAt: string | null;
  untranslated: number;
};

/** فهرست صفحه‌هایی که متن و عکسشان از پنل ویرایش می‌شود (shared/content/registry.ts) */
export default function AdminContentPage() {
  const [pages, setPages] = useState<PageSummary[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/content')
      .then((r) => r.json())
      .then((j) => (j.success ? setPages(j.data) : setError(j.error || 'بارگذاری نشد')))
      .catch(() => setError('ارتباط با سرور برقرار نشد'));
  }, []);

  const untranslated = pages?.reduce((sum, p) => sum + p.untranslated, 0) ?? 0;

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center gap-4">
        <IconTile icon={FileText} />
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">محتوای صفحات</h1>
          <p className="text-[var(--muted-foreground)] text-sm">متن، عکس و فهرست‌های هر بخش از صفحات سایت — فارسی و انگلیسی</p>
        </div>
      </div>

      {untranslated > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-sm leading-6">
          <Languages className="w-5 h-5 shrink-0 text-amber-600" />
          <p>
            {faDigits(untranslated)} متن هنوز ترجمه انگلیسی ندارد؛ در نسخه انگلیسی سایت به جای آن‌ها متن فارسی نمایش داده می‌شود. در هر بخش، زبانه
            «English» و دکمه «ترجمه خودکار» را بزنید.
          </p>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {!pages && !error ? (
        <div className="grid sm:grid-cols-2 gap-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {pages?.map((page) => (
            <Link
              key={page.key}
              href={`/admin/content/${page.key}`}
              className="group flex items-center gap-4 p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] hover:border-[var(--accent)] transition-colors"
            >
              <div className="min-w-0 flex-1">
                <p className="font-bold text-[var(--foreground)]">{page.title}</p>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  {faDigits(page.sections.length)} بخش
                  {page.updatedAt && ` · آخرین ویرایش ${formatDate(page.updatedAt)}`}
                </p>
                {page.untranslated > 0 && (
                  <span className="inline-block mt-2 text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-400">
                    {faDigits(page.untranslated)} متن بدون ترجمه
                  </span>
                )}
              </div>
              <ChevronLeft className="w-5 h-5 text-[var(--muted-foreground)] group-hover:text-[var(--accent-text)] transition-colors" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
