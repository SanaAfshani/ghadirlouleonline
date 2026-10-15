'use client';

import { useRef, useState } from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadImage } from '@/shared/lib/uploadImage';

export type BannerData = {
  title: string;
  description: string;
  buttonText: string;
  buttonUrl: string;
  image: string;
};

const EMPTY: BannerData = { title: '', description: '', buttonText: '', buttonUrl: '', image: '' };

/**
 * بنر به صورت یک بلوک HTML مستقل داخل خود محتوا درج می‌شود.
 * این‌طور نیازی به فیلد جدید در دیتابیس نیست و ادمین می‌تواند مثل بقیه
 * محتوا جابه‌جا یا حذفش کند. استایلش در globals.css با کلاس article-banner است.
 */
export function buildBannerHtml(b: BannerData): string {
  const esc = (s: string) =>
    s.trim().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const parts = ['<div class="article-banner">'];
  if (b.image.trim()) {
    parts.push(`<img class="article-banner-image" src="${esc(b.image)}" alt="${esc(b.title)}">`);
  }
  parts.push('<div class="article-banner-body">');
  if (b.title.trim()) parts.push(`<span class="article-banner-title">${esc(b.title)}</span>`);
  if (b.description.trim()) parts.push(`<p class="article-banner-text">${esc(b.description)}</p>`);
  parts.push('</div>');
  if (b.buttonText.trim() && b.buttonUrl.trim()) {
    const external = /^https?:\/\//i.test(b.buttonUrl.trim());
    const rel = external ? ' target="_blank" rel="noopener"' : '';
    parts.push(
      `<a class="article-banner-cta" href="${esc(b.buttonUrl)}"${rel}>${esc(b.buttonText)}</a>`,
    );
  }
  parts.push('</div>');
  return parts.join('\n');
}

type Props = {
  open: boolean;
  onClose: () => void;
  onInsert: (html: string) => void;
};

const inputCls =
  'w-full h-11 bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--accent)] transition-colors';

export function BannerDialog({ open, onClose, onInsert }: Props) {
  const [data, setData] = useState<BannerData>(EMPTY);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const set = (patch: Partial<BannerData>) => setData((d) => ({ ...d, ...patch }));

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      set({ image: await uploadImage(file) });
      toast.success('تصویر بنر آپلود شد');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'خطا در آپلود تصویر');
    } finally {
      setUploading(false);
    }
  };

  const submit = () => {
    if (!data.title.trim() && !data.description.trim()) {
      toast.error('حداقل عنوان یا توضیح بنر را وارد کنید');
      return;
    }
    if (data.buttonText.trim() && !data.buttonUrl.trim()) {
      toast.error('برای دکمه باید لینک وارد کنید');
      return;
    }
    onInsert(buildBannerHtml(data));
    setData(EMPTY);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[var(--card)] border border-[var(--border)] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <h3 className="text-[var(--foreground)] font-bold">افزودن بنر تبلیغاتی</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">عنوان بنر</label>
            <input
              type="text"
              value={data.title}
              onChange={(e) => set({ title: e.target.value })}
              placeholder="مثال: قدیر لوله آنلاین"
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">توضیح</label>
            <textarea
              value={data.description}
              onChange={(e) => set({ description: e.target.value })}
              rows={3}
              placeholder="تامین‌کننده انواع لوله و اتصالات صنعتی با ارسال به سراسر کشور..."
              className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--accent)] resize-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">متن دکمه</label>
              <input
                type="text"
                value={data.buttonText}
                onChange={(e) => set({ buttonText: e.target.value })}
                placeholder="مشاهده محصولات"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">لینک دکمه</label>
              <input
                type="text"
                value={data.buttonUrl}
                onChange={(e) => set({ buttonUrl: e.target.value })}
                placeholder="/products"
                className={inputCls}
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
              تصویر بنر <span className="text-[var(--muted-foreground)] text-xs">(اختیاری)</span>
            </label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
            {data.image ? (
              <div className="flex items-center gap-3 bg-[var(--muted)] rounded-xl p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={data.image} alt="" className="w-14 h-14 rounded-lg object-cover" />
                <span className="text-xs text-[var(--muted-foreground)] flex-1 truncate" dir="ltr">
                  {data.image}
                </span>
                <button
                  type="button"
                  onClick={() => set({ image: '' })}
                  className="text-[var(--muted-foreground)] hover:text-red-700 dark:hover:text-red-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="w-full border-2 border-dashed border-[var(--border)] rounded-xl p-5 flex flex-col items-center gap-2 text-[var(--muted-foreground)] hover:border-[var(--accent)] hover:text-[var(--accent-text)] transition-colors disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-[var(--accent-text)]" />
                ) : (
                  <ImagePlus className="w-6 h-6" />
                )}
                <span className="text-sm">{uploading ? 'در حال آپلود...' : 'آپلود تصویر'}</span>
              </button>
            )}
          </div>

          {/* پیش‌نمایش زنده */}
          <div>
            <div className="text-xs text-[var(--muted-foreground)] mb-2">پیش‌نمایش</div>
            <div className="bg-[var(--background)] rounded-xl p-4">
              <div
                className="article-content"
                dangerouslySetInnerHTML={{ __html: buildBannerHtml(data) }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 px-6 py-4 border-t border-[var(--border)]">
          <button
            type="button"
            onClick={submit}
            className="flex-1 h-11 rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] font-bold hover:bg-[var(--accent)]/90 transition-colors"
          >
            درج بنر در متن
          </button>
          <button
            type="button"
            onClick={onClose}
            className="h-11 px-5 rounded-xl bg-[var(--muted)] text-[var(--foreground)] hover:bg-[var(--border)] transition-colors"
          >
            انصراف
          </button>
        </div>
      </div>
    </div>
  );
}
