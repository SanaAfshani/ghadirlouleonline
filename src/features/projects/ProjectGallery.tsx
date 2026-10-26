'use client';

import { useCallback, useRef, useState } from 'react';
import Image from 'next/image';
import { ZoomIn } from 'lucide-react';
import type { ProjectImage } from '@/shared/types';
import { ImageLightbox } from '@/shared/ui/ImageLightbox';
import { faDigits } from '@/shared/lib/utils';

/** تا وقتی نسبت واقعی عکس معلوم نشده، همین کادر ایستاده رزرو می‌شود تا چیدمان نپرد */
const FALLBACK_RATIO = 3 / 4;

/**
 * چند عکس هم‌زمان از سرور خواسته شود.
 *
 * هر درخواست /_next/image یک بهینه‌سازی sharp روی سرور است و کانتینر سایت حدود ۹۵۰ مگابایت رم
 * دارد. با ده درخواست هم‌زمان (HTTP/2 هیچ‌کدام را پشت سر هم نمی‌کند) اولین بازدید از یک پروژه
 * ده‌ها ثانیه طول می‌کشید. با صف، هر لحظه حداکثر همین تعداد در راه است و با تمام‌شدن هرکدام،
 * بعدی شروع می‌شود. نسخه بهینه‌شده یک سال کش می‌شود، پس این هزینه فقط بار اول است.
 */
const CONCURRENCY = 3;

/**
 * گالری عکس‌های یک پروژه.
 *
 * عکس‌های پروژه با موبایل گرفته شده‌اند و بیشترشان ایستاده‌اند (مثلاً ۲۷۰×۴۸۰). قبلاً عکس اول در
 * نواری به ارتفاع ثابت ۲۵۶ پیکسل و بقیه در کادرهای ۱۹۲ پیکسلیِ خوابیده با object-cover می‌افتادند،
 * یعنی از یک عکس ایستاده فقط یک نوار باریک وسطش می‌ماند.
 *
 * اینجا هیچ نسبتی به عکس تحمیل نمی‌شود: نسبت واقعی هر عکس موقع بارگذاری خوانده می‌شود و روی کادر
 * خودش می‌نشیند، پس هیچ عکسی بریده نمی‌شود. چیدمان ستونی (masonry) است تا عکس‌های ایستاده و
 * خوابیده کنار هم جا بیفتند. کلیک، عکس را تمام‌صفحه باز می‌کند.
 *
 * کاشی‌هایی که هنوز نوبتشان نرسیده، کادر خودشان را می‌گیرند ولی تگ img ندارند — پس چیدمان از
 * اول کامل است و فقط دانلود صف می‌شود. آدرس همه عکس‌ها در JSON-LD صفحه (projectSchema.image)
 * هست، پس این صف‌بندی چیزی از دید موتور جستجو پنهان نمی‌کند.
 */
export function ProjectGallery({ images, title }: { images: ProjectImage[]; title: string }) {
  const [ratios, setRatios] = useState<Record<string, number>>({});
  const [ready, setReady] = useState(CONCURRENCY);
  const [zoom, setZoom] = useState<number | null>(null);
  const closeZoom = useCallback(() => setZoom(null), []);
  /** عکس‌هایی که تکلیفشان روشن شده — تا یک عکس دو بار صف را جلو نبرد */
  const settled = useRef(new Set<string>());

  /** تکلیف یک عکس روشن شد: نسبتش را بردار و نوبت بعدی را باز کن */
  const settle = useCallback((url: string, img: HTMLImageElement) => {
    if (img.naturalHeight) {
      const ratio = img.naturalWidth / img.naturalHeight;
      setRatios((r) => (r[url] ? r : { ...r, [url]: ratio }));
    }
    if (settled.current.has(url)) return;
    settled.current.add(url);
    setReady((n) => n + 1);
  }, []);

  /**
   * گوش‌دادن به پایان کار عکس، مستقیم روی خود المان.
   *
   * به onLoad ری‌اکت تکیه نمی‌کنیم: اگر عکس پیش از وصل‌شدن آن تمام شده باشد (کش مرورگر یا
   * جابه‌جایی بین صفحه‌ها) رویداد هیچ‌وقت نمی‌رسد و آن‌وقت هم نسبت روی مقدار پیش‌فرض می‌ماند —
   * یعنی همان برشی که این گالری برای حذفش هست — و هم صف همان‌جا قفل می‌شود. پس اول همان
   * لحظه complete را می‌خوانیم و اگر هنوز تمام نشده، listener می‌گذاریم. خطا هم صف را باز
   * می‌کند تا یک عکس خراب بقیه را زمین‌گیر نکند.
   */
  const watch = useCallback(
    (url: string) => (img: HTMLImageElement | null) => {
      if (!img) return;
      if (img.complete) return settle(url, img);
      const done = () => settle(url, img);
      img.addEventListener('load', done, { once: true });
      img.addEventListener('error', done, { once: true });
    },
    [settle],
  );

  if (images.length === 0) return null;

  const urls = images.map((image) => image.url);

  return (
    <div className="mb-10">
      {/* columns به‌جای grid: هر ستون عکس‌ها را پشت هم می‌چیند، پس ارتفاع‌های متفاوت فاصله خالی نمی‌سازند */}
      <div className="columns-2 lg:columns-3 gap-3 [column-fill:_balance]">
        {images.map((image, i) => (
          <button
            key={image.url}
            type="button"
            onClick={() => setZoom(i)}
            aria-label={`بزرگ‌نمایی تصویر ${faDigits(i + 1)}`}
            style={{ aspectRatio: ratios[image.url] ?? FALLBACK_RATIO }}
            className="group relative block w-full mb-3 break-inside-avoid rounded-2xl overflow-hidden bg-[var(--muted)] border border-[var(--border)] cursor-zoom-in"
          >
            {i < ready && (
              <Image
                src={image.url}
                alt={image.alt || `${title} — تصویر ${faDigits(i + 1)}`}
                fill
                sizes="(max-width: 1024px) 50vw, 300px"
                quality={90}
                priority={i === 0}
                // عکسی که نوبتش رسیده بی‌درنگ دانلود می‌شود. lazy بومی اینجا کار را خراب می‌کرد:
                // کاشی‌های پایین صفحه هیچ‌وقت fetch نمی‌شدند، پس هیچ‌وقت نوبت بعدی را باز
                // نمی‌کردند و صف وسط راه می‌ماند. تنظیم تعداد هم‌زمان با همین صف انجام می‌شود.
                loading={i === 0 ? undefined : 'eager'}
                ref={watch(image.url)}
                // کادر دقیقاً نسبت خود عکس را دارد، پس cover چیزی نمی‌برد و فقط لبه‌های گرد را پر می‌کند
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            )}
            <span
              aria-hidden
              className="absolute bottom-3 left-3 grid place-items-center w-9 h-9 rounded-full bg-black/55 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ZoomIn className="w-4.5 h-4.5" />
            </span>
          </button>
        ))}
      </div>

      <ImageLightbox images={urls} name={title} index={zoom} onIndex={setZoom} onClose={closeZoom} />
    </div>
  );
}
