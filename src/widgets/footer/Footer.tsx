'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Building2, ChevronDown, Clock, Factory, Mail, MapPin, MessageCircle, Phone, ShieldCheck } from 'lucide-react';
import { useSiteSettings } from '@/shared/providers/SiteSettingsProvider';
import { siteConfig } from '@/shared/config/site';
import { phoneHref as toTel } from '@/shared/lib/site-settings';
import type { NavCategory } from '@/shared/lib/data';
import { CertificateStrip } from '@/features/certificates/Certificates';
import { RubikaIcon } from '@/shared/ui/RubikaIcon';
import { RubikaButton } from '@/shared/ui/RubikaButton';
import { Link } from '@/shared/i18n/Link';
import { useLocale, useMessages } from '@/shared/i18n/LocaleProvider';
import { defineMessages, fill } from '@/shared/i18n/messages';
import { digits } from '@/shared/i18n/format';
import type { ContentOf } from '@/shared/content/types';
import type { globalFooter } from '@/shared/content/pages/global';

const messages = defineMessages({
  fa: {
    whatsapp: 'واتس‌اپ',
    email: 'ایمیل',
    comingSoon: '(به زودی)',
    sales: 'فروش و سفارش عمده',
    rubika: 'روبیکا:',
    headOffice: 'دفتر مرکزی',
    factory: 'کارخانه و انبار',
    directions: 'مسیریابی روی نقشه',
    verify: 'استعلام {name}',
    legal: 'قوانین',
  },
  en: {
    whatsapp: 'WhatsApp',
    email: 'Email',
    comingSoon: '(coming soon)',
    sales: 'Sales and bulk orders',
    rubika: 'Rubika:',
    headOffice: 'Head office',
    factory: 'Factory and warehouse',
    directions: 'Get directions',
    verify: 'Verify {name}',
    legal: 'Legal',
  },
});

