import type { Metadata } from 'next';
import Link from 'next/link';
import { siteConfig } from '@/shared/config/site';
import { JsonLd } from '@/shared/ui/JsonLd';
import { PageHero } from '@/shared/ui/PageHero';
import { breadcrumbSchema } from '@/shared/lib/seo';

export const metadata: Metadata = {
  title: 'حریم خصوصی',
  description: `سیاست حریم خصوصی ${siteConfig.name}: چه اطلاعاتی از فرم تماس و درخواست مشاوره دریافت می‌شود و چگونه استفاده می‌شود.`,
  alternates: { canonical: `${siteConfig.url}/privacy` },
};

export default function PrivacyPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: 'حریم خصوصی', path: '/privacy' }])} />
      <PageHero label="قوانین" title="حریم خصوصی" description={`نحوه نگهداری و استفاده از اطلاعات شما در ${siteConfig.name}`} />

      <div className="container-main section-padding-sm max-w-3xl">
        <article className="article-content">
          <p>
            {siteConfig.name} تنها نماینده انحصاری فروش {siteConfig.legalName} است. این صفحه توضیح می‌دهد هنگام استفاده از سایت چه
            اطلاعاتی از شما دریافت می‌شود و با آن چه می‌کنیم.
          </p>

          <h2>چه اطلاعاتی دریافت می‌کنیم</h2>
          <p>
            سایت ثبت‌نام کاربر و پرداخت آنلاین ندارد و اطلاعات کارت بانکی از شما دریافت نمی‌شود. فقط وقتی فرم «تماس با ما» یا
            «درخواست مشاوره و خرید» را پر می‌کنید، این موارد ثبت می‌شود: نام، شماره تماس، ایمیل (در صورت وارد کردن)، موضوع و متن پیام.
          </p>

          <h2>این اطلاعات برای چیست</h2>
          <p>
            فقط برای پاسخ به پیام شما، اعلام قیمت، هماهنگی سفارش و ارسال توسط کارشناسان فروش. اطلاعات شما برای تبلیغات به
            شخص یا شرکت دیگری فروخته یا واگذار نمی‌شود.
          </p>

          <h2>ذخیره‌سازی در مرورگر</h2>
          <p>
            انتخاب حالت روشن یا تیره سایت در حافظه مرورگر خودتان ذخیره می‌شود تا در بازدید بعدی حفظ شود. سایت از ابزارهای
            آمارگیری یا تبلیغاتی استفاده نمی‌کند. کوکی ورود فقط برای مدیران سایت در پنل مدیریت به کار می‌رود.
          </p>

          <h2>سرویس‌های بیرونی</h2>
          <p>
            فونت سایت از Google Fonts بارگذاری می‌شود. نقشه کارخانه در صفحه تماس فقط وقتی خودتان روی «نمایش نقشه» بزنید از
            Google Maps بارگذاری می‌شود.
          </p>

          <h2>حذف یا اصلاح اطلاعات</h2>
          <p>
            اگر می‌خواهید پیام یا اطلاعات تماس شما حذف یا اصلاح شود، از طریق <Link href="/contact">صفحه تماس</Link> یا ایمیل{' '}
            <a href={`mailto:${siteConfig.email}`} dir="ltr">{siteConfig.email}</a> با ما در ارتباط باشید.
          </p>
        </article>
      </div>
    </>
  );
}
