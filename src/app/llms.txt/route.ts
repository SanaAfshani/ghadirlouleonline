import { siteConfig } from '@/shared/config/site';
import { getPublishedBlogPosts, getPublishedCategories, getPublishedFaqs } from '@/shared/lib/data';
import { getPriceBoard, summarizeLine } from '@/shared/lib/price-board';
import { toMetaDescription } from '@/shared/lib/seo';
import { faDigits, formatToman } from '@/shared/lib/utils';

export const dynamic = 'force-dynamic';
/** یک ساعت کافی است: فهرست دسته‌ها به‌ندرت عوض می‌شود و این فایل در هر درخواست به دیتابیس نزند */
export const revalidate = 3600;

/**
 * llms.txt — معرفی کوتاه سایت برای دستیارهای هوش مصنوعی.
 *
 * یک قرارداد نوپاست (هنوز استاندارد رسمی نیست و همه ابزارها نمی‌خوانندش)، ولی ساختنش تقریباً
 * بی‌هزینه است: یک متن ساده که می‌گوید این سایت چیست، چه می‌فروشد و مهم‌ترین صفحه‌هایش کجاست.
 * خزنده‌ای که جاوااسکریپت اجرا نمی‌کند هم از همین‌جا تصویر درستی می‌گیرد.
 *
 * sitemap.xml جای فهرست کامل آدرس‌هاست؛ اینجا نقشه کلی، دسته‌ها، خلاصه قیمت، راهنماها و پرسش‌های متداول است.
 * دستیارها جمله و عدد نقل می‌کنند، نه فهرست لینک: خلاصه قیمت تاریخ‌دار و جواب سوال‌ها همان چیزی است
 * که در پاسخ «قیمت لوله کاروگیت چند است؟» یا «لوله کاروگیت از کجا بخرم؟» می‌آید.
 */
export async function GET() {
  const [categories, board, posts, faqs] = await Promise.all([
    getPublishedCategories().catch(() => []),
    getPriceBoard().catch(() => null),
    getPublishedBlogPosts().catch(() => []),
    getPublishedFaqs().catch(() => []),
  ]);
  const categoryLines = categories
    .map((c) => `- [${c.name}](${siteConfig.url}/products/${c.slug})`)
    .join('\n');

  const dateFa = (iso: string) => new Intl.DateTimeFormat('fa-IR', { dateStyle: 'long', timeZone: 'Asia/Tehran' }).format(new Date(iso));
  // فقط ردیف‌هایی که قیمت تازه دارند — قیمت کهنه را getPriceBoard خودش پنهان کرده است
  const priceLines = (board?.lines ?? [])
    .map((l) => ({ l, s: summarizeLine(l.items) }))
    .filter(({ s }) => s.minPrice != null && s.updatedAt)
    .map(({ l, s }) => {
      const range = s.minPrice === s.maxPrice ? formatToman(s.minPrice) : `از ${formatToman(s.minPrice)} تا ${formatToman(s.maxPrice)}`;
      return `- [${l.productName}](${siteConfig.url}${l.href}): ${range} (${faDigits(s.count)} سایز/کلاس، به‌روز ${dateFa(s.updatedAt!)})`;
    })
    .join('\n');

  const guideLines = posts
    .map((p) => `- [${p.title}](${siteConfig.url}/blog/${p.slug})${p.excerpt ? `: ${toMetaDescription(p.excerpt, 160)}` : ''}`)
    .join('\n');

  const faqLines = faqs
    .map((f) => `### ${f.question.trim()}\n\n${toMetaDescription(f.answer, 600)}`)
    .join('\n\n');

  const body = `# ${siteConfig.name}

> ${siteConfig.description}

${siteConfig.name} ${siteConfig.exclusiveTitle} است — کارخانه تولیدکننده لوله دوجداره پلی اتیلن (کاروگیت) در شهرک صنعتی گرمسار، استان سمنان. سفارش‌ها مستقیم از انبار کارخانه و بدون واسطه به سراسر ایران ارسال می‌شود.

English: ${siteConfig.nameEn} (${siteConfig.url}) is the exclusive sales agent of ${siteConfig.legalNameEn}, an Iranian manufacturer of double-wall corrugated HDPE pipes (ISIRI 9116, ISO 9001) in Garmsar Industrial Park, Semnan. It sells three product lines only: double-wall corrugated pipes (110–1200 mm, SN4 and SN8), spiral pipes (1400–2000 mm) and corrugated pipe fittings, each size on its own page, with daily factory prices and nationwide delivery in Iran.

## صفحه‌های اصلی

- [قیمت روز](${siteConfig.url}/prices): جدول قیمت به‌روز لوله و اتصالات بر اساس سایز و کلاس. قیمت هر متر از وزن ردیف × قیمت روز هر کیلو حساب می‌شود و در ساعت کاری (۹ تا ۱۷) نمایش داده می‌شود؛ بیرون از آن با استعلام اعلام می‌شود.
- [محصولات](${siteConfig.url}/products): مشخصات فنی، سایزبندی، استانداردها و کاتالوگ هر محصول.
- [پروژه‌ها](${siteConfig.url}/projects): نمونه پروژه‌های اجراشده.
- [سوالات متداول](${siteConfig.url}/faq): پاسخ پرسش‌های رایج درباره انتخاب سایز، کلاس و نحوه خرید.
- [نمایندگی رسمی](${siteConfig.url}/official-representative): پیام رسمی ${siteConfig.legalName} (امضای جمشید شاطری، مدیریت شرکت) درباره معرفی ${siteConfig.name} به مدیریت امیر یوسفی به‌عنوان نماینده رسمی و اختصاصی فروش و عرضه آنلاین محصولاتش، همراه با تصویر گواهی نمایندگی. وب‌سایت رسمی کارخانه: ${siteConfig.manufacturerUrl}
- [کارخانه و توانمندی تأمین](${siteConfig.url}/factory): عکس و فیلم واقعی خط تولید، انبار و بارگیری.
- [درباره ما](${siteConfig.url}/about) · [تماس](${siteConfig.url}/contact) · [گواهینامه‌ها](${siteConfig.url}/certificates)
- [وبلاگ](${siteConfig.url}/blog): راهنمای فنی انتخاب و اجرای لوله.

## دسته‌بندی محصولات

${categoryLines}
${priceLines ? `
## خلاصه قیمت روز

قیمت‌ها به تومان است (لوله‌ها هر متر، اتصالات هر عدد) و با قیمت مواد اولیه تغییر می‌کند؛ جدول کامل و آخرین عدد هر سایز در [صفحه قیمت روز](${siteConfig.url}/prices) است.

${priceLines}
` : ''}${guideLines ? `
## راهنماها و مقالات فنی

${guideLines}
` : ''}${faqLines ? `
## پرسش‌های متداول

${faqLines}
` : ''}
## تماس

- تلفن: ${siteConfig.phone} / ${siteConfig.mobile}
- دفتر مرکزی: ${siteConfig.address}
- کارخانه و انبار: ${siteConfig.factoryAddress}

## فهرست کامل آدرس‌ها

${siteConfig.url}/sitemap.xml
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
