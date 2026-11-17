import { fill } from '@/shared/i18n/messages';
import { defineSection, type ContentPage } from '../types';
import { seoSection } from '../seo-section';

const BODY_HINT = 'لینک داخلی را با آدرس بدون دامنه بنویسید (مثلاً /contact)؛ در نسخه انگلیسی خودکار /en می‌گیرد.';

function heroSection(key: string, defaults: { fa: { label: string; title: string; description: string }; en: { label: string; title: string; description: string } }) {
  return defineSection({
    key,
    title: 'بالای صفحه',
    fields: {
      label: { type: 'text', label: 'برچسب کوچک بالای عنوان' },
      title: { type: 'text', label: 'عنوان' },
      description: { type: 'text', label: 'توضیح', multiline: true },
    },
    defaults,
  });
}

/**
 * مقدارهای تنظیمات سایت (ایمیل، آدرس) در متن HTML به‌جای {email} و {factoryAddress}؛
 * مقدار escape می‌شود چون مستقیم در HTML می‌نشیند.
 */
export function fillLegalHtml(html: string, values: Record<string, string>): string {
  const escape = (v: string) => v.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
  return fill(html, Object.fromEntries(Object.entries(values).map(([k, v]) => [k, escape(v)])));
}

// ─── حریم خصوصی ───

export const privacySeo = seoSection('privacy.seo', {
  fa: {
    metaTitle: 'حریم خصوصی',
    metaDescription: 'سیاست حریم خصوصی قدیر لوله آنلاین: چه اطلاعاتی از فرم تماس و درخواست مشاوره دریافت می‌شود و چگونه استفاده می‌شود.',
  },
  en: {
    metaTitle: 'Privacy policy',
    metaDescription: 'Ghadir Louleh Online privacy policy: what information we receive through the contact and consultation request forms, and how it is used.',
  },
});

export const privacyHero = heroSection('privacy.hero', {
  fa: { label: 'قوانین', title: 'حریم خصوصی', description: 'نحوه نگهداری و استفاده از اطلاعات شما در قدیر لوله آنلاین' },
  en: { label: 'Policies', title: 'Privacy policy', description: 'How Ghadir Louleh Online stores and uses your information' },
});

