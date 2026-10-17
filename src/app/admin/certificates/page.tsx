'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { BadgeCheck, ChevronDown, ChevronUp, ExternalLink, Loader2, Plus, Save, Trash2 } from 'lucide-react';
import { ImageUploader } from '@/shared/ui/ImageUploader';
import { IconTile } from '@/shared/ui/IconTile';
import { Skeleton } from '@/shared/ui/Skeleton';
import { parseCertificates, type Certificate } from '@/shared/lib/site-settings';
import { cn } from '@/shared/lib/utils';

const card = 'bg-[var(--card)] border border-[var(--border)] rounded-2xl';
const inputCls = 'w-full h-11 bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 text-sm focus:outline-none focus:border-[var(--accent)]';

/** گواهینامه‌ها با عکس واقعی — در فوتر، صفحه محصول و صفحه /certificates نمایش داده می‌شوند */
export default function AdminCertificatesPage() {
  const [list, setList] = useState<Certificate[] | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((j) => setList(parseCertificates(j?.data?.certificates)))
      .catch(() => setList([]));
  }, []);

  const update = (i: number, patch: Partial<Certificate>) => setList((l) => l!.map((c, k) => (k === i ? { ...c, ...patch } : c)));
  const move = (i: number, d: -1 | 1) =>
    setList((l) => {
      const next = [...l!];
      [next[i], next[i + d]] = [next[i + d], next[i]];
      return next;
    });

  const save = async () => {
    const clean = list!.filter((c) => c.title.trim() && c.image);
    if (clean.length !== list!.length) return toast.error('هر گواهی باید عنوان و عکس داشته باشد');
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ certificates: JSON.stringify(clean) }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j.success) throw new Error(j.error || 'ذخیره نشد');
      toast.success('ذخیره شد — در فوتر و صفحه محصولات نمایش داده می‌شود');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'خطا');
    } finally {
      setSaving(false);
    }
  };

  if (!list) {
    return (
      <div className="max-w-4xl space-y-4">
        <Skeleton className="h-8 w-56" />
        {Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-5">
      <div className="flex flex-wrap items-start gap-3">
        <IconTile icon={BadgeCheck} tone="emerald" size="lg" />
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-black">گواهینامه‌ها و استانداردها</h1>
          <p className="text-sm leading-7 text-[var(--muted-foreground)]">
            عکس واقعی هر گواهی (استاندارد ملی، ISO، پروانه بهره‌برداری و...) را آپلود کنید. بدون عکس، هیچ گواهی در سایت نمایش داده نمی‌شود.
          </p>
        </div>
        {list.length > 0 && (
          <Link href="/certificates" target="_blank" className="h-10 px-3.5 rounded-xl border border-[var(--border)] text-xs font-bold flex items-center gap-1.5">
            <ExternalLink className="w-4 h-4" /> مشاهده در سایت
          </Link>
        )}
      </div>

      {list.map((c, i) => (
        <div key={i} className={cn(card, 'p-4 sm:p-5 grid sm:grid-cols-[180px_1fr_auto] gap-4 items-start')}>
          <ImageUploader images={c.image ? [c.image] : []} onChange={(imgs) => update(i, { image: imgs[0] ?? '' })} max={1} />
          <div className="space-y-3">
            <label className="block">
              <span className="block text-xs font-bold text-[var(--muted-foreground)] mb-1.5">عنوان</span>
              <input value={c.title} onChange={(e) => update(i, { title: e.target.value })} placeholder="مثلاً: نشان استاندارد ملی ایران — ISIRI 9116" className={inputCls} />
            </label>
            <label className="block">
              <span className="block text-xs font-bold text-[var(--muted-foreground)] mb-1.5">شماره یا کد (اختیاری)</span>
              <input value={c.code} onChange={(e) => update(i, { code: e.target.value })} placeholder="مثلاً شماره پروانه یا تاریخ اعتبار" className={inputCls} />
            </label>
          </div>
          <div className="flex sm:flex-col gap-1 justify-end">
            <button onClick={() => move(i, -1)} disabled={i === 0} aria-label="بالا" className="w-9 h-9 grid place-items-center rounded-lg hover:bg-[var(--muted)] disabled:opacity-25"><ChevronUp className="w-4 h-4" /></button>
            <button onClick={() => move(i, 1)} disabled={i === list.length - 1} aria-label="پایین" className="w-9 h-9 grid place-items-center rounded-lg hover:bg-[var(--muted)] disabled:opacity-25"><ChevronDown className="w-4 h-4" /></button>
            <button onClick={() => setList((l) => l!.filter((_, k) => k !== i))} aria-label="حذف" className="w-9 h-9 grid place-items-center rounded-lg text-red-600 hover:bg-red-500/10"><Trash2 className="w-4 h-4" /></button>
          </div>
        </div>
      ))}

      {!list.length && <p className={cn(card, 'p-8 text-center text-sm text-[var(--muted-foreground)]')}>هنوز گواهی‌ای ثبت نشده است.</p>}

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setList((l) => [...l!, { title: '', code: '', image: '' }])} className="h-11 px-4 rounded-xl border-2 border-dashed border-[var(--border)] text-sm font-bold flex items-center gap-1.5 hover:border-[var(--accent)]">
          <Plus className="w-4 h-4" /> افزودن گواهی
        </button>
        <button onClick={save} disabled={saving} className="h-11 px-5 rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] text-sm font-black flex items-center gap-1.5 disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} ذخیره
        </button>
      </div>
    </div>
  );
}