/** هر ستون یک‌بار رندر می‌شود — موبایل: تاشو با دکمه؛ دسکتاپ: همیشه باز (قبلاً محتوا دو بار در HTML تکرار می‌شد) */
function Column({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/10 lg:border-0">
      <h3 className="font-bold text-white lg:mb-5">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex items-center justify-between w-full h-14 text-start lg:h-auto lg:pointer-events-none"
        >
          {title}
          <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform lg:hidden ${open ? 'rotate-180' : ''}`} />
        </button>
      </h3>
      <div className={open ? 'pb-4 lg:pb-0' : 'hidden lg:block'}>{children}</div>
    </div>
  );
}

export function Footer({ categories, content }: { categories: NavCategory[]; content: ContentOf<typeof globalFooter> }) {
  const {
    siteName, siteDescription, phone, phoneHref, mobile, mobileHref, email, address, companyPhones, factoryAddress, mapUrl, whatsappUrl, certificates,
    exclusiveTitle, workingHours, rubikaId, trustBadges,
  } = useSiteSettings();
  const locale = useLocale();
  const t = useMessages(messages);
  // فارسی سال شمسی، انگلیسی میلادی
  const year = new Intl.DateTimeFormat(locale === 'fa' ? 'fa-IR-u-ca-persian' : 'en-US', { year: 'numeric' }).format(new Date());

  const linkCls = 'block py-1.5 text-sm text-slate-400 hover:text-[var(--accent-text)] transition-colors';

  return (
    <footer className="relative mt-16 bg-[var(--ink)] text-slate-300 overflow-hidden pb-bottom-nav print:hidden">
      <div className="absolute inset-0 bp-grid opacity-40" />
      {/* نوار هشدار صنعتی لبه بالای فوتر */}
      <div className="relative h-1.5 hazard opacity-90" aria-hidden />

      <div className="relative container-main pt-14 lg:pt-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] gap-2 lg:gap-12">
          <div className="pb-6 lg:pb-0">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/images/logo.png" alt="" width={52} height={52} className="w-12 h-12 object-contain" />
              <span className="text-xl font-black text-white">{siteName}</span>
            </Link>
            <Link href="/official-representative" className="mt-4 inline-flex items-center gap-1.5 text-sm font-black text-[var(--accent-text)] hover:underline">
              <ShieldCheck className="w-4 h-4 shrink-0" aria-hidden />
              <strong>{exclusiveTitle}</strong>
            </Link>
            <p className="mt-2 text-sm leading-7 text-slate-400 max-w-sm">{siteDescription}</p>
            <p className="mt-2 text-sm text-slate-400">
              {content.manufacturerSiteLabel}{' '}
              <a href={siteConfig.manufacturerUrl} target="_blank" rel="noopener" className="font-bold text-slate-200 hover:text-[var(--accent-text)]" dir="ltr">
                ghadirlouleh.com
              </a>
            </p>
            <div className="mt-5 flex gap-2">
              <a href={whatsappUrl} target="_blank" rel="noopener" aria-label={t.whatsapp} className="grid place-items-center w-11 h-11 rounded-2xl bg-white/5 border border-white/10 hover:bg-[#128C7E] hover:text-white transition-colors">
                <MessageCircle className="w-5 h-5" />
              </a>
              <RubikaButton className="grid place-items-center w-11 h-11 rounded-2xl bg-white border border-white/10 hover:scale-105 transition-transform">
                <RubikaIcon className="w-6" />
              </RubikaButton>
              <a href={`mailto:${email}`} aria-label={t.email} className="grid place-items-center w-11 h-11 rounded-2xl bg-white/5 border border-white/10 hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          <Column title={content.categoriesTitle}>
            <ul>
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link href={`/products/${c.slug}`} className={linkCls}>
                    {c.name}
                    {c.comingSoon && <span className="ms-1.5 text-[11px] text-[var(--accent-text)]">{t.comingSoon}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </Column>

          <Column title={content.quickLinksTitle}>
            <ul>
              {content.quickLinks.map((l) => (
                <li key={l.id}><Link href={l.link} className={linkCls}>{l.label}</Link></li>
              ))}
            </ul>
          </Column>

          <Column title={content.contactTitle}>
            <ul className="space-y-3 text-sm">
              <li>
                <a href={phoneHref} className="flex items-center gap-3 hover:text-white">
                  <span className="grid place-items-center w-9 h-9 rounded-xl bg-white/5"><Phone className="w-4 h-4 text-[var(--accent-text)]" /></span>
                  <span>
                    <span className="block text-[11px] text-slate-400">{t.sales}</span>
                    <span dir="ltr" className="num font-bold">{digits(phone, locale)}</span>
                  </span>
                </a>
              </li>
              {mobile && mobile !== phone && (
                <li>
                  <a href={mobileHref} className="flex items-center gap-3 hover:text-white">
                    <span className="grid place-items-center w-9 h-9 rounded-xl bg-white/5"><Phone className="w-4 h-4 text-[var(--accent-text)]" /></span>
                    <span dir="ltr" className="num font-bold">{digits(mobile, locale)}</span>
                  </a>
                </li>
              )}
              <li>
                <RubikaButton className="flex items-center gap-3 hover:text-white text-start">
                  <span className="grid place-items-center w-9 h-9 rounded-xl bg-white"><RubikaIcon /></span>
                  <span>{t.rubika} <span dir="ltr" className="font-bold">{rubikaId}</span></span>
                </RubikaButton>
              </li>
              <li className="flex items-center gap-3">
                <span className="grid place-items-center w-9 h-9 rounded-xl bg-white/5"><Clock className="w-4 h-4 text-[var(--accent-text)]" /></span>
                {workingHours}
              </li>
              {/* هر شماره در li و لینک tel: جدا — قبلاً در متن صفحه به هم چسبیده خوانده می‌شدند */}
              {companyPhones.map((p) => (
                <li key={p}>
                  <a href={toTel(p)} className="flex items-center gap-3 hover:text-white">
                    <span className="grid place-items-center w-9 h-9 rounded-xl bg-white/5"><Phone className="w-4 h-4 text-[var(--accent-text)]" /></span>
                    <span dir="ltr" className="num font-bold">{digits(p, locale)}</span>
                  </a>
                </li>
              ))}
              {address?.trim() && (
                <li className="flex items-start gap-3">
                  <span className="grid place-items-center w-9 h-9 rounded-xl bg-white/5 shrink-0"><Building2 className="w-4 h-4 text-[var(--accent-text)]" /></span>
                  <span className="leading-7"><span className="block text-xs text-slate-500">{t.headOffice}</span>{digits(address, locale)}</span>
                </li>
              )}
              {factoryAddress?.trim() && (
                <li className="flex items-start gap-3">
                  <span className="grid place-items-center w-9 h-9 rounded-xl bg-white/5 shrink-0"><Factory className="w-4 h-4 text-[var(--accent-text)]" /></span>
                  <span className="leading-7">
                    <span className="block text-xs text-slate-500">{t.factory}</span>
                    {factoryAddress}
                    <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs font-bold text-[var(--accent-text)] hover:underline">
                      <MapPin className="w-3.5 h-3.5" /> {t.directions}
                    </a>
                  </span>
                </li>
              )}
            </ul>
          </Column>
        </div>

        {/* گواهینامه‌ها (فقط وقتی عکس واقعی در پنل ثبت شده) + نمادهای اعتماد */}
        <div className="mt-10 lg:mt-14 pt-6 border-t border-white/10 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          {certificates.length > 0 ? <CertificateStrip certificates={certificates} tone="dark" /> : <span />}
          <div>
            <p className="mb-3 font-black text-sm text-white">{content.trustTitle}</p>
            <ul className="flex flex-wrap gap-2.5">
              {trustBadges.map((b) => {
                const img = <Image src={b.image} alt={b.name} width={82} height={100} className="h-[5.5rem] w-auto object-contain" />;
                return (
                  <li key={b.name} title={b.name} className="rounded-2xl bg-white p-2 ring-1 ring-white/10">
                    {b.href ? (
                      <a href={b.href} target="_blank" rel="noopener" referrerPolicy="origin" aria-label={fill(t.verify, { name: b.name })}>{img}</a>
                    ) : (
                      img
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="mt-10 lg:mt-16 py-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>© <span className="num">{year}</span> {siteName} — <strong className="text-slate-200">{exclusiveTitle}</strong>. {content.rights}</p>
          <nav aria-label={t.legal} className="flex items-center gap-4">
            {content.legalLinks.map((l) => (
              <Link key={l.id} href={l.link} className="hover:text-white transition-colors">{l.label}</Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
