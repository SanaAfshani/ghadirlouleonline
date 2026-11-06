/** اقدام‌های مشتری که در گزارش «کدام صفحه مشتری می‌آورد» شمرده می‌شوند — قابل import در کلاینت */
export const LEAD_TYPES = ['phone', 'whatsapp', 'form'] as const;
export type LeadType = (typeof LEAD_TYPES)[number];

export const LEAD_LABEL: Record<LeadType, string> = {
  phone: 'تماس تلفنی',
  whatsapp: 'واتس‌اپ',
  form: 'فرم مشاوره و تماس',
};

export function isLeadType(v: unknown): v is LeadType {
  return LEAD_TYPES.includes(v as LeadType);
}

/** فقط مسیر داخلی سایت، بدون query — ورودی از مرورگر است و نباید هر رشته‌ای در گزارش بنشیند */
export function cleanPath(v: unknown): string {
  if (typeof v !== 'string' || !v.startsWith('/') || v.startsWith('//')) return '';
  return v.split(/[?#]/)[0].slice(0, 200);
}

/** موضوع پیام فرم استعلام پروژه‌ای — پنل پیام‌ها با همین آن را از پیام‌های عادی جدا می‌کند */
export const PROJECT_INQUIRY_SUBJECT = 'استعلام خرید پروژه‌ای';
