'use client';

import toast from 'react-hot-toast';
import { siteConfig } from '@/shared/config/site';

/** پیام پیش‌فرض گفتگو؛ صفحه محصول نام محصول را می‌دهد */
export const rubikaMessage = (subject?: string) =>
  `سلام، از سایت ${siteConfig.name}${subject ? ` درباره ${subject}` : ''} پیام می‌دهم`;

/**
 * لینک روبیکا: همان آدرسی که کد QR حساب در خود روبیکا دارد (rubikaUrl) — روی گوشی اپ روبیکا را باز می‌کند.
 *
 * روبیکا برخلاف واتس‌اپ (wa.me/?text=) لینکی برای پیام آماده ندارد، پس پیام پیش‌فرض هم‌زمان کپی می‌شود
 * تا مشتری فقط در گفتگو Paste کند. در دسکتاپ یا گوشیِ بدون اپ، آدرس فقط صفحه وب روبیکاست؛ راهنمای
 * پیام، شناسه حساب را هم برای جستجو در پیام‌رسان می‌گوید.
 */
export function RubikaButton({
  className,
  children,
  label = 'روبیکا',
  message = rubikaMessage(),
}: {
  className?: string;
  children: React.ReactNode;
  label?: string;
  message?: string;
}) {
  const { rubikaId, rubikaUrl } = siteConfig.socials;

  const copyMessage = () => {
    // ناوبری لینک متوقف نمی‌شود؛ کپی فقط کمکی است و شکستش مهم نیست
    navigator.clipboard
      ?.writeText(message)
      .then(() =>
        toast.success(`پیام کپی شد؛ در گفتگوی روبیکا بچسبانید (Paste). اگر روبیکا باز نشد، ${rubikaId} را در روبیکا جستجو کنید.`, {
          duration: 7000,
        }),
      )
      .catch(() => {});
  };

  return (
    <a href={rubikaUrl} target="_blank" rel="noopener" onClick={copyMessage} aria-label={`${label} (${rubikaId})`} className={className}>
      {children}
    </a>
  );
}
