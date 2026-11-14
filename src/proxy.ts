import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/shared/lib/auth';
import { ADMIN_COOKIE } from '@/shared/lib/admin-auth';

// proxy در Next 16 روی Node اجرا می‌شود، پس امضای JWT را همان‌جا بررسی می‌کنیم — decode ساده توکن جعلی را هم می‌پذیرفت
function isLoggedIn(request: NextRequest): boolean {
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  return Boolean(token && verifyToken(token));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all /admin routes except /admin/login
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
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

export const config = {
  matcher: ['/admin/:path*'],
};
