import type { Metadata } from 'next';
import Link from 'next/link';
import { siteConfig } from '@/shared/config/site';
import { JsonLd } from '@/shared/ui/JsonLd';
import { PageHero } from '@/shared/ui/PageHero';
import { breadcrumbSchema } from '@/shared/lib/seo';

export const metadata: Metadata = {
  title: 'قوانین و شرایط خرید',
  description: `قوانین استفاده از ${siteConfig.name}: اعتبار قیمت‌ها، ثبت و تایید سفارش، ارسال از انبار کارخانه و مشخصات فنی محصولات.`,
  alternates: { canonical: `${siteConfig.url}/terms` },
};

export default function TermsPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: 'قوانین و شرایط خرید', path: '/terms' }])} />
      <PageHero label="قوانین" title="قوانین و شرایط خرید" description={`شرایط استفاده از سایت و خرید از ${siteConfig.legalName}`} />

      <div className="container-main section-padding-sm max-w-3xl">
        <article className="article-content">
          <p>
            {siteConfig.name} تنها نماینده انحصاری فروش {siteConfig.legalName} است. استفاده از سایت و ثبت درخواست خرید به معنی
            پذیرش شرایط زیر است.
          </p>

          <h2>قیمت‌ها</h2>
          <p>
            قیمت‌ها به تومان است و در ساعات فروش به صورت لحظه‌ای به‌روز می‌شود؛ خارج از ساعت کاری، قیمت روز از طریق «استعلام
            قیمت» اعلام می‌شود. قیمت نهایی، موجودی و هزینه حمل هنگام ثبت
            سفارش توسط کارشناس فروش تایید و در پیش‌فاکتور اعلام می‌شود.
          </p>

          <h2>ثبت و تایید سفارش</h2>
          <p>
            می‌توانید از جدول قیمت، ردیف‌های مورد نظر را به سبد پیش‌فاکتور اضافه کنید و درخواست بدهید؛ یا از فرم «درخواست مشاوره
            و خرید» و تماس تلفنی استفاده کنید. کارشناس فروش درخواست را بررسی می‌کند، در صورت نیاز اصلاح می‌کند و پیش‌فاکتور را
            صادر می‌کند. سفارش پس از تایید پیش‌فاکتور توسط شما قطعی است. اعتبار پیش‌فاکتور روی سند درج شده است.
          </p>

          <h2>ارسال</h2>
          <p>
            کالا از انبار کارخانه در {siteConfig.factoryAddress} بارگیری و پس از هماهنگی به سراسر کشور ارسال می‌شود. زمان و هزینه
            حمل هنگام ثبت سفارش اعلام می‌شود.
          </p>

          <h2>مشخصات فنی و تصاویر</h2>
          <p>
            مشخصات و توضیحات محصولات برای راهنمایی شما در انتخاب است. برای پروژه‌هایی که به استاندارد یا مشخصه خاصی نیاز دارند،
            پیش از خرید با کارشناسان ما مشورت کنید.
          </p>

          <h2>محتوای سایت</h2>
          <p>
            متن‌ها، جدول‌های قیمت و مقالات این سایت متعلق به {siteConfig.name} است و نقل آن با ذکر منبع و لینک به سایت مجاز است.
          </p>

          <p>
            برای هر پرسشی درباره این شرایط از طریق <Link href="/contact">صفحه تماس</Link> با ما در ارتباط باشید. حریم خصوصی
            اطلاعات شما در صفحه <Link href="/privacy">حریم خصوصی</Link> توضیح داده شده است.
          </p>
        </article>
      </div>
    </>
  );
}
