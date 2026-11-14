import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, type JWTPayload } from '@/shared/lib/auth';

export const ADMIN_COOKIE = 'admin_token';

/**
 * احراز هویت API های ادمین از روی کوکی admin_token (که در /api/auth/login ست می‌شود).
 * امضای JWT بررسی می‌شود — decode ساده کافی نیست چون توکن جعلی را هم می‌پذیرد.
 */
export function requireAdmin(request: NextRequest): JWTPayload | NextResponse {
  const token =
    request.cookies.get(ADMIN_COOKIE)?.value ||
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  const payload = token ? verifyToken(token) : null;
  if (!payload) {
    return NextResponse.json({ success: false, error: 'دسترسی غیرمجاز' }, { status: 401 });
  }
  return payload;
}

/**
 * بخش‌هایی که روی کل سایت اثر دارند (تنظیمات، سئو، ریدایرکت، کاربران) فقط برای مدیر کل؛
 * ویرایشگر محتوا (محصول، مقاله، قیمت، پیش‌فاکتور) را مدیریت می‌کند ولی تلفن و ریدایرکت سایت را نه.
 */
export function requireSuperAdmin(request: NextRequest): JWTPayload | NextResponse {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  if (auth.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'فقط مدیر کل به این بخش دسترسی دارد' }, { status: 403 });
  }
  return auth;
}

/** برای GETهای عمومی که با ?admin=true موارد منتشرنشده را هم برمی‌گردانند — فقط برای ادمین واقعی، نه هر کسی که پارامتر را بفرستد */
export function isAdmin(request: NextRequest): boolean {
  return !(requireAdmin(request) instanceof NextResponse);
}
