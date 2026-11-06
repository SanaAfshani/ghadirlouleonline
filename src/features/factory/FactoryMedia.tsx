'use client';

import { useCallback, useState } from 'react';
import Image from 'next/image';
import { Expand, Play } from 'lucide-react';
import { ImageLightbox } from '@/shared/ui/ImageLightbox';
import { cn, faDigits } from '@/shared/lib/utils';
import type { FactoryPhotoGroup, FactoryVideo } from '@/shared/config/factory-media';

const duration = (s: number) => faDigits(`${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`);

/** فیلم‌های خط تولید — پخش در همان کارت؛ با شروع یکی، بقیه متوقف می‌شوند */
export function FactoryVideos({ videos }: { videos: FactoryVideo[] }) {
  const [started, setStarted] = useState<Set<string>>(new Set());

  const onPlay = (e: React.SyntheticEvent<HTMLVideoElement>, src: string) => {
    const current = e.currentTarget;
    document.querySelectorAll<HTMLVideoElement>('video[data-factory-video]').forEach((v) => v !== current && v.pause());
    setStarted((s) => new Set(s).add(src));
  };

  return (
    <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
      {videos.map((v) => (
        <li key={v.src} className="group">
          <div className="relative aspect-[9/16] overflow-hidden rounded-[var(--radius-panel)] bg-[var(--ink)]">
            <video
              data-factory-video
              src={v.src}
              poster={v.poster}
              // کنترل‌های مرورگر بعد از اولین پخش؛ روی پوستر فقط دکمه پخش بزرگ دیده می‌شود
              controls={started.has(v.src)}
              playsInline
              preload="none"
              onPlay={(e) => onPlay(e, v.src)}
              aria-label={v.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            {!started.has(v.src) && (
              <button
                type="button"
                aria-label={`پخش فیلم: ${v.title}`}
                onClick={(e) => e.currentTarget.parentElement?.querySelector('video')?.play()}
                className="absolute inset-0 grid place-items-center bg-gradient-to-t from-black/45 via-transparent to-transparent"
              >
                <span className="w-14 h-14 rounded-full bg-white/90 text-[var(--ink)] grid place-items-center shadow-lg transition-transform group-hover:scale-110">
                  <Play className="w-6 h-6 translate-x-[-1px] fill-current" />
                </span>
              </button>
            )}
          </div>
          <p className="mt-2 flex items-start justify-between gap-2 text-sm font-bold leading-6">
            <span className="min-w-0 line-clamp-2">{v.title}</span>
            <span className="shrink-0 text-xs font-medium text-[var(--muted-foreground)] num">{duration(v.duration)}</span>
          </p>
        </li>
      ))}
    </ul>
  );
}

/** یک گروه عکس — شبکه با عکس اول بزرگ‌تر، و نمایش تمام‌صفحه با کلیک */
export function FactoryPhotos({ group }: { group: FactoryPhotoGroup }) {
  const [index, setIndex] = useState<number | null>(null);
  const close = useCallback(() => setIndex(null), []);

  return (
    <>
      <ul className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {group.photos.map((p, i) => (
          // عکس اول بزرگ؛ اگر تعداد عکس‌های کوچک فرد باشد آخری دو ستون می‌گیرد تا جای خالی نماند
          <li
            key={p.src}
            className={cn(i === 0 && 'col-span-2 row-span-2', i > 0 && i === group.photos.length - 1 && (group.photos.length - 1) % 2 === 1 && 'col-span-2')}
          >
            <button
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`نمایش بزرگ: ${p.alt}`}
              className="group relative block w-full h-full min-h-40 aspect-[4/3] overflow-hidden rounded-[var(--radius-panel)] bg-[var(--muted)]"
            >
              <Image
                src={p.src}
                alt={p.alt}
                fill
                sizes={i === 0 ? '(min-width: 1024px) 50vw, 100vw' : '(min-width: 1024px) 25vw, 50vw'}
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute top-2 left-2 w-8 h-8 rounded-lg bg-black/40 text-white grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Expand className="w-4 h-4" />
              </span>
            </button>
          </li>
        ))}
      </ul>
      <ImageLightbox images={group.photos.map((p) => p.src)} name={group.title} index={index} onIndex={setIndex} onClose={close} />
    </>
  );
}
