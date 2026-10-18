import { prisma } from '@/shared/lib/prisma';
import { priceFromWeight, toWeight } from '@/shared/lib/price-admin';

/**
 * قیمت روز هر کیلوی محصول را ثبت و همه ردیف‌های وزن‌دار را با فرمول وزن × قیمت روز دوباره حساب می‌کند.
 * ردیف‌هایی که قیمتشان عوض شد قیمت قبلی و نقطه نمودار می‌گیرند؛ ردیف‌های بدون وزن دست نمی‌خورند.
 */
export async function applyPricePerKg(productId: string, pricePerKg: number | null) {
  const items = await prisma.priceItem.findMany({ where: { productId }, select: { id: true, price: true, weight: true } });
  const changed = items.flatMap((i) => {
    const price = priceFromWeight(i.weight, pricePerKg);
    return price === undefined || price === i.price ? [] : [{ id: i.id, price }];
  });
  // یک کوئری برای همه ردیف‌ها (مثل تغییر درصدی): قبلاً هر ردیف دو رفت‌وبرگشت در یک تراکنش بود و برای ۵۲ ردیف
  // کاروگیت از سقف ۳۰ ثانیه می‌گذشت، کل تراکنش برمی‌گشت و ادمین «خطای سرور» می‌دید. زمان‌ها UTC (timestamp بدون منطقه).
  await prisma.$transaction([
    prisma.product.update({ where: { id: productId }, data: { pricePerKg } }),
    prisma.$executeRaw`
      WITH upd AS (
        UPDATE "PriceItem" i
        SET "previousPrice" = i.price,
            price = c.price,
            "priceChangedAt" = (now() AT TIME ZONE 'UTC'),
            "updatedAt" = (now() AT TIME ZONE 'UTC')
        FROM jsonb_to_recordset(${JSON.stringify(changed)}::jsonb) AS c(id text, price int)
        WHERE i.id = c.id
        RETURNING i.id, i.price
      )
      INSERT INTO "PriceHistory" (id, "priceItemId", price, "recordedAt")
      SELECT 'c' || substr(md5(random()::text || upd.id), 1, 24), upd.id, upd.price, (now() AT TIME ZONE 'UTC') FROM upd`,
  ]);
  // ردیف بی‌وزن با فرمول حساب نمی‌شود — ادمین باید بداند چرا «۰ ردیف به‌روز شد»
  return { updated: changed.length, missingWeight: items.filter((i) => toWeight(i.weight) == null).length };
}
