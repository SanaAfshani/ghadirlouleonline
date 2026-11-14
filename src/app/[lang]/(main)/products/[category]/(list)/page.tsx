/** فهرست محصولات یک دسته. */
export const revalidate = 900;

import { safeDecode } from '@/shared/lib/utils';
import { ensureCategory } from '@/shared/lib/route-guards';
import type { Metadata } from 'next';
import { CategoryProductsClient } from '@/features/products/CategoryProductsClient';
import { CategoryGuides } from '@/features/products/CategoryGuides';
import { getCategoryBySlug, getPublishedCategories, getPublishedProducts, getRelatedBlogPosts, getSiteSettingsMap, resolveCategoryImage } from '@/shared/lib/data';
import { getPriceBoard } from '@/shared/lib/price-board';
import { mergeSiteSettings } from '@/shared/lib/site-settings';
import { JsonLd } from '@/shared/ui/JsonLd';
import { absoluteUrl, breadcrumbSchema, toMetaDescription } from '@/shared/lib/seo';
import { isComingSoon } from '@/shared/lib/catalog';
import { withImageDimensions } from '@/shared/lib/media';
import { localizeRecord } from '@/shared/lib/translations';
import { resolveLocale, localeAlternates } from '@/shared/i18n/server';
import { localeTag, localizeHtmlLinks, localizePath } from '@/shared/i18n/config';
import { defineMessages, fill } from '@/shared/i18n/messages';

type Props = { params: Promise<{ lang: string; category: string }> };

const messages = defineMessages({
  fa: {
    notFound: 'دسته‌بندی یافت نشد',
    products: 'محصولات',
    generic: 'خرید انواع {name} با قیمت مناسب و تحویل سریع به سراسر کشور. استعلام قیمت و مشاوره رایگان از {site}.',
    title: 'قیمت {name} | جدول سایز و خرید عمده',
    comingSoonTitle: '{name} | مشخصات و استعلام (به زودی)',
    guideLabel: 'راهنمای {name}',
  },
  en: {
    notFound: 'Category not found',
    products: 'Products',
    generic: 'Buy {name} at competitive prices with fast delivery across Iran. Request a price and free technical advice from {site}.',
    title: '{name} prices | Size table and bulk orders',
    comingSoonTitle: '{name} | Specifications and inquiry (coming soon)',
    guideLabel: '{name} guide',
  },
});

/**
 * بدون این، سگمنت پارامتری در هر درخواست از نو رندر می‌شود و revalidate به‌تنهایی کاری نمی‌کند —
 * با هدر no-store دیده می‌شد. با فهرست‌کردن آدرس‌های موجود، همان‌ها موقع build ساخته و کش می‌شوند.
 * dynamicParams پیش‌فرض روشن است، پس محصول یا مقاله‌ای که بعداً اضافه شود هم کار می‌کند.
 */
