/**
 * تاریخ شمسی بدون کتابخانه: نمایش با Intl (تقویم persian، وقت تهران) و تبدیل شمسی → میلادی با جستجوی روز.
 * ایران از ۱۴۰۱ ساعت تابستانی ندارد — وقت تهران همیشه UTC+۳:۳۰ است.
 */

export const JALALI_MONTHS = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];

const TEHRAN_OFFSET_MIN = 210;

const partsFmt = (timeZone: string) =>
  new Intl.DateTimeFormat('en-US-u-ca-persian-nu-latn', { timeZone, year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' });

function read(date: Date, timeZone: string) {
  const parts = Object.fromEntries(partsFmt(timeZone).formatToParts(date).map((p) => [p.type, p.value]));
  return { year: Number(parts.year), month: Number(parts.month), day: Number(parts.day), hour: Number(parts.hour), minute: Number(parts.minute) };
}

/** اجزای تاریخ شمسی به وقت تهران */
export const jalaliParts = (date: Date) => read(date, 'Asia/Tehran');

/** تاریخ شمسی + ساعت تهران → Date */
export function fromJalali(year: number, month: number, day: number, hour = 0, minute = 0) {
  // تقریب: ۱ فروردین حدود ۲۱ مارس؛ بعد چند روز جلو/عقب تا روز شمسی دقیق پیدا شود
  const approx = Date.UTC(year + 621, 2, 21, 12) + ((month - 1) * 30.5 + (day - 1)) * 86_400_000;
  for (let delta = -4; delta <= 4; delta++) {
    const t = approx + delta * 86_400_000;
    const p = read(new Date(t), 'UTC');
    if (p.year === year && p.month === month && p.day === day) {
      const d = new Date(t);
      return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), hour, minute) - TEHRAN_OFFSET_MIN * 60_000);
    }
  }
  return null;
}

/** تعداد روزهای ماه شمسی (اسفند کبیسه ۳۰ روز) */
export function jalaliMonthDays(year: number, month: number) {
  if (month <= 6) return 31;
  if (month <= 11) return 30;
  return fromJalali(year, 12, 30) ? 30 : 29;
}

const fa = (n: number) => n.toLocaleString('fa-IR', { useGrouping: false });

/** «سه‌شنبه ۲۱ مهر ۱۴۰۵، ساعت ۱۸:۳۸» — از اجزا ساخته می‌شود؛ ترکیب خود Intl ترتیب را به‌هم می‌ریخت */
export function faDateLong(value: string | Date | null | undefined) {
  if (!value) return '—';
  const date = new Date(value);
  const p = jalaliParts(date);
  const weekday = date.toLocaleDateString('fa-IR', { timeZone: 'Asia/Tehran', weekday: 'long' });
  return `${weekday} ${fa(p.day)} ${JALALI_MONTHS[p.month - 1]} ${fa(p.year)}، ساعت ${fa(p.hour).padStart(2, '۰')}:${fa(p.minute).padStart(2, '۰')}`;
}