export const privacyBody = defineSection({
  key: 'privacy.body',
  title: 'متن حریم خصوصی',
  description: '{email} با ایمیل «تنظیمات سایت» جایگزین می‌شود.',
  fields: { html: { type: 'html', label: 'متن', hint: BODY_HINT } },
  defaults: {
    fa: {
      html: `<p>قدیر لوله آنلاین تنها نماینده انحصاری فروش قدیر لوله پاسارگاد است. این صفحه توضیح می‌دهد هنگام استفاده از سایت چه اطلاعاتی از شما دریافت می‌شود و با آن چه می‌کنیم.</p>
<h2>چه اطلاعاتی دریافت می‌کنیم</h2>
<p>سایت ثبت‌نام کاربر و پرداخت آنلاین ندارد و اطلاعات کارت بانکی از شما دریافت نمی‌شود. فقط وقتی فرم «تماس با ما» یا «درخواست مشاوره و خرید» را پر می‌کنید، این موارد ثبت می‌شود: نام، شماره تماس، ایمیل (در صورت وارد کردن)، موضوع و متن پیام.</p>
<h2>این اطلاعات برای چیست</h2>
<p>فقط برای پاسخ به پیام شما، اعلام قیمت، هماهنگی سفارش و ارسال توسط کارشناسان فروش. اطلاعات شما برای تبلیغات به شخص یا شرکت دیگری فروخته یا واگذار نمی‌شود.</p>
<h2>ذخیره‌سازی در مرورگر</h2>
<p>انتخاب حالت روشن یا تیره سایت در حافظه مرورگر خودتان ذخیره می‌شود تا در بازدید بعدی حفظ شود. سایت از ابزارهای آمارگیری یا تبلیغاتی استفاده نمی‌کند. کوکی ورود فقط برای مدیران سایت در پنل مدیریت به کار می‌رود.</p>
<h2>سرویس‌های بیرونی</h2>
<p>فونت سایت از Google Fonts بارگذاری می‌شود. نقشه کارخانه در صفحه تماس فقط وقتی خودتان روی «نمایش نقشه» بزنید از Google Maps بارگذاری می‌شود.</p>
<h2>حذف یا اصلاح اطلاعات</h2>
<p>اگر می‌خواهید پیام یا اطلاعات تماس شما حذف یا اصلاح شود، از طریق <a href="/contact">صفحه تماس</a> یا ایمیل <a href="mailto:{email}" dir="ltr">{email}</a> با ما در ارتباط باشید.</p>`,
    },
    en: {
      html: `<p>Ghadir Louleh Online is the sole exclusive sales agent of Ghadir Louleh Pasargad. This page explains what information we receive from you when you use the site and what we do with it.</p>
<h2>What information we receive</h2>
<p>The site has no user registration or online payment, and we never receive your bank card details. Only when you fill in the “Contact us” or “Consultation and purchase request” form do we record the following: your name, phone number, email (if provided), subject and message.</p>
<h2>What this information is used for</h2>
<p>Only for replying to your message, quoting prices, arranging your order and delivery by our sales specialists. Your information is never sold or passed to any other person or company for advertising.</p>
<h2>Storage in your browser</h2>
<p>Your choice of light or dark mode is saved in your own browser so it is kept for your next visit. The site does not use analytics or advertising tools. The login cookie is used only by site administrators in the admin panel.</p>
<h2>External services</h2>
<p>The site font is loaded from Google Fonts. The factory map on the contact page is loaded from Google Maps only when you click “Show map”.</p>
<h2>Deleting or correcting your information</h2>
<p>If you would like your message or contact details deleted or corrected, get in touch through the <a href="/contact">contact page</a> or by email at <a href="mailto:{email}" dir="ltr">{email}</a>.</p>`,
    },
  },
});

export const privacyPage: ContentPage = {
  key: 'privacy',
  title: 'حریم خصوصی',
  path: '/privacy',
  sections: [privacySeo, privacyHero, privacyBody],
};

// ─── قوانین و شرایط خرید ───

export const termsSeo = seoSection('terms.seo', {
  fa: {
    metaTitle: 'قوانین و شرایط خرید',
    metaDescription: 'قوانین استفاده از قدیر لوله آنلاین: اعتبار قیمت‌ها، ثبت و تایید سفارش، ارسال از انبار کارخانه و مشخصات فنی محصولات.',
  },
  en: {
    metaTitle: 'Terms and conditions of purchase',
    metaDescription: 'Terms of use for Ghadir Louleh Online: price validity, placing and confirming orders, shipping from the factory warehouse and product specifications.',
  },
});

export const termsHero = heroSection('terms.hero', {
  fa: { label: 'قوانین', title: 'قوانین و شرایط خرید', description: 'شرایط استفاده از سایت و خرید از قدیر لوله پاسارگاد' },
  en: { label: 'Policies', title: 'Terms and conditions of purchase', description: 'Terms for using the site and buying Ghadir Louleh Pasargad products' },
});

