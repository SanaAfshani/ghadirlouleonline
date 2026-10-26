export const dynamic = 'force-dynamic';

import { safeDecode } from '@/shared/lib/utils';
import { ensureProduct } from '@/shared/lib/route-guards';
import type { Metadata } from 'next';
import { ProductDetailView } from '@/features/products/ProductDetailView';
import { getProductBySlug, getPublishedProducts } from '@/shared/lib/data';
import { getPriceBoard, summarizeLine } from '@/shared/lib/price-board';
import { siteConfig } from '@/shared/config/site';
import { JsonLd } from '@/shared/ui/JsonLd';
import { absoluteUrl, breadcrumbSchema, faqPageSchema, toMetaDescription } from '@/shared/lib/seo';
import { isComingSoon } from '@/shared/lib/catalog';
import { withImageDimensions } from '@/shared/lib/media';

type Props = { params: Promise<{ category: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: rawCat, slug: rawSlug } = await params;
  const category = safeDecode(rawCat);
  const slug = safeDecode(rawSlug);
  const product = await getProductBySlug(slug, category);
  if (!product) return { title: 'محصول یافت نشد', robots: { index: false, follow: true } };

  // مقادیر ست‌شده در پنل ادمین اولویت دارند؛ در صورت خالی بودن از محتوای محصول fallback می‌شود
  const desc = toMetaDescription(
    product.metaDescription ||
      product.shortDescription ||
      product.description ||
      `خرید ${product.name} با قیمت مناسب از ${siteConfig.name} با ارسال به سراسر کشور. استعلام قیمت و مشاوره رایگان.`
  );
  const ogTitle = product.ogTitle || product.metaTitle || `${product.name} | ${siteConfig.name}`;
  const ogDescription = toMetaDescription(product.ogDescription || desc);
  const image = product.images?.[0] ? absoluteUrl(product.images[0]) : undefined;
  const canonical = `${siteConfig.url}/products/${encodeURIComponent(category)}/${encodeURIComponent(slug)}`;

  return {
    // metaTitle دقیقاً همان چیزی است که ادمین در پیش‌نمایش گوگل دیده — پس template سایت روی آن اعمال نمی‌شود
    // پیش‌فرض: نام دقیق مدل + مشخصات — عنوان صفحه دسته («قیمت … | جدول سایز») با آن رقابت نکند
    title: product.metaTitle
      ? { absolute: product.metaTitle }
      : `${product.name} | مشخصات و قیمت`,
    description: desc,
    ...(product.focusKeyword ? { keywords: [product.focusKeyword] } : {}),
    alternates: { canonical },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: canonical,
      type: 'website',
      ...(image ? { images: [{ url: image, alt: product.name }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: ogDescription,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { category: rawCat, slug: rawSlug } = await params;
  const category = safeDecode(rawCat);
  const slug = safeDecode(rawSlug);
  // ریدایرکت/۴۰۴ قبلاً در layout همین مسیر انجام شده؛ اینجا فقط داده (از cache)
  const product = await ensureProduct(category, slug);

  if (product.description) product.description = await withImageDimensions(product.description);

  // product.images توسط serializeProduct از قبل به آرایه تبدیل شده است
  const images = (product.images ?? []).map((src) => absoluteUrl(src));
  const canonical = `${siteConfig.url}/products/${encodeURIComponent(category)}/${encodeURIComponent(slug)}`;

  const board = await getPriceBoard();
  // دسته «به زودی»: نه قیمت در صفحه، نه offer در schema (قیمت ساختگی/قدیمی به گوگل نمی‌رود)
  const comingSoon = isComingSoon(product.category.slug);
  const showPrice = board.market.open && !comingSoon;
  // بیرون از ساعت کاری سرور قیمت نمی‌فرستد؛ پس schema هم فقط در ساعت کاری offer دارد
  const priceSummary = summarizeLine(board.lines.find((l) => l.productId === product.id)?.items ?? []);
  const related = (await getPublishedProducts({ categorySlug: product.category.slug, limit: 5 }))
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  // جدول قیمت ← AggregateOffer (بازه قیمت در نتایج گوگل)؛ در غیر این صورت قیمت تکی.
  // قیمت‌ها در پنل به تومان ثبت می‌شوند؛ schema.org واحد رسمی ریال را می‌خواهد (×۱۰)
  const seller = { '@type': 'Organization', name: siteConfig.name, url: siteConfig.url };
  const availability = product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock';
  const offers =
    priceSummary.minPrice != null
      ? {
          '@type': 'AggregateOffer',
          url: canonical,
          priceCurrency: 'IRR',
          lowPrice: priceSummary.minPrice * 10,
          highPrice: (priceSummary.maxPrice ?? priceSummary.minPrice) * 10,
          offerCount: priceSummary.count,
          availability,
          seller,
        }
      : showPrice && typeof product.price === 'number' && product.price > 0
        ? {
            '@type': 'Offer',
            url: canonical,
            price: product.price * 10,
            priceCurrency: 'IRR',
            itemCondition: 'https://schema.org/NewCondition',
            availability,
            seller,
            areaServed: siteConfig.serviceArea,
          }
        : null;

  // مشخصات فنی به صورت ماشین‌خوان: «چه سایزی دارید»، «استانداردش چیست»، «صلبیتش چند است» را
  // دستیارهای هوش مصنوعی از همین‌جا برمی‌دارند، نه از جدول HTML
  const specs = Object.entries(product.specifications ?? {})
    .filter(([name, value]) => name && value)
    .map(([name, value]) => ({ '@type': 'PropertyValue', name, value }));

  // Product همیشه منتشر می‌شود، حتی بدون قیمت.
  //
  // قبلاً فقط وقتی offers داشت منتشر می‌شد، چون گوگل برای *رفتن به نتیجه غنی* offers می‌خواهد.
  // ولی بیرون از ساعت فروش و روی محصول‌های «فقط استعلام» اصلاً offer وجود ندارد، یعنی عملاً هیچ‌وقت
  // منتشر نمی‌شد. Product بدون offer خطا نیست؛ فقط نتیجه غنیِ قیمت نمی‌گیرد — در عوض نام، مشخصات
  // فنی و دسته محصول برای خزنده‌ها و دستیارهای هوش مصنوعی خوانا می‌ماند. offers همچنان فقط وقتی
  // می‌آید که واقعاً قیمتی در صفحه باشد، تا schema و صفحه هیچ‌وقت دو حرف نزنند.
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: toMetaDescription(
      product.metaDescription || product.shortDescription || product.description,
      400
    ),
    ...(product.focusKeyword ? { keywords: product.focusKeyword } : {}),
    sku: product.slug,
    // mpn و brand عمداً نیست: شناسه دیتابیس شماره قطعه سازنده نیست و نام فروشگاه برند همه کالاها نیست —
    // داده ساختاریافته باید با واقعیت و محتوای صفحه یکی باشد (فروشنده در offers.seller آمده)
    category: product.category?.name,
    ...(images.length ? { image: images } : {}),
    ...(specs.length ? { additionalProperty: specs } : {}),
    url: canonical,
    ...(offers ? { offers } : {}),
  };

  return (
    <>
      <JsonLd data={productSchema} />
      {/* سوالات متداول اختصاصی محصول — واجد شرایط rich result آکاردئونی */}
      {product.faqs.length > 0 && <JsonLd data={faqPageSchema(product.faqs)} />}
      <JsonLd
        data={breadcrumbSchema([
          { name: 'محصولات', path: '/products' },
          {
            name: product.category?.name ?? category,
            path: `/products/${encodeURIComponent(category)}`,
          },
          { name: product.name, path: `/products/${encodeURIComponent(category)}/${encodeURIComponent(slug)}` },
        ])}
      />
      <ProductDetailView product={showPrice ? product : { ...product, price: undefined }} related={related} board={board} comingSoon={comingSoon} />
    </>
  );
}
