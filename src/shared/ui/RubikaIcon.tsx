import Image from 'next/image';
import { cn } from '@/shared/lib/utils';

/**
 * نشان رسمی روبیکا (برش شش‌ضلعی از لوگوی rubika.ir) — مثل لوگوی هر پیام‌رسان، کنار لینک حساب روبیکا.
 * تزئینی است؛ متن یا aria-label لینک کنارش نام روبیکا را می‌گوید.
 */
export function RubikaIcon({ className }: { className?: string }) {
  return <Image src="/images/brands/rubika.svg" alt="" aria-hidden width={20} height={22} unoptimized className={cn('w-5 h-auto', className)} />;
}