export const termsBody = defineSection({
  key: 'terms.body',
  title: 'متن قوانین',
  description: '{factoryAddress} با آدرس کارخانه «تنظیمات سایت» جایگزین می‌شود.',
  fields: { html: { type: 'html', label: 'متن', hint: BODY_HINT } },
  defaults: {
    fa: {
      html: `<p>قدیر لوله آنلاین تنها نماینده انحصاری فروش قدیر لوله پاسارگاد است. استفاده از سایت و ثبت درخواست خرید به معنی پذیرش شرایط زیر است.</p>
<h2>قیمت‌ها</h2>
<p>قیمت‌ها به تومان است و در ساعات فروش به صورت لحظه‌ای به‌روز می‌شود؛ خارج از ساعت کاری، قیمت روز از طریق «استعلام قیمت» اعلام می‌شود. قیمت نهایی، موجودی و هزینه حمل هنگام ثبت سفارش توسط کارشناس فروش تایید و در پیش‌فاکتور اعلام می‌شود.</p>
<h2>ثبت و تایید سفارش</h2>
<p>می‌توانید از جدول قیمت، ردیف‌های مورد نظر را به سبد پیش‌فاکتور اضافه کنید و درخواست بدهید؛ یا از فرم «درخواست مشاوره و خرید» و تماس تلفنی استفاده کنید. کارشناس فروش درخواست را بررسی می‌کند، در صورت نیاز اصلاح می‌کند و پیش‌فاکتور را صادر می‌کند. سفارش پس از تایید پیش‌فاکتور توسط شما قطعی است. اعتبار پیش‌فاکتور روی سند درج شده است.</p>
<h2>ارسال</h2>
<p>کالا از انبار کارخانه در {factoryAddress} بارگیری و پس از هماهنگی به سراسر کشور ارسال می‌شود. زمان و هزینه حمل هنگام ثبت سفارش اعلام می‌شود.</p>
<h2>مشخصات فنی و تصاویر</h2>
<p>مشخصات و توضیحات محصولات برای راهنمایی شما در انتخاب است. برای پروژه‌هایی که به استاندارد یا مشخصه خاصی نیاز دارند، پیش از خرید با کارشناسان ما مشورت کنید.</p>
<h2>محتوای سایت</h2>
<p>متن‌ها، جدول‌های قیمت و مقالات این سایت متعلق به قدیر لوله آنلاین است و نقل آن با ذکر منبع و لینک به سایت مجاز است.</p>
<p>برای هر پرسشی درباره این شرایط از طریق <a href="/contact">صفحه تماس</a> با ما در ارتباط باشید. حریم خصوصی اطلاعات شما در صفحه <a href="/privacy">حریم خصوصی</a> توضیح داده شده است.</p>`,
    },
    en: {
      html: `<p>Ghadir Louleh Online is the sole exclusive sales agent of Ghadir Louleh Pasargad. Using this site and submitting a purchase request means you accept the terms below.</p>
<h2>Prices</h2>
<p>Prices are in Toman and are updated in real time during sales hours; outside business hours, today’s price is given through “Request a price”. The final price, availability and shipping cost are confirmed by a sales specialist when the order is placed and stated in the pro forma invoice.</p>
<h2>Placing and confirming an order</h2>
<p>You can add the rows you need from the price table to your quote basket and submit a request, or use the “Consultation and purchase request” form or call us. A sales specialist reviews the request, adjusts it if needed and issues the pro forma invoice. The order becomes final once you confirm the pro forma invoice. The invoice’s validity period is printed on the document.</p>
<h2>Shipping</h2>
<p>Goods are loaded at the factory warehouse in {factoryAddress} and, once arranged, shipped anywhere in Iran. Delivery time and shipping cost are given when the order is placed.</p>
<h2>Technical specifications and images</h2>
<p>Product specifications and descriptions are provided to guide your choice. For projects that require a particular standard or specification, please consult our specialists before buying.</p>
<h2>Site content</h2>
<p>The texts, price tables and articles on this site belong to Ghadir Louleh Online and may be quoted with attribution and a link to the site.</p>
<p>For any questions about these terms, contact us through the <a href="/contact">contact page</a>. How we handle your personal information is explained on the <a href="/privacy">privacy policy</a> page.</p>`,
    },
  },
});

export const termsPage: ContentPage = {
  key: 'terms',
  title: 'قوانین و شرایط خرید',
  path: '/terms',
  sections: [termsSeo, termsHero, termsBody],
};
