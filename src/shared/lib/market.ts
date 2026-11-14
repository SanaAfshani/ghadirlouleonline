/**
 * ساعت کاری فروش (بازار قیمت).
 * در ساعت کاری قیمت‌ها لحظه‌ای نمایش داده می‌شوند؛ بیرون از آن به جای قیمت «استعلام قیمت».
 * همه محاسبات با ساعت تهران است، چون سرور معمولاً روی UTC اجرا می‌شود.
 */

import { defaultLocale, type Locale } from '@/shared/i18n/config';

export type MarketMode = 'auto' | 'open' | 'closed';
/** کلید: روز هفته جاوااسکریپت (۰=یکشنبه … ۶=شنبه)؛ مقدار: [باز، بسته] به صورت «HH:MM» */
export type MarketSchedule = Partial<Record<'0' | '1' | '2' | '3' | '4' | '5' | '6', [string, string]>>;

export type MarketConfig = { mode: MarketMode; schedule: MarketSchedule };

export type MarketStatus = {
  open: boolean;
  mode: MarketMode;
  /** زمان تغییر وضعیت بعدی (ISO) — برای شمارش معکوس؛ در حالت دستی null */
  nextChangeAt: string | null;
  /** ساعت بسته/باز شدن بعدی به ساعت تهران، مثلاً «۱۷:۰۰» */
  nextChangeLabel: string | null;
  /** نام روز بازگشایی بعدی وقتی بازار بسته است، مثلاً «شنبه» */
  nextOpenDay: string | null;
};

const TZ = 'Asia/Tehran';
const DAY_NAMES = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'];

/** شنبه تا چهارشنبه ۹ تا ۱۷، پنجشنبه ۹ تا ۱۳، جمعه تعطیل */
export const DEFAULT_SCHEDULE: MarketSchedule = {
  '6': ['09:00', '17:00'],
  '0': ['09:00', '17:00'],
  '1': ['09:00', '17:00'],
  '2': ['09:00', '17:00'],
  '3': ['09:00', '17:00'],
  '4': ['09:00', '13:00'],
};

const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + (m || 0);
};

export function parseMarketConfig(raw: Record<string, string>): MarketConfig {
  const mode = (['auto', 'open', 'closed'] as const).includes(raw.market_mode as MarketMode) ? (raw.market_mode as MarketMode) : 'auto';
  let schedule: MarketSchedule = DEFAULT_SCHEDULE;
  if (raw.market_schedule) {
    try {
      const parsed = JSON.parse(raw.market_schedule) as MarketSchedule;
      if (parsed && typeof parsed === 'object') schedule = parsed;
    } catch {
      // مقدار خراب — برنامه پیش‌فرض
    }
  }
  return { mode, schedule };
}

/** روز هفته و دقیقه از نیمه‌شب به ساعت تهران */
function tehranClock(date: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ, weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
  const minutes = (Number(get('hour')) % 24) * 60 + Number(get('minute'));
  return { day, minutes };
}

function faTime(hhmm: string) {
  return hhmm.replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);
}

export function getMarketStatus(config: MarketConfig, now = new Date()): MarketStatus {
  if (config.mode !== 'auto') {
    return { open: config.mode === 'open', mode: config.mode, nextChangeAt: null, nextChangeLabel: null, nextOpenDay: null };
  }

  const { day, minutes } = tehranClock(now);
  // زمان مطلق «امروز ساعت X تهران» = اکنون + (X - دقیقه فعلی)
  const at = (offsetDays: number, hhmm: string) =>
    new Date(now.getTime() + ((offsetDays * 1440 + toMin(hhmm) - minutes) * 60_000) - now.getSeconds() * 1000 - now.getMilliseconds()).toISOString();

  const today = config.schedule[String(day) as keyof MarketSchedule];
  if (today && minutes >= toMin(today[0]) && minutes < toMin(today[1])) {
    return { open: true, mode: 'auto', nextChangeAt: at(0, today[1]), nextChangeLabel: faTime(today[1]), nextOpenDay: null };
  }

  // بسته: اولین بازگشایی در ۷ روز آینده (امروز قبل از ساعت باز هم حساب است)
  for (let i = 0; i < 8; i++) {
    const d = (day + i) % 7;
    const slot = config.schedule[String(d) as keyof MarketSchedule];
    if (!slot) continue;
    if (i === 0 && minutes >= toMin(slot[0])) continue;
    return {
      open: false,
      mode: 'auto',
      nextChangeAt: at(i, slot[0]),
      nextChangeLabel: faTime(slot[0]),
      nextOpenDay: i === 0 ? 'امروز' : i === 1 ? 'فردا' : DAY_NAMES[d],
    };
  }
  return { open: false, mode: 'auto', nextChangeAt: null, nextChangeLabel: null, nextOpenDay: null };
}

const DAY_NAMES_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * nextOpenDay به زبان صفحه. وضعیت بازار یک‌بار روی سرور و به فارسی ساخته می‌شود (پنل ادمین هم همان را می‌خواند)؛
 * نسخه انگلیسی سایت فقط برچسب را برمی‌گرداند.
 */
export function openDayLabel(day: string, locale: Locale) {
  if (locale === defaultLocale) return day;
  if (day === 'امروز') return 'today';
  if (day === 'فردا') return 'tomorrow';
  const i = DAY_NAMES.indexOf(day);
  return i < 0 ? day : DAY_NAMES_EN[i];
}

export const WEEK_ORDER = ['6', '0', '1', '2', '3', '4', '5'] as const;
export const WEEKDAY_LABEL: Record<string, string> = {
  '6': 'شنبه', '0': 'یکشنبه', '1': 'دوشنبه', '2': 'سه‌شنبه', '3': 'چهارشنبه', '4': 'پنجشنبه', '5': 'جمعه',
};
