import { NextRequest, NextResponse } from 'next/server';
import { defaultLocale, isLocale, localizePath } from '@/shared/i18n/config';

type Props = { params: Promise<{ lang: string; code: string }> };

/**
 * لینک کوتاه پیامک پیش‌فاکتور: /q/s/<hex> → /q/<token> (و /en/q/s/<hex> → /en/q/<token>).
 * پنل پیامک لینک کامل را در متغیر الگو نمی‌پذیرد؛ دامنه در متن الگوست و توکن به صورت hex (فقط حرف و عدد) می‌رود.
 */
export async function GET(request: NextRequest, { params }: Props) {
  const { lang, code } = await params;
  const locale = isLocale(lang) ? lang : defaultLocale;
  if (!/^[0-9a-f]{20,80}$/.test(code) || code.length % 2) return NextResponse.redirect(new URL(localizePath('/track', locale), request.url));
  return NextResponse.redirect(new URL(localizePath(`/q/${Buffer.from(code, 'hex').toString('base64url')}`, locale), request.url));
}
