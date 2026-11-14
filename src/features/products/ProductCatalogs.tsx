'use client';

import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { Download, ExternalLink, Eye, EyeOff, FileText, Images, Loader2, X } from 'lucide-react';
import type { CatalogFile } from '@/shared/types';
import { isImageCatalog } from '@/shared/lib/catalog-files';
import { cn } from '@/shared/lib/utils';
import { useLocale, useMessages } from '@/shared/i18n/LocaleProvider';
import { defineMessages, fill } from '@/shared/i18n/messages';
import { digits } from '@/shared/i18n/format';

const messages = defineMessages({
  fa: {
    close: 'بستن',
    pageOf: 'صفحه {n} از {total}',
    pageAlt: '{title} — صفحه {n}',
    prevPage: 'صفحه قبل',
    nextPage: 'صفحه بعد',
    imagePages: '{n} صفحه تصویری',
    pdfFile: 'فایل PDF · قابل دانلود',
    view: 'مشاهده',
    download: 'دانلود',
    zoomPage: 'بزرگ‌نمایی صفحه {n}',
    loading: 'در حال آماده‌سازی کاتالوگ…',
    openInTab: 'اگر فایل نمایش داده نشد، در تب جدید باز کنید',
  },
  en: {
    close: 'Close',
    pageOf: 'Page {n} of {total}',
    pageAlt: '{title}, page {n}',
    prevPage: 'Previous page',
    nextPage: 'Next page',
    imagePages: '{n} image pages',
    pdfFile: 'PDF file · downloadable',
    view: 'View',
    download: 'Download',
    zoomPage: 'Enlarge page {n}',
    loading: 'Preparing the catalogue…',
    openInTab: 'If the file does not display, open it in a new tab',
  },
});

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
  const locale = useLocale();
  const t = useMessages(messages);
  const rtl = locale === 'fa';
  const isOpen = index !== null;
  const go = useCallback(
    (delta: number) => index !== null && onIndex((index + delta + pages.length) % pages.length),
    [index, pages.length, onIndex],
  );

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      // RTL: فلش چپ یعنی صفحه بعد؛ LTR برعکس
      else if (e.key === 'ArrowLeft') go(rtl ? 1 : -1);
      else if (e.key === 'ArrowRight') go(rtl ? -1 : 1);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, go, rtl]);

  if (index === null || typeof document === 'undefined') return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[100] bg-black/92 flex items-center justify-center"
      onClick={onClose}
    >
      <button onClick={onClose} aria-label={t.close} className="absolute top-4 end-4 z-10 w-11 h-11 rounded-2xl bg-white/10 text-white grid place-items-center">
        <X className="w-5 h-5" />
      </button>
      <span className="absolute top-6 start-6 z-10 text-white/80 text-sm num">
        {fill(t.pageOf, { n: digits(index + 1, locale), total: digits(pages.length, locale) })}
      </span>
      <div className="relative w-full h-full p-4 sm:p-12" onClick={(e) => e.stopPropagation()}>
        <Image src={pages[index]} alt={fill(t.pageAlt, { title, n: digits(index + 1, locale) })} fill sizes="100vw" className="object-contain" priority />
      </div>
      {pages.length > 1 && (
        <>
          <button onClick={(e) => { e.stopPropagation(); go(-1); }} aria-label={t.prevPage}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-2xl grid place-items-center transition-colors">‹</button>
          {/* جای فیزیکی در هر دو زبان یکی است (قبل چپ، بعد راست) — همان چیدمان قبلی نسخه فارسی */}
          <button onClick={(e) => { e.stopPropagation(); go(1); }} aria-label={t.nextPage}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-2xl grid place-items-center transition-colors">›</button>
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
  const locale = useLocale();
  const t = useMessages(messages);
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
                <p className="font-bold text-sm leading-6 truncate">{digits(file.title, locale)}</p>
                <p className="text-xs text-[var(--muted-foreground)] num">
                  {images ? fill(t.imagePages, { n: digits(file.pages.length, locale) }) : t.pdfFile}
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
                  {expanded ? t.close : t.view}
                </button>
                {!images && (
                  <a
                    href={file.url}
                    download
                    className="flex-1 sm:flex-none h-11 px-4 rounded-2xl bg-[var(--accent)] text-[var(--accent-foreground)] text-sm font-black flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-transform"
                  >
                    <Download className="w-4 h-4" />
                    {t.download}
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
                        aria-label={fill(t.zoomPage, { n: digits(pageIndex + 1, locale) })}
                        className="relative block w-full rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--muted)] cursor-zoom-in"
                      >
                        {/* نسبت A4 خوابیده؛ object-contain تا هیچ بخشی از صفحه بریده نشود */}
                        <span className="block w-full aspect-[1.414/1]">
                          <Image
                            src={page}
                            alt={fill(t.pageAlt, { title: file.title, n: digits(pageIndex + 1, locale) })}
                            fill
                            sizes="(max-width: 1024px) 100vw, 60vw"
                            loading="lazy"
                            className="object-contain"
                          />
                        </span>
                        <span className="absolute top-2 start-2 text-xs font-bold num bg-black/55 text-white rounded-lg px-2 py-0.5">
                          {digits(pageIndex + 1, locale)}
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
                            <p className="text-sm">{t.loading}</p>
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
                      {t.openInTab}
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
