'use client';

import { use, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ExternalLink, FileText } from 'lucide-react';
import { IconTile } from '@/shared/ui/IconTile';
import { Skeleton } from '@/shared/ui/Skeleton';
import { SectionEditor, type SectionSummary } from '@/features/admin/content/SectionEditor';

type PageDetail = { key: string; title: string; path: string | null; sections: SectionSummary[] };

export default function AdminContentEditPage({ params }: { params: Promise<{ page: string }> }) {
  const { page: pageKey } = use(params);
  const [page, setPage] = useState<PageDetail | null>(null);
  const [error, setError] = useState('');
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [dirty, setDirty] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch('/api/admin/content')
      .then((r) => r.json())
      .then((j) => {
        const found = j.success ? (j.data as PageDetail[]).find((p) => p.key === pageKey) : undefined;
        if (!found) return setError(j.error || 'صفحه یافت نشد');
        setPage(found);
        setOpenKey(found.sections[0]?.key ?? null);
      })
      .catch(() => setError('ارتباط با سرور برقرار نشد'));
  }, [pageKey]);

  // هشدار مرورگر قبل از بستن تب با تغییرات ذخیره‌نشده
  useEffect(() => {
    if (!dirty.size) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const onDirtyChange = useCallback((key: string, isDirty: boolean) => {
    setDirty((prev) => {
      if (prev.has(key) === isDirty) return prev;
      const next = new Set(prev);
      if (isDirty) next.add(key);
      else next.delete(key);
      return next;
    });
  }, []);

  const onSaved = useCallback((s: Pick<SectionSummary, 'key' | 'customized' | 'untranslated'>) => {
    setPage((p) => p && { ...p, sections: p.sections.map((x) => (x.key === s.key ? { ...x, ...s } : x)) });
  }, []);

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!page) {
    return (
      <div className="max-w-4xl space-y-4">
        <Skeleton className="h-10 w-64" />
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-16 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-5">
      <Link href="/admin/content" className="inline-flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
        <ArrowRight className="w-4 h-4" /> همه صفحه‌ها
      </Link>
      <div className="flex flex-wrap items-center gap-4">
        <IconTile icon={FileText} />
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">{page.title}</h1>
          <p className="text-[var(--muted-foreground)] text-sm">هر بخش جدا ذخیره می‌شود و بلافاصله در سایت اعمال می‌شود.</p>
        </div>
        {page.path && (
          <div className="ms-auto flex gap-2">
            <a href={page.path} target="_blank" rel="noreferrer" className="flex items-center gap-2 h-10 px-4 rounded-xl bg-[var(--muted)] text-sm font-semibold hover:bg-[var(--border)]">
              <ExternalLink className="w-4 h-4" /> فارسی
            </a>
            <a href={page.path === '/' ? '/en' : `/en${page.path}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 h-10 px-4 rounded-xl bg-[var(--muted)] text-sm font-semibold hover:bg-[var(--border)]">
              <ExternalLink className="w-4 h-4" /> English
            </a>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {page.sections.map((section) => (
          <SectionEditor
            key={section.key}
            summary={section}
            open={openKey === section.key}
            onToggle={() => setOpenKey((k) => (k === section.key ? null : section.key))}
            onDirtyChange={onDirtyChange}
            onSaved={onSaved}
          />
        ))}
      </div>
    </div>
  );
}
