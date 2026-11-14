'use client';

import { ChevronDown, ChevronUp, Copy, Plus, Trash2 } from 'lucide-react';
import { HtmlContentEditor } from '@/features/admin/editor/HtmlContentEditor';
import { ImageUploader } from '@/shared/ui/ImageUploader';
import { faDigits, cn } from '@/shared/lib/utils';
import type { FieldDef, Fields } from '@/shared/content/types';

export type Values = Record<string, unknown>;
type Item = Values & { id: string };

const inputCls =
  'w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 text-sm focus:outline-none focus:border-[var(--accent)] transition-colors';
const iconBtn =
  'w-8 h-8 rounded-lg bg-[var(--muted)] grid place-items-center disabled:opacity-40 hover:bg-[var(--border)] transition-colors';

function asItems(value: unknown): Item[] {
  return Array.isArray(value) ? (value as Item[]) : [];
}

/** شناسه آیتم تازه — ثابت می‌ماند تا ترجمه انگلیسی با جابه‌جایی ترتیب به آیتم دیگری نچسبد */
function newItemId() {
  return `item-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

function emptyItem(fields: Fields): Item {
  return {
    id: newItemId(),
    ...Object.fromEntries(Object.entries(fields).map(([name, f]) => [name, f.type === 'list' ? [] : ''])),
  };
}

type Mode = {
  /** زبان اصلی (فارسی): همه فیلدها؛ زبان دوم: فقط متن‌ها، بدون افزودن/حذف آیتم */
  primary: boolean;
  /** مقدار فارسی همان فیلد — در فرم انگلیسی جای placeholder و راهنمای ترجمه */
  reference?: Values;
  ltr: boolean;
};

export function FieldsEditor({ fields, value, onChange, mode }: { fields: Fields; value: Values; onChange: (next: Values) => void; mode: Mode }) {
  return (
    <div className="space-y-4">
      {Object.entries(fields).map(([name, field]) => {
        // عکس و لینک بین دو زبان مشترک است؛ در فرم انگلیسی نشان داده نمی‌شود
        if (!mode.primary && (field.type === 'image' || field.type === 'link')) return null;
        return (
          <FieldEditor
            key={name}
            field={field}
            value={value[name]}
            reference={mode.reference?.[name]}
            onChange={(v) => onChange({ ...value, [name]: v })}
            mode={mode}
          />
        );
      })}
    </div>
  );
}

function Label({ field }: { field: FieldDef }) {
  return (
    <div className="mb-1.5">
      <span className="text-sm font-semibold text-[var(--foreground)]">{field.label}</span>
      {field.hint && <p className="text-xs text-[var(--muted-foreground)] mt-0.5 leading-5">{field.hint}</p>}
    </div>
  );
}

function FieldEditor({ field, value, reference, onChange, mode }: { field: FieldDef; value: unknown; reference: unknown; onChange: (v: unknown) => void; mode: Mode }) {
  const text = typeof value === 'string' ? value : '';
  const refText = typeof reference === 'string' ? reference : '';
  const dir = mode.ltr ? 'ltr' : 'rtl';
  // در فرم انگلیسی، متن فارسی همان فیلد بالای ورودی دیده می‌شود تا مترجم بداند چه چیزی را ترجمه می‌کند
  const source = !mode.primary && refText && field.type !== 'list' && (
    <p className="mb-1.5 text-xs leading-6 text-[var(--muted-foreground)] bg-[var(--muted)] rounded-lg px-2.5 py-1.5 line-clamp-3" dir="rtl">
      {field.type === 'html' ? refText.replace(/<[^>]+>/g, ' ') : refText}
    </p>
  );

  switch (field.type) {
    case 'text':
      return (
        <label className="block">
          <Label field={field} />
          {source}
          {field.multiline ? (
            <textarea value={text} onChange={(e) => onChange(e.target.value)} rows={3} dir={dir} className={cn(inputCls, 'py-2.5 leading-7 resize-y', mode.ltr && 'text-left')} />
          ) : (
            <input value={text} onChange={(e) => onChange(e.target.value)} dir={dir} className={cn(inputCls, 'h-11', mode.ltr && 'text-left')} />
          )}
          {!mode.primary && !text && refText && <MissingTranslation />}
        </label>
      );
    case 'html':
      return (
        <div dir={dir}>
          <Label field={field} />
          {source}
          <HtmlContentEditor value={text} onChange={onChange} rows={8} />
          {!mode.primary && !text && refText && <MissingTranslation />}
        </div>
      );
    case 'link':
      return (
        <label className="block">
          <Label field={field} />
          <input value={text} onChange={(e) => onChange(e.target.value)} dir="ltr" placeholder="/contact یا https://…" className={cn(inputCls, 'h-11 font-mono text-xs text-left')} />
        </label>
      );
    case 'image':
      return (
        <div>
          <Label field={field} />
          <ImageUploader images={text ? [text] : []} onChange={(list) => onChange(list[0] ?? '')} max={1} />
        </div>
      );
    case 'list':
      return <ListEditor field={field} value={asItems(value)} reference={asItems(reference)} onChange={onChange} mode={mode} />;
  }
}

function MissingTranslation() {
  return <p className="mt-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">ترجمه نشده — در سایت انگلیسی متن فارسی نمایش داده می‌شود</p>;
}

function ListEditor({
  field,
  value,
  reference,
  onChange,
  mode,
}: {
  field: Extract<FieldDef, { type: 'list' }>;
  value: Item[];
  reference: Item[];
  onChange: (v: Item[]) => void;
  mode: Mode;
}) {
  const update = (i: number, next: Values) => onChange(value.map((item, k) => (k === i ? ({ ...next, id: item.id } as Item) : item)));
  const move = (i: number, d: -1 | 1) => {
    const next = [...value];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };
  const full = field.max !== undefined && value.length >= field.max;

  return (
    <div>
      <Label field={field} />
      <div className="space-y-3">
        {value.map((item, i) => (
          <div key={item.id} className="rounded-xl border border-[var(--border)] bg-[var(--background)]/60 p-3.5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold text-[var(--muted-foreground)]">
                {field.itemLabel} {faDigits(i + 1)}
              </span>
              {mode.primary && (
                <div className="ms-auto flex items-center gap-1">
                  <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className={iconBtn} aria-label="بالا">
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button type="button" disabled={i === value.length - 1} onClick={() => move(i, 1)} className={iconBtn} aria-label="پایین">
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={full}
                    onClick={() => onChange([...value.slice(0, i + 1), { ...item, id: newItemId() }, ...value.slice(i + 1)])}
                    className={iconBtn}
                    aria-label="تکثیر"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange(value.filter((_, k) => k !== i))}
                    className={cn(iconBtn, 'hover:bg-red-500/15 hover:text-red-600')}
                    aria-label="حذف"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
            <FieldsEditor
              fields={field.fields}
              value={item}
              onChange={(next) => update(i, next)}
              mode={{ ...mode, reference: reference.find((r) => r.id === item.id) }}
            />
          </div>
        ))}
        {!value.length && <p className="text-xs text-[var(--muted-foreground)]">هنوز موردی اضافه نشده است.</p>}
        {mode.primary && (
          <button
            type="button"
            disabled={full}
            onClick={() => onChange([...value, emptyItem(field.fields)])}
            className="h-10 px-4 rounded-xl border-2 border-dashed border-[var(--border)] text-sm font-bold flex items-center gap-1.5 hover:border-[var(--accent)] disabled:opacity-40"
          >
            <Plus className="w-4 h-4" /> افزودن {field.itemLabel}
          </button>
        )}
      </div>
    </div>
  );
}
