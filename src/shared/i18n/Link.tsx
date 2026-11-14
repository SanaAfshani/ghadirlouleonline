'use client';

import NextLink from 'next/link';
import { forwardRef, type ComponentProps } from 'react';
import { localizePath } from './config';
import { useLocale } from './LocaleProvider';

type Props = Omit<ComponentProps<typeof NextLink>, 'href'> & { href: string };

/**
 * همان next/link که آدرس را به زبان صفحه جاری می‌برد: href="/products" در نسخه انگلیسی /en/products می‌شود.
 * همه لینک‌های سایت عمومی از این استفاده می‌کنند تا کاربر انگلیسی با یک کلیک به فارسی پرت نشود.
 */
export const Link = forwardRef<HTMLAnchorElement, Props>(function Link({ href, ...props }, ref) {
  const locale = useLocale();
  return <NextLink ref={ref} href={localizePath(href, locale)} {...props} />;
});
