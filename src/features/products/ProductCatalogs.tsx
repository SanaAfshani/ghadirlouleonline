'use client';

import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { Download, ExternalLink, Eye, EyeOff, FileText, Images, Loader2, X } from 'lucide-react';
import type { CatalogFile } from '@/shared/types';
import { isImageCatalog } from '@/shared/lib/catalog-files';
import { cn, faDigits } from '@/shared/lib/utils';

type Props = {
  catalogs: CatalogFile[];
  productName: string;
};

/**
 * صفحه کاتالوگ تصویری در حالت تمام‌صفحه.
 * با portal به body می‌رود: داخل درخت محصول، والدِ transform‌دار باعث می‌شود inset-0 به‌جای
 * کل صفحه فقط ستون محتوا را بپوشاند و هدر و سایدبار روی پوشش بمانند.
 */
function PageLightbox({ pages, title, index, onIndex, onClose }: {
  pages: string[]; title: string; index: number | null;
  onIndex: (i: number) => void; onClose: () => void;
}) {
  const isOpen = index !== null;
  const go = useCallback(
    (delta: number) => index !== null && onIndex((index + delta + pages.length) % pages.length),
    [index, pages.length, onIndex],
  );

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      // RTL: فلش چپ یعنی صفحه بعد
      else if (e.key === 'ArrowLeft') go(1);
      else if (e.key === 'ArrowRight') go(-1);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, go]);

  if (index === null || typeof document === 'undefined') return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[100] bg-black/92 flex items-center justify-center"
      onClick={onClose}
    >
      <button onClick={onClose} aria-label="بستن" className="absolute top-4 end-4 z-10 w-11 h-11 rounded-2xl bg-white/10 text-white grid place-items-center">
        <X className="w-5 h-5" />
      </button>
      <span className="absolute top-6 start-6 z-10 text-white/80 text-sm num">
        صفحه {faDigits(index + 1)} از {faDigits(pages.length)}
      </span>
      <div className="relative w-full h-full p-4 sm:p-12" onClick={(e) => e.stopPropagation()}>
        <Image src={pages[index]} alt={`${title} — صفحه ${faDigits(index + 1)}`} fill sizes="100vw" className="object-contain" priority />
      </div>
      {pages.length > 1 && (
        <>
          <button onClick={(e) => { e.stopPropagation(); go(-1); }} aria-label="صفحه قبل"
            className="absolute end-3 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-2xl grid place-items-center transition-colors">‹</button>
          <button onClick={(e) => { e.stopPropagation(); go(1); }} aria-label="صفحه بعد"
            className="absolute start-3 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-2xl grid place-items-center transition-colors">›</button>
        </>
      )}
    </div>,
    document.body,
  );
}

/**
 * کاتالوگ‌های محصول — هم PDF و هم کاتالوگ تصویری (چند عکس = چند صفحه).
 * پیش‌نمایش فقط با درخواست کاربر باز می‌شود؛ iframe و عکس‌های تمام‌صفحه روی موبایل سنگین‌اند.
 */
