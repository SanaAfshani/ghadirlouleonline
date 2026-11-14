'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Languages, Loader2, Sparkles } from 'lucide-react';
import { HtmlContentEditor } from '@/features/admin/editor/HtmlContentEditor';
import { cn, faDigits } from '@/shared/lib/utils';
import type { SpecTranslation, TranslationValue } from '@/shared/lib/translations';
import type { FaqItem } from '@/shared/types';
import { requestTranslation } from '@/features/admin/content/translate-client';

/**
 * زبانه «English» فرم‌های پنل (محصول، دسته، مقاله، پروژه، سوال، نظر). مقدار فارسی هر فیلد بالای ورودی دیده می‌شود
 * و «ترجمه خودکار» فقط فیلدهای خالی را پر می‌کند تا ترجمه اصلاح‌شده دستی بازنویسی نشود. ذخیره با همان دکمه فرم است.
 */
export type TranslationFieldDef =
  | { name: string; label: string; type: 'text' | 'textarea' | 'html' }
  | { name: 'faqs'; label: string; type: 'faqs' }
  | { name: 'specifications'; label: string; type: 'specs' }
  | { name: 'tags' | 'catalogTitles' | 'imageAlts'; label: string; type: 'list' };

export type EnglishTranslations = Record<string, TranslationValue>;

const inputCls =
  'w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 text-sm focus:outline-none focus:border-[var(--accent)] transition-colors';

function asString(v: unknown) {
  return typeof v === 'string' ? v : '';
}

function Source({ text }: { text: string }) {
  if (!text) return null;
  return (
    <p className="mb-1.5 text-xs leading-6 text-[var(--muted-foreground)] bg-[var(--muted)] rounded-lg px-2.5 py-1.5 line-clamp-3" dir="rtl">
      {text.replace(/<[^>]+>/g, ' ')}
    </p>
  );
}

/**
 * source: مقدار فارسی فیلدها از state فرم؛ برای specs یک Record<string,string>، برای faqs آرایه FaqItem،
 * برای فهرست‌ها آرایه رشته (عنوان کاتالوگ‌ها، alt عکس‌ها، برچسب‌ها).
 */
