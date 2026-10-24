'use client';

import Image from 'next/image';
import { ImageUploader } from '@/shared/ui/ImageUploader';
import { formatPersianNumber } from '@/shared/lib/utils';
import type { ProjectImage } from '@/shared/types';

type Props = {
  value: ProjectImage[];
  onChange: (images: ProjectImage[]) => void;
  /** برای placeholder فیلد alt — تا ادمین بداند خالی بگذارد چه نوشته می‌شود */
  projectTitle: string;
  max?: number;
};

/**
 * آپلود تصاویر پروژه + متن جایگزین هر تصویر.
 * آپلود و جابه‌جایی و حذف را همان ImageUploader مشترک انجام می‌دهد (با آرایه آدرس کار می‌کند)؛
 * اینجا فقط alt هر آدرس نگه داشته می‌شود. تطبیق بر اساس خودِ آدرس است، پس جابه‌جا کردن
 * ترتیب یا حذف یک عکس، alt بقیه را جابه‌جا نمی‌کند.
 */
export function ProjectImageEditor({ value, onChange, projectTitle, max = 10 }: Props) {
  const handleUrls = (urls: string[]) => {
    const altByUrl = new Map(value.map((img) => [img.url, img.alt]));
    onChange(urls.map((url) => ({ url, alt: altByUrl.get(url) ?? '' })));
  };

  const setAlt = (url: string, alt: string) =>
    onChange(value.map((img) => (img.url === url ? { ...img, alt } : img)));

  return (
    <div className="space-y-4">
      <ImageUploader images={value.map((img) => img.url)} onChange={handleUrls} max={max} />

      {value.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="text-sm font-medium text-[var(--foreground)]">متن جایگزین تصاویر</h3>
            <span className="text-xs text-[var(--muted-foreground)]">
              {formatPersianNumber(value.filter((img) => img.alt).length)} از {formatPersianNumber(value.length)} پر شده
            </span>
          </div>

          {value.map((img, i) => (
            <div key={img.url} className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-[var(--muted)]">
                <Image src={img.url} alt="" fill sizes="48px" className="object-cover" />
                {i === 0 && (
                  <span className="absolute inset-x-0 bottom-0 bg-[var(--accent)] text-[var(--accent-foreground)] text-[9px] font-bold text-center leading-3">
                    اصلی
                  </span>
                )}
              </div>
              <input
                type="text"
                value={img.alt}
                onChange={(e) => setAlt(img.url, e.target.value)}
                placeholder={projectTitle || 'توضیح کوتاه تصویر'}
                className="w-full h-11 bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
            </div>
          ))}

          <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
            چیزی که در تصویر دیده می‌شود را بنویسید، نه کلمه کلیدی؛ مثلاً «اجرای خط انتقال با لوله پلی اتیلن ۴۰۰
            میلیمتر». خالی بماند، عنوان پروژه استفاده می‌شود.
          </p>
        </div>
      )}
    </div>
  );
}
