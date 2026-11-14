'use client';

import * as React from 'react';
import { cn } from '@/shared/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, hint, type, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute start-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]">
              {icon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              'w-full h-11 px-4 rounded-xl border bg-[var(--card)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] border-[var(--border)]',
              'focus:outline-none',
              icon && 'ps-10',
              error && 'border-red-500',
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
        {hint && !error && <p className="mt-1.5 text-sm text-[var(--muted-foreground)]">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
