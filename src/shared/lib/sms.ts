import { prisma } from '@/shared/lib/prisma';
import { siteConfig } from '@/shared/config/site';
import { latinDigits } from '@/shared/lib/utils';
import { ORDER_STEPS } from '@/shared/lib/order-status';

/**
 * پیامک‌های سفارش با «خط خدماتی اشتراکی» ملی پیامک (ارسال با الگو): از خط خدماتی می‌رود و به شماره‌هایی که پیامک
 * تبلیغاتی را بسته‌اند هم می‌رسد. متن هر الگو یک بار در پنل ملی پیامک ثبت و تأیید می‌شود و یک کد (bodyId) می‌گیرد؛
 * اینجا فقط کد الگو و مقدار متغیرها ({0}، {1}، ...) ارسال می‌شود.
 *
 * تنظیمات (متغیرهای محیطی سرور):
 *   MELIPAYAMAK_USERNAME   نام کاربری پنل ملی پیامک
 *   MELIPAYAMAK_PASSWORD   کلید وب‌سرویس (توسعه دهندگان ← وب سرویس & API) — بدون این دو هیچ پیامکی ارسال نمی‌شود
 *   SMS_ADMIN_MOBILE       موبایل(های) مدیر برای خبر درخواست جدید، با کاما — پیش‌فرض: موبایل تنظیمات سایت
 *
 * خطای ارسال هیچ‌وقت ثبت سفارش را خراب نمی‌کند؛ فقط لاگ می‌شود.
 */

/** کد الگوها (bodyId) بعد از تأیید در پنل ملی پیامک — ۰ یعنی هنوز ثبت نشده و ارسال نمی‌شود */
export const SMS_TEMPLATES = {
  /** به مدیر: درخواست پیش‌فاکتور جدید — {0} شماره، {1} نام مشتری، {2} موبایل مشتری */
  adminNewQuote: 0,
  /** به مشتری: درخواست ثبت شد — {0} نام، {1} شماره */
  quoteReceived: 0,
  /** به مشتری: پیش‌فاکتور تأیید و صادر شد — {0} نام، {1} شماره، {2} کد لینک کوتاه (/q/s/...) */
  quoteIssued: 0,
  /** به مشتری: مرحله سفارش عوض شد — {0} شماره، {1} مرحله */
  orderStatus: 0,
} as const;

const API = 'https://rest.payamak-panel.com/api/SendSMS/BaseServiceNumber';

/** متغیرها با «;» از هم جدا می‌شوند — «;» و خط جدید داخل مقدار نباید باشد */
const clean = (value: string) => latinDigits(value).replace(/[;\r\n]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 100);

function normalizeMobile(raw: string) {
  const digits = latinDigits(raw).replace(/\D/g, '');
  if (/^09\d{9}$/.test(digits)) return digits;
  if (/^9\d{9}$/.test(digits)) return `0${digits}`;
  if (/^989\d{9}$/.test(digits)) return `0${digits.slice(2)}`;
  return null;
}

async function send(to: string, bodyId: number, args: string[]) {
  const username = process.env.MELIPAYAMAK_USERNAME;
  const password = process.env.MELIPAYAMAK_PASSWORD;
  const mobile = normalizeMobile(to);
  if (!username || !password) return console.warn(`[sms] MELIPAYAMAK_USERNAME/PASSWORD not set — skipped body ${bodyId}`);
  if (!bodyId) return console.warn('[sms] template not registered yet — skipped');
  if (!mobile) return console.warn(`[sms] invalid mobile — skipped body ${bodyId}`);

  const res = await fetch(API, {
    method: 'POST',
    body: new URLSearchParams({ username, password, to: mobile, bodyId: String(bodyId), text: args.map(clean).join(';') }),
    signal: AbortSignal.timeout(10_000),
  });
  const data = await res.json().catch(() => null);
  // موفق: Value شناسه پیامک است (بیش از ۱۵ رقم)؛ در غیر این صورت کد خطا (مثلاً ‎-10 یعنی لینک در متغیرها)
  const value = String(data?.Value ?? '');
  if (!/^\d{15,}$/.test(value)) throw new Error(`melipayamak body ${bodyId}: ${res.status} ${value} ${data?.StrRetStatus ?? ''}`);
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
        safe(() => send(m, SMS_TEMPLATES.adminNewQuote, [q.number, q.customerName, q.customerPhone])),
      ),
      safe(() => send(q.customerPhone, SMS_TEMPLATES.quoteReceived, [q.customerName, q.number])),
    ]);
  });
}

/** پیش‌فاکتور تأیید و صادر شد: لینک مشاهده به مشتری */
export function notifyQuoteIssued(q: QuoteInfo) {
  // لینک کامل در متغیر رد می‌شود (خطای ‎-10)؛ دامنه در متن الگوست و فقط کد hex توکن به /q/s/<hex> می‌رود
  const code = Buffer.from(q.token, 'base64url').toString('hex');
  return safe(() => send(q.customerPhone, SMS_TEMPLATES.quoteIssued, [q.customerName, q.number, code]));
}

/** مرحله جدید سفارش (آماده‌سازی، بارگیری، ارسال، تحویل) */
export function notifyOrderStatus(q: QuoteInfo, status: string) {
  const step = ORDER_STEPS.find((s) => s.key === status);
  if (!step) return Promise.resolve();
  return safe(() => send(q.customerPhone, SMS_TEMPLATES.orderStatus, [q.number, step.label]));
}
