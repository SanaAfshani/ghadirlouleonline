import {
  ArrowUpDown, BadgeCheck, Compass, Droplets, Gauge, Hourglass, Info, Layers, Leaf, Link2, MoveHorizontal, Ruler, ScanSearch, Shapes, ShieldCheck,
  Sparkles, Sun, Target, type LucideIcon,
} from 'lucide-react';
import { GRADES, gradeLabel, sizeValue } from '@/shared/lib/price-item';
import type { LiveItem } from '@/shared/lib/price-board-types';
import type { Locale } from '@/shared/i18n/config';
import { digits } from '@/shared/i18n/format';
import { defineMessages } from '@/shared/i18n/messages';
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

/** یک مشخصه: کلید فارسی برای منطق (آیکون و تصویر)، برچسب و مقدار به زبان صفحه */
export type SpecEntry = { key: string; label: string; value: string };

/**
 * برچسب و واحدهای مشخصاتی که از جدول قیمت ساخته می‌شوند + کارت‌های ثابت.
 * جنس فقط برای محصولاتی که در پنل مشخصات ندارند — فقط جایی که از خود نام محصول قطعی است.
 */
const messages = defineMessages({
  fa: {
    material: 'جنس',
    size: 'سایز',
    pressure: 'فشار کاری',
    grade: 'کلاس',
    height: 'ارتفاع',
    to: 'تا',
    mm: 'میلیمتر',
    bar: 'بار',
    cm: 'سانتیمتر',
    materials: { pe: 'پلی اتیلن', pvc: 'PVC سخت (UPVC)', concrete: 'بتن', ductile: 'چدن داکتیل' } as Partial<Record<Subject, string>>,
    delivery: { label: 'ارسال', value: 'به سراسر کشور' },
    warranty: { label: 'ضمانت', value: 'اصالت کالا از کارخانه' },
  },
  en: {
    material: 'Material',
    size: 'Size',
    pressure: 'Working pressure',
    grade: 'Class',
    height: 'Height',
    to: 'to',
    mm: 'mm',
    bar: 'bar',
    cm: 'cm',
    materials: { pe: 'Polyethylene', pvc: 'Rigid PVC (UPVC)', concrete: 'Concrete', ductile: 'Ductile iron' },
    delivery: { label: 'Delivery', value: 'Across Iran' },
    warranty: { label: 'Guarantee', value: 'Genuine factory product' },
  },
});

const range = (values: number[], unit: string, to: string) => {
  const min = Math.min(...values);
  const max = Math.max(...values);
  return min === max ? `${min} ${unit}` : `${min} ${to} ${max} ${unit}`;
};

/**
 * محصولی که در پنل مشخصات کم دارد (پلی اتیلن، پلیکا، بتنی...) کارت خالی نماند: از ردیف‌های واقعی جدول قیمت
 * بازه سایز، فشار کاری، کلاس سبک/سنگین و ارتفاع ساخته می‌شود. مشخصات ثبت‌شده در پنل همیشه اول می‌آیند.
 */
export function withDerivedSpecs(
  specs: SpecEntry[],
  items: Pick<LiveItem, 'size' | 'grade' | 'spec' | 'dimensions'>[],
  subject: Subject,
  locale: Locale,
): SpecEntry[] {
  const t = messages[locale];
  const out = [...specs];
  const has = (art: IllustrationKind) => out.some((s) => specMeta(s.key).art === art);
  // کلید فارسی ثابت می‌ماند تا آیکون و تصویر کارت در هر دو زبان یکی باشد
  const add = (key: string, label: string, value: string) => out.push({ key, label, value });

  const material = t.materials[subject];
  if (material && !has('material')) add('جنس', t.material, material);

  const mm = items.filter((i) => /میلیمتر/.test(i.size)).map((i) => sizeValue(i.size)).filter(Number.isFinite);
  if (mm.length && !has('size')) add('سایز', t.size, range(mm, t.mm, t.to));

  const bar = items.flatMap((i) => [...i.spec.matchAll(/(\d+(?:\.\d+)?)\s*بار/g)].map((m) => Number(m[1])));
  if (bar.length && !has('pressure')) add('فشار کاری', t.pressure, range(bar, t.bar, t.to));

  const grades = GRADES.filter((g) => items.some((i) => i.grade === g));
  if (grades.length && !has('strength')) add('کلاس', t.grade, grades.map((g) => gradeLabel(g, locale)).join(' / '));

  const heights = items.flatMap((i) => [...i.dimensions.matchAll(/ارتفاع\s*(\d+)\s*سانتیمتر/g)].map((m) => Number(m[1])));
  if (heights.length && !has('height')) add('ارتفاع', t.height, range(heights, t.cm, t.to));

  return out;
}

function Card({ art, subject, label, value, locale }: { art: IllustrationKind; subject: Subject; label: string; value: string; locale: Locale }) {
  return (
    <div className="group flex flex-col items-center text-center rounded-3xl border border-[var(--border)] bg-[var(--card)] px-3 pt-3 pb-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-[var(--accent)]/40">
      <div className="h-20 sm:h-24 w-full grid place-items-center">
        <SpecIllustration kind={art} subject={subject} className="h-full w-auto drop-shadow-md transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-2" />
      </div>
      <dt className="mt-1 text-[11px] font-semibold text-[var(--muted-foreground)]">{label}</dt>
      <dd className="mt-0.5 max-w-full text-[13px] sm:text-sm font-black leading-6 num line-clamp-2 [overflow-wrap:anywhere]">{digits(value, locale)}</dd>
    </div>
  );
}

/** مشخصات اصلی محصول به شکل کارت‌های تصویرسازی‌شده با شکل خود همین محصول (منهول کنار کولیس، سپتیک روی کامیون...) */
export function SpecCards({ specs, subject, locale }: { specs: SpecEntry[]; subject: Subject; locale: Locale }) {
  const t = messages[locale];
  /** کارت‌های ثابت کنار مشخصات — برای همه محصولات */
  const extras: { art: IllustrationKind; label: string; value: string }[] = [
    { art: 'delivery', ...t.delivery },
    { art: 'warranty', ...t.warranty },
  ];
  return (
    // @container: ستون‌ها به عرض همین بخش بستگی دارد — در دسکتاپ ۱۰۲۴ ستون اطلاعات محصول فقط ~۴۸۰ پیکسل است
    <div className="@container mt-5">
      <dl className="grid grid-cols-2 @lg:grid-cols-3 gap-2.5">
        {specs.map((s) => (
          <Card key={s.key} art={specMeta(s.key).art} subject={subject} label={s.label} value={s.value} locale={locale} />
        ))}
        {extras.map((e) => (
          <Card key={e.art} art={e.art} subject={subject} label={e.label} value={e.value} locale={locale} />
        ))}
      </dl>
    </div>
  );
}
