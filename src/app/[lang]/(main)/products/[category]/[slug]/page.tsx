/** جدول قیمت محصول دارد؛ همان ملاحظه صفحه اصلی. */
export const revalidate = 300;

import { safeDecode } from '@/shared/lib/utils';
import { ensureProduct } from '@/shared/lib/route-guards';
import type { Metadata } from 'next';
import { ProductDetailView } from '@/features/products/ProductDetailView';
import { getFittingsForSize, getProductBySlug, getPublishedProducts, getRelatedBlogPosts, getSiteSettingsMap, getSitemapData } from '@/shared/lib/data';
import { CategoryGuides } from '@/features/products/CategoryGuides';
import { getPriceBoard, isPriceFresh, summarizeLine } from '@/shared/lib/price-board';
import { siteConfig } from '@/shared/config/site';
import { mergeSiteSettings } from '@/shared/lib/site-settings';
import { JsonLd } from '@/shared/ui/JsonLd';
import { absoluteUrl, breadcrumbSchema, faqPageSchema, toMetaDescription } from '@/shared/lib/seo';
import { isComingSoon } from '@/shared/lib/catalog';
import { withImageDimensions } from '@/shared/lib/media';
import { localizeRecord, localizedList, localizedSpecs } from '@/shared/lib/translations';
import { resolveLocale, localeAlternates } from '@/shared/i18n/server';
import { defaultLocale, localizeHtmlLinks, localizePath, type Locale } from '@/shared/i18n/config';
import { defineMessages, fill } from '@/shared/i18n/messages';
import { getSection } from '@/shared/content/server';
import { productDetailCopy, productSnNote } from '@/shared/content/pages/products';
import type { Product } from '@/shared/types';

type Props = { params: Promise<{ lang: string; category: string; slug: string }> };

const messages = defineMessages({
  fa: {
    notFound: 'محصول یافت نشد',
    products: 'محصولات',
    title: '{name} | مشخصات و قیمت',
    generic: 'خرید {name} با قیمت مناسب از {site} با ارسال به سراسر کشور. استعلام قیمت و مشاوره رایگان.',
    serviceArea: siteConfig.serviceArea,
  },
  en: {
    notFound: 'Product not found',
    products: 'Products',
    title: '{name} | Specifications and price',
    generic: 'Buy {name} at a competitive price from {site} with delivery across Iran. Request a price and free technical advice.',
    serviceArea: 'Iran',
  },
});

type SeoField = 'metaTitle' | 'metaDescription' | 'ogTitle' | 'ogDescription' | 'shortDescription' | 'description';

/**
 * محصول به زبان صفحه + متن‌های سئوی «خودِ همین زبان»: فیلد ترجمه‌نشده در نسخه انگلیسی متن فارسی است و
 * نباید در عنوان و توضیح گوگل انگلیسی بیاید؛ جایش قالب پیش‌فرض همان زبان می‌نشیند.
 */
function localizeProduct(product: Product, locale: Locale) {
  const p = localizeRecord(product, locale, 'name');
  const own = (field: SeoField) => (locale === defaultLocale || p[field] !== product[field] ? p[field] || '' : '');
  return { p, own };
}

/**
 * بدون این، سگمنت پارامتری در هر درخواست از نو رندر می‌شود و revalidate به‌تنهایی کاری نمی‌کند —
 * با هدر no-store دیده می‌شد. با فهرست‌کردن آدرس‌های موجود، همان‌ها موقع build ساخته و کش می‌شوند.
 * dynamicParams پیش‌فرض روشن است، پس محصول یا مقاله‌ای که بعداً اضافه شود هم کار می‌کند.
 */
