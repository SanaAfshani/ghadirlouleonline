'use client';

import { useEffect, useSyncExternalStore, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, Loader2, RotateCw, ServerCrash, WifiOff } from 'lucide-react';
import { ErrorState, stateButton } from './ErrorState';

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
export function RouteError({ error, reset, title = 'مشکلی در بارگذاری صفحه پیش آمد', homeHref = '/', homeLabel = 'بازگشت به خانه' }: {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  homeHref?: string;
  homeLabel?: string;
}) {
  const router = useRouter();
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
        تلاش دوباره
      </button>
      <Link href={homeHref} className={stateButton.secondary}>
        <Home className="w-4 h-4" />
        {homeLabel}
      </Link>
    </>
  );

  if (offline) {
    return (
      <ErrorState icon={WifiOff} tone="sky" title="اتصال اینترنت برقرار نیست" description="به نظر می‌رسد اینترنت شما قطع شده است. پس از وصل شدن، «تلاش دوباره» را بزنید.">
        {actions}
      </ErrorState>
    );
  }

  return (
    <ErrorState
      icon={ServerCrash}
      tone="rose"
      code="۵۰۰"
      title={title}
      description="ارتباط با سرور موقتاً برقرار نشد. چند ثانیه دیگر دوباره تلاش کنید؛ اگر مشکل ادامه داشت با ما تماس بگیرید."
      digest={error.digest}
    >
      {actions}
    </ErrorState>
  );
}
