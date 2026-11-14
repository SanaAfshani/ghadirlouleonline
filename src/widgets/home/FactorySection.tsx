import Image from 'next/image';
import { Building2, Factory, MapPin, Navigation, Phone, ShieldCheck } from 'lucide-react';
import { phoneHref, type SiteSettings } from '@/shared/lib/site-settings';
import { IconTile } from '@/shared/ui/IconTile';
import { RichText } from '@/shared/ui/RichText';
import { CertificateStrip } from '@/features/certificates/Certificates';
import { LtrCodes } from '@/shared/ui/LtrCodes';
import { RubikaButton } from '@/shared/ui/RubikaButton';
import { RubikaIcon } from '@/shared/ui/RubikaIcon';
import type { Locale } from '@/shared/i18n/config';
import { defineMessages } from '@/shared/i18n/messages';
import { digits } from '@/shared/i18n/format';
import type { ContentOf } from '@/shared/content/types';
import type { homeFactory } from '@/shared/content/pages/home';

const messages = defineMessages({
  fa: { directions: 'مسیریابی در گوگل مپ', rubika: 'روبیکا' },
  en: { directions: 'Directions on Google Maps', rubika: 'Rubika' },
});

type Props = Pick<SiteSettings, 'exclusiveTitle' | 'address' | 'factoryAddress' | 'companyPhones' | 'mapUrl' | 'certificates'> & {
  content: ContentOf<typeof homeFactory>;
  locale: Locale;
};

/**
 * تنها نماینده انحصاری کارخانه — مسیر کالا از انبار تا مشتری، گواهینامه‌های کارخانه و آدرس‌های واقعی (سئوی محلی).
 * متن‌ها و عکس‌ها از پنل «محتوای صفحات ← صفحه اصلی»؛ جای هر عکس در چیدمان به ترتیب فهرست است.
 */
