import { siteConfig } from '@/shared/config/site';
import { getPublishedCategories } from '@/shared/lib/data';

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
 * sitemap.xml جای فهرست کامل آدرس‌هاست؛ اینجا فقط نقشه کلی و دسته‌هاست.
 */
export async function GET() {
  const categories = await getPublishedCategories().catch(() => []);
  const categoryLines = categories
    .map((c) => `- [${c.name}](${siteConfig.url}/products/${c.slug})`)
    .join('\n');

  const body = `# ${siteConfig.name}

> ${siteConfig.description}

${siteConfig.name} ${siteConfig.exclusiveTitle} است — کارخانه تولیدکننده لوله دوجداره پلی اتیلن (کاروگیت) در شهرک صنعتی گرمسار، استان سمنان. سفارش‌ها مستقیم از انبار کارخانه و بدون واسطه به سراسر ایران ارسال می‌شود.

## صفحه‌های اصلی

- [قیمت روز](${siteConfig.url}/prices): جدول قیمت به‌روز لوله و اتصالات بر اساس سایز و کلاس. قیمت هر متر از وزن ردیف × قیمت روز هر کیلو حساب می‌شود و در ساعت کاری (۹ تا ۱۷) نمایش داده می‌شود؛ بیرون از آن با استعلام اعلام می‌شود.
- [محصولات](${siteConfig.url}/products): مشخصات فنی، سایزبندی، استانداردها و کاتالوگ هر محصول.
- [پروژه‌ها](${siteConfig.url}/projects): نمونه پروژه‌های اجراشده.
- [سوالات متداول](${siteConfig.url}/faq): پاسخ پرسش‌های رایج درباره انتخاب سایز، کلاس و نحوه خرید.
- [درباره ما](${siteConfig.url}/about) · [تماس](${siteConfig.url}/contact) · [گواهینامه‌ها](${siteConfig.url}/certificates)
- [وبلاگ](${siteConfig.url}/blog): راهنمای فنی انتخاب و اجرای لوله.

## دسته‌بندی محصولات

${categoryLines}

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
