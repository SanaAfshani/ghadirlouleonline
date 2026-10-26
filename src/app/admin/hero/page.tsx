'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ChevronDown, ChevronUp, ExternalLink, GalleryHorizontal, Loader2, Plus, Save, Trash2 } from 'lucide-react';
import { ImageUploader } from '@/shared/ui/ImageUploader';
import { IconTile } from '@/shared/ui/IconTile';
import { Skeleton } from '@/shared/ui/Skeleton';
import { parseHeroSlides, type HeroSlide } from '@/shared/lib/site-settings';
import { formatPersianNumber } from '@/shared/lib/utils';
import { cn } from '@/shared/lib/utils';

const card = 'bg-[var(--card)] border border-[var(--border)] rounded-2xl';
const inputCls =
  'w-full h-11 bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 text-sm focus:outline-none focus:border-[var(--accent)]';

/** نُه نقطه کانونی؛ همان object-position است و ادمین لازم نیست با درصد سر و کله بزند */
const FOCUS: { x: number; y: number; label: string }[] = [
  { x: 0, y: 0, label: 'بالا چپ' }, { x: 50, y: 0, label: 'بالا وسط' }, { x: 100, y: 0, label: 'بالا راست' },
  { x: 0, y: 50, label: 'میانه چپ' }, { x: 50, y: 50, label: 'وسط' }, { x: 100, y: 50, label: 'میانه راست' },
  { x: 0, y: 100, label: 'پایین چپ' }, { x: 50, y: 100, label: 'پایین وسط' }, { x: 100, y: 100, label: 'پایین راست' },
];

const EMPTY: HeroSlide = { image: '', alt: '', focusX: 50, focusY: 0 };

