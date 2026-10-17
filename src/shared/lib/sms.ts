import { prisma } from '@/shared/lib/prisma';
import { siteConfig } from '@/shared/config/site';
import { latinDigits } from '@/shared/lib/utils';
import { ORDER_STEPS } from '@/shared/lib/order-status';

/**
 * پیامک‌های سفارش با الگوی اعتبارسنجی کاوه‌نگار (verify/lookup): از خط خدماتی می‌رود و به شماره‌هایی که پیامک تبلیغاتی
 * را بسته‌اند هم می‌رسد. متن هر الگو یک بار در پنل کاوه‌نگار ثبت و تأیید می‌شود؛ اینجا فقط نام الگو و مقدارها ارسال می‌شود.
 *
 * تنظیمات (متغیرهای محیطی سرور):
 *   KAVENEGAR_API_KEY   کلید API پنل — بدون آن هیچ پیامکی ارسال نمی‌شود و فقط لاگ می‌شود
 *   SMS_ADMIN_MOBILE    موبایل(های) مدیر برای خبر درخواست جدید، با کاما — پیش‌فرض: موبایل تنظیمات سایت
 *
 * خطای ارسال هیچ‌وقت ثبت سفارش را خراب نمی‌کند؛ فقط لاگ می‌شود.
 */

/** نام الگوها در پنل کاوه‌نگار — انگلیسی، بدون فاصله و _ */
export const SMS_TEMPLATES = {
  /** به مدیر: درخواست پیش‌فاکتور جدید — %token شماره، %token2 موبایل مشتری، %token10 نام مشتری */
  adminNewQuote: 'ghadirNewQuote',
  /** به مشتری: درخواست ثبت شد — %token شماره، %token10 نام */
  quoteReceived: 'ghadirQuoteReceived',
  /** به مشتری: پیش‌فاکتور تأیید و صادر شد — %token شماره، %token2 کد لینک کوتاه (/q/s/...)، %token10 نام */
  quoteIssued: 'ghadirQuoteIssued',
  /** به مشتری: مرحله سفارش عوض شد — %token شماره، %token10 مرحله */
  orderStatus: 'ghadirOrderStatus',
} as const;

type Tokens = { token: string; token2?: string; token3?: string; token10?: string; token20?: string };

const API = 'https://api.kavenegar.com/v1';

/** token/token2/token3 فاصله نمی‌پذیرند؛ token10 تا ۵ و token20 تا ۸ فاصله. _ هم خطای ۴۳۱ می‌دهد */
function clean(value: string, maxSpaces: number) {
  let spaces = 0;
  return latinDigits(value)
    .replace(/_/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/ /g, () => (spaces++ < maxSpaces ? ' ' : '‌'))
    .slice(0, 100);
}

function normalizeMobile(raw: string) {
  const digits = latinDigits(raw).replace(/\D/g, '');
  if (/^09\d{9}$/.test(digits)) return digits;
  if (/^9\d{9}$/.test(digits)) return `0${digits}`;
  if (/^989\d{9}$/.test(digits)) return `0${digits.slice(2)}`;
  return null;
}

async function lookup(receptor: string, template: string, tokens: Tokens) {
  const apiKey = process.env.KAVENEGAR_API_KEY;
  const mobile = normalizeMobile(receptor);
  if (!apiKey) return console.warn(`[sms] KAVENEGAR_API_KEY not set — skipped ${template}`);
  if (!mobile) return console.warn(`[sms] invalid mobile — skipped ${template}`);

  const params = new URLSearchParams({ receptor: mobile, template, token: clean(tokens.token, 0) });
  if (tokens.token2) params.set('token2', clean(tokens.token2, 0));
  if (tokens.token3) params.set('token3', clean(tokens.token3, 0));
  if (tokens.token10) params.set('token10', clean(tokens.token10, 5));
  if (tokens.token20) params.set('token20', clean(tokens.token20, 8));

  const res = await fetch(`${API}/${encodeURIComponent(apiKey)}/verify/lookup.json`, {
    method: 'POST',
    body: params,
    signal: AbortSignal.timeout(10_000),
  });
  const data = await res.json().catch(() => null);
  const status = data?.return?.status ?? res.status;
  if (status !== 200) throw new Error(`kavenegar ${template}: ${status} ${data?.return?.message ?? ''}`);
}

/** ارسال بدون شکستن جریان اصلی — در after() صدا زده می‌شود */
async function safe(task: () => Promise<unknown>) {
  try {
    await task();
  } catch (error) {
    console.error('[sms] send failed:', error);
  }
}

async function adminMobiles() {
  const fromEnv = process.env.SMS_ADMIN_MOBILE;
  if (fromEnv) return fromEnv.split(',').map((m) => m.trim()).filter(Boolean);
  const setting = await prisma.siteSettings.findUnique({ where: { key: 'contact_mobile' }, select: { value: true } });
  return [setting?.value || siteConfig.mobile].filter(Boolean);
}

type QuoteInfo = { number: string; token: string; customerName: string; customerPhone: string };

/** درخواست پیش‌فاکتور جدید: خبر به مدیر + تأیید ثبت به مشتری */
export function notifyQuoteRequested(q: QuoteInfo) {
  return safe(async () => {
    const admins = await adminMobiles();
    await Promise.all([
      ...admins.map((m) =>
        safe(() => lookup(m, SMS_TEMPLATES.adminNewQuote, { token: q.number, token2: q.customerPhone, token10: q.customerName })),
      ),
      safe(() => lookup(q.customerPhone, SMS_TEMPLATES.quoteReceived, { token: q.number, token10: q.customerName })),
    ]);
  });
}

/** پیش‌فاکتور تأیید و صادر شد: لینک مشاهده به مشتری */
export function notifyQuoteIssued(q: QuoteInfo) {
  // توکن لینک «_» دارد که کاوه‌نگار نمی‌پذیرد — hex آن به /q/s/<hex> می‌رود و به /q/<token> برمی‌گردد
  const code = Buffer.from(q.token, 'base64url').toString('hex');
  return safe(() => lookup(q.customerPhone, SMS_TEMPLATES.quoteIssued, { token: q.number, token2: code, token10: q.customerName }));
}

/** مرحله جدید سفارش (آماده‌سازی، بارگیری، ارسال، تحویل) */
export function notifyOrderStatus(q: QuoteInfo, status: string) {
  const step = ORDER_STEPS.find((s) => s.key === status);
  if (!step) return Promise.resolve();
  return safe(() => lookup(q.customerPhone, SMS_TEMPLATES.orderStatus, { token: q.number, token10: step.label }));
}