export function ProductCatalogs({ catalogs, productName }: Props) {
  // هر لحظه فقط یک پیش‌نمایش باز است تا صفحه طولانی و گیج‌کننده نشود
  const [open, setOpen] = useState<number | null>(null);
  // تا وقتی PDF نیامده، iframe یک کادر سفید خالی است و کاربر فکر می‌کند کار نکرده
  const [loaded, setLoaded] = useState<number | null>(null);
  const [zoom, setZoom] = useState<{ catalog: number; page: number } | null>(null);

  return (
    <div className="space-y-3">
      {catalogs.map((file, index) => {
        const images = isImageCatalog(file);
        const expanded = open === index;
        return (
          <div
            key={index}
            className={cn(
              'rounded-2xl border bg-[var(--card)] transition-colors',
              expanded ? 'border-[var(--accent)]' : 'border-[var(--border)]',
            )}
          >
            <div className="flex flex-wrap items-center gap-3 p-4">
              <span className="w-11 h-11 rounded-2xl bg-[var(--accent)]/12 grid place-items-center shrink-0">
                {images ? <Images className="w-5 h-5 text-[var(--accent-text)]" /> : <FileText className="w-5 h-5 text-[var(--accent-text)]" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-sm leading-6 truncate">{faDigits(file.title)}</p>
                <p className="text-xs text-[var(--muted-foreground)] num">
                  {images ? `${faDigits(file.pages.length)} صفحه تصویری` : 'فایل PDF · قابل دانلود'}
                </p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => { setOpen(expanded ? null : index); setLoaded(null); }}
                  aria-expanded={expanded}
                  className="flex-1 sm:flex-none h-11 px-4 rounded-2xl border border-[var(--border)] text-sm font-bold flex items-center justify-center gap-2 hover:border-[var(--accent)] transition-colors"
                >
                  {expanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {expanded ? 'بستن' : 'مشاهده'}
                </button>
                {!images && (
                  <a
                    href={file.url}
                    download
                    className="flex-1 sm:flex-none h-11 px-4 rounded-2xl bg-[var(--accent)] text-[var(--accent-foreground)] text-sm font-black flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-transform"
                  >
                    <Download className="w-4 h-4" />
                    دانلود
                  </a>
                )}
              </div>
            </div>

            {/* عنوان و دکمه دانلود بالای همین کارت است؛ پیش‌نمایش فقط خود فایل را نشان می‌دهد */}
            {expanded && (
              <div className="px-4 pb-4">
                {images ? (
                  <div className="space-y-3">
                    {file.pages.map((page, pageIndex) => (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setZoom({ catalog: index, page: pageIndex })}
                        aria-label={`بزرگ‌نمایی صفحه ${faDigits(pageIndex + 1)}`}
                        className="relative block w-full rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--muted)] cursor-zoom-in"
                      >
                        {/* نسبت A4 خوابیده؛ object-contain تا هیچ بخشی از صفحه بریده نشود */}
                        <span className="block w-full aspect-[1.414/1]">
                          <Image
                            src={page}
                            alt={`${file.title} — صفحه ${faDigits(pageIndex + 1)}`}
                            fill
                            sizes="(max-width: 1024px) 100vw, 60vw"
                            loading="lazy"
                            className="object-contain"
                          />
                        </span>
                        <span className="absolute top-2 start-2 text-xs font-bold num bg-black/55 text-white rounded-lg px-2 py-0.5">
                          {faDigits(pageIndex + 1)}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="relative rounded-2xl overflow-hidden border border-[var(--border)] bg-slate-950">
                      {loaded !== index && (
                        <div className="absolute inset-0 grid place-items-center gap-3 text-white/70">
                          <div className="flex flex-col items-center gap-3">
                            <Loader2 className="w-7 h-7 animate-spin" />
                            <p className="text-sm">در حال آماده‌سازی کاتالوگ…</p>
                          </div>
                        </div>
                      )}
                      <iframe
                        src={`${file.url}#view=FitH`}
                        title={`${file.title} — ${productName}`}
                        onLoad={() => setLoaded(index)}
                        className="w-full border-0 block h-[70vh] min-h-[420px] md:h-[78vh]"
                      />
                    </div>
                    {/* بعضی مرورگرهای موبایل PDF را داخل iframe باز نمی‌کنند */}
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-[var(--accent-text)] hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      اگر فایل نمایش داده نشد، در تب جدید باز کنید
                    </a>
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}

      {zoom !== null && isImageCatalog(catalogs[zoom.catalog]) && (
        <PageLightbox
          pages={(catalogs[zoom.catalog] as CatalogFile & { pages: string[] }).pages}
          title={catalogs[zoom.catalog].title}
          index={zoom.page}
          onIndex={(page) => setZoom({ ...zoom, page })}
          onClose={() => setZoom(null)}
        />
      )}
    </div>
  );
}
