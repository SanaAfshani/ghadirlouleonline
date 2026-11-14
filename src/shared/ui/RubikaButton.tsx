'use client';

import toast from 'react-hot-toast';
import { siteConfig } from '@/shared/config/site';
import type { Locale } from '@/shared/i18n/config';
import { useLocale, useMessages } from '@/shared/i18n/LocaleProvider';
import { defineMessages, fill } from '@/shared/i18n/messages';
import { useSiteSettings } from '@/shared/providers/SiteSettingsProvider';

const messages = defineMessages({
  fa: {
    greeting: 'سلام، از سایت {site} پیام می‌دهم',
    greetingAbout: 'سلام، از سایت {site} درباره {subject} پیام می‌دهم',
    label: 'روبیکا',
    copied: 'پیام کپی شد؛ در گفتگوی روبیکا بچسبانید (Paste). اگر روبیکا باز نشد، {id} را در روبیکا جستجو کنید.',
  },
  en: {
    greeting: 'Hello, I am messaging you from the {site} website',
    greetingAbout: 'Hello, I am messaging you from the {site} website about {subject}',
    label: 'Rubika',
    copied: 'Message copied; paste it into the Rubika chat. If Rubika does not open, search for {id} in Rubika.',
  },
});

/** پیام پیش‌فرض گفتگو؛ صفحه محصول نام محصول را می‌دهد */
export const rubikaMessage = (
  subject?: string,
  locale: Locale = 'fa',
  site: string = locale === 'fa' ? siteConfig.name : siteConfig.nameEn,
) => fill(subject ? messages[locale].greetingAbout : messages[locale].greeting, { site, subject: subject ?? '' });

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
  label,
  message,
}: {
  className?: string;
  children: React.ReactNode;
  label?: string;
  message?: string;
}) {
  const { rubikaId, rubikaUrl, siteName } = useSiteSettings();
  const locale = useLocale();
  const t = useMessages(messages);

  const copyMessage = () => {
    // ناوبری لینک متوقف نمی‌شود؛ کپی فقط کمکی است و شکستش مهم نیست
    navigator.clipboard
      ?.writeText(message ?? rubikaMessage(undefined, locale, siteName))
      .then(() => toast.success(fill(t.copied, { id: rubikaId }), { duration: 7000 }))
      .catch(() => {});
  };

  return (
    <a href={rubikaUrl} target="_blank" rel="noopener" onClick={copyMessage} aria-label={`${label ?? t.label} (${rubikaId})`} className={className}>
      {children}
    </a>
  );
}
