/** فهرست محصولات یک دسته. */
export const revalidate = 900;

import { safeDecode } from '@/shared/lib/utils';
import { ensureCategory } from '@/shared/lib/route-guards';
import type { Metadata } from 'next';
import { CategoryProductsClient } from '@/features/products/CategoryProductsClient';
import { CategoryGuides } from '@/features/products/CategoryGuides';
import { getCategoryBySlug, getPublishedCategories, getPublishedProducts, getRelatedBlogPosts, resolveCategoryImage } from '@/shared/lib/data';
import { getPriceBoard } from '@/shared/lib/price-board';
import { siteConfig } from '@/shared/config/site';
import { JsonLd } from '@/shared/ui/JsonLd';
import { absoluteUrl, breadcrumbSchema, toMetaDescription } from '@/shared/lib/seo';
import { isComingSoon } from '@/shared/lib/catalog';
import { withImageDimensions } from '@/shared/lib/media';

type Props = { params: Promise<{ category: string }> };


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
  const { category: rawSlug } = await params;
  const slug = safeDecode(rawSlug);
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: 'دسته‌بندی یافت نشد', robots: { index: false, follow: true } };
  const generic = `خرید انواع ${category.name} با قیمت مناسب و تحویل سریع به سراسر کشور. استعلام قیمت و مشاوره رایگان از ${siteConfig.name}.`;
  // توضیح دسته در پنل گاهی فقط یک عبارت کوتاه است (مثل «منهول پلیمری و بتنی و دریچه فاضلاب»)؛ گوگل زیر ۷۰ حرف را
  // ناقص می‌داند و خودش تکه‌ای از صفحه را جایش می‌گذارد — پس جمله عمومی پشتش می‌آید
  const own = category.description?.trim() ?? '';
  const desc = toMetaDescription(own.length >= 70 ? own : own ? `${own}. ${generic}` : generic);
  const canonical = `${siteConfig.url}/products/${encodeURIComponent(slug)}`;
  const image = category.image ? absoluteUrl(category.image) : undefined;
  // دسته = نیت «قیمت و انتخاب سایز»؛ صفحه محصول = «مشخصات یک مدل» — عنوان‌ها هم‌پوشانی نکنند
  // دسته «به زودی» جدول قیمت ندارد؛ عنوان نباید وعده قیمت بدهد
  const title = isComingSoon(category.slug)
    ? `${category.name} | مشخصات و استعلام (به زودی)`
    : `قیمت ${category.name} | جدول سایز و خرید عمده`;
  return {
    // با «| نام سایت» قالب روت، دسته‌های با نام بلند از ۶۰ حرف رد می‌شدند و گوگل عنوان را می‌برید
    title: title.length + ` | ${siteConfig.name}`.length > 60 ? { absolute: title } : title,
    description: desc,
    alternates: { canonical },
    openGraph: {
      title: `${category.name} | ${siteConfig.name}`,
      description: desc,
      url: canonical,
      type: 'website',
      ...(image ? { images: [{ url: image, alt: category.name }] } : {}),
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category: rawSlug } = await params;
  const slug = safeDecode(rawSlug);
  // ریدایرکت/۴۰۴ قبلاً در layout همین مسیر انجام شده
  const category = await ensureCategory(slug);

  const [products, board, guides] = await Promise.all([
    getPublishedProducts({ categorySlug: slug }),
    getPriceBoard(),
    // خطا نباید صفحه دسته را بیندازد؛ نبودِ راهنما فقط یعنی این بخش نمایش داده نمی‌شود
    getRelatedBlogPosts(category.name).catch(() => []),
  ]);
  const priceProductIds = board.lines.filter((l) => l.categorySlug === slug).map((l) => l.productId);
  // متن بلند دسته از پنل (HTML مدیر)؛ ابعاد عکس‌ها مثل توضیحات محصول اضافه می‌شود تا جابه‌جایی صفحه نداشته باشیم
  const content = category.content ? await withImageDimensions(category.content) : null;

  const canonical = `${siteConfig.url}/products/${encodeURIComponent(slug)}`;

  /** ItemList — به گوگل می‌گوید این صفحه فهرستی از محصولات است و ترتیب آن‌ها چیست */
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: category.name,
    description: category.description ?? undefined,
    url: canonical,
    inLanguage: 'fa-IR',
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: products.length,
      itemListElement: products.slice(0, 30).map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: p.name,
        url: `${siteConfig.url}/products/${encodeURIComponent(slug)}/${encodeURIComponent(p.slug)}`,
      })),
    },
  };

  return (
    <>
      <JsonLd data={itemListSchema} />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'محصولات', path: '/products' },
          { name: category.name, path: `/products/${encodeURIComponent(slug)}` },
        ])}
      />
    <CategoryProductsClient
      category={{
        slug: category.slug,
        name: category.name,
        description: category.description,
        image: resolveCategoryImage(category),
        productCount: category._count?.products ?? 0,
        comingSoon: isComingSoon(category.slug),
      }}
      products={products}
      board={board}
      priceProductIds={priceProductIds}
    />
      {content && (
        <section className="container-main pb-10" aria-label={`راهنمای ${category.name}`}>
          <div className="article-content max-w-4xl" dangerouslySetInnerHTML={{ __html: content }} />
        </section>
      )}
      <CategoryGuides categoryName={category.name} guides={guides} />
    </>
  );
}
