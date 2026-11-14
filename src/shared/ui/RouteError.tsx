'use client';

import { useEffect, useSyncExternalStore, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Home, Loader2, RotateCw, ServerCrash, WifiOff } from 'lucide-react';
import { ErrorState, stateButton } from './ErrorState';
import { Link } from '@/shared/i18n/Link';
import { useLocale, useMessages } from '@/shared/i18n/LocaleProvider';
import { digits } from '@/shared/i18n/format';
import { defineMessages } from '@/shared/i18n/messages';

const messages = defineMessages({
  fa: {
    title: 'مشکلی در بارگذاری صفحه پیش آمد',
    home: 'بازگشت به خانه',
    retry: 'تلاش دوباره',
    offlineTitle: 'اتصال اینترنت برقرار نیست',
    offlineText: 'به نظر می‌رسد اینترنت شما قطع شده است. پس از وصل شدن، «تلاش دوباره» را بزنید.',
    serverText: 'ارتباط با سرور موقتاً برقرار نشد. چند ثانیه دیگر دوباره تلاش کنید؛ اگر مشکل ادامه داشت با ما تماس بگیرید.',
    digest: 'کد پیگیری:',
  },
  en: {
    title: 'Something went wrong while loading this page',
    home: 'Back to home',
    retry: 'Try again',
    offlineTitle: 'You are offline',
    offlineText: 'Your internet connection seems to be down. Once you are back online, press “Try again”.',
    serverText: 'We could not reach the server. Please try again in a few seconds; if the problem continues, contact us.',
    digest: 'Reference:',
  },
});

const subscribeOnline = (cb: () => void) => {
  window.addEventListener('online', cb);
  window.addEventListener('offline', cb);
  return () => {
    window.removeEventListener('online', cb);
    window.removeEventListener('offline', cb);
  };
};

/**
 * محتوای مشترک error.tsx ها: قطعی اینترنت کاربر را از خطای سرور جدا می‌کند و «تلاش دوباره» داده سرور را هم تازه می‌گیرد
 * (reset به‌تنهایی فقط کامپوننت کلاینت را دوباره رندر می‌کند، نه کوئری سرور را).
 */
export function RouteError({ error, reset, title, homeHref = '/', homeLabel }: {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  homeHref?: string;
  homeLabel?: string;
}) {
  const router = useRouter();
  const t = useMessages(messages);
  const locale = useLocale();
  const [pending, startTransition] = useTransition();
  const offline = useSyncExternalStore(subscribeOnline, () => !navigator.onLine, () => false);

  useEffect(() => {
    console.error(error);
  }, [error]);

  const retry = () =>
    startTransition(() => {
      router.refresh();
      reset();
    });

  const actions = (
    <>
      <button onClick={retry} disabled={pending} className={stateButton.primary}>
        {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCw className="w-4 h-4" />}
        {t.retry}
      </button>
      <Link href={homeHref} className={stateButton.secondary}>
        <Home className="w-4 h-4" />
        {homeLabel ?? t.home}
      </Link>
    </>
  );

  if (offline) {
    return (
      <ErrorState icon={WifiOff} tone="sky" title={t.offlineTitle} description={t.offlineText}>
        {actions}
      </ErrorState>
    );
  }

  return (
    <ErrorState
      icon={ServerCrash}
      tone="rose"
      code={digits(500, locale)}
      title={title ?? t.title}
      description={t.serverText}
      digest={error.digest}
      digestLabel={t.digest}
    >
      {actions}
    </ErrorState>
  );
}
