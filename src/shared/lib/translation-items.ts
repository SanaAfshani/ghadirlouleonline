import type { SpecTranslation, TranslationValue } from '@/shared/lib/translations';
import type { FaqItem } from '@/shared/types';

/**
 * فیلدهای قابل ترجمه هر مدل و دو کار مشترک فرم پنل، ترجمه گروهی و اسکریپت: پیدا کردن متن‌های فارسیِ بدون ترجمه
 * (هر کدام با یک id مسیر مثل faqs.0.answer) و نشاندن نتیجه ترجمه در شکل ذخیره‌شده ستون translations.
 */
export type TranslationFieldDef =
  | { name: string; label: string; type: 'text' | 'textarea' | 'html' }
  | { name: 'faqs'; label: string; type: 'faqs' }
  | { name: 'specifications'; label: string; type: 'specs' }
  | { name: 'tags' | 'catalogTitles' | 'imageAlts'; label: string; type: 'list' };

export type EnglishTranslations = Record<string, TranslationValue>;

function asString(v: unknown) {
  return typeof v === 'string' ? v : '';
}

export type TranslationItem = { id: string; text: string; html: boolean };

/** فیلدهای فارسیِ پر که نسخه انگلیسی ندارند؛ id مسیر فیلد است: name، faqs.0.question، specifications.<key>.label */
export function missingTranslationItems(fields: TranslationFieldDef[], source: Record<string, unknown>, value: EnglishTranslations): TranslationItem[] {
  const out: TranslationItem[] = [];
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

/** نتیجه ترجمه (id ← متن) را در شکل ذخیره‌شده ترجمه‌ها می‌نشاند */
export function applyTranslationItems(fields: TranslationFieldDef[], source: Record<string, unknown>, value: EnglishTranslations, result: Record<string, string>): EnglishTranslations {
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
