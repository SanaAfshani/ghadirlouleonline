'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none',
  {
    variants: {
      variant: {
        default: 'bg-[var(--accent)] text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)] shadow-lg shadow-accent hover:-translate-y-0.5',
        primary: 'bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 shadow-lg hover:-translate-y-0.5',
        outline: 'border-2 border-[var(--accent)] text-[var(--accent-text)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] hover:-translate-y-0.5',
        ghost: 'hover:bg-[var(--muted)] text-[var(--foreground)]',
        destructive: 'bg-red-500 text-white hover:bg-red-600 shadow-lg hover:-translate-y-0.5',
        glass: 'glass text-[var(--foreground)] hover:bg-white/10 border border-white/20',
      },
      size: {
        sm: 'h-8 px-4 text-sm',
        md: 'h-11 px-6 text-base',
        lg: 'h-14 px-8 text-lg',
        xl: 'h-16 px-10 text-xl',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'start' | 'end';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, icon, iconPosition = 'start', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading ? (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : icon && iconPosition === 'start' ? (
          icon
        ) : null}
        {children}
        {!loading && icon && iconPosition === 'end' ? icon : null}
      </button>
    );
  }
);

Button.displayName = 'Button';
