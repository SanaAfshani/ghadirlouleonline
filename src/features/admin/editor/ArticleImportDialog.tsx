'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle, Check, FileJson, Info, X } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  FIELD_LABELS,
  JSON_ONLY_FIELDS,
  parseArticleInput,
  type ImportedArticle,
  type ImportField,
} from '@/shared/lib/article-import';
import { formatPersianNumber } from '@/shared/lib/utils';

type Props = {
  open: boolean;
  onClose: () => void;
  /** فیلدهایی که همین الان در فرم پر هستند — برای هشدار جایگزینی */
  filled: Partial<Record<ImportField, boolean>>;
  onImport: (data: ImportedArticle, fields: ImportField[]) => void;
};

export function ArticleImportDialog({ open, onClose, filled, onImport }: Props) {
  const [raw, setRaw] = useState('');
  const [overwrite, setOverwrite] = useState(false);

  const result = useMemo(() => (raw.trim() ? parseArticleInput(raw) : null), [raw]);

  if (!open) return null;

  const found = result?.ok ? result.found : [];
  // فیلدهایی که واقعاً نوشته می‌شوند
  const willWrite = found.filter((f) => overwrite || !filled[f]);
  const skipped = found.filter((f) => !overwrite && filled[f]);

  const submit = () => {
    if (!result?.ok) return;
    if (!willWrite.length) {
      toast.error('همه فیلدها از قبل پر هستند — گزینه جایگزینی را فعال کنید');
      return;
    }
    onImport(result.data, willWrite);
    toast.success(`${formatPersianNumber(willWrite.length)} فیلد وارد شد`);
    setRaw('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-[var(--card)] border border-[var(--border)] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <FileJson className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            <h3 className="text-[var(--foreground)] font-bold">ورود مقاله از ابزار تولید محتوا</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          <p className="flex items-start gap-2 text-xs text-[var(--muted-foreground)] leading-relaxed bg-[var(--muted)]/50 rounded-xl p-3">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-sky-700 dark:text-sky-400" />
            خروجی «کپی Markdown» یا JSON مقاله را اینجا پیست کن. عنوان، خلاصه، متن و بخش
            سوالات متداول خودکار جدا و پر می‌شوند، و Markdown به HTML تمیز تبدیل می‌شود.
          </p>

          <textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            rows={8}
            dir="auto"
            placeholder={'# عنوان مقاله\n\nمتن مقدمه...\n\n## بخش اول\n\n...\n\n## سوالات متداول\n\n### سوال؟\n\nپاسخ.\n\n— یا JSON مقاله —'}
            className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-emerald-500 resize-y transition-colors font-mono text-xs leading-relaxed"
          />

          {result && !result.ok && (
            <p className="flex items-center gap-2 text-sm text-red-700 dark:text-red-400">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {result.error}
            </p>
          )}

          {result?.ok && (
            <div className="space-y-3">
              <div className="bg-[var(--muted)]/50 border border-[var(--border)] rounded-xl p-4">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-sm font-medium text-[var(--foreground)]">
                    فیلدهای پیداشده ({formatPersianNumber(found.length)})
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--border)] text-[var(--foreground)]">
                    {result.kind === 'markdown' ? 'ورودی: Markdown' : 'ورودی: JSON'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                  {found.map((f) => {
                    const write = willWrite.includes(f);
                    const value = result.data[f];
                    const detail = Array.isArray(value)
                      ? `${formatPersianNumber(value.length)} سوال`
                      : `${formatPersianNumber(String(value).length)} کاراکتر`;
                    return (
                      <div key={f} className="flex items-center gap-2 text-xs">
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                            write ? 'bg-emerald-500/20' : 'bg-[var(--border)]/30'
                          }`}
                        >
                          {write ? (
                            <Check className="w-2.5 h-2.5 text-emerald-700 dark:text-emerald-400" />
                          ) : (
                            <X className="w-2.5 h-2.5 text-[var(--muted-foreground)]" />
                          )}
                        </div>
                        <span className={write ? 'text-[var(--foreground)]' : 'text-[var(--muted-foreground)] line-through'}>
                          {FIELD_LABELS[f]}
                        </span>
                        <span className="text-[var(--muted-foreground)]">{detail}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {result.kind === 'markdown' && (
                <div className="border border-[var(--border)] rounded-xl p-3">
                  <div className="text-xs text-[var(--muted-foreground)] mb-2">
                    در Markdown وجود ندارد — دستی وارد کنید یا خالی بگذارید
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {JSON_ONLY_FIELDS.map((f) => (
                      <span
                        key={f}
                        className="text-[11px] px-2 py-1 rounded-lg bg-[var(--muted)] text-[var(--muted-foreground)]"
                      >
                        {FIELD_LABELS[f]}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {skipped.length > 0 && (
                <p className="flex items-start gap-2 text-xs text-[var(--accent-text)] leading-relaxed">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  {formatPersianNumber(skipped.length)} فیلد از قبل پر است و رد می‌شود. برای
                  جایگزینی، گزینه زیر را فعال کن.
                </p>
              )}

              {result.notes.map((note) => (
                <p key={note} className="flex items-start gap-2 text-xs text-[var(--muted-foreground)] leading-relaxed">
                  <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  {note}
                </p>
              ))}

              <label className="flex items-center gap-3 cursor-pointer">
                <button
                  type="button"
                  onClick={() => setOverwrite((o) => !o)}
                  className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                    overwrite ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                      overwrite ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
                <span className="text-[var(--foreground)] text-sm">جایگزینی فیلدهایی که از قبل پر هستند</span>
              </label>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 px-6 py-4 border-t border-[var(--border)] flex-shrink-0">
          <button
            type="button"
            onClick={submit}
            disabled={!result?.ok}
            className="flex-1 h-11 rounded-xl bg-emerald-500 text-black font-bold hover:bg-emerald-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {result?.ok
              ? `وارد کردن ${formatPersianNumber(willWrite.length)} فیلد`
              : 'وارد کردن'}
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
