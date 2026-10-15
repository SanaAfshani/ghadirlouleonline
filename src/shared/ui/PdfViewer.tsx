'use client';

import { useState } from 'react';
import { FileText, Download, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

interface PdfViewerProps {
  url: string;
  title?: string;
}

export function PdfViewer({ url, title }: PdfViewerProps) {
  const [expanded, setExpanded] = useState(true);
  const label = title ?? 'کاتالوگ PDF';

  return (
    <div className="mt-10 rounded-2xl overflow-hidden border border-[var(--border)] shadow-xl">

      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-4 bg-[var(--card)] border-b border-[var(--border)]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-[var(--accent-text)]" />
          </div>
          <div className="min-w-0">
            <p className="text-[var(--foreground)] font-semibold text-sm leading-tight">کاتالوگ محصول</p>
            <p className="text-[var(--muted-foreground)] text-xs mt-0.5 truncate sm:max-w-xs">{label}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] border border-[var(--border)] px-3 py-1.5 rounded-lg transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            باز کردن
          </a>
          <a
            href={url}
            download
            className="flex items-center gap-1.5 text-sm bg-[var(--accent)] text-[var(--accent-foreground)] px-3 py-1.5 rounded-lg font-bold hover:opacity-90 transition-opacity"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">دانلود PDF</span>
            <span className="sm:hidden">دانلود</span>
          </a>
          <button
            onClick={() => setExpanded(v => !v)}
            className="w-8 h-8 rounded-lg bg-[var(--muted)] flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ── Viewer ── */}
      {expanded && (
        <>
          {/* Desktop */}
          <div className="hidden md:block bg-slate-950">
            <iframe
              src={`${url}#toolbar=1&view=FitH`}
              className="w-full border-0 block"
              style={{ height: '82vh', minHeight: 600 }}
              title={label}
            />
          </div>

          {/* Mobile — scrollable wrapper trick */}
          <div className="md:hidden bg-slate-950">
            <div
              style={{
                height: '75vh',
                overflowY: 'scroll',
                WebkitOverflowScrolling: 'touch' as never,
              }}
            >
              <iframe
                src={url}
                className="w-full border-0 block"
                style={{ height: '100%', minHeight: '75vh' }}
                title={label}
                scrolling="yes"
              />
            </div>
            {/* fallback strip */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border)] bg-[var(--card)]">
              <span className="text-xs text-[var(--muted-foreground)]">اگر PDF نمایش داده نمی‌شود:</span>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-[var(--accent-text)] font-bold hover:opacity-80 transition-opacity"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                باز کردن در مرورگر
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
