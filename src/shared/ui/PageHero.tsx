interface PageHeroProps {
  label?: string;
  title: string;
  description?: string;
  /** Optional end-side element (e.g. breadcrumb or illustration) */
  aside?: React.ReactNode;
}

/**
 * سربرگ یکسان صفحات داخلی — همان زبان بصری هیرو صفحه اصلی:
 * زمینه تیره با شبکه ملایم نقشه مهندسی.
 */
export function PageHero({ label, title, description, aside }: PageHeroProps) {
  return (
    <div className="relative overflow-hidden bg-[var(--ink)] text-white">
      <div className="absolute inset-0 bp-grid bp-grid-fade" />

      <div className="container-main page-hero relative z-10">
        <div className="flex items-start justify-between gap-8">
          {/* بدون انیمیشن ورود: عنوان صفحه (معمولاً LCP) باید بدون انتظار برای جاوااسکریپت دیده شود */}
          <div className="max-w-2xl">
            {label && <span className="eyebrow mb-2 sm:mb-3">{label}</span>}
            <h1 className="text-[1.65rem] sm:text-3xl md:text-[2.6rem] font-black text-white leading-snug sm:leading-tight">
              {title}
            </h1>
            {description && (
              <p className="mt-3 text-slate-300 text-sm sm:text-base md:text-lg leading-8">{description}</p>
            )}
          </div>
          {aside && <div className="hidden md:block shrink-0">{aside}</div>}
        </div>
      </div>

      {/* لبه پایین: خط فولادی + تکه نوار هشدار در لبه شروع */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-white/10" aria-hidden />
      <div className="absolute bottom-0 start-0 h-1.5 w-28 sm:w-40 hazard" aria-hidden />
    </div>
  );
}
