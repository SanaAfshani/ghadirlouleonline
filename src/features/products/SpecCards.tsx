import {
  BadgeCheck, Gauge, Hourglass, Info, Layers, Link2, Ruler, Shapes, Target, type LucideIcon,
} from 'lucide-react';
import { faDigits } from '@/shared/lib/utils';
import { IconTile, type IconTone } from '@/shared/ui/IconTile';
import { SpecIllustration, type IllustrationKind } from './SpecIllustration';

const RULES: { test: RegExp; icon: LucideIcon; tone: IconTone; art?: IllustrationKind }[] = [
  { test: /جنس|مواد/, icon: Layers, tone: 'emerald', art: 'material' },
  { test: /سایز|قطر/, icon: Ruler, tone: 'sky', art: 'size' },
  { test: /کلاس|صلبیت|فشار|مقاومت/, icon: Gauge, tone: 'rose', art: 'strength' },
  { test: /اتصال/, icon: Link2, tone: 'violet', art: 'joint' },
  { test: /طول عمر/, icon: Hourglass, tone: 'accent', art: 'lifetime' },
  { test: /استاندارد/, icon: BadgeCheck, tone: 'emerald', art: 'warranty' },
  { test: /کاربرد/, icon: Target, tone: 'rose', art: 'usage' },
  { test: /انواع|اجزا/, icon: Shapes, tone: 'sky' },
];

export function specMeta(key: string) {
  return RULES.find((r) => r.test.test(key)) ?? { icon: Info, tone: 'accent' as IconTone, art: undefined };
}

/** کارت‌های ثابت کنار مشخصات — برای همه محصولات */
const EXTRAS: { art: IllustrationKind; label: string; value: string }[] = [
  { art: 'delivery', label: 'ارسال', value: 'به سراسر کشور' },
  { art: 'warranty', label: 'ضمانت', value: 'اصالت کالا از کارخانه' },
];

function Card({ art, icon, tone, label, value }: { art?: IllustrationKind; icon: LucideIcon; tone: IconTone; label: string; value: string }) {
  return (
    <div className="group flex flex-col items-center text-center rounded-3xl border border-[var(--border)] bg-[var(--card)] px-3 pt-3 pb-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-[var(--accent)]/40">
      <div className="h-20 sm:h-24 w-full grid place-items-center">
        {art ? (
          <SpecIllustration kind={art} className="h-full w-auto drop-shadow-md transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-2" />
        ) : (
          <IconTile icon={icon} tone={tone} size="lg" />
        )}
      </div>
      <dt className="mt-1 text-[11px] font-semibold text-[var(--muted-foreground)]">{label}</dt>
      <dd className="mt-0.5 max-w-full text-[13px] sm:text-sm font-black leading-6 num line-clamp-2 [overflow-wrap:anywhere]">{faDigits(value)}</dd>
    </div>
  );
}

/** مشخصات اصلی محصول به شکل کارت‌های تصویرسازی‌شده (کولیس برای سایز، سپر برای کلاس مقاومتی، کوپلر برای اتصال...) */
export function SpecCards({ specs }: { specs: [string, string][] }) {
  return (
    // @container: ستون‌ها به عرض همین بخش بستگی دارد — در دسکتاپ ۱۰۲۴ ستون اطلاعات محصول فقط ~۴۸۰ پیکسل است
    <div className="@container mt-5">
      <dl className="grid grid-cols-2 @lg:grid-cols-3 gap-2.5">
        {specs.map(([k, v]) => {
          const meta = specMeta(k);
          return <Card key={k} art={meta.art} icon={meta.icon} tone={meta.tone} label={k} value={v} />;
        })}
        {EXTRAS.map((e) => (
          <Card key={e.art} art={e.art} icon={Info} tone="accent" label={e.label} value={e.value} />
        ))}
      </dl>
    </div>
  );
}