export async function generateStaticParams() {
  const { products } = await getSitemapData();
  return products.map((p) => ({ category: p.categorySlug, slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = messages[locale];
  const { category: rawCat, slug: rawSlug } = await params;
  const category = safeDecode(rawCat);
  const slug = safeDecode(rawSlug);
  const product = await getProductBySlug(slug, category);
  if (!product) return { title: t.notFound, robots: { index: false, follow: true } };
  const { p, own } = localizeProduct(product, locale);
  const { siteName } = mergeSiteSettings(await getSiteSettingsMap(), locale);

  // مقادیر ست‌شده در پنل ادمین اولویت دارند؛ در صورت خالی بودن از محتوای محصول fallback می‌شود
  const desc = toMetaDescription(
    own('metaDescription') ||
      own('shortDescription') ||
      own('description') ||
      fill(t.generic, { name: p.name, site: siteName })
  );
  const ogTitle = own('ogTitle') || own('metaTitle') || `${p.name} | ${siteName}`;
  const ogDescription = toMetaDescription(own('ogDescription') || desc);
  const image = product.images?.[0] ? absoluteUrl(product.images[0]) : undefined;
  const path = `/products/${encodeURIComponent(category)}/${encodeURIComponent(slug)}`;
  const url = absoluteUrl(localizePath(path, locale));
  const metaTitle = own('metaTitle');

  return {
    // metaTitle دقیقاً همان چیزی است که ادمین در پیش‌نمایش گوگل دیده — پس template سایت روی آن اعمال نمی‌شود
    // پیش‌فرض: نام دقیق مدل + مشخصات — عنوان صفحه دسته («قیمت … | جدول سایز») با آن رقابت نکند
    title: metaTitle ? { absolute: metaTitle } : fill(t.title, { name: p.name }),
    description: desc,
    // کلیدواژه کانونی فارسی است و ترجمه ندارد
    ...(locale === defaultLocale && product.focusKeyword ? { keywords: [product.focusKeyword] } : {}),
    ...localeAlternates(path, locale, p.translated),
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url,
      type: 'website',
      ...(image ? { images: [{ url: image, alt: p.name }] } : {}),
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
  const locale = await resolveLocale(params);
  const t = messages[locale];
  const { category: rawCat, slug: rawSlug } = await params;
  const category = safeDecode(rawCat);
  const slug = safeDecode(rawSlug);
  // ریدایرکت/۴۰۴ قبلاً در layout همین مسیر انجام شده؛ اینجا فقط داده (از cache)
  const product = await ensureProduct(category, slug, locale);
  const { p, own } = localizeProduct(product, locale);
  const productCategory = localizeRecord(product.category, locale, 'name');
  const catalogTitles = localizedList(product.catalogs.map((c) => c.title), product.translations, locale, 'catalogTitles');
  // نسخه زبان صفحه جدا ساخته می‌شود؛ خود محصول از cache درخواست است و نباید دست بخورد
  const localized: Product = {
    ...p,
    description: p.description ? await withImageDimensions(localizeHtmlLinks(p.description, locale)) : '',
    category: productCategory,
    catalogs: product.catalogs.map((c, i) => ({ ...c, title: catalogTitles[i] })),
  };
  // کلید فارسی برای منطق (آیکون، سایز)، برچسب و مقدار به زبان صفحه برای نمایش
  const specs = localizedSpecs(product.specifications ?? {}, product.translations, locale);

  // product.images توسط serializeProduct از قبل به آرایه تبدیل شده است
  const images = (product.images ?? []).map((src) => absoluteUrl(src));
  const path = `/products/${encodeURIComponent(category)}/${encodeURIComponent(slug)}`;
  const canonical = absoluteUrl(localizePath(path, locale));

  const [board, settingsMap, copy, snNote] = await Promise.all([
    getPriceBoard(locale),
    getSiteSettingsMap(),
    getSection(productDetailCopy, locale),
    getSection(productSnNote, locale),
  ]);
  const { siteName } = mergeSiteSettings(settingsMap, locale);
  // دسته «به زودی»: نه قیمت در صفحه، نه offer در schema (قیمت ساختگی/قدیمی به گوگل نمی‌رود)
  const comingSoon = isComingSoon(product.category.slug);
  const showPrice = board.market.open && !comingSoon;
  // بیرون از ساعت کاری سرور قیمت نمی‌فرستد؛ پس schema هم فقط در ساعت کاری offer دارد
  const priceSummary = summarizeLine(board.lines.find((l) => l.productId === product.id)?.items ?? []);
  // هر سایز یک محصول است: همه هم‌دسته‌ها دکمه‌های انتخاب سایزند و «مرتبط» سایزهای همسایه
  const variants = await getPublishedProducts({ categorySlug: product.category.slug, locale });
  // اتصالات کاروگیت هم‌سایز همین لوله (کوپلر، واشر، زانو…) — اتصالات زیرمجموعه سیستم کاروگیت‌اند
  const pipeSize = product.slug.match(/^corrugated-pipe-(\d+)$/)?.[1];
  const fittings = pipeSize ? await getFittingsForSize(Number(pipeSize), locale) : [];
  const others = variants.filter((v) => v.id !== product.id);
  const index = variants.findIndex((v) => v.id === product.id);
  const start = Math.min(Math.max(0, index - 2), Math.max(0, others.length - 4));
  const related = others.slice(start, start + 4);
  // همان راهنماهای صفحه دسته: مقاله‌ها به محصول لینک می‌دهند و حالا محصول هم به آن‌ها؛ خطا صفحه را نمی‌اندازد
  // جستجو با نام فارسی دسته (عنوان و برچسب مقاله‌ها فارسی است)؛ نمایش به زبان صفحه
  const guides = (await getRelatedBlogPosts(product.category.name).catch(() => [])).map((g) => localizeRecord(g, locale, 'title'));

  // جدول قیمت ← AggregateOffer (بازه قیمت در نتایج گوگل)؛ در غیر این صورت قیمت تکی.
  // قیمت‌ها در پنل به تومان ثبت می‌شوند؛ schema.org واحد رسمی ریال را می‌خواهد (×۱۰)
  const seller = { '@type': 'Organization', name: siteName, url: siteConfig.url };
  // «استعلام موجودی» و «در انتظار تأیید» ناموجود نیستند؛ فقط آماده‌بودنشان تأیید نشده
  const availability = product.supplyStatus === 'ready' ? 'https://schema.org/InStock' : 'https://schema.org/LimitedAvailability';
  // offers فقط در ساعت فروش.
  //
  // بیرون از آن، جدول «آخرین قیمت ثبت‌شده» را با تاریخش نشان می‌دهد و همین برای خزنده‌ها و
  // دستیارهای هوش مصنوعی که متن صفحه را می‌خوانند کافی است. ولی offers در schema یعنی «قیمت
  // فروش همین حالا» و گوگل آن را در نتایج به‌عنوان قیمت روز نشان می‌دهد — گذاشتن قیمت دیروز
  // در آن، هم با صفحه نمی‌خواند و هم کاربر را پای یک عدد قطعی‌نما می‌نشاند.
  // قیمت چندروزه هم «قیمت فروش همین حالا» نیست؛ فقط قیمت تازه به گوگل می‌رود
  const offers =
    showPrice && priceSummary.minPrice != null && isPriceFresh(priceSummary.updatedAt)
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
            areaServed: t.serviceArea,
          }
        : null;

  // مشخصات فنی به صورت ماشین‌خوان: «چه سایزی دارید»، «استانداردش چیست»، «صلبیتش چند است» را
  // دستیارهای هوش مصنوعی از همین‌جا برمی‌دارند، نه از جدول HTML
  const specProperties = specs
    .filter((s) => s.label && s.value)
    .map((s) => ({ '@type': 'PropertyValue', name: s.label, value: s.value }));

  // Product فقط همراه offers منتشر می‌شود.
  //
  // گوگل Product بدون offers/review/aggregateRating را در گزارش «Product snippets» خطای بحرانی
  // (Invalid item) حساب می‌کند. بیرون از ساعت فروش، با قیمت کهنه و روی دسته «به زودی» offer نداریم؛
  // پس آن موقع Product نمی‌آید — مشخصات فنی همچنان در متن صفحه هست. قیمت ساختگی/قدیمی هم به
  // offers نمی‌رود تا schema و صفحه هیچ‌وقت دو حرف نزنند.
  const productSchema = offers && {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: toMetaDescription(
      own('metaDescription') || own('shortDescription') || own('description') || fill(t.generic, { name: p.name, site: siteName }),
      400
    ),
    ...(locale === defaultLocale && product.focusKeyword ? { keywords: product.focusKeyword } : {}),
    sku: product.slug,
    // mpn و brand عمداً نیست: شناسه دیتابیس شماره قطعه سازنده نیست و نام فروشگاه برند همه کالاها نیست —
    // داده ساختاریافته باید با واقعیت و محتوای صفحه یکی باشد (فروشنده در offers.seller آمده)
    category: productCategory.name,
    ...(images.length ? { image: images } : {}),
    ...(specProperties.length ? { additionalProperty: specProperties } : {}),
    url: canonical,
    offers,
  };

  return (
    <>
      {productSchema && <JsonLd data={productSchema} />}
      {/* سوالات متداول اختصاصی محصول — واجد شرایط rich result آکاردئونی */}
      {localized.faqs.length > 0 && <JsonLd data={faqPageSchema(localized.faqs)} />}
      <JsonLd
        data={breadcrumbSchema(
          [
            { name: t.products, path: '/products' },
            { name: productCategory.name, path: `/products/${encodeURIComponent(category)}` },
            { name: p.name, path },
          ],
          locale,
        )}
      />
      <ProductDetailView
        product={showPrice ? localized : { ...localized, price: undefined }}
        specs={specs}
        copy={copy}
        snNote={snNote.text}
        related={related}
        variants={variants}
        fittings={fittings}
        board={board}
        comingSoon={comingSoon}
      />
      <CategoryGuides categoryName={productCategory.name} guides={guides} locale={locale} />
    </>
  );
}
