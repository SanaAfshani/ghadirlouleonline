import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/shared/lib/auth';
import { ADMIN_COOKIE } from '@/shared/lib/admin-auth';
import { defaultLocale } from '@/shared/i18n/config';

// proxy در Next 16 روی Node اجرا می‌شود، پس امضای JWT را همان‌جا بررسی می‌کنیم — decode ساده توکن جعلی را هم می‌پذیرفت
function isLoggedIn(request: NextRequest): boolean {
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  return Boolean(token && verifyToken(token));
}

function adminGuard(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // Protect all /admin routes except /admin/login
  if (pathname !== '/admin/login') {
    if (!request.cookies.get(ADMIN_COOKIE)) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (!isLoggedIn(request)) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('expired', '1');
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete(ADMIN_COOKIE);
      return response;
    }
  }

  // If already logged in, redirect away from login page
  if (pathname === '/admin/login' && isLoggedIn(request)) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

/** فایل‌های متادیتای Next (عکس og، آیکن) که خودش با پیشوند /fa لینک می‌دهد */
const METADATA_FILE = /\/(opengraph-image|twitter-image|icon|apple-icon)(-[\w-]+)?$/;

/**
 * زبان: صفحه‌ها واقعاً زیر /[lang] هستند. آدرس فارسی بدون پیشوند می‌ماند (همان آدرس‌هایی که گوگل می‌شناسد)
 * و این‌جا داخلی به /fa بازنویسی می‌شود؛ /en مستقیم می‌رود. /fa/... در نوار آدرس تکرار همان صفحه است، پس ۳۰۸ به آدرس بی‌پیشوند.
 */
function localeRouting(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  if (pathname === `/${defaultLocale}` || pathname.startsWith(`/${defaultLocale}/`)) {
    if (METADATA_FILE.test(pathname)) return NextResponse.next();
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(defaultLocale.length + 1) || '/';
    return NextResponse.redirect(url, 308);
  }

  if (pathname === '/en' || pathname.startsWith('/en/')) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname === '/' ? '' : pathname}`;
  return NextResponse.rewrite(url);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === '/admin' || pathname.startsWith('/admin/')) return adminGuard(request);
  return localeRouting(request);
}

export const config = {
  // API، فایل‌های ثابت و مسیرهای بدون زبان (sitemap، robots، llms.txt، media) از proxy رد نمی‌شوند؛
  // هر مسیری که پسوند فایل دارد (عکس، فونت، pdf) هم همین‌طور
  matcher: ['/((?!api/|_next/|media/|uploads/|images/|videos/|catalogs/|favicon\\.ico|sitemap\\.xml|robots\\.txt|llms\\.txt|.*\\.[a-zA-Z0-9]{2,5}$).*)'],
};
