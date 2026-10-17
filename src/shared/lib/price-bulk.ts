import { prisma } from '@/shared/lib/prisma';
import { priceFromWeight } from '@/shared/lib/price-admin';
import { applyPricePerKg } from '@/shared/lib/price-per-kg';

/** تغییر درصدی قیمت‌ها — مشترک بین «یک محصول»، «همه محصولات» و «ردیف‌های انتخاب‌شده» */

export type BulkInput = { pct: number; step: number };

/** درصد بین -۹۰ و ۵۰۰ (غیر صفر) و گرد کردن ۱/۱۰/۱۰۰/۱۰۰۰ — نامعتبر null */
export function parseBulk(body: { percent?: unknown; roundTo?: unknown }): BulkInput | null {
  const pct = Number(body.percent);
  const step = [1, 10, 100, 1000].includes(Number(body.roundTo)) ? Number(body.roundTo) : 1;
  if (!Number.isFinite(pct) || pct === 0 || pct <= -90 || pct > 500) return null;
  return { pct, step };
}

export const bump = (n: number, { pct, step }: BulkInput) => Math.max(step, Math.round((n * (1 + pct / 100)) / step) * step);

/**
 * درصد روی قیمت چند ردیف با یک کوئری SQL — برای صدها ردیف (مثلاً کل اتصالات) یک رفت‌وبرگشت به دیتابیس.
 * قیمت قبلی و نقطه نمودار هم ثبت می‌شود. زمان‌ها UTC هستند (ستون‌ها timestamp بدون منطقه زمانی‌اند).
 */
async function bumpIds(ids: string[], { pct, step }: BulkInput) {
  if (!ids.length) return 0;
  const rows = await prisma.$queryRaw<{ n: bigint }[]>`
    WITH upd AS (
      UPDATE "PriceItem"
      SET "previousPrice" = price,
          price = GREATEST(${step}::int, (ROUND(price * ${1 + pct / 100}::numeric / ${step}::int) * ${step}::int)::int),
          "priceChangedAt" = (now() AT TIME ZONE 'UTC'),
          "updatedAt" = (now() AT TIME ZONE 'UTC')
      WHERE id = ANY(${ids}::text[]) AND price IS NOT NULL
      RETURNING id, price
    ), hist AS (
      INSERT INTO "PriceHistory" (id, "priceItemId", price, "recordedAt")
      SELECT 'c' || substr(md5(random()::text || upd.id), 1, 24), upd.id, upd.price, (now() AT TIME ZONE 'UTC') FROM upd
      RETURNING 1
    )
    SELECT count(*) AS n FROM upd`;
  return Number(rows[0]?.n ?? 0);
}

/**
 * یک محصول: با قیمت روز هر کیلو، درصد روی خود قیمت روز می‌نشیند (ردیف‌های وزن‌دار از فرمول خارج نمی‌شوند)
 * و بقیه ردیف‌ها مستقیم درصد می‌خورند.
 */
export async function bumpProduct(productId: string, input: BulkInput) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { pricePerKg: true, priceItems: { select: { id: true, weight: true } } },
  });
  if (!product) return { updated: 0, pricePerKg: null as number | null };

  let updated = 0;
  let pricePerKg = product.pricePerKg;
  if (pricePerKg) {
    pricePerKg = bump(pricePerKg, input);
    updated += (await applyPricePerKg(productId, pricePerKg)).updated;
  }
  const manual = product.priceItems.filter((i) => priceFromWeight(i.weight, pricePerKg) === undefined).map((i) => i.id);
  updated += await bumpIds(manual, input);
  return { updated, pricePerKg };
}

/**
 * ردیف‌های انتخاب‌شده: فقط ردیف‌های قیمت دستی. ردیف وزن‌دار محصولی که قیمت روز دارد از فرمول می‌آید
 * و درصد مستقیم رویش اثری نمی‌گذارد — شمرده و برگردانده می‌شود تا ادمین بداند.
 */
export async function bumpSelected(ids: string[], input: BulkInput) {
  const items = await prisma.priceItem.findMany({
    where: { id: { in: ids } },
    select: { id: true, weight: true, product: { select: { pricePerKg: true } } },
  });
  const manual = items.filter((i) => priceFromWeight(i.weight, i.product.pricePerKg) === undefined).map((i) => i.id);
  const updated = await bumpIds(manual, input);
  return { updated, skippedFormula: items.length - manual.length };
}
