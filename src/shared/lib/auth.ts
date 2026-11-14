import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * یک کلید برای امضا و بررسی همه توکن‌ها (login، proxy، API ها).
 * قبلاً login و me کلید پیش‌فرض دیگری داشتند و بدون JWT_SECRET توکنِ ورود در API ها رد می‌شد.
 * در production بدون JWT_SECRET اصلاً توکن صادر نمی‌شود — کلید پیش‌فرضِ داخل کد را هر کسی می‌تواند ببیند.
 */
function jwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === 'production') throw new Error('JWT_SECRET is not set');
  return 'lule-mashhad-dev-only-secret';
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, jwtSecret(), { expiresIn: '7d' });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const payload = jwt.verify(token, jwtSecret());
    if (typeof payload !== 'object' || !payload.userId || !payload.email || !payload.role) return null;
    return { userId: payload.userId, email: payload.email, role: payload.role };
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
