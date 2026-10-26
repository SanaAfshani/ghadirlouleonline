'use client';

import { useCallback, useState } from 'react';
import Image from 'next/image';
import { ZoomIn } from 'lucide-react';
import type { ProjectImage } from '@/shared/types';
import { ImageLightbox } from '@/shared/ui/ImageLightbox';
import { faDigits } from '@/shared/lib/utils';

/** تا وقتی نسبت واقعی عکس معلوم نشده، همین کادر ایستاده رزرو می‌شود تا چیدمان نپرد */
const FALLBACK_RATIO = 3 / 4;

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
 */
export function ProjectGallery({ images, title }: { images: ProjectImage[]; title: string }) {
  const [ratios, setRatios] = useState<Record<string, number>>({});
  const [zoom, setZoom] = useState<number | null>(null);
  const closeZoom = useCallback(() => setZoom(null), []);

  /**
   * نسبت واقعی عکس را از خود المان می‌خواند.
   *
   * هم از ref صدا زده می‌شود و هم از onLoad، چون اگر عکس قبل از وصل‌شدن onLoad لود شده باشد
   * (مثلاً از کش مرورگر یا موقع جابه‌جایی بین صفحه‌ها) آن رویداد هیچ‌وقت نمی‌رسد و کاشی تا آخر
   * روی نسبت پیش‌فرض می‌ماند — یعنی دقیقاً همان برشی که قرار بود حذف شود.
   */
  const measure = useCallback((img: HTMLImageElement | null, url: string) => {
    if (!img?.naturalHeight) return;
    const ratio = img.naturalWidth / img.naturalHeight;
    setRatios((r) => (r[url] ? r : { ...r, [url]: ratio }));
  }, []);

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
            <Image
              src={image.url}
              alt={image.alt || `${title} — تصویر ${faDigits(i + 1)}`}
              fill
              sizes="(max-width: 1024px) 50vw, 300px"
              quality={90}
              priority={i < 2}
              ref={(img) => measure(img, image.url)}
              onLoad={(e) => measure(e.currentTarget, image.url)}
              // کادر دقیقاً نسبت خود عکس را دارد، پس cover چیزی نمی‌برد و فقط لبه‌های گرد را پر می‌کند
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
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
