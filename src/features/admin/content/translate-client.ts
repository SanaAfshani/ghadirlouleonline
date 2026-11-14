import type { Fields } from '@/shared/content/types';
import type { Values } from './FieldEditor';

type Item = { id: string; text: string; html: boolean };

/** پیشنهاد ترجمه انگلیسی از /api/admin/translate — { مسیر: متن } */
export async function requestTranslation(items: Item[]): Promise<Record<string, string>> {
  const res = await fetch('/api/admin/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.success) throw new Error(json.error || 'ترجمه انجام نشد');
  return json.data as Record<string, string>;
}

function items(value: unknown): Values[] {
  return Array.isArray(value) ? (value as Values[]) : [];
}

/**
 * متن‌های فارسی که نسخه انگلیسی‌شان خالی است، با مسیر هر فیلد (مثل 'items.2.title').
 * فقط جاهای خالی ترجمه می‌شوند تا ترجمه‌ای که ادمین دستی اصلاح کرده دوباره بازنویسی نشود.
 */
export function missingTranslations(fields: Fields, primary: Values, translated: Values, prefix = ''): Item[] {
  return Object.entries(fields).flatMap(([name, field]): Item[] => {
    if (field.type === 'image' || field.type === 'link') return [];
    if (field.type === 'list') {
      const target = items(translated[name]);
      return items(primary[name]).flatMap((item, i) =>
        missingTranslations(field.fields, item, target[i] ?? {}, `${prefix}${name}.${i}.`),
      );
    }
    const source = typeof primary[name] === 'string' ? (primary[name] as string) : '';
    const current = typeof translated[name] === 'string' ? (translated[name] as string) : '';
    return source.trim() && !current.trim() ? [{ id: `${prefix}${name}`, text: source, html: field.type === 'html' }] : [];
  });
}

/** نتیجه ترجمه را در مسیرهای مشخص‌شده فرم انگلیسی می‌نشاند */
export function applyTranslations(value: Values, result: Record<string, string>): Values {
  const next: Values = structuredClone(value);
  for (const [path, text] of Object.entries(result)) {
    const parts = path.split('.');
    let target: Record<string, unknown> | undefined = next;
    for (let i = 0; i < parts.length - 1 && target; i++) {
      target = target[parts[i]] as Record<string, unknown> | undefined;
    }
    if (target) target[parts[parts.length - 1]] = text;
  }
  return next;
}
