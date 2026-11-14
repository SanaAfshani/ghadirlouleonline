'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ChevronDown, Languages, Loader2, RotateCcw, Save, Sparkles } from 'lucide-react';
import { useConfirm } from '@/shared/ui/ConfirmDialog';
import { Skeleton } from '@/shared/ui/Skeleton';
import { cn, faDigits } from '@/shared/lib/utils';
import type { Fields } from '@/shared/content/types';
import type { Locale } from '@/shared/i18n/config';
import { FieldsEditor, type Values } from './FieldEditor';
import { applyTranslations, missingTranslations, requestTranslation } from './translate-client';

type Payload = {
  key: string;
  title: string;
  description: string | null;
  fields: Fields;
  values: Record<Locale, Values>;
  customized: Record<Locale, boolean>;
  untranslated: number;
};

export type SectionSummary = { key: string; title: string; customized: boolean; untranslated: number; updatedAt: string | null };

const LOCALE_TABS: { locale: Locale; label: string }[] = [
  { locale: 'fa', label: 'فارسی' },
  { locale: 'en', label: 'English' },
];

/**
 * ویرایش یک بخش از یک صفحه. هر زبان جدا ذخیره می‌شود؛ تغییرات ذخیره‌نشده با onDirtyChange به صفحه گزارش می‌شود
 * تا قبل از بستن تب هشدار داده شود.
 */