export async function generateStaticParams() {
  const categories = await getPublishedCategories();
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = messages[locale];
  const { category: rawSlug } = await params;
  const slug = safeDecode(rawSlug);
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: t.notFound, robots: { index: false, follow: true } };
  const c = localizeRecord(category, locale, 'name');
  const { siteName } = mergeSiteSettings(await getSiteSettingsMap(), locale);
  const generic = fill(t.generic, { name: c.name, site: siteName });
  // توضیح دسته در پنل گاهی فقط یک عبارت کوتاه است (مثل «منهول پلیمری و بتنی و دریچه فاضلاب»)؛ گوگل زیر ۷۰ حرف را
  // ناقص می‌داند و خودش تکه‌ای از صفحه را جایش می‌گذارد — پس جمله عمومی پشتش می‌آید.
  // توضیح ترجمه‌نشده (همان متن فارسی) در متای انگلیسی نمی‌آید
  const own = locale === 'fa' || c.description !== category.description ? (c.description?.trim() ?? '') : '';
  const desc = toMetaDescription(own.length >= 70 ? own : own ? `${own}. ${generic}` : generic);
  const path = `/products/${encodeURIComponent(slug)}`;
  const image = category.image ? absoluteUrl(category.image) : undefined;
  // دسته = نیت «قیمت و انتخاب سایز»؛ صفحه محصول = «مشخصات یک مدل» — عنوان‌ها هم‌پوشانی نکنند
  // دسته «به زودی» جدول قیمت ندارد؛ عنوان نباید وعده قیمت بدهد
  const title = fill(isComingSoon(category.slug) ? t.comingSoonTitle : t.title, { name: c.name });
  return {
    // با «| نام سایت» قالب روت، دسته‌های با نام بلند از ۶۰ حرف رد می‌شدند و گوگل عنوان را می‌برید
    title: title.length + ` | ${siteName}`.length > 60 ? { absolute: title } : title,
    description: desc,
    ...localeAlternates(path, locale, c.translated),
    openGraph: {
      title: `${c.name} | ${siteName}`,
      description: desc,
      url: absoluteUrl(localizePath(path, locale)),
      type: 'website',
      ...(image ? { images: [{ url: image, alt: c.name }] } : {}),
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const locale = await resolveLocale(params);
  const t = messages[locale];
  const { category: rawSlug } = await params;
  const slug = safeDecode(rawSlug);
  // ریدایرکت/۴۰۴ قبلاً در layout همین مسیر انجام شده
  const category = await ensureCategory(slug, locale);
  const c = localizeRecord(category, locale, 'name');

  const [products, board, guides] = await Promise.all([
    getPublishedProducts({ categorySlug: slug, locale }),
    getPriceBoard(locale),
    // خطا نباید صفحه دسته را بیندازد؛ نبودِ راهنما فقط یعنی این بخش نمایش داده نمی‌شود
    // جستجو با نام فارسی دسته است (عنوان و برچسب مقاله‌ها فارسی است)؛ نمایش به زبان صفحه
    getRelatedBlogPosts(category.name).catch(() => []),
  ]);
  const priceProductIds = board.lines.filter((l) => l.categorySlug === slug).map((l) => l.productId);
  // متن بلند دسته از پنل (HTML مدیر)؛ ابعاد عکس‌ها مثل توضیحات محصول اضافه می‌شود تا جابه‌جایی صفحه نداشته باشیم
  const content = c.content ? await withImageDimensions(localizeHtmlLinks(c.content, locale)) : null;

  const path = `/products/${encodeURIComponent(slug)}`;

  /** ItemList — به گوگل می‌گوید این صفحه فهرستی از محصولات است و ترتیب آن‌ها چیست */
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: c.name,
    description: c.description ?? undefined,
    url: absoluteUrl(localizePath(path, locale)),
    inLanguage: localeTag[locale],
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: products.length,
      itemListElement: products.slice(0, 30).map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: p.name,
        url: absoluteUrl(localizePath(`${path}/${encodeURIComponent(p.slug)}`, locale)),
      })),
    },
  };

  return (
    <>
      <JsonLd data={itemListSchema} />
      <JsonLd
        data={breadcrumbSchema(
          [
            { name: t.products, path: '/products' },
            { name: c.name, path },
          ],
          locale,
        )}
      />
    <CategoryProductsClient
      category={{
        slug: c.slug,
        name: c.name,
        description: c.description,
        image: resolveCategoryImage(c),
        productCount: c._count?.products ?? 0,
        comingSoon: isComingSoon(c.slug),
      }}
      products={products}
      board={board}
      priceProductIds={priceProductIds}
    />
      {content && (
        <section className="container-main pb-10" aria-label={fill(t.guideLabel, { name: c.name })}>
          <div className="article-content max-w-4xl" dangerouslySetInnerHTML={{ __html: content }} />
        </section>
      )}
      <CategoryGuides categoryName={c.name} guides={guides.map((g) => localizeRecord(g, locale, 'title'))} locale={locale} />
    </>
  );
}
