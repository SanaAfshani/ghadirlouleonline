'use client';

import { createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { defaultLocale, localizePath, type Locale } from './config';

const LocaleContext = createContext<Locale>(defaultLocale);

export function LocaleProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useLocale(): Locale {
  return useContext(LocaleContext);
}

/** متن‌های defineMessages به زبان صفحه جاری */
export function useMessages<T>(messages: Record<Locale, T>): T {
  return messages[useLocale()];
}

/** router.push/replace با پیشوند زبان — آدرس‌ها مثل Link فارسی‌وار نوشته می‌شوند */
export function useLocalizedRouter() {
  const router = useRouter();
  const locale = useLocale();
  return {
    ...router,
    push: (href: string, options?: Parameters<typeof router.push>[1]) => router.push(localizePath(href, locale), options),
    replace: (href: string, options?: Parameters<typeof router.replace>[1]) => router.replace(localizePath(href, locale), options),
  };
}
