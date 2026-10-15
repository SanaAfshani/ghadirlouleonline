import { ImageResponse } from 'next/og';
import { siteConfig } from '@/shared/config/site';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
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

/**
 * Satori ترتیب کلمات RTL را جابه‌جا می‌کند (شکل حروف درست است، ترتیب کلمات نه).
 * هر کلمه را به یک آیتم flex جدا تبدیل می‌کنیم و ردیف را row-reverse می‌چینیم.
 */
function RtlText({ children, style }: { children: string; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row-reverse',
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

export default async function OpengraphImage() {
  const font = await loadVazirmatn();

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
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          padding: 80,
          fontFamily: 'Vazirmatn',
        }}
      >
        <div style={{ display: 'flex', width: 120, height: 8, background: '#f59e0b', marginBottom: 44 }} />
        <RtlText style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.35 }}>
          {siteConfig.name}
        </RtlText>
        <RtlText style={{ fontSize: 36, color: '#cbd5e1', marginTop: 28, lineHeight: 1.5 }}>
          لوله و اتصالات آب و فاضلاب
        </RtlText>
        <RtlText style={{ fontSize: 30, color: '#f59e0b', marginTop: 34 }}>
          ارسال به سراسر کشور
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
