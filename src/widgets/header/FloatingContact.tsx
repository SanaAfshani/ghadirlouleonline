'use client';

import { useEffect, useState } from 'react';
import { ArrowUp, MessageCircle, Phone } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useSiteSettings } from '@/shared/providers/SiteSettingsProvider';
import { RubikaIcon } from '@/shared/ui/RubikaIcon';
import { RubikaButton } from '@/shared/ui/RubikaButton';
import { useMessages } from '@/shared/i18n/LocaleProvider';
import { defineMessages } from '@/shared/i18n/messages';

const messages = defineMessages({
  fa: { whatsapp: 'واتس‌اپ', call: 'تماس تلفنی', top: 'بازگشت به بالا' },
  en: { whatsapp: 'WhatsApp', call: 'Call us', top: 'Back to top' },
});

/** دکمه‌های شناور تماس — فقط دسکتاپ؛ در موبایل نوار پایین همین کار را می‌کند */
export function FloatingContact() {
  const { phoneHref, whatsappUrl } = useSiteSettings();
  const t = useMessages(messages);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 800);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const btn = 'grid place-items-center w-12 h-12 rounded-2xl shadow-lg transition-transform hover:-translate-y-0.5';

  return (
    <div className="hidden lg:flex fixed end-5 bottom-6 z-40 flex-col gap-2.5 print:hidden">
      <a href={whatsappUrl} target="_blank" rel="noopener" aria-label={t.whatsapp} className={cn(btn, 'bg-[#128C7E] text-white')}>
        <MessageCircle className="w-6 h-6" />
      </a>
      <RubikaButton className={cn(btn, 'bg-white border border-[var(--border)]')}>
        <RubikaIcon className="w-7" />
      </RubikaButton>
      <a href={phoneHref} aria-label={t.call} className={cn(btn, 'bg-[var(--accent)] text-[var(--accent-foreground)]')}>
        <Phone className="w-5 h-5" />
      </a>
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label={t.top}
        className={cn(btn, 'bg-[var(--ink)] text-white', showTop ? 'opacity-100' : 'opacity-0 pointer-events-none')}
      >
        <ArrowUp className="w-5 h-5" />
      </button>
    </div>
  );
}
