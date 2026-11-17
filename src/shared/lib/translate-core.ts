import Anthropic from '@anthropic-ai/sdk';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import { z } from 'zod';

/**
 * ترجمه خودکار فارسی به انگلیسی برای دکمه «ترجمه خودکار» پنل (محتوای صفحات، محصول، مقاله، ...).
 * فقط پیشنهاد است: نتیجه در فرم پنل می‌نشیند و ادمین قبل از ذخیره بازبینی می‌کند.
 * کلید API از ANTHROPIC_API_KEY (یا پروفایل ant) خوانده می‌شود؛ بدون آن دکمه پیام روشن می‌دهد.
 * بدون server-only تا اسکریپت scripts/translate-all.ts هم بتواند از آن استفاده کند؛ کد Next از translate.ts می‌خواند.
 */

export type TranslateItem = { id: string; text: string; html?: boolean };

const ResultSchema = z.object({
  translations: z.array(z.object({ id: z.string(), text: z.string() })),
});

const SYSTEM = `You translate website content for "Ghadir Louleh Online" (Persian: قدیر لوله آنلاین), the exclusive sales agent of the pipe manufacturer "Ghadir Louleh Pasargad" (قدیر لوله پاسارگاد) in Iran, from Persian into English.
Audience: contractors, consulting engineers and buyers of civil-infrastructure products. Tone: clear, professional B2B English; no marketing fluff added.

Terminology:
- لوله کاروگیت / لوله کاروگیت دوجداره → double-wall corrugated pipe; لوله اسپیرال → spiral pipe; اتصالات کاروگیت → corrugated pipe fittings
- کوپلر → coupler; واشر → EPDM seal; زانو → elbow; سه‌راهی → tee; تبدیل → reducer; درپوش → end cap; سختی حلقوی → ring stiffness
- پیش‌فاکتور → pro forma invoice; استعلام قیمت → price request; تومان → Toman; گرمسار → Garmsar; شهرک صنعتی → Industrial Park; شادآباد → Shadabad
- Keep codes and standards exactly: SN4, SN8, PE100, HDPE, ISO 9001, ISIRI 9116-3, DN/ID/OD values.

Rules:
- Translate every item; return each item's id unchanged with its English text, nothing else.
- Use Latin digits. Convert Solar Hijri (Persian calendar) years and dates to Gregorian (e.g. ۱۳۹۱ → 2012, دی ۱۴۰۲ → January 2024).
- Items marked html: keep every tag, attribute, href and src exactly as in the source; translate only the human-readable text and alt/title attributes.
- Plain-text items: return plain text (no markdown, no added quotes).
- Keep person names transliterated (e.g. آقای امیر یوسفی → Mr. Amir Yousefi).`;

/** سقف حجم یک درخواست — مقاله بلند هم جا می‌شود ولی کل سایت یک‌جا نه */
export const MAX_TRANSLATE_CHARS = 80000;

export class TranslateError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

/** سرویس ترجمه خودکار تنظیم شده است؟ (ترجمه هنگام ذخیره و دکمه‌های پنل) */
export function isTranslatorConfigured(): boolean {
  return Boolean(process.env.TRANSLATE_API_BASE_URL?.trim() || process.env.ANTHROPIC_API_KEY?.trim());
}

export async function translateToEnglish(items: TranslateItem[]): Promise<Record<string, string>> {
  const todo = items.filter((item) => item.text.trim());
  if (!todo.length) return {};

  const payload = todo.map((item) => ({ id: item.id, html: Boolean(item.html), text: item.text }));
  const prompt = `Translate these items:\n${JSON.stringify(payload)}`;
  // سرویس سازگار با ChatGPT (مثلاً درگاه‌های ایرانی یا مدل‌های رایگان OpenRouter) اگر تنظیم شده باشد؛ وگرنه Claude
  const text = process.env.TRANSLATE_API_BASE_URL ? await translateWithOpenAICompatible(prompt) : await translateWithClaude(prompt);

  let parsed: z.infer<typeof ResultSchema>;
  try {
    parsed = ResultSchema.parse(JSON.parse(extractJson(text)));
  } catch {
    throw new TranslateError('پاسخ سرویس ترجمه قابل خواندن نبود؛ دوباره امتحان کنید', 502);
  }

  const known = new Set(todo.map((item) => item.id));
  return Object.fromEntries(parsed.translations.filter((t) => known.has(t.id)).map((t) => [t.id, t.text]));
}

/** بعضی مدل‌ها JSON را داخل ```json یا با متن اضافه برمی‌گردانند */
function extractJson(text: string): string {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  return start !== -1 && end > start ? text.slice(start, end + 1) : text;
}

