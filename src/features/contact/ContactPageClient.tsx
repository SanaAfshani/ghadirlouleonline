'use client';

import { useState } from 'react';
import { m as motion } from 'framer-motion';
import { Building2, ChevronLeft, ClipboardList, Clock, Factory, Loader2, Mail, MapPin, MessageCircle, Navigation, Phone, Send, type LucideIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHero } from '@/shared/ui/PageHero';
import { useSiteSettings } from '@/shared/providers/SiteSettingsProvider';
import { cn } from '@/shared/lib/utils';
import { RubikaIcon } from '@/shared/ui/RubikaIcon';
import { RubikaButton } from '@/shared/ui/RubikaButton';
import { IconTile, type IconTone } from '@/shared/ui/IconTile';
import { Link } from '@/shared/i18n/Link';
import { useLocale, useMessages } from '@/shared/i18n/LocaleProvider';
import { defineMessages, fill } from '@/shared/i18n/messages';
import { digits } from '@/shared/i18n/format';
import type { ContentOf } from '@/shared/content/types';
import type { contactChannels, contactHero, contactLocations, contactProjectCta } from '@/shared/content/pages/contact';

export type ContactInfoItem = {
  icon: 'phone' | 'mail' | 'map' | 'clock' | 'rubika';
  title: string;
  /** هر شماره لینک tel خودش را دارد */
  items: { text: string; href?: string; ltr?: boolean }[];
};

export type ContactLocation = {
  kind: 'office' | 'factory';
  title: string;
  address: string;
  mapUrl?: string;
  embedUrl?: string;
};

// روبیکا نشان رسمی خودش را دارد و جدا رسم می‌شود
const iconMap: Record<Exclude<ContactInfoItem['icon'], 'rubika'>, LucideIcon> = { phone: Phone, mail: Mail, map: MapPin, clock: Clock };
const iconTone: Record<Exclude<ContactInfoItem['icon'], 'rubika'>, IconTone> = { phone: 'emerald', mail: 'sky', map: 'rose', clock: 'violet' };

const messages = defineMessages({
  fa: {
    required: 'لطفاً نام و پیام خود را وارد کنید',
    sendFailed: 'ارسال پیام با خطا مواجه شد',
    sent: 'پیام شما ارسال شد! به‌زودی با شما تماس می‌گیریم.',
    network: 'خطا در ارتباط با سرور',
    call: 'تماس',
    whatsapp: 'واتس‌اپ',
    rubika: 'روبیکا',
    formTitle: 'ارسال پیام',
    orCall: 'یا مستقیم تماس بگیرید:',
    namePlaceholder: 'نام و نام‌خانوادگی *',
    nameLabel: 'نام',
    phonePlaceholder: 'شماره موبایل',
    phoneLabel: 'شماره موبایل',
    emailPlaceholder: 'ایمیل (اختیاری)',
    emailLabel: 'ایمیل',
    subjectPlaceholder: 'موضوع — مثلاً: استعلام لوله کاروگیت ۱۶۰',
    subjectLabel: 'موضوع',
    messagePlaceholder: 'پیام یا سوال خود را بنویسید… *',
    messageLabel: 'پیام',
    sending: 'در حال ارسال…',
    submit: 'ارسال پیام',
    directions: 'مسیریابی در گوگل مپ',
    mapTitle: 'نقشه {title}',
    showMap: 'نمایش نقشه کارخانه',
    mapSource: 'بارگذاری از گوگل مپ',
  },
  en: {
    required: 'Please enter your name and message',
    sendFailed: 'Your message could not be sent',
    sent: 'Your message has been sent! We will contact you soon.',
    network: 'Could not connect to the server',
    call: 'Call',
    whatsapp: 'WhatsApp',
    rubika: 'Rubika',
    formTitle: 'Send a message',
    orCall: 'Or call us directly:',
    namePlaceholder: 'Full name *',
    nameLabel: 'Name',
    phonePlaceholder: 'Mobile number',
    phoneLabel: 'Mobile number',
    emailPlaceholder: 'Email (optional)',
    emailLabel: 'Email',
    subjectPlaceholder: 'Subject — e.g. price for 160 mm corrugated pipe',
    subjectLabel: 'Subject',
    messagePlaceholder: 'Write your message or question… *',
    messageLabel: 'Message',
    sending: 'Sending…',
    submit: 'Send message',
    directions: 'Get directions on Google Maps',
    mapTitle: '{title} map',
    showMap: 'Show factory map',
    mapSource: 'Loads from Google Maps',
  },
});

/**
 * about: معرفی کارخانه (سمت سرور برای سئو) — بعد از راه‌های تماس و آدرس‌ها می‌آید؛
 * کسی که به صفحه تماس می‌آید اول شماره و فرم را می‌خواهد، نه دو هزار پیکسل معرفی.
 */
