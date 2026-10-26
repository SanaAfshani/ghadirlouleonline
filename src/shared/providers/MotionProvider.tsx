'use client';

import { LazyMotion, MotionConfig } from 'framer-motion';

const loadFeatures = () => import('./motion-features').then((mod) => mod.default);

/**
 * framer-motion به شکل سبک: همه‌جا کامپوننت m (به نام محلی motion) استفاده می‌شود و قابلیت‌های انیمیشن
 * بعد از رندر صفحه جدا دانلود می‌شوند — حدود ۴۰ کیلوبایت جاوااسکریپت کمتر در بارگذاری اول.
 *
 * reducedMotion="user": کاربری که در تنظیمات سیستمش انیمیشن کمتر خواسته، هیچ‌کدام از حرکت‌های
 * framer-motion را نمی‌بیند — یک‌جا برای کل سایت، به‌جای تکرار شرط در تک‌تک کامپوننت‌ها.
 * (انیمیشن‌های CSS از قبل در globals.css همین را رعایت می‌کنند.)
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={loadFeatures}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
