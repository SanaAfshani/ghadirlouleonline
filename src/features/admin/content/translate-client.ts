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

export { applyTranslations, missingTranslations } from '@/shared/content/translate-items';
