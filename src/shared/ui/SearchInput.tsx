'use client';

import { Search, X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useMessages } from '@/shared/i18n/LocaleProvider';
import { defineMessages } from '@/shared/i18n/messages';

const messages = defineMessages({
  fa: { clear: 'پاک کردن جستجو' },
  en: { clear: 'Clear search' },
});

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string;
  onValueChange: (value: string) => void;
  wrapperClassName?: string;
}

export function SearchInput({
  value,
  onValueChange,
  wrapperClassName,
  className,
  placeholder,
  ...props
}: SearchInputProps) {
  const t = useMessages(messages);
  return (
    <div className={cn('relative', wrapperClassName)}>
      <Search
        className="pointer-events-none absolute top-1/2 end-3.5 h-[18px] w-[18px] -translate-y-1/2 text-[var(--muted-foreground)]"
        aria-hidden
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'input-base input-base--with-icon h-11 w-full text-sm',
          value && 'input-base--with-clear',
          className,
        )}
        {...props}
      />
      {value ? (
        <button
          type="button"
          onClick={() => onValueChange('')}
          className="absolute top-1/2 start-3 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
          aria-label={t.clear}
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}
