import { ImageResponse } from 'next/og';
import { siteConfig } from '@/shared/config/site';
import { getSiteSettingsMap } from '@/shared/lib/data';
import { mergeSiteSettings } from '@/shared/lib/site-settings';
import { resolveLocale } from '@/shared/i18n/server';
import { defineMessages } from '@/shared/i18n/messages';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// alt ثابت فایل است (پارامتر زبان نمی‌گیرد) — generateImageMetadata آدرس تصویر را عوض می‌کرد
export const alt =`${siteConfig.name} | تامین کننده لوله و اتصالات صنعتی`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/** فونت فارسی برای رندر تصویر — بدون آن متن فارسی به صورت مربع نمایش داده می‌شود */
async function loadVazirmatn(): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      'https://fonts.googleapis.com/css2?family=Vazirmatn:wght@700&display=swap',
      { headers: { 'User-Agent': 'Mozilla/5.0' }, next: { revalidate: 86400 } }
    ).then((r) => r.text());
    const url = css.match(/src:\s*url\((https:[^)]+\.(?:woff2?|ttf))\)/)?.[1];
    if (!url) return null;
    return await fetch(url, { next: { revalidate: 86400 } }).then((r) => r.arrayBuffer());
  } catch {
    return null;
  }
}

const messages = defineMessages({
  fa: { subtitle: 'لوله و اتصالات آب و فاضلاب', shipping: 'ارسال به سراسر کشور' },
  en: { subtitle: 'Water and sewer pipes and fittings', shipping: 'Delivery across Iran' },
});

/**
 * Satori ترتیب کلمات RTL را جابه‌جا می‌کند (شکل حروف درست است، ترتیب کلمات نه).
 * هر کلمه را به یک آیتم flex جدا تبدیل می‌کنیم و ردیف را row-reverse می‌چینیم.
 */
function RtlText({ children, style, rtl = true }: { children: string; style?: React.CSSProperties; rtl?: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        // متن انگلیسی همان چیدمان کلمه‌به‌کلمه را با ترتیب عادی می‌گیرد
        flexDirection: rtl ? 'row-reverse' : 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '0.22em',
        ...style,
      }}
    >
      {children.split(/\s+/).filter(Boolean).map((word, i) => (
        <div key={i} style={{ display: 'flex' }}>
          {word}
        </div>
      ))}
    </div>
  );
}

export default async function OpengraphImage({ params }: { params: Promise<{ lang: string }> }) {
  const locale = await resolveLocale(params);
  const [font, raw] = await Promise.all([loadVazirmatn(), getSiteSettingsMap()]);
  const { siteName } = mergeSiteSettings(raw, locale);
  const t = messages[locale];
  const rtl = locale === 'fa';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          color: '#ffffff',
          padding: 80,
          fontFamily: 'Vazirmatn',
        }}
      >
        <div style={{ display: 'flex', width: 120, height: 8, background: '#3B82F6', marginBottom: 44 }} />
        <RtlText rtl={rtl} style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.35 }}>
          {siteName}
        </RtlText>
        <RtlText rtl={rtl} style={{ fontSize: 36, color: '#CBD5E1', marginTop: 28, lineHeight: 1.5 }}>
          {t.subtitle}
        </RtlText>
        <RtlText rtl={rtl} style={{ fontSize: 30, color: '#3B82F6', marginTop: 34 }}>
          {t.shipping}
        </RtlText>
      </div>
    ),
    {
      ...size,
      ...(font
        ? { fonts: [{ name: 'Vazirmatn', data: font, style: 'normal' as const, weight: 700 as const }] }
        : {}),
    }
  );
}
