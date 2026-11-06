'use client';

import { useCallback, useState } from 'react';
import Image from 'next/image';
import { ChevronDown, Expand, Play } from 'lucide-react';
import { ImageLightbox } from '@/shared/ui/ImageLightbox';
import { cn, faDigits } from '@/shared/lib/utils';
import type { FactoryPhotoGroup, FactoryVideo } from '@/shared/config/factory-media';

const duration = (s: number) => faDigits(`${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`);

/** تعداد فیلم‌های پیش از «نمایش همه» — یک ردیف دسکتاپ؛ ۱۱ کارت عمودی صفحه را بیش از حد بلند می‌کرد */
const VIDEOS_PREVIEW = 4;

/** فیلم‌های خط تولید — پخش در همان کارت؛ با شروع یکی، بقیه متوقف می‌شوند */
export function FactoryVideos({ videos }: { videos: FactoryVideo[] }) {
  const [started, setStarted] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? videos : videos.slice(0, VIDEOS_PREVIEW);

  const onPlay = (e: React.SyntheticEvent<HTMLVideoElement>, src: string) => {
    const current = e.currentTarget;
    document.querySelectorAll<HTMLVideoElement>('video[data-factory-video]').forEach((v) => v !== current && v.pause());
    setStarted((s) => new Set(s).add(src));
  };

  return (
    <>
    <ul className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
      {visible.map((v) => (
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
    {videos.length > VIDEOS_PREVIEW && (
      <button
        type="button"
        onClick={() => setShowAll((v) => !v)}
        aria-expanded={showAll}
        className="mt-5 mx-auto flex items-center gap-1.5 h-11 px-5 rounded-[var(--radius-control)] border border-[var(--border)] text-sm font-bold hover:border-[var(--accent)] hover:text-[var(--accent-text)] transition-colors"
      >
        {showAll ? 'نمایش کمتر' : `نمایش همه ${faDigits(videos.length)} فیلم`}
        <ChevronDown className={cn('w-4 h-4 transition-transform', showAll && 'rotate-180')} />
      </button>
    )}
    </>
  );
}

const LG_SPAN = ['', 'lg:col-span-1', 'lg:col-span-2', 'lg:col-span-3', 'lg:col-span-4'];

/**
 * چیدمان شبکه بدون خانه خالی: عکس اول ۲×۲، بقیه یک خانه؛ آخرین عکس بقیه ردیفش را پر می‌کند.
 * موبایل ۲ ستون است؛ دسکتاپ ۴ ستون که ۴ عکس اول کنار عکس بزرگ و بقیه در ردیف‌های ۴تایی می‌نشینند.
 * گروه کمتر از ۳ عکس عکس بزرگ ندارد و در دسکتاپ نیمه‌نیمه است.
 */
function tileClass(i: number, n: number) {
  if (n < 3) return 'lg:col-span-2';
  if (i === 0) return 'col-span-2 row-span-2';
  if (i !== n - 1) return '';
  const smalls = n - 1;
  const mobile = smalls % 2 === 1 ? 'col-span-2' : '';
  const leftover = smalls <= 4 ? smalls % 2 : (smalls - 4) % 4;
  const lg = smalls <= 4 ? (leftover ? 2 : 1) : leftover ? 5 - leftover : 1;
  return cn(mobile, LG_SPAN[lg]);
}

/** یک گروه عکس — شبکه با عکس اول بزرگ‌تر، و نمایش تمام‌صفحه با کلیک */
export function FactoryPhotos({ group }: { group: FactoryPhotoGroup }) {
  const [index, setIndex] = useState<number | null>(null);
  const close = useCallback(() => setIndex(null), []);

  return (
    <>
      <ul className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {group.photos.map((p, i) => (
          <li key={p.src} className={tileClass(i, group.photos.length)}>
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

/**
 * گالری عکس کارخانه با تب گروه‌ها — به‌جای پنج بخش پشت سر هم با عنوان تکراری.
 * همه گروه‌ها در HTML هستند (فقط پنهان)، پس متن جایگزین عکس‌ها برای گوگل خوانده می‌شود.
 */
export function FactoryGallery({ groups }: { groups: FactoryPhotoGroup[] }) {
  const [active, setActive] = useState(groups[0]?.id);

  return (
    <>
      <div role="tablist" aria-label="گروه عکس‌ها" className="snap-row mb-5">
        {groups.map((g) => (
          <button
            key={g.id}
            type="button"
            role="tab"
            id={`tab-${g.id}`}
            aria-controls={`panel-${g.id}`}
            aria-selected={active === g.id}
            onClick={() => setActive(g.id)}
            className={cn(
              'h-10 px-4 rounded-[var(--radius-control)] border text-sm font-bold whitespace-nowrap flex items-center gap-1.5 transition-colors',
              active === g.id
                ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-foreground)]'
                : 'border-[var(--border)] hover:border-[var(--foreground)]/40',
            )}
          >
            {g.title}
            <span className="text-xs opacity-70 num">{faDigits(g.photos.length)}</span>
          </button>
        ))}
      </div>
      {groups.map((g) => (
        <div key={g.id} role="tabpanel" id={`panel-${g.id}`} aria-labelledby={`tab-${g.id}`} hidden={active !== g.id}>
          <h3 className="sr-only">{g.title}</h3>
          <p className="mb-4 text-sm leading-7 text-[var(--muted-foreground)]">{g.description}</p>
          <FactoryPhotos group={g} />
        </div>
      ))}
    </>
  );
}
