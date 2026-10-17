'use client';

import { useEffect } from 'react';

/**
 * سخت‌کردن کپی عکس‌ها در سایت: راست‌کلیک («ذخیره تصویر»)، کشیدن عکس به دسکتاپ و منوی لمس طولانی موبایل غیرفعال.
 * جلوی اسکرین‌شات یا ابزار توسعه‌دهنده را نمی‌گیرد — برای همین عکس‌ها واترمارک هم دارند (shared/lib/watermark).
 */
export function ImageGuard() {
  useEffect(() => {
    const isImage = (t: EventTarget | null) => t instanceof HTMLImageElement || (t instanceof Element && !!t.closest('picture, figure img, [data-protect-image]'));
    const block = (e: Event) => {
      if (isImage(e.target)) e.preventDefault();
    };
    document.addEventListener('contextmenu', block);
    document.addEventListener('dragstart', block);
    return () => {
      document.removeEventListener('contextmenu', block);
      document.removeEventListener('dragstart', block);
    };
  }, []);
  return null;
}
