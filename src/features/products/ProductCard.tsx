'use client';

import Image from 'next/image';
import { Link } from '@/shared/i18n/Link';
import { ArrowLeft, Table2 } from 'lucide-react';
import { CategoryThumb } from '@/widgets/header/Header';
import { cn } from '@/shared/lib/utils';
import type { ProductListItem } from '@/shared/lib/serializers';
import { supplyStatusLabel, type SupplyStatus } from '@/shared/lib/supply-status';
import { useLocale, useMessages } from '@/shared/i18n/LocaleProvider';
import { defineMessages } from '@/shared/i18n/messages';
import { digits, formatNumber } from '@/shared/i18n/format';
import type { Locale } from '@/shared/i18n/config';

const messages = defineMessages({
  fa: { comingSoon: 'به زودی', priceTable: 'جدول قیمت', from: 'از', toman: 'تومان', priceOnRequest: 'استعلام قیمت' },
  en: { comingSoon: 'Coming soon', priceTable: 'Price table', from: 'From', toman: 'Toman', priceOnRequest: 'Price on request' },
});

/** روی عکس کارت — پس‌زمینه پررنگ تا روی هر عکسی خوانا بماند */
const CARD_TONE: Record<SupplyStatus, string> = {
  ready: 'bg-emerald-700/90 text-white',
  inquiry: 'bg-amber-500/95 text-slate-950',
  pending: 'bg-slate-900/75 text-slate-100',
};

function priceLabel(p: ProductListItem, locale: Locale) {
  if (p.priceFrom != null) return { from: true, value: formatNumber(p.priceFrom, locale) };
  // قیمت تکی قدیمی (فیلد price) — serializer آن را از قبل به زبان صفحه قالب‌بندی کرده و «۰»/«0» یعنی ثبت نشده
  if (p.price && p.price !== '۰' && p.price !== '0') return { from: false, value: p.price };
  return null;
}

export function ProductCard({ product, className }: { product: ProductListItem; className?: string }) {
  const href = `/products/${product.category}/${product.slug}`;
  const locale = useLocale();
  const t = useMessages(messages);
  const price = priceLabel(product, locale);
  const specs = product.specList.slice(0, 2);

  return (
    <div className={cn('h-full rounded-3xl', className)}>
      <Link
        href={href}
        className="group h-full flex flex-col rounded-3xl border border-[var(--border)] bg-[var(--background)] overflow-hidden hover:-translate-y-1 hover:shadow-[0_24px_48px_-24px_rgba(15,23,42,0.35)] transition-[transform,box-shadow] duration-300"
      >
        <div className="relative aspect-[4/3] bg-[var(--muted)] overflow-hidden">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 70vw, (max-width: 1024px) 40vw, 25vw"
              quality={90}
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <CategoryThumb category={{ name: product.name, image: null }} className="absolute inset-0 w-full h-full" />
          )}
          <span className="absolute top-3 inset-x-3 flex flex-wrap gap-1.5">
            {product.comingSoon ? (
              <span className="h-7 px-2.5 rounded-lg text-[11px] font-bold flex items-center backdrop-blur bg-[var(--accent)] text-[var(--accent-foreground)]">
                {t.comingSoon}
              </span>
            ) : (
              <span className={cn('h-7 px-2.5 rounded-lg text-[11px] font-bold flex items-center backdrop-blur', CARD_TONE[product.supplyStatus])}>
                {supplyStatusLabel(product.supplyStatus, locale)}
              </span>
            )}
            {product.priceRows > 0 && (
              <span className="h-7 px-2.5 rounded-lg text-[11px] font-bold flex items-center gap-1 bg-white/90 text-slate-900 backdrop-blur">
                <Table2 className="w-3.5 h-3.5" />
                {t.priceTable}
              </span>
            )}
          </span>
        </div>

        <div className="flex-1 flex flex-col p-4 sm:p-5">
          <span className="block truncate text-[11px] font-bold text-[var(--accent-text)]">{product.categoryName}</span>
          <h3 className="mt-1 font-black text-[15px] sm:text-base leading-7 line-clamp-2 group-hover:text-[var(--accent-text)] transition-colors">
            {digits(product.name, locale)}
          </h3>

          {specs.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {specs.map((s) => (
                <span key={s.key} className="max-w-full min-h-6 px-2 py-0.5 rounded-md bg-[var(--muted)] text-[11px] leading-5 text-[var(--muted-foreground)] break-words num">
                  {s.label}: {digits(s.value, locale)}
                </span>
              ))}
            </div>
          )}

          <div className="mt-auto pt-4 flex items-end justify-between gap-2">
            <div className="min-w-0">
              {price ? (
                <p className="flex flex-wrap items-baseline gap-x-1 font-black text-[15px] num">
                  {price.from && <span className="text-xs font-medium text-[var(--muted-foreground)]">{t.from}</span>}
                  <span className="whitespace-nowrap">{price.value}</span>
                  <span className="text-[11px] font-medium text-[var(--muted-foreground)]">{t.toman}</span>
                </p>
              ) : (
                <p className="font-bold text-sm text-[var(--muted-foreground)]">{product.comingSoon ? t.comingSoon : t.priceOnRequest}</p>
              )}
            </div>
            <span className="shrink-0 hidden min-[400px]:grid place-items-center w-10 h-10 rounded-2xl bg-[var(--muted)] group-hover:bg-[var(--accent)] group-hover:text-[var(--accent-foreground)] transition-colors">
              <ArrowLeft className="w-4 h-4 ltr:rotate-180" />
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
