import { cn } from '@/shared/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('skeleton rounded-lg', className)} />
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </div>
  );
}

/** سربرگ تیره هم‌شکل PageHero — تا هنگام بارگذاری صفحه پرش نکند */
export function SkeletonPageHero() {
  return (
    <div className="relative overflow-hidden bg-[var(--ink)]">
      <div className="absolute inset-0 bp-grid bp-grid-fade" />
      <div className="container-main page-hero relative space-y-4 max-w-2xl">
        <div className="h-4 w-24 rounded-md bg-white/10 animate-pulse" />
        <div className="h-9 w-4/5 rounded-lg bg-white/10 animate-pulse" />
        <div className="h-4 w-full rounded-md bg-white/[0.07] animate-pulse" />
        <div className="h-4 w-2/3 rounded-md bg-white/[0.07] animate-pulse" />
      </div>
    </div>
  );
}

/** جدول قیمت در حال بارگذاری — دسکتاپ ردیف جدول، موبایل کارت */
export function SkeletonTable({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div role="status" aria-label="در حال بارگذاری">
      <div className="hidden md:block rounded-2xl border border-[var(--border)] overflow-hidden">
        <div className="bg-[var(--muted)] px-5 py-3.5 flex gap-6">
          {Array.from({ length: cols }, (_, i) => <Skeleton key={i} className={i === 0 ? 'h-3 w-40' : 'h-3 w-16'} />)}
        </div>
        {Array.from({ length: rows }, (_, r) => (
          <div key={r} className="border-t border-[var(--border)] px-5 py-4 flex items-center gap-6">
            <Skeleton className="h-4 flex-1 max-w-sm" />
            {Array.from({ length: cols - 2 }, (_, i) => <Skeleton key={i} className="h-4 w-20" />)}
            <Skeleton className="h-9 w-24 rounded-xl ms-auto" />
          </div>
        ))}
      </div>
      <div className="md:hidden space-y-2">
        {Array.from({ length: Math.min(rows, 4) }, (_, r) => (
          <div key={r} className="rounded-2xl border border-[var(--border)] p-3.5 space-y-3">
            <Skeleton className="h-4 w-4/5" />
            <div className="flex justify-between">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-10 w-24 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** صفحه فهرستی (محصولات، دسته، وبلاگ، پروژه‌ها): سربرگ + کارت‌ها */
export function SkeletonGridPage() {
  return (
    <>
      <SkeletonPageHero />
      <div className="container-main section-padding-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }, (_, i) => <SkeletonCard key={i} />)}
      </div>
    </>
  );
}

/** صفحه محصول: گالری + اطلاعات + جدول قیمت */
export function SkeletonProductPage() {
  return (
    <div className="container-main pt-4 lg:pt-10">
      <Skeleton className="h-3 w-56 mb-6" />
      <div className="grid lg:grid-cols-2 gap-6 lg:gap-12">
        <div>
          <Skeleton className="aspect-[4/3] w-full rounded-3xl" />
          <div className="mt-3 flex gap-2">{Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="w-20 h-20 rounded-2xl" />)}</div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-7 w-28 rounded-lg" />
          <Skeleton className="h-9 w-4/5" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-36 rounded-3xl" />)}</div>
          <Skeleton className="h-32 rounded-3xl" />
        </div>
      </div>
      <div className="mt-12 space-y-4">
        <Skeleton className="h-7 w-48" />
        <SkeletonTable rows={5} cols={5} />
      </div>
    </div>
  );
}

/** مقاله و پروژه: عنوان، کاور و پاراگراف‌ها */
export function SkeletonArticle() {
  return (
    <div className="container-main section-padding-sm max-w-3xl space-y-5">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-10 w-5/6" />
      <Skeleton className="aspect-[16/9] w-full rounded-3xl" />
      {Array.from({ length: 7 }, (_, i) => <Skeleton key={i} className={i % 3 === 2 ? 'h-4 w-2/3' : 'h-4 w-full'} />)}
    </div>
  );
}

/** صفحه اصلی: هیرو تیره با تابلوی قیمت + کارت‌ها */
export function SkeletonHome() {
  return (
    <>
      <div className="bg-[var(--ink)]">
        <div className="container-main grid lg:grid-cols-[1fr_470px] gap-8 py-12 lg:py-20">
          <div className="space-y-4">
            <div className="h-4 w-40 rounded-md bg-white/10 animate-pulse" />
            <div className="h-12 w-4/5 rounded-lg bg-white/10 animate-pulse" />
            <div className="h-5 w-3/5 rounded-md bg-white/[0.07] animate-pulse" />
            <div className="h-14 w-full max-w-xl rounded-2xl bg-white/10 animate-pulse" />
          </div>
          <div className="h-80 rounded-[var(--radius-panel)] bg-white/[0.06] animate-pulse" />
        </div>
      </div>
      <div className="container-main section-padding-sm">
        <SkeletonTable rows={6} cols={5} />
      </div>
    </>
  );
}

/** صفحه متنی (درباره، تماس، قوانین...) */
export function SkeletonTextPage() {
  return (
    <>
      <SkeletonPageHero />
      <div className="container-main section-padding-sm grid lg:grid-cols-[1fr_1.4fr] gap-8">
        <div className="space-y-3">{Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-24 rounded-3xl" />)}</div>
        <div className="space-y-3">{Array.from({ length: 8 }, (_, i) => <Skeleton key={i} className={i % 4 === 3 ? 'h-4 w-1/2' : 'h-4 w-full'} />)}</div>
      </div>
    </>
  );
}