export default function AdminHeroPage() {
  const [list, setList] = useState<HeroSlide[] | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((j) => setList(parseHeroSlides(j?.data?.hero_slides)))
      .catch(() => setList([]));
  }, []);

  const update = (i: number, patch: Partial<HeroSlide>) =>
    setList((l) => l!.map((s, k) => (k === i ? { ...s, ...patch } : s)));

  const move = (i: number, d: -1 | 1) =>
    setList((l) => {
      const next = [...l!];
      [next[i], next[i + d]] = [next[i + d], next[i]];
      return next;
    });

  const save = async () => {
    const clean = list!.filter((s) => s.image);
    if (clean.length !== list!.length) return toast.error('هر اسلاید باید عکس داشته باشد');
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hero_slides: JSON.stringify(clean) }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j.success) throw new Error(j.error || 'ذخیره نشد');
      toast.success(
        clean.length ? 'ذخیره شد — بالای صفحه اصلی نمایش داده می‌شود' : 'همه اسلایدها پاک شدند؛ عکس پیش‌فرض برمی‌گردد',
      );
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
        {Array.from({ length: 2 }, (_, i) => (
          <Skeleton key={i} className="h-56 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <IconTile icon={GalleryHorizontal} />
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">اسلایدر هرو</h1>
          <p className="text-[var(--muted-foreground)] text-sm">عکس‌های بالای صفحه اصلی</p>
        </div>
        <Link
          href="/"
          target="_blank"
          className="mr-auto flex items-center gap-2 h-10 px-4 rounded-xl bg-[var(--muted)] text-sm font-semibold hover:bg-[var(--border)] transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          دیدن صفحه اصلی
        </Link>
      </div>

      <div className={cn(card, 'p-5 text-sm text-[var(--muted-foreground)] leading-relaxed')}>
        با یک عکس، همان حالت ثابت قبلی است. از دو عکس به بالا، هر ۶ ثانیه محو می‌شود و نقطه‌های پایین
        هرو برای جابه‌جایی دستی می‌آیند. اگر هیچ عکسی نگذارید، عکس پیش‌فرض سایت نمایش داده می‌شود.
        <br />
        <strong className="text-[var(--foreground)]">نقطه کانونی</strong> مهم‌ترین تنظیم است: قاب هرو روی
        گوشی فقط نوار باریکی از <em>عرض</em> عکس را نشان می‌دهد و روی دسکتاپ از <em>ارتفاع</em> آن می‌زند.
        نقطه را روی بخشی بگذارید که حتماً باید دیده شود.
      </div>

      <div className="space-y-4">
        {list.map((slide, i) => (
          <div key={i} className={cn(card, 'p-5 space-y-4')}>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-[var(--foreground)]">
                اسلاید {formatPersianNumber(i + 1)}
              </span>
              {i === 0 && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[var(--accent)]/15 text-[var(--accent-text)]">
                  اولین نمایش
                </span>
              )}
              <div className="mr-auto flex items-center gap-1">
                <button
                  type="button"
                  disabled={i === 0}
                  onClick={() => move(i, -1)}
                  className="w-9 h-9 rounded-xl bg-[var(--muted)] grid place-items-center disabled:opacity-40 hover:bg-[var(--border)] transition-colors"
                  aria-label="بالا"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={i === list.length - 1}
                  onClick={() => move(i, 1)}
                  className="w-9 h-9 rounded-xl bg-[var(--muted)] grid place-items-center disabled:opacity-40 hover:bg-[var(--border)] transition-colors"
                  aria-label="پایین"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setList((l) => l!.filter((_, k) => k !== i))}
                  className="w-9 h-9 rounded-xl bg-red-500/10 text-red-500 grid place-items-center hover:bg-red-500/20 transition-colors"
                  aria-label="حذف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-[1fr_200px] gap-5">
              <div className="space-y-3">
                <ImageUploader
                  images={slide.image ? [slide.image] : []}
                  onChange={(imgs) => update(i, { image: imgs[0] ?? '' })}
                  max={1}
                />
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                    متن جایگزین (alt)
                  </label>
                  <input
                    type="text"
                    value={slide.alt}
                    onChange={(e) => update(i, { alt: e.target.value })}
                    placeholder="مثال: حیاط کارخانه و دپوی لوله کاروگیت"
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <span className="block text-sm font-medium text-[var(--foreground)] mb-1.5">نقطه کانونی</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {FOCUS.map((f) => {
                    const on = slide.focusX === f.x && slide.focusY === f.y;
                    return (
                      <button
                        key={f.label}
                        type="button"
                        title={f.label}
                        onClick={() => update(i, { focusX: f.x, focusY: f.y })}
                        className={cn(
                          'relative aspect-square rounded-lg overflow-hidden border transition-colors',
                          on ? 'border-[var(--accent)] ring-2 ring-[var(--accent)]/40' : 'border-[var(--border)] hover:border-[var(--accent)]/60',
                        )}
                      >
                        {slide.image ? (
                          <Image
                            src={slide.image}
                            alt=""
                            fill
                            sizes="64px"
                            className="object-cover"
                            style={{ objectPosition: `${f.x}% ${f.y}%` }}
                          />
                        ) : (
                          <span className="absolute inset-0 bg-[var(--muted)]" />
                        )}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-[var(--muted-foreground)] mt-2 leading-relaxed">
                  هر مربع همان برش را نشان می‌دهد. انتخاب فعلی:{' '}
                  {FOCUS.find((f) => f.x === slide.focusX && f.y === slide.focusY)?.label ?? 'دلخواه'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setList((l) => [...l!, { ...EMPTY }])}
          disabled={list.length >= 8}
          className="h-11 px-4 rounded-xl bg-[var(--muted)] text-sm font-semibold flex items-center gap-2 hover:bg-[var(--border)] transition-colors disabled:opacity-40"
        >
          <Plus className="w-4 h-4" />
          افزودن اسلاید
        </button>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="h-11 px-6 rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] font-bold text-sm flex items-center gap-2 hover:bg-[var(--accent)]/90 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          ذخیره
        </button>
      </div>
    </div>
  );
}
