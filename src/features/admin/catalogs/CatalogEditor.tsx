'use client';

import { useRef, useState } from 'react';
import { ChevronDown, ChevronUp, FileText, Images, Loader2, Trash2, Upload, X } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import type { CatalogFile } from '@/shared/types';
import { uploadPdf } from '@/shared/lib/uploadPdf';
import { uploadImage } from '@/shared/lib/uploadImage';
import { isImageCatalog } from '@/shared/lib/catalog-files';
import { formatPersianNumber } from '@/shared/lib/utils';

type Props = {
  value: CatalogFile[];
  onChange: (catalogs: CatalogFile[]) => void;
};

const inputCls =
  'w-full h-11 bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--accent)] transition-colors';

export function CatalogEditor({ value, onChange }: Props) {
  const [busy, setBusy] = useState<'pdf' | 'images' | null>(null);
  const [progress, setProgress] = useState(0);
  const pdfRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLInputElement>(null);

  const update = (index: number, patch: Partial<CatalogFile>) =>
    onChange(value.map((item, i) => (i === index ? { ...item, ...patch } : item)));

  const remove = (index: number) => onChange(value.filter((_, i) => i !== index));

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  /** هر PDF یک کاتالوگ جداست */
  const handlePdfs = async (files: FileList) => {
    setBusy('pdf');
    const added: CatalogFile[] = [];
    try {
      for (const file of Array.from(files)) {
        setProgress(0);
        const url = await uploadPdf(file, setProgress);
        added.push({ title: file.name.replace(/\.pdf$/i, ''), url });
      }
      toast.success('کاتالوگ PDF آپلود شد');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'آپلود ناموفق بود');
    } finally {
      if (added.length) onChange([...value, ...added]);
      setBusy(null);
      setProgress(0);
      if (pdfRef.current) pdfRef.current.value = '';
    }
  };

  /** همه تصاویر انتخاب‌شده با هم یک کاتالوگ چندصفحه‌ای می‌سازند */
  const handleImages = async (files: FileList) => {
    setBusy('images');
    const list = Array.from(files).sort((a, b) => a.name.localeCompare(b.name, 'en', { numeric: true }));
    const pages: string[] = [];
    try {
      for (const [i, file] of list.entries()) {
        pages.push(await uploadImage(file));
        setProgress(Math.round(((i + 1) / list.length) * 100));
      }
      toast.success(`کاتالوگ تصویری با ${formatPersianNumber(pages.length)} صفحه ساخته شد`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'آپلود ناموفق بود');
    } finally {
      if (pages.length) onChange([...value, { title: 'کاتالوگ تصویری', pages }]);
      setBusy(null);
      setProgress(0);
      if (imgRef.current) imgRef.current.value = '';
    }
  };

  /** حذف یک صفحه از کاتالوگ تصویری */
  const removePage = (index: number, pageIndex: number) => {
    const item = value[index];
    if (!isImageCatalog(item)) return;
    update(index, { pages: item.pages.filter((_, i) => i !== pageIndex) });
  };

  const movePage = (index: number, pageIndex: number, direction: -1 | 1) => {
    const item = value[index];
    if (!isImageCatalog(item)) return;
    const target = pageIndex + direction;
    if (target < 0 || target >= item.pages.length) return;
    const pages = [...item.pages];
    [pages[pageIndex], pages[target]] = [pages[target], pages[pageIndex]];
    update(index, { pages });
  };

  return (
    <div className="bg-[var(--card)] border-2 border-[var(--accent)]/30 rounded-2xl overflow-hidden">
      <div className="bg-[var(--accent)]/10 border-b border-[var(--accent)]/20 px-6 py-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[var(--accent)]/20 flex items-center justify-center flex-shrink-0">
          <FileText className="w-4 h-4 text-[var(--accent-text)]" />
        </div>
        <div>
          <h2 className="text-[var(--foreground)] font-bold">کاتالوگ و مدارک فنی</h2>
          <p className="text-[var(--muted-foreground)] text-xs mt-0.5">
            کاتالوگ PDF یا کاتالوگ تصویری (چند عکس = چند صفحه). در صفحه محصول بخش «کاتالوگ و مدارک فنی» فقط وقتی فایلی داشته باشد نمایش داده می‌شود.
          </p>
        </div>
      </div>

      <div className="p-6 space-y-3">
        {value.map((item, index) => (
          <div key={index} className="bg-[var(--muted)]/50 border border-[var(--border)] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-bold text-[var(--accent-text)] flex items-center gap-1.5">
                {isImageCatalog(item) ? <Images className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
                {isImageCatalog(item)
                  ? `کاتالوگ تصویری — ${formatPersianNumber(item.pages.length)} صفحه`
                  : 'کاتالوگ PDF'}
              </span>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label="انتقال به بالا"
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--border)] disabled:opacity-30 transition-colors">
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => move(index, 1)} disabled={index === value.length - 1} aria-label="انتقال به پایین"
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--border)] disabled:opacity-30 transition-colors">
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => remove(index)} aria-label="حذف کاتالوگ"
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--muted-foreground)] hover:text-red-700 dark:hover:text-red-400 hover:bg-red-500/10 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <input
              type="text"
              value={item.title}
              onChange={(e) => update(index, { title: e.target.value })}
              placeholder="عنوان — مثال: کاتالوگ دریچه و درب کامپوزیتی"
              className={inputCls}
            />

            {isImageCatalog(item) ? (
              <div className="flex flex-wrap gap-2">
                {item.pages.map((page, pageIndex) => (
                  <div key={page} className="relative group w-20">
                    <div className="relative w-20 h-24 rounded-lg overflow-hidden border border-[var(--border)] bg-[var(--muted)]">
                      <Image src={page} alt={`صفحه ${pageIndex + 1}`} fill sizes="80px" className="object-cover" />
                    </div>
                    <span className="absolute top-1 start-1 text-[10px] font-bold bg-black/60 text-white rounded px-1">
                      {formatPersianNumber(pageIndex + 1)}
                    </span>
                    <button type="button" onClick={() => removePage(index, pageIndex)} aria-label={`حذف صفحه ${pageIndex + 1}`}
                      className="absolute -top-1.5 -end-1.5 w-5 h-5 rounded-full bg-red-600 text-white grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3 h-3" />
                    </button>
                    <div className="flex justify-center gap-0.5 mt-1">
                      <button type="button" onClick={() => movePage(index, pageIndex, -1)} disabled={pageIndex === 0} aria-label="صفحه قبل"
                        className="w-6 h-5 rounded text-[var(--muted-foreground)] hover:bg-[var(--border)] disabled:opacity-30 grid place-items-center">
                        <ChevronUp className="w-3 h-3 rotate-90" />
                      </button>
                      <button type="button" onClick={() => movePage(index, pageIndex, 1)} disabled={pageIndex === item.pages.length - 1} aria-label="صفحه بعد"
                        className="w-6 h-5 rounded text-[var(--muted-foreground)] hover:bg-[var(--border)] disabled:opacity-30 grid place-items-center">
                        <ChevronDown className="w-3 h-3 rotate-90" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <a href={item.url} target="_blank" rel="noopener noreferrer" dir="ltr"
                className="block text-xs text-[var(--muted-foreground)] hover:text-[var(--accent-text)] truncate transition-colors">
                {item.url}
              </a>
            )}
          </div>
        ))}

        <input ref={pdfRef} type="file" accept="application/pdf" multiple className="hidden"
          onChange={(e) => { if (e.target.files?.length) handlePdfs(e.target.files); }} />
        <input ref={imgRef} type="file" accept="image/*" multiple className="hidden"
          onChange={(e) => { if (e.target.files?.length) handleImages(e.target.files); }} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button type="button" onClick={() => pdfRef.current?.click()} disabled={busy !== null}
            className="h-11 rounded-xl border border-dashed border-[var(--border)] text-[var(--muted-foreground)] text-sm font-medium flex items-center justify-center gap-2 hover:border-[var(--accent)] hover:text-[var(--accent-text)] disabled:opacity-60 transition-colors">
            {busy === 'pdf' ? (
              <><Loader2 className="w-4 h-4 animate-spin" />در حال آپلود... {formatPersianNumber(progress)}٪</>
            ) : (
              <><Upload className="w-4 h-4" />آپلود کاتالوگ PDF</>
            )}
          </button>
          <button type="button" onClick={() => imgRef.current?.click()} disabled={busy !== null}
            className="h-11 rounded-xl border border-dashed border-[var(--border)] text-[var(--muted-foreground)] text-sm font-medium flex items-center justify-center gap-2 hover:border-[var(--accent)] hover:text-[var(--accent-text)] disabled:opacity-60 transition-colors">
            {busy === 'images' ? (
              <><Loader2 className="w-4 h-4 animate-spin" />در حال آپلود... {formatPersianNumber(progress)}٪</>
            ) : (
              <><Images className="w-4 h-4" />آپلود کاتالوگ تصویری</>
            )}
          </button>
        </div>
        <p className="text-[11px] leading-5 text-[var(--muted-foreground)]">
          برای کاتالوگ تصویری، همه عکس‌های صفحات را یک‌جا انتخاب کنید؛ به ترتیب نام فایل مرتب می‌شوند و بعد می‌توانید جابه‌جا کنید.
        </p>
      </div>
    </div>
  );
}
