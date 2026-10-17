import type { LucideIcon } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export type IconTone = 'accent' | 'sky' | 'emerald' | 'rose' | 'violet' | 'slate';

const sizes = {
  sm: 'w-9 h-9 rounded-xl [&>svg]:w-4.5 [&>svg]:h-4.5',
  md: 'w-11 h-11 rounded-2xl [&>svg]:w-5 [&>svg]:h-5',
  lg: 'w-14 h-14 rounded-2xl [&>svg]:w-7 [&>svg]:h-7',
  xl: 'w-20 h-20 rounded-3xl [&>svg]:w-10 [&>svg]:h-10',
};

/**
 * آیکون گرافیکی: کاشی گرادیانی با هایلایت و درخشش (استایل در globals.css: .icon-tile).
 * داخل والد با کلاس group، هاور روی کل کارت هم کاشی را متحرک می‌کند.
 */
export function IconTile({ icon: Icon, tone = 'accent', size = 'md', float = false, className }: {
  icon: LucideIcon;
  tone?: IconTone;
  size?: keyof typeof sizes;
  /** حرکت آرام بالا و پایین — برای آیکون تکی و مهم (مثلاً صفحه خطا) */
  float?: boolean;
  className?: string;
}) {
  return (
    <span aria-hidden className={cn('icon-tile', `tile-${tone}`, sizes[size], float && 'icon-tile--float', className)}>
      <Icon strokeWidth={2.2} />
    </span>
  );
}
