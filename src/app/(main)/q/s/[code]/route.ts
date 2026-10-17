import { NextRequest, NextResponse } from 'next/server';

type Props = { params: Promise<{ code: string }> };

/**
 * لینک کوتاه پیامک پیش‌فاکتور: /q/s/<hex> → /q/<token>.
 * توکن base64url است و ممکن است «_» داشته باشد که کاوه‌نگار در مقدار الگو نمی‌پذیرد؛ در پیامک همان توکن به صورت hex می‌رود.
 */
export async function GET(request: NextRequest, { params }: Props) {
  const { code } = await params;
  if (!/^[0-9a-f]{20,80}$/.test(code) || code.length % 2) return NextResponse.redirect(new URL('/track', request.url));
  return NextResponse.redirect(new URL(`/q/${Buffer.from(code, 'hex').toString('base64url')}`, request.url));
}