async function translateWithClaude(prompt: string): Promise<string> {
  const client = new Anthropic();
  let message;
  try {
    // استریم چون خروجی مقاله‌های بلند از سقف زمانی درخواست معمولی بیشتر می‌شود
    message = await client.beta.messages
      .stream({
        model: 'claude-opus-5',
        max_tokens: 64000,
        // اگر مدل اصلی درخواست را رد کند، سرور خودش با مدل جایگزین پیشنهادی دوباره امتحان می‌کند
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
        system: SYSTEM,
        messages: [{ role: 'user', content: prompt }],
        output_config: { format: betaZodOutputFormat(ResultSchema) },
      })
      .finalMessage();
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) throw new TranslateError('کلید API ترجمه (ANTHROPIC_API_KEY) نامعتبر است', 503);
    if (error instanceof Anthropic.RateLimitError) throw new TranslateError('سرویس ترجمه موقتاً شلوغ است؛ چند دقیقه دیگر دوباره امتحان کنید', 429);
    if (error instanceof Anthropic.APIError) throw new TranslateError(`خطای سرویس ترجمه (${error.status ?? 'شبکه'})`, 502);
    // بدون هیچ اعتبارنامه‌ای SDK پیش از ارسال درخواست خطا می‌دهد
    throw new TranslateError(
      'ترجمه خودکار تنظیم نشده است: ANTHROPIC_API_KEY یا TRANSLATE_API_BASE_URL/TRANSLATE_API_KEY/TRANSLATE_MODEL را در متغیرهای محیطی سرور قرار دهید',
      503,
    );
  }

  if (message.stop_reason === 'refusal') throw new TranslateError('سرویس ترجمه این متن را ترجمه نکرد', 422);
  if (message.stop_reason === 'max_tokens') throw new TranslateError('متن برای ترجمه یک‌جا خیلی طولانی است؛ بخش‌بخش ترجمه کنید', 413);
  return message.content.flatMap((block) => (block.type === 'text' ? [block.text] : [])).join('');
}

/**
 * هر سرویس با API سازگار با ChatGPT (/chat/completions): TRANSLATE_API_BASE_URL (مثلاً https://openrouter.ai/api/v1)،
 * TRANSLATE_API_KEY و TRANSLATE_MODEL. خروجی JSON با دستور سیستم خواسته می‌شود چون همه مدل‌ها response_format را ندارند.
 */
async function translateWithOpenAICompatible(prompt: string): Promise<string> {
  const base = process.env.TRANSLATE_API_BASE_URL!.replace(/\/+$/, '');
  const model = process.env.TRANSLATE_MODEL;
  if (!model) throw new TranslateError('TRANSLATE_MODEL (نام مدل سرویس ترجمه) تنظیم نشده است', 503);

  let res: Response;
  try {
    res = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.TRANSLATE_API_KEY ?? ''}` },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        messages: [
          { role: 'system', content: `${SYSTEM}\n\nRespond with only a JSON object of the form {"translations":[{"id":"...","text":"..."}]} and nothing else.` },
          { role: 'user', content: prompt },
        ],
      }),
      signal: AbortSignal.timeout(280_000),
    });
  } catch {
    throw new TranslateError('سرویس ترجمه در دسترس نیست (اتصال برقرار نشد)', 502);
  }
  if (!res.ok) {
    // پیام خود سرویس (مثلاً «اعتبار کافی نیست» یا «این مدل در سطح حساب شما در دسترس نیست») — بدون آن علت ۴۲۹ معلوم نبود
    const detail = await res
      .json()
      .then((j: { error?: { message?: string } | string; message?: string }) => (typeof j?.error === 'string' ? j.error : j?.error?.message ?? j?.message ?? ''))
      .catch(() => '');
    const why = detail ? ` — ${String(detail).slice(0, 200)}` : '';
    if (res.status === 401 || res.status === 403) throw new TranslateError(`کلید یا دسترسی سرویس ترجمه مشکل دارد${why}`, 503);
    if (res.status === 429) throw new TranslateError(`سرویس ترجمه درخواست را نپذیرفت (محدودیت سرعت، اعتبار یا سطح حساب)${why}`, 429);
    throw new TranslateError(`خطای سرویس ترجمه (${res.status})${why}`, 502);
  }

  const json = (await res.json().catch(() => null)) as { choices?: { message?: { content?: string }; finish_reason?: string }[] } | null;
  const choice = json?.choices?.[0];
  if (choice?.finish_reason === 'length') throw new TranslateError('متن برای ترجمه یک‌جا خیلی طولانی است؛ بخش‌بخش ترجمه کنید', 413);
  return choice?.message?.content ?? '';
}