type Props = {
  contactInfo: ContactInfoItem[];
  locations: ContactLocation[];
  whatsappUrl?: string;
  about?: React.ReactNode;
  /** متن‌ها از پنل «محتوای صفحات ← تماس با ما» (shared/content/pages/contact.ts) */
  hero: ContentOf<typeof contactHero>;
  channels: ContentOf<typeof contactChannels>;
  projectCta: ContentOf<typeof contactProjectCta>;
  locationsText: ContentOf<typeof contactLocations>;
};

const fieldCls =
  'w-full h-12 rounded-2xl bg-[var(--muted)] border border-[var(--border)] px-4 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--foreground)]/40 focus:bg-[var(--background)] transition-colors';

export function ContactPageClient({ contactInfo, locations, whatsappUrl, about, hero, channels, projectCta, locationsText }: Props) {
  const { phone, phoneHref } = useSiteSettings();
  const locale = useLocale();
  const t = useMessages(messages);
  // پاسخ API فارسی است؛ در نسخه انگلیسی متن خود فرم نمایش داده می‌شود
  const serverText = (text: unknown) => (locale === 'fa' && typeof text === 'string' ? text : '');
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.message) {
      toast.error(t.required);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, sourcePath: window.location.pathname }) });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(serverText(data.error) || t.sendFailed);
        return;
      }
      toast.success(serverText(data.message) || t.sent);
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch {
      toast.error(t.network);
    } finally {
      setLoading(false);
    }
  };

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value });

  return (
    <>
      <PageHero label={hero.label} title={hero.title} description={hero.description} />

      {/* موبایل: تماس مستقیم پیش از هر چیز */}
      <div className="lg:hidden container-main -mt-5 relative z-10 grid grid-cols-3 gap-2">
        <a href={phoneHref} className="h-14 rounded-2xl bg-[var(--accent)] text-[var(--accent-foreground)] font-black flex items-center justify-center gap-2 shadow-lg">
          <Phone className="w-5 h-5" /> {t.call}
        </a>
        {whatsappUrl && (
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="h-14 rounded-2xl bg-[#128C7E] text-white font-black flex items-center justify-center gap-2 shadow-lg">
            <MessageCircle className="w-5 h-5" /> {t.whatsapp}
          </a>
        )}
        <RubikaButton className="h-14 rounded-2xl bg-white border border-[var(--border)] font-black flex items-center justify-center gap-2 shadow-lg">
          <RubikaIcon className="w-5" /> {t.rubika}
        </RubikaButton>
      </div>

      <section className="section-padding">
        <div className="container-main grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-8 lg:gap-12 items-start">
          <div className="space-y-3">
            {contactInfo.map(({ icon, title, items }, i) => {
              return (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="group flex gap-4 p-5 rounded-3xl border border-[var(--border)] transition-colors hover:border-[var(--accent)]/40"
                >
                  {icon === 'rubika' ? (
                    <span aria-hidden className="w-11 h-11 rounded-2xl border border-[var(--border)] bg-white grid place-items-center shrink-0">
                      <RubikaIcon className="w-6" />
                    </span>
                  ) : (
                    <IconTile icon={iconMap[icon]} tone={iconTone[icon]} />
                  )}
                  <div className="min-w-0">
                    <p className="text-xs text-[var(--muted-foreground)]">{title}</p>
                    {/* هر مورد در li جدا — در متن قابل خزش شماره‌ها به هم نمی‌چسبند */}
                    <ul className={cn(icon === 'phone' && 'mt-0.5 flex flex-wrap gap-x-4 gap-y-0.5')}>
                      {items.filter((it) => it.text).map((it) => (
                        <li key={it.text}>
                          {icon === 'rubika' ? (
                            <RubikaButton className="block mt-0.5 font-bold hover:text-[var(--accent-text)] transition-colors">
                              <span dir="ltr">{it.text}</span>
                            </RubikaButton>
                          ) : it.href ? (
                            <a href={it.href} dir={it.ltr ? 'ltr' : undefined} className="block mt-0.5 font-bold hover:text-[var(--accent-text)] transition-colors rtl:text-right num break-all">
                              {icon === 'phone' ? digits(it.text, locale) : it.text}
                            </a>
                          ) : (
                            <p className="mt-0.5 font-semibold text-sm leading-7">{it.text}</p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              );
            })}
            {whatsappUrl && (
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="hidden lg:flex items-center gap-4 p-5 rounded-3xl border border-[var(--border)] hover:border-[#25D366] transition-colors">
                <span className="grid place-items-center w-11 h-11 rounded-2xl bg-[#128C7E] text-white shrink-0"><MessageCircle className="w-5 h-5" /></span>
                <span>
                  <span className="block font-bold">{channels.whatsappTitle}</span>
                  <span className="block text-xs text-[var(--muted-foreground)]">{channels.whatsappText}</span>
                </span>
              </a>
            )}
          </div>

          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-[var(--radius-panel)] border border-[var(--border)] p-6 sm:p-10">
            <Link
              href={projectCta.link || '/project-inquiry'}
              className="group mb-6 flex items-center gap-3 rounded-2xl border border-[var(--accent)]/40 bg-[var(--accent)]/[0.07] p-4 hover:border-[var(--accent)] transition-colors"
            >
              <IconTile icon={ClipboardList} size="sm" />
              <span className="min-w-0 flex-1">
                <span className="block font-black text-sm">{projectCta.title}</span>
                <span className="block mt-0.5 text-xs leading-6 text-[var(--muted-foreground)]">{projectCta.text}</span>
              </span>
              <ChevronLeft className="w-5 h-5 shrink-0 text-[var(--accent-text)] transition-transform rtl:group-hover:-translate-x-0.5 ltr:group-hover:translate-x-0.5 ltr:rotate-180" />
            </Link>
            <h2 className="text-xl sm:text-2xl font-black">{t.formTitle}</h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {t.orCall} <a href={phoneHref} dir="ltr" className="font-bold text-[var(--foreground)] num">{digits(phone, locale)}</a>
            </p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-3" noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input className={fieldCls} value={form.name} onChange={set('name')} placeholder={t.namePlaceholder} autoComplete="name" aria-label={t.nameLabel} />
                <input className={`${fieldCls} ltr-field`} type="tel" inputMode="tel" value={form.phone} onChange={set('phone')} placeholder={t.phonePlaceholder} autoComplete="tel" aria-label={t.phoneLabel} />
              </div>
              <input className={`${fieldCls} ltr-field`} type="email" value={form.email} onChange={set('email')} placeholder={t.emailPlaceholder} autoComplete="email" aria-label={t.emailLabel} />
              <input className={fieldCls} value={form.subject} onChange={set('subject')} placeholder={t.subjectPlaceholder} aria-label={t.subjectLabel} />
              <textarea className={`${fieldCls} h-36 py-3 resize-none`} value={form.message} onChange={set('message')} placeholder={t.messagePlaceholder} aria-label={t.messageLabel} />
              <button type="submit" disabled={loading} className="w-full h-13 rounded-2xl bg-[var(--foreground)] text-[var(--background)] font-bold flex items-center justify-center gap-2 disabled:opacity-60">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
                {loading ? t.sending : t.submit}
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* دفتر مرکزی و کارخانه — آدرس‌ها برای سئوی محلی متن واقعی صفحه‌اند، نه فقط schema */}
      <section className="section-padding-sm" aria-labelledby="locations-title">
        <div className="container-main">
          <p className="tech-label">{locationsText.eyebrow}</p>
          <h2 id="locations-title" className="mt-2 text-xl sm:text-2xl font-black">{locationsText.title}</h2>
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-4">
            {locations.map((l) => {
              const Icon = l.kind === 'factory' ? Factory : Building2;
              return (
                <article
                  key={l.kind}
                  className={cn('rounded-3xl border border-[var(--border)] overflow-hidden flex flex-col', l.kind === 'factory' && 'lg:row-span-2')}
                >
                  <div className="p-5 sm:p-6 flex gap-4">
                    <IconTile icon={Icon} tone={l.kind === 'factory' ? 'accent' : 'slate'} />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-black">{l.title}</h3>
                      <p className="mt-1 text-sm leading-7 text-[var(--muted-foreground)] num">
                        <MapPin className="inline w-4 h-4 -mt-0.5 me-1" />
                        {digits(l.address, locale)}
                      </p>
                    </div>
                  </div>
                  {l.embedUrl && <MapEmbed src={l.embedUrl} title={fill(t.mapTitle, { title: l.title })} />}
                  {l.mapUrl && (
                    <a
                      href={l.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="m-4 h-12 rounded-2xl bg-[var(--foreground)] text-[var(--background)] font-bold flex items-center justify-center gap-2"
                    >
                      <Navigation className="w-4 h-4" /> {t.directions}
                    </a>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {about}
    </>
  );
}

/** نقشه با کلیک بارگذاری می‌شود: صفحه سبک می‌ماند و تا کاربر نخواهد، درخواستی به گوگل نمی‌رود */
function MapEmbed({ src, title }: { src: string; title: string }) {
  const [show, setShow] = useState(false);
  const t = useMessages(messages);
  return (
    <div className="relative flex-1 min-h-[260px] bg-[var(--ink)] border-t border-[var(--border)]">
      {show ? (
        <iframe src={src} title={title} referrerPolicy="no-referrer-when-downgrade" className="absolute inset-0 w-full h-full" />
      ) : (
        <button type="button" onClick={() => setShow(true)} className="absolute inset-0 bp-grid flex flex-col items-center justify-center gap-3 text-white">
          <span className="grid place-items-center w-14 h-14 rounded-2xl bg-[var(--accent)] text-[var(--accent-foreground)]">
            <MapPin className="w-6 h-6" />
          </span>
          <span className="font-bold">{t.showMap}</span>
          <span className="text-xs text-slate-400">{t.mapSource}</span>
        </button>
      )}
    </div>
  );
}
