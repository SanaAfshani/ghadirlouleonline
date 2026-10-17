import {
  ArrowUpDown, BadgeCheck, Compass, Droplets, Gauge, Hourglass, Info, Layers, Leaf, Link2, MoveHorizontal, Ruler, ScanSearch, Shapes, ShieldCheck,
  Sparkles, Sun, Target, type LucideIcon,
} from 'lucide-react';
import { GRADES, sizeValue } from '@/shared/lib/price-item';
import type { LiveItem } from '@/shared/lib/price-board-types';
import { faDigits } from '@/shared/lib/utils';
import { SpecIllustration, type IllustrationKind, type Subject } from './SpecIllustration';

/** ترتیب مهم است: «مقاوم UV» قبل از «مقاومت»، «سطح» قبل از بقیه */
const RULES: { test: RegExp; icon: LucideIcon; art: IllustrationKind }[] = [
  { test: /UV|اشعه/i, icon: Sun, art: 'uv' },
  { test: /جنس|مواد/, icon: Layers, art: 'material' },
  { test: /ارتفاع|عمق/, icon: ArrowUpDown, art: 'height' },
  { test: /سایز|قطر|ظرفیت/, icon: Ruler, art: 'size' },
  { test: /فشار/, icon: Gauge, art: 'pressure' },
  { test: /کلاس|صلبیت|مقاومت/, icon: ShieldCheck, art: 'strength' },
  { test: /اتصال/, icon: Link2, art: 'joint' },
  { test: /طول عمر/, icon: Hourglass, art: 'lifetime' },
  { test: /طول|کلاف|رول/, icon: MoveHorizontal, art: 'length' },
  { test: /استاندارد/, icon: BadgeCheck, art: 'warranty' },
  { test: /کاربرد/, icon: Target, art: 'usage' },
  { test: /دبی/, icon: Droplets, art: 'flow' },
  { test: /سطح/, icon: ScanSearch, art: 'surface' },
  { test: /زاویه/, icon: Compass, art: 'angle' },
  { test: /پوشش/, icon: Layers, art: 'coating' },
  { test: /آلودگی|محیط زیست/, icon: Leaf, art: 'eco' },
  { test: /انواع|اجزا/, icon: Shapes, art: 'types' },
  { test: /ویژگی|قابلیت/, icon: Sparkles, art: 'feature' },
];

export function specMeta(key: string) {
  return RULES.find((r) => r.test.test(key)) ?? { icon: Info, art: 'feature' as IllustrationKind };
}

/** جنس محصولاتی که در پنل مشخصات ندارند — فقط جایی که از خود نام محصول قطعی است */
const MATERIAL: Partial<Record<Subject, string>> = {
  pe: 'پلی اتیلن',
  pvc: 'PVC سخت (UPVC)',
  concrete: 'بتن',
  ductile: 'چدن داکتیل',
};

const range = (values: number[], unit: string) => {
  const min = Math.min(...values);
  const max = Math.max(...values);
  return min === max ? `${min} ${unit}` : `${min} تا ${max} ${unit}`;
};

/**
 * محصولی که در پنل مشخصات کم دارد (پلی اتیلن، پلیکا، بتنی...) کارت خالی نماند: از ردیف‌های واقعی جدول قیمت
 * بازه سایز، فشار کاری، کلاس سبک/سنگین و ارتفاع ساخته می‌شود. مشخصات ثبت‌شده در پنل همیشه اول می‌آیند.
 */
export function withDerivedSpecs(specs: [string, string][], items: Pick<LiveItem, 'size' | 'grade' | 'spec' | 'dimensions'>[], subject: Subject) {
  const out = [...specs];
  const has = (art: IllustrationKind) => out.some(([k]) => specMeta(k).art === art);

  const material = MATERIAL[subject];
  if (material && !has('material')) out.push(['جنس', material]);

  const mm = items.filter((i) => /میلیمتر/.test(i.size)).map((i) => sizeValue(i.size)).filter(Number.isFinite);
  if (mm.length && !has('size')) out.push(['سایز', range(mm, 'میلیمتر')]);

  const bar = items.flatMap((i) => [...i.spec.matchAll(/(\d+(?:\.\d+)?)\s*بار/g)].map((m) => Number(m[1])));
  if (bar.length && !has('pressure')) out.push(['فشار کاری', range(bar, 'بار')]);

  const grades = GRADES.filter((g) => items.some((i) => i.grade === g));
  if (grades.length && !has('strength')) out.push(['کلاس', grades.join(' / ')]);

  const heights = items.flatMap((i) => [...i.dimensions.matchAll(/ارتفاع\s*(\d+)\s*سانتیمتر/g)].map((m) => Number(m[1])));
  if (heights.length && !has('height')) out.push(['ارتفاع', range(heights, 'سانتیمتر')]);

  return out;
}

/** کارت‌های ثابت کنار مشخصات — برای همه محصولات */
const EXTRAS: { art: IllustrationKind; label: string; value: string }[] = [
  { art: 'delivery', label: 'ارسال', value: 'به سراسر کشور' },
  { art: 'warranty', label: 'ضمانت', value: 'اصالت کالا از کارخانه' },
];

function Card({ art, subject, label, value }: { art: IllustrationKind; subject: Subject; label: string; value: string }) {
  return (
    <div className="group flex flex-col items-center text-center rounded-3xl border border-[var(--border)] bg-[var(--card)] px-3 pt-3 pb-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-[var(--accent)]/40">
      <div className="h-20 sm:h-24 w-full grid place-items-center">
        <SpecIllustration kind={art} subject={subject} className="h-full w-auto drop-shadow-md transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-2" />
      </div>
      <dt className="mt-1 text-[11px] font-semibold text-[var(--muted-foreground)]">{label}</dt>
      <dd className="mt-0.5 max-w-full text-[13px] sm:text-sm font-black leading-6 num line-clamp-2 [overflow-wrap:anywhere]">{faDigits(value)}</dd>
    </div>
  );
}

/** مشخصات اصلی محصول به شکل کارت‌های تصویرسازی‌شده با شکل خود همین محصول (منهول کنار کولیس، سپتیک روی کامیون...) */
export function SpecCards({ specs, subject }: { specs: [string, string][]; subject: Subject }) {
  return (
    // @container: ستون‌ها به عرض همین بخش بستگی دارد — در دسکتاپ ۱۰۲۴ ستون اطلاعات محصول فقط ~۴۸۰ پیکسل است
    <div className="@container mt-5">
      <dl className="grid grid-cols-2 @lg:grid-cols-3 gap-2.5">
        {specs.map(([k, v]) => (
          <Card key={k} art={specMeta(k).art} subject={subject} label={k} value={v} />
        ))}
        {EXTRAS.map((e) => (
          <Card key={e.art} art={e.art} subject={subject} label={e.label} value={e.value} />
        ))}
      </dl>
    </div>
  );
}
