import { Ruler } from 'lucide-react';
import type { PipeDimension } from '@/shared/lib/pipe-dimensions';
import { IconTile } from '@/shared/ui/IconTile';
import { faDigits } from '@/shared/lib/utils';
import { cn } from '@/shared/lib/utils';

/** عددها با ارقام فارسی و بدون صفر اضافه: ۱.۳ نه ۱.۳۰، و ۳ نه ۳.۰ */
const mm = (value: number) => faDigits(String(value));

/**
 * جدول ابعاد لوله: سایز، قطر خارجی، ضخامت لایه‌ها و نوع واشر.
 *
 * خریدار پیش از سفارش دقیقاً همین را می‌خواهد — قطر خارجی برای محاسبه کانال و فضای نصب، و
 * ضخامت لایه‌ها برای تطبیق با مشخصات پروژه. تا امروز این اعداد فقط در برگه کاغذی کارخانه بود.
 *
 * جدول واقعی HTML است نه عکس، پس هم روی گوشی خوانده می‌شود و هم خزنده و دستیار هوش مصنوعی
 * می‌توانند جواب «قطر خارجی لوله کاروگیت ۶۰۰ چند است» را از آن بردارند.
 */
export function DimensionTable({ rows, productName }: { rows: readonly PipeDimension[]; productName: string }) {
  if (rows.length === 0) return null;
  const anyWasher = rows.some((r) => r.washer);

  return (
    <section id="dimensions" aria-labelledby="dimensions-title" className="scroll-mt-40">
      <h2 id="dimensions-title" className="text-xl sm:text-2xl font-black mb-4 flex items-center gap-3">
        <IconTile icon={Ruler} tone="emerald" size="sm" />
        جدول ابعاد {productName}
      </h2>

      {/* روی گوشی افقی اسکرول می‌شود تا ستون‌ها روی هم نیفتند */}
      <div className="rounded-2xl border border-[var(--border)] overflow-x-auto">
        <table className="w-full text-sm border-collapse min-w-[34rem]">
          <caption className="sr-only">ابعاد و مشخصات لایه‌های {productName} بر اساس سایز</caption>
          <thead>
            <tr className="bg-[var(--muted)] text-[var(--muted-foreground)]">
              <th scope="col" className="px-4 py-3 text-right font-bold">سایز لوله (mm)</th>
              <th scope="col" className="px-4 py-3 text-right font-bold">قطر خارجی (mm)</th>
              <th scope="col" className="px-4 py-3 text-right font-bold">ضخامت لایه داخلی (mm)</th>
              <th scope="col" className="px-4 py-3 text-right font-bold">ضخامت مجموع لایه‌ها (mm)</th>
              {anyWasher && <th scope="col" className="px-4 py-3 text-right font-bold">نوع واشر</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.size} className={cn('transition-colors hover:bg-[var(--muted)]/40', i > 0 && 'border-t border-[var(--border)]')}>
                <th scope="row" className="px-4 py-3 text-right font-black num whitespace-nowrap">{mm(r.size)}</th>
                <td className="px-4 py-3 num whitespace-nowrap">{mm(r.outerDiameter)}</td>
                <td className="px-4 py-3 num whitespace-nowrap">{mm(r.innerLayer)}</td>
                <td className="px-4 py-3 num whitespace-nowrap">{mm(r.totalLayers)}</td>
                {anyWasher && (
                  <td className="px-4 py-3 whitespace-nowrap">
                    {r.washer || <span className="text-[var(--muted-foreground)]">—</span>}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
