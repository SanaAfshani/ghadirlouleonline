import { prisma } from '@/shared/lib/prisma';
import { priceFromWeight } from '@/shared/lib/price-admin';

/**
 * قیمت روز هر کیلوی محصول را ثبت و همه ردیف‌های وزن‌دار را با فرمول وزن × قیمت روز دوباره حساب می‌کند.
 * ردیف‌هایی که قیمتشان عوض شد قیمت قبلی و نقطه نمودار می‌گیرند؛ ردیف‌های بدون وزن دست نمی‌خورند.
 */
export async function applyPricePerKg(productId: string, pricePerKg: number | null) {
  const items = await prisma.priceItem.findMany({ where: { productId }, select: { id: true, price: true, weight: true } });
  const now = new Date();
  const changed = items.flatMap((i) => {
    const price = priceFromWeight(i.weight, pricePerKg);
    return price === undefined || price === i.price ? [] : [{ id: i.id, price, previousPrice: i.price }];
  });
  // هر ردیف یک رفت‌وبرگشت به دیتابیس است؛ سقف پیش‌فرض ۵ ثانیه برای چند ده ردیف کم است
  await prisma.$transaction(async (tx) => {
    await tx.product.update({ where: { id: productId }, data: { pricePerKg } });
    for (const c of changed) {
      await tx.priceItem.update({
        where: { id: c.id },
        data: { price: c.price, previousPrice: c.previousPrice, priceChangedAt: now, history: { create: { price: c.price, recordedAt: now } } },
      });
    }
  }, { timeout: 30_000 });
  return { updated: changed.length };
}