export function FactorySection({ content, locale, exclusiveTitle, address, factoryAddress, companyPhones, mapUrl, certificates }: Props) {
  const t = messages[locale];
  const [aerial, entrance, yard, loading] = content.photos;
  return (
    <section className="relative bg-[var(--ink)] text-white overflow-hidden" aria-labelledby="factory-title">
      <div className="absolute inset-0 bp-grid" aria-hidden />
      <div className="relative h-1.5 hazard" aria-hidden />

      {/*
        نمای هوایی کارخانه کنار سردر آن — یکی نشان می‌دهد کارخانه چقدر است و دیگری تابلوی
        «قدیر لوله پاسارگاد» را نشان می‌دهد؛ همان چیزی که ادعای نمایندگی انحصاری را ثابت می‌کند.
        روی دسکتاپ هر دو هم‌ارتفاع در یک ردیف‌اند و روی موبایل زیر هم می‌آیند.
      */}
      {aerial && (
        <div className="relative container-main pt-12 lg:pt-16">
          <div className="grid grid-cols-1 lg:grid-cols-[1.75fr_1fr] gap-4 lg:h-[23rem]">
            <figure className="group relative aspect-[4/3] sm:aspect-[16/8] lg:aspect-auto lg:h-full rounded-[var(--radius-panel)] overflow-hidden border border-white/10 shadow-2xl">
              <Image
                src={aerial.image}
                alt={aerial.alt}
                fill
                quality={90}
                sizes="(min-width: 1280px) 780px, 100vw"
                className="object-cover object-[50%_60%] transition-transform duration-[1.2s] group-hover:scale-[1.03]"
              />
              <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
              <figcaption className="text-legible absolute inset-x-0 bottom-0 p-5 sm:p-8 flex flex-wrap items-end justify-between gap-3">
                <span>
                  <span className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full bg-[var(--accent)] text-[var(--accent-foreground)] text-xs font-black">{aerial.caption}</span>
                  <span className="block mt-2 text-xl sm:text-3xl font-black text-white">{content.photoTitle}</span>
                  <span className="mt-1 flex items-center gap-1.5 text-sm text-white/85"><MapPin className="w-4 h-4 shrink-0" />{factoryAddress}</span>
                </span>
              </figcaption>
            </figure>

            {entrance && (
              <figure className="group relative aspect-[4/3] lg:aspect-auto lg:h-full rounded-[var(--radius-panel)] overflow-hidden border border-white/10 shadow-2xl">
                <Image
                  src={entrance.image}
                  alt={entrance.alt}
                  fill
                  quality={90}
                  sizes="(min-width: 1280px) 430px, 100vw"
                  className="object-cover object-[50%_35%] transition-transform duration-[1.2s] group-hover:scale-[1.03]"
                />
                <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <figcaption className="text-legible absolute inset-x-0 bottom-0 p-5">
                  <span className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full bg-white/15 backdrop-blur text-white text-xs font-black">{entrance.caption}</span>
                </figcaption>
              </figure>
            )}
          </div>
        </div>
      )}

      <div className="relative container-main py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-10 lg:gap-14 items-start">
        <div>
          <p className="eyebrow">{content.eyebrow}</p>
          <h2 id="factory-title" className="mt-2 text-[1.35rem] sm:text-2xl lg:text-3xl font-black text-white leading-snug">
            {exclusiveTitle}
          </h2>
          <RichText
            html={content.intro}
            className="mt-3 space-y-3 text-sm sm:text-[15px] leading-8 text-slate-300 max-w-xl [&_strong]:text-white [&_a]:font-bold [&_a]:text-[var(--accent-text)]"
          />

          <ol className="mt-8 grid grid-cols-1 sm:grid-cols-3 border border-white/10 rounded-2xl overflow-hidden">
            {content.steps.map((s, i) => (
              <li key={s.id} className="p-4 border-b sm:border-b-0 sm:border-s first:border-s-0 border-white/10 last:border-b-0 bg-white/[0.03]">
                <span className="text-2xl font-black text-[var(--accent-text)] num leading-none">{digits(String(i + 1).padStart(2, '0'), locale)}</span>
                <p className="mt-2 font-bold text-sm text-white">{s.title}</p>
                <p className="mt-1 text-xs leading-6 text-slate-400">{s.desc}</p>
              </li>
            ))}
          </ol>

          {/* عکس‌های واقعی انبار و بارگیری کارخانه */}
          {yard && (
            <div className="mt-6 grid grid-cols-[1.7fr_1fr] gap-3">
              <figure className="group relative aspect-[16/10] rounded-2xl overflow-hidden border border-white/10">
                <Image
                  src={yard.image}
                  alt={yard.alt}
                  fill
                  sizes="(min-width: 1024px) 420px, 62vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <figcaption className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/75 to-transparent text-xs font-bold">{yard.caption}</figcaption>
              </figure>
              {loading && (
                <figure className="group relative rounded-2xl overflow-hidden border border-white/10">
                  <Image
                    src={loading.image}
                    alt={loading.alt}
                    fill
                    sizes="(min-width: 1024px) 250px, 36vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <figcaption className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/75 to-transparent text-xs font-bold">{loading.caption}</figcaption>
                </figure>
              )}
            </div>
          )}
        </div>

        <div className="grid gap-3">
          {/* جایگاه انحصاری + گواهینامه‌های کارخانه — اعتماد مشتری و سئو */}
          <article className="rounded-2xl border-2 border-[var(--accent)]/60 bg-[var(--accent)]/[0.08] p-5">
            <div className="flex items-start gap-3.5">
              <IconTile icon={ShieldCheck} />
              <div className="min-w-0">
                <h3 className="font-black text-white leading-7">{exclusiveTitle}</h3>
                <p className="mt-1 text-sm leading-7 text-slate-300">
                  <LtrCodes text={content.exclusiveText} />
                </p>
              </div>
            </div>
            {certificates.length > 0 && (
              <div className="mt-4">
                <CertificateStrip certificates={certificates} tone="dark" title={content.certificatesTitle} />
              </div>
            )}
          </article>

          <article className="corner-marks rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-start gap-3.5">
              <IconTile icon={Factory} />
              <div className="min-w-0">
                <h3 className="font-black text-white">{content.factoryTitle}</h3>
                <p className="mt-1 text-sm leading-7 text-slate-300">{factoryAddress}</p>
              </div>
            </div>
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 h-11 rounded-xl bg-white text-[var(--ink)] text-sm font-bold flex items-center justify-center gap-2"
            >
              <Navigation className="w-4 h-4" /> {t.directions}
            </a>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-start gap-3.5">
              <IconTile icon={Building2} tone="sky" />
              <div className="min-w-0">
                <h3 className="font-black text-white">{content.officeTitle}</h3>
                <p className="mt-1 text-sm leading-7 text-slate-300 num">{digits(address, locale)}</p>
              </div>
            </div>
            {companyPhones.length > 0 && (
              <div className="mt-4 grid grid-cols-1 min-[400px]:grid-cols-2 min-[400px]:[&>:last-child:nth-child(odd)]:col-span-2 gap-2">
                {companyPhones.map((p) => (
                  <a key={p} href={phoneHref(p)} className="h-11 rounded-xl border border-white/15 flex items-center justify-center gap-2 text-sm font-bold hover:bg-white/10 transition-colors">
                    <Phone className="w-4 h-4 text-[var(--accent-text)]" />
                    <span dir="ltr" className="num">{digits(p, locale)}</span>
                  </a>
                ))}
                <RubikaButton className="h-11 rounded-xl border border-white/15 flex items-center justify-center gap-2 text-sm font-bold hover:bg-white/10 transition-colors">
                  <RubikaIcon className="w-4" />
                  {t.rubika}
                </RubikaButton>
              </div>
            )}
          </article>
        </div>
      </div>
    </section>
  );
}
