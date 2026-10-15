'use client';

import { useState } from 'react';
import { m as motion } from 'framer-motion';
import { Building2, Clock, Factory, Loader2, Mail, MapPin, MessageCircle, Navigation, Phone, Send, type LucideIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHero } from '@/shared/ui/PageHero';
import { useSiteSettings } from '@/shared/providers/SiteSettingsProvider';
import { cn, faDigits } from '@/shared/lib/utils';

export type ContactInfoItem = {
  icon: 'phone' | 'mail' | 'map' | 'clock';
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

const iconMap: Record<ContactInfoItem['icon'], LucideIcon> = { phone: Phone, mail: Mail, map: MapPin, clock: Clock };

type Props = { contactInfo: ContactInfoItem[]; locations: ContactLocation[]; whatsappUrl?: string };

const fieldCls =
  'w-full h-12 rounded-2xl bg-[var(--muted)] border border-[var(--border)] px-4 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--foreground)]/40 focus:bg-[var(--background)] transition-colors';

export function ContactPageClient({ contactInfo, locations, whatsappUrl }: Props) {
  const { phone, phoneHref } = useSiteSettings();
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.message) {
      toast.error('لطفاً نام و پیام خود را وارد کنید');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, sourcePath: window.location.pathname }) });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error || 'ارسال پیام با خطا مواجه شد');
        return;
      }
      toast.success(data.message || 'پیام شما ارسال شد! به‌زودی با شما تماس می‌گیریم.');
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch {
      toast.error('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value });

  return (
    <>
      <PageHero label="تماس با ما" title="با ما در تماس باشید" description="تیم کارشناسی ما آماده پاسخگویی به سوالات فنی و استعلام قیمت شما است" />

      {/* موبایل: تماس مستقیم پیش از هر چیز */}
      <div className="lg:hidden container-main -mt-5 relative z-10 grid grid-cols-2 gap-2">
        <a href={phoneHref} className="h-14 rounded-2xl bg-[var(--accent)] text-[var(--accent-foreground)] font-black flex items-center justify-center gap-2 shadow-lg">
          <Phone className="w-5 h-5" /> تماس
        </a>
        {whatsappUrl && (
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="h-14 rounded-2xl bg-[#128C7E] text-white font-black flex items-center justify-center gap-2 shadow-lg">
            <MessageCircle className="w-5 h-5" /> واتس‌اپ
          </a>
        )}
      </div>

      <section className="section-padding">
        <div className="container-main grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-8 lg:gap-12 items-start">
          <div className="space-y-3">
            {contactInfo.map(({ icon, title, items }, i) => {
              const Icon = iconMap[icon];
              return (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="flex gap-4 p-5 rounded-3xl border border-[var(--border)]"
                >
                  <span className="grid place-items-center w-11 h-11 rounded-2xl bg-[var(--muted)] shrink-0"><Icon className="w-5 h-5" /></span>
                  <div className="min-w-0">
                    <p className="text-xs text-[var(--muted-foreground)]">{title}</p>
                    {/* هر مورد در li جدا — در متن قابل خزش شماره‌ها به هم نمی‌چسبند */}
                    <ul className={cn(icon === 'phone' && 'mt-0.5 flex flex-wrap gap-x-4 gap-y-0.5')}>
                      {items.filter((it) => it.text).map((it) => (
                        <li key={it.text}>
                          {it.href ? (
                            <a href={it.href} dir={it.ltr ? 'ltr' : undefined} className="block mt-0.5 font-bold hover:text-[var(--accent-text)] transition-colors text-right num break-all">
                              {icon === 'phone' ? faDigits(it.text) : it.text}
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
                  <span className="block font-bold">گفتگو در واتس‌اپ</span>
                  <span className="block text-xs text-[var(--muted-foreground)]">پاسخ سریع در ساعت کاری</span>
                </span>
              </a>
            )}
          </div>

          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-[var(--radius-panel)] border border-[var(--border)] p-6 sm:p-10">
            <h2 className="text-xl sm:text-2xl font-black">ارسال پیام</h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              یا مستقیم تماس بگیرید: <a href={phoneHref} dir="ltr" className="font-bold text-[var(--foreground)] num">{faDigits(phone)}</a>
            </p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-3" noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input className={fieldCls} value={form.name} onChange={set('name')} placeholder="نام و نام‌خانوادگی *" autoComplete="name" aria-label="نام" />
                <input className={`${fieldCls} ltr-field`} type="tel" inputMode="tel" value={form.phone} onChange={set('phone')} placeholder="شماره موبایل" autoComplete="tel" aria-label="شماره موبایل" />
              </div>
              <input className={`${fieldCls} ltr-field`} type="email" value={form.email} onChange={set('email')} placeholder="ایمیل (اختیاری)" autoComplete="email" aria-label="ایمیل" />
              <input className={fieldCls} value={form.subject} onChange={set('subject')} placeholder="موضوع — مثلاً: استعلام لوله پلیکا ۱۶۰" aria-label="موضوع" />
              <textarea className={`${fieldCls} h-36 py-3 resize-none`} value={form.message} onChange={set('message')} placeholder="پیام یا سوال خود را بنویسید… *" aria-label="پیام" />
              <button type="submit" disabled={loading} className="w-full h-13 rounded-2xl bg-[var(--foreground)] text-[var(--background)] font-bold flex items-center justify-center gap-2 disabled:opacity-60">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
                {loading ? 'در حال ارسال…' : 'ارسال پیام'}
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* دفتر مرکزی و کارخانه — آدرس‌ها برای سئوی محلی متن واقعی صفحه‌اند، نه فقط schema */}
      <section className="section-padding-sm" aria-labelledby="locations-title">
        <div className="container-main">
          <p className="tech-label">آدرس‌ها</p>
          <h2 id="locations-title" className="mt-2 text-xl sm:text-2xl font-black">دفتر مرکزی و کارخانه</h2>
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-4">
            {locations.map((l) => {
              const Icon = l.kind === 'factory' ? Factory : Building2;
              return (
                <article
                  key={l.kind}
                  className={cn('rounded-3xl border border-[var(--border)] overflow-hidden flex flex-col', l.kind === 'factory' && 'lg:row-span-2')}
                >
                  <div className="p-5 sm:p-6 flex gap-4">
                    <span className="grid place-items-center w-11 h-11 rounded-2xl bg-[var(--ink)] text-[var(--accent-text)] shrink-0"><Icon className="w-5 h-5" /></span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-black">{l.title}</h3>
                      <p className="mt-1 text-sm leading-7 text-[var(--muted-foreground)] num">
                        <MapPin className="inline w-4 h-4 -mt-0.5 me-1" />
                        {faDigits(l.address)}
                      </p>
                    </div>
                  </div>
                  {l.embedUrl && <MapEmbed src={l.embedUrl} title={`نقشه ${l.title}`} />}
                  {l.mapUrl && (
                    <a
                      href={l.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="m-4 h-12 rounded-2xl bg-[var(--foreground)] text-[var(--background)] font-bold flex items-center justify-center gap-2"
                    >
                      <Navigation className="w-4 h-4" /> مسیریابی در گوگل مپ
                    </a>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

/** نقشه با کلیک بارگذاری می‌شود: صفحه سبک می‌ماند و تا کاربر نخواهد، درخواستی به گوگل نمی‌رود */
function MapEmbed({ src, title }: { src: string; title: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative flex-1 min-h-[260px] bg-[var(--ink)] border-t border-[var(--border)]">
      {show ? (
        <iframe src={src} title={title} referrerPolicy="no-referrer-when-downgrade" className="absolute inset-0 w-full h-full" />
      ) : (
        <button type="button" onClick={() => setShow(true)} className="absolute inset-0 bp-grid flex flex-col items-center justify-center gap-3 text-white">
          <span className="grid place-items-center w-14 h-14 rounded-2xl bg-[var(--accent)] text-[var(--accent-foreground)]">
            <MapPin className="w-6 h-6" />
          </span>
          <span className="font-bold">نمایش نقشه کارخانه</span>
          <span className="text-xs text-slate-400">بارگذاری از گوگل مپ</span>
        </button>
      )}
    </div>
  );
}
