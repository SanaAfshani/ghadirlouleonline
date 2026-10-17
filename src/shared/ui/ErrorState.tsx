import type { LucideIcon } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { IconTile, type IconTone } from './IconTile';

/**
 * صفحه وضعیت مشترک: خطای سرور، قطعی اینترنت، صفحه پیدا نشد، پیش‌فاکتور منقضی/ردشده و...
 * بدون hook — هم در error.tsx (کلاینت) و هم در not-found / صفحه سرور قابل استفاده است.
 */
export function ErrorState({ icon, tone = 'accent', code, title, description, digest, children, className }: {
  icon: LucideIcon;
  tone?: IconTone;
  /** کد کوتاه بالای عنوان، مثلاً ۴۰۴ یا ۵۰۰ */
  code?: string;
  title: string;
  description: React.ReactNode;
  /** شناسه خطای Next.js — برای پیگیری در لاگ سرور، وقتی مشتری با پشتیبانی تماس می‌گیرد */
  digest?: string;
  /** دکمه‌های اقدام */
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('container-main py-16 sm:py-24 grid place-items-center', className)}>
      <div className="page-enter relative max-w-lg w-full text-center">
        <div aria-hidden className="absolute -top-10 left-1/2 -translate-x-1/2 w-64 h-40 glow-accent opacity-60" />
        <div className="relative flex flex-col items-center">
          <IconTile icon={icon} tone={tone} size="xl" float />
          {code && <p className="mt-6 text-sm font-black tracking-widest text-[var(--muted-foreground)] num">{code}</p>}
          <h1 className={cn('font-black text-2xl sm:text-3xl text-[var(--foreground)] leading-snug', code ? 'mt-1' : 'mt-6')}>{title}</h1>
          <div className="mt-3 text-[var(--muted-foreground)] leading-8">{description}</div>
          {children && <div className="mt-8 flex flex-wrap items-center justify-center gap-3">{children}</div>}
          {digest && <p className="mt-6 text-[11px] text-[var(--muted-foreground)] num" dir="ltr">کد پیگیری: {digest}</p>}
        </div>
      </div>
    </div>
  );
}

/** کلاس دکمه‌های صفحه وضعیت — اصلی و فرعی */
export const stateButton = {
  primary: 'h-11 px-6 rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] font-bold inline-flex items-center gap-2 hover:bg-[var(--accent-hover)] transition-all hover:-translate-y-0.5',
  secondary: 'h-11 px-6 rounded-xl border border-[var(--border)] text-[var(--foreground)] font-bold inline-flex items-center gap-2 hover:border-[var(--accent)] hover:text-[var(--accent-text)] transition-colors',
};