export function TranslationEditor({
  fields,
  source,
  value,
  onChange,
}: {
  fields: TranslationFieldDef[];
  source: Record<string, unknown>;
  value: EnglishTranslations;
  onChange: (next: EnglishTranslations) => void;
}) {
  const [translating, setTranslating] = useState(false);
  const set = (name: string, v: TranslationValue) => onChange({ ...value, [name]: v });

  const missing = collectMissing(fields, source, value);

  const autoTranslate = async () => {
    if (!missing.length) return toast('همه فیلدها ترجمه دارند');
    setTranslating(true);
    try {
      const result = await requestTranslation(missing);
      onChange(applyResult(fields, source, value, result));
      toast.success(`${faDigits(Object.keys(result).length)} متن ترجمه شد — بازبینی و ذخیره کنید`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'ترجمه انجام نشد');
    } finally {
      setTranslating(false);
    }
  };

  return (
    <div className="space-y-5" dir="ltr">
      <div className="flex flex-wrap items-center gap-3" dir="rtl">
        <p className="text-xs text-[var(--muted-foreground)] leading-6 flex gap-1.5 flex-1 min-w-60">
          <Languages className="w-4 h-4 shrink-0" />
          نسخه انگلیسی سایت (/en). فیلد خالی در سایت انگلیسی متن فارسی را نشان می‌دهد و تا وقتی «{fields[0]?.label}» ترجمه نشده، صفحه انگلیسی در گوگل
          ایندکس نمی‌شود.
        </p>
        <button
          type="button"
          onClick={autoTranslate}
          disabled={translating || !missing.length}
          className="h-10 px-4 rounded-xl border border-[var(--border)] text-sm font-bold flex items-center gap-1.5 hover:border-[var(--accent)] disabled:opacity-50"
        >
          {translating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          ترجمه خودکار {missing.length > 0 && `(${faDigits(missing.length)})`}
        </button>
      </div>

      {fields.map((field) => {
        const src = source[field.name];
        switch (field.type) {
          case 'text':
          case 'textarea':
            return (
              <label key={field.name} className="block">
                <span className="block mb-1.5 text-sm font-semibold" dir="rtl">{field.label}</span>
                <Source text={asString(src)} />
                {field.type === 'text' ? (
                  <input value={asString(value[field.name])} onChange={(e) => set(field.name, e.target.value)} className={cn(inputCls, 'h-11')} />
                ) : (
                  <textarea value={asString(value[field.name])} onChange={(e) => set(field.name, e.target.value)} rows={3} className={cn(inputCls, 'py-2.5 leading-7')} />
                )}
              </label>
            );
          case 'html':
            return (
              <div key={field.name}>
                <span className="block mb-1.5 text-sm font-semibold" dir="rtl">{field.label}</span>
                <Source text={asString(src)} />
                <HtmlContentEditor value={asString(value[field.name])} onChange={(v) => set(field.name, v)} rows={10} />
              </div>
            );
          case 'list': {
            const list = Array.isArray(src) ? (src as string[]) : [];
            const current = Array.isArray(value[field.name]) ? (value[field.name] as string[]) : [];
            if (!list.length) return null;
            return (
              <div key={field.name} className="space-y-2">
                <span className="block text-sm font-semibold" dir="rtl">{field.label}</span>
                {list.map((item, i) => (
                  <div key={i} className="grid sm:grid-cols-2 gap-2 items-center">
                    <span className="text-xs text-[var(--muted-foreground)] truncate" dir="rtl">{item || '—'}</span>
                    <input
                      value={current[i] ?? ''}
                      onChange={(e) => set(field.name, list.map((_, k) => (k === i ? e.target.value : current[k] ?? '')))}
                      className={cn(inputCls, 'h-10')}
                    />
                  </div>
                ))}
              </div>
            );
          }
          case 'faqs': {
            const list = Array.isArray(src) ? (src as FaqItem[]) : [];
            const current = Array.isArray(value.faqs) ? (value.faqs as FaqItem[]) : [];
            if (!list.length) return null;
            const update = (i: number, patch: Partial<FaqItem>) =>
              set('faqs', list.map((_, k) => ({ question: current[k]?.question ?? '', answer: current[k]?.answer ?? '', ...(k === i ? patch : {}) })));
            return (
              <div key="faqs" className="space-y-3">
                <span className="block text-sm font-semibold" dir="rtl">{field.label}</span>
                {list.map((faq, i) => (
                  <div key={i} className="rounded-xl border border-[var(--border)] p-3 space-y-2">
                    <Source text={faq.question} />
                    <input value={current[i]?.question ?? ''} onChange={(e) => update(i, { question: e.target.value })} placeholder="Question" className={cn(inputCls, 'h-10')} />
                    <Source text={faq.answer} />
                    <textarea value={current[i]?.answer ?? ''} onChange={(e) => update(i, { answer: e.target.value })} placeholder="Answer" rows={3} className={cn(inputCls, 'py-2 leading-7')} />
                  </div>
                ))}
              </div>
            );
          }
          case 'specs': {
            const specs = src && typeof src === 'object' && !Array.isArray(src) ? (src as Record<string, string>) : {};
            const current = (value.specifications && typeof value.specifications === 'object' && !Array.isArray(value.specifications)
              ? value.specifications
              : {}) as Record<string, SpecTranslation>;
            const keys = Object.keys(specs);
            if (!keys.length) return null;
            const update = (key: string, patch: Partial<SpecTranslation>) =>
              set('specifications', { ...current, [key]: { label: current[key]?.label ?? '', value: current[key]?.value ?? '', ...patch } });
            return (
              <div key="specs" className="space-y-2">
                <span className="block text-sm font-semibold" dir="rtl">{field.label}</span>
                {keys.map((key) => (
                  <div key={key} className="grid sm:grid-cols-[1fr_1fr_1fr] gap-2 items-center">
                    <span className="text-xs text-[var(--muted-foreground)] truncate" dir="rtl">
                      {key}: {specs[key]}
                    </span>
                    <input value={current[key]?.label ?? ''} onChange={(e) => update(key, { label: e.target.value })} placeholder="Label" className={cn(inputCls, 'h-10')} />
                    <input value={current[key]?.value ?? ''} onChange={(e) => update(key, { value: e.target.value })} placeholder="Value" className={cn(inputCls, 'h-10')} />
                  </div>
                ))}
              </div>
            );
          }
        }
      })}
    </div>
  );
}

type Missing = { id: string; text: string; html: boolean };

/** فیلدهای فارسیِ پر که نسخه انگلیسی ندارند؛ id مسیر فیلد است: name، faqs.0.question، specifications.<key>.label */
function collectMissing(fields: TranslationFieldDef[], source: Record<string, unknown>, value: EnglishTranslations): Missing[] {
  const out: Missing[] = [];
  for (const field of fields) {
    const src = source[field.name];
    if (field.type === 'text' || field.type === 'textarea' || field.type === 'html') {
      if (asString(src).trim() && !asString(value[field.name]).trim()) out.push({ id: field.name, text: asString(src), html: field.type === 'html' });
    } else if (field.type === 'list' && Array.isArray(src)) {
      const current = Array.isArray(value[field.name]) ? (value[field.name] as string[]) : [];
      (src as string[]).forEach((t, i) => t?.trim() && !current[i]?.trim() && out.push({ id: `${field.name}.${i}`, text: t, html: false }));
    } else if (field.type === 'faqs' && Array.isArray(src)) {
      const current = Array.isArray(value.faqs) ? (value.faqs as FaqItem[]) : [];
      (src as FaqItem[]).forEach((f, i) => {
        if (f.question && !current[i]?.question) out.push({ id: `faqs.${i}.question`, text: f.question, html: false });
        if (f.answer && !current[i]?.answer) out.push({ id: `faqs.${i}.answer`, text: f.answer, html: false });
      });
    } else if (field.type === 'specs' && src && typeof src === 'object') {
      const current = (value.specifications ?? {}) as Record<string, SpecTranslation>;
      for (const [key, v] of Object.entries(src as Record<string, string>)) {
        if (!current[key]?.label) out.push({ id: `specifications.${key}.label`, text: key, html: false });
        if (v && !current[key]?.value) out.push({ id: `specifications.${key}.value`, text: v, html: false });
      }
    }
  }
  return out;
}

function applyResult(fields: TranslationFieldDef[], source: Record<string, unknown>, value: EnglishTranslations, result: Record<string, string>): EnglishTranslations {
  const next: EnglishTranslations = { ...value };
  for (const [id, text] of Object.entries(result)) {
    const [name, ...rest] = id.split('.');
    const field = fields.find((f) => f.name === name);
    if (!field) continue;
    if (!rest.length) {
      next[name] = text;
    } else if (field.type === 'list') {
      const length = Array.isArray(source[name]) ? (source[name] as string[]).length : 0;
      const list = Array.from({ length }, (_, i) => (Array.isArray(next[name]) ? (next[name] as string[])[i] : '') ?? '');
      list[Number(rest[0])] = text;
      next[name] = list;
    } else if (field.type === 'faqs') {
      const length = Array.isArray(source.faqs) ? (source.faqs as FaqItem[]).length : 0;
      const list = Array.from({ length }, (_, i) => ({ question: '', answer: '', ...((next.faqs as FaqItem[] | undefined)?.[i] ?? {}) }));
      const i = Number(rest[0]);
      if (list[i]) list[i] = { ...list[i], [rest[1] as 'question' | 'answer']: text };
      next.faqs = list;
    } else if (field.type === 'specs') {
      const part = rest.pop() as 'label' | 'value';
      const key = rest.join('.');
      const specs = { ...((next.specifications ?? {}) as Record<string, SpecTranslation>) };
      specs[key] = { label: specs[key]?.label ?? '', value: specs[key]?.value ?? '', [part]: text };
      next.specifications = specs;
    }
  }
  return next;
}
