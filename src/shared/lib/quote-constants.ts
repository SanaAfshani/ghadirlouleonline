/**
 * ارزش افزوده فعلاً همه‌جا خاموش است (سبد، پیش‌فاکتور، فاکتور، PDF، پنل ادمین). برای برگرداندن: true —
 * فیلد درصد در پنل ادمین برمی‌گردد و پیش‌فرض ۱۰٪ می‌شود.
 */
export const VAT_ENABLED = false;
export const DEFAULT_VAT_RATE = VAT_ENABLED ? 10 : 0;
/** اعتبار پیش‌فرض پس از صدور (ساعت) */
export const DEFAULT_VALIDITY_HOURS = 48;

export type QuoteStatus = 'DRAFT' | 'REQUESTED' | 'ISSUED' | 'REJECTED' | 'EXPIRED';

export function statusLabel(status: QuoteStatus | string) {
  const map: Record<string, string> = {
    DRAFT: 'پیش‌نویس',
    REQUESTED: 'درخواست‌شده',
    ISSUED: 'صادرشده',
    REJECTED: 'ردشده',
    EXPIRED: 'منقضی',
  };
  return map[status] ?? status;
}