export function SectionEditor({
  summary,
  open,
  onToggle,
  onDirtyChange,
  onSaved,
}: {
  summary: SectionSummary;
  open: boolean;
  onToggle: () => void;
  onDirtyChange: (key: string, dirty: boolean) => void;
  onSaved: (summary: Pick<SectionSummary, 'key' | 'customized' | 'untranslated'>) => void;
}) {
  const confirm = useConfirm();
  const [payload, setPayload] = useState<Payload | null>(null);
  const [draft, setDraft] = useState<Record<Locale, Values> | null>(null);
  const [locale, setLocale] = useState<Locale>('fa');
  const [busy, setBusy] = useState<'save' | 'reset' | 'translate' | null>(null);

  useEffect(() => {
    if (!open || payload) return;
    fetch(`/api/admin/content/${encodeURIComponent(summary.key)}`)
      .then((r) => r.json())
      .then((j) => {
        if (!j.success) throw new Error(j.error);
        setPayload(j.data);
        setDraft(j.data.values);
      })
      .catch((e) => toast.error(e instanceof Error && e.message ? e.message : 'بارگذاری نشد'));
  }, [open, payload, summary.key]);

  const dirtyLocales = payload && draft ? LOCALE_TABS.filter((t) => JSON.stringify(draft[t.locale]) !== JSON.stringify(payload.values[t.locale])).map((t) => t.locale) : [];
  const dirty = dirtyLocales.length > 0;

  useEffect(() => {
    onDirtyChange(summary.key, dirty);
  }, [dirty, summary.key, onDirtyChange]);

  const accept = (data: Payload, keepOther: boolean) => {
    setPayload(data);
    // زبان دیگر اگر تغییر ذخیره‌نشده دارد دست نمی‌خورد
    setDraft((d) => (keepOther && d ? { ...data.values, [locale === 'fa' ? 'en' : 'fa']: d[locale === 'fa' ? 'en' : 'fa'] } : data.values));
    onSaved({ key: data.key, customized: data.customized.fa || data.customized.en, untranslated: data.untranslated });
  };

  const save = async () => {
    if (!draft) return;
    setBusy('save');
    try {
      const res = await fetch(`/api/admin/content/${encodeURIComponent(summary.key)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale, data: draft[locale] }),
      });
      const j = await res.json();
      if (!res.ok || !j.success) throw new Error(j.error || 'ذخیره نشد');
      accept(j.data, true);
      toast.success(locale === 'fa' ? 'ذخیره شد و در سایت اعمال شد' : 'نسخه انگلیسی ذخیره شد');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'ذخیره نشد');
    } finally {
      setBusy(null);
    }
  };

  const reset = async () => {
    const ok = await confirm({
      title: 'بازگشت به متن پیش‌فرض',
      message: `همه تغییرات ${locale === 'fa' ? 'فارسی' : 'انگلیسی'} این بخش پاک می‌شود و متن اولیه سایت برمی‌گردد.`,
      confirmLabel: 'بازگشت به پیش‌فرض',
      tone: 'danger',
    });
    if (!ok) return;
    setBusy('reset');
    try {
      const res = await fetch(`/api/admin/content/${encodeURIComponent(summary.key)}?locale=${locale}`, { method: 'DELETE' });
      const j = await res.json();
      if (!res.ok || !j.success) throw new Error(j.error || 'انجام نشد');
      accept(j.data, true);
      toast.success('متن پیش‌فرض برگشت');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'انجام نشد');
    } finally {
      setBusy(null);
    }
  };

  const translate = async () => {
    if (!payload || !draft) return;
    const todo = missingTranslations(payload.fields, draft.fa, draft.en);
    if (!todo.length) return toast('همه متن‌ها ترجمه دارند');
    setBusy('translate');
    try {
      const result = await requestTranslation(todo);
      setDraft({ ...draft, en: applyTranslations(draft.en, result) });
      toast.success(`${faDigits(Object.keys(result).length)} متن ترجمه شد — بازبینی و ذخیره کنید`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'ترجمه انجام نشد');
    } finally {
      setBusy(null);
    }
  };

  const untranslated = payload && draft ? missingTranslations(payload.fields, draft.fa, draft.en).length : summary.untranslated;

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl">
      <button type="button" onClick={onToggle} className="w-full flex items-center gap-3 p-4 sm:p-5 text-start">
        <span className="font-bold text-[var(--foreground)]">{summary.title}</span>
        {summary.customized && <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[var(--accent)]/15 text-[var(--accent-text)]">ویرایش‌شده</span>}
        {untranslated > 0 && (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-400">
            {faDigits(untranslated)} متن بدون ترجمه
          </span>
        )}
        {dirty && <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-sky-500/15 text-sky-700 dark:text-sky-400">ذخیره‌نشده</span>}
        <ChevronDown className={cn('w-4 h-4 ms-auto shrink-0 transition-transform text-[var(--muted-foreground)]', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="border-t border-[var(--border)] p-4 sm:p-5 space-y-5">
          {!payload || !draft ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-24" />
            </div>
          ) : (
            <>
              {payload.description && <p className="text-sm text-[var(--muted-foreground)] leading-6">{payload.description}</p>}

              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex p-1 rounded-xl bg-[var(--muted)]" role="tablist">
                  {LOCALE_TABS.map((t) => (
                    <button
                      key={t.locale}
                      type="button"
                      role="tab"
                      aria-selected={locale === t.locale}
                      onClick={() => setLocale(t.locale)}
                      className={cn(
                        'h-9 px-4 rounded-lg text-sm font-bold transition-colors flex items-center gap-1.5',
                        locale === t.locale ? 'bg-[var(--card)] shadow-sm text-[var(--foreground)]' : 'text-[var(--muted-foreground)]',
                      )}
                    >
                      {t.label}
                      {dirtyLocales.includes(t.locale) && <span className="w-1.5 h-1.5 rounded-full bg-sky-500" aria-label="ذخیره‌نشده" />}
                    </button>
                  ))}
                </div>
                {locale === 'en' && (
                  <button
                    type="button"
                    onClick={translate}
                    disabled={busy !== null || untranslated === 0}
                    className="h-10 px-4 rounded-xl border border-[var(--border)] text-sm font-bold flex items-center gap-1.5 hover:border-[var(--accent)] disabled:opacity-50"
                  >
                    {busy === 'translate' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    ترجمه خودکار متن‌های خالی
                  </button>
                )}
              </div>

              {locale === 'en' && (
                <p className="text-xs text-[var(--muted-foreground)] leading-6 flex gap-1.5">
                  <Languages className="w-4 h-4 shrink-0" />
                  عکس‌ها، لینک‌ها و ترتیب آیتم‌ها از نسخه فارسی می‌آید؛ این‌جا فقط متن‌ها ترجمه می‌شوند. متن خالی در سایت انگلیسی همان متن فارسی را نشان می‌دهد.
                </p>
              )}

              <FieldsEditor
                key={locale}
                fields={payload.fields}
                value={draft[locale]}
                onChange={(next) => setDraft({ ...draft, [locale]: next })}
                mode={{ primary: locale === 'fa', reference: locale === 'fa' ? undefined : draft.fa, ltr: locale === 'en' }}
              />

              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={save}
                  disabled={busy !== null || !dirtyLocales.includes(locale)}
                  className="h-11 px-5 rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] text-sm font-black flex items-center gap-1.5 disabled:opacity-50"
                >
                  {busy === 'save' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  ذخیره {locale === 'fa' ? 'فارسی' : 'انگلیسی'}
                </button>
                {dirtyLocales.includes(locale) && (
                  <button
                    type="button"
                    onClick={() => setDraft({ ...draft, [locale]: payload.values[locale] })}
                    disabled={busy !== null}
                    className="h-11 px-4 rounded-xl text-sm font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  >
                    لغو تغییرات
                  </button>
                )}
                {payload.customized[locale] && (
                  <button
                    type="button"
                    onClick={reset}
                    disabled={busy !== null}
                    className="ms-auto h-11 px-4 rounded-xl text-sm font-semibold text-[var(--muted-foreground)] hover:text-red-600 flex items-center gap-1.5"
                  >
                    {busy === 'reset' ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                    بازگشت به پیش‌فرض
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
