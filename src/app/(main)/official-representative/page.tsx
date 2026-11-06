import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { BadgeCheck, Check, ChevronLeft, FileSignature, Globe } from 'lucide-react';
import { PageHero } from '@/shared/ui/PageHero';
import { JsonLd } from '@/shared/ui/JsonLd';
import { siteConfig } from '@/shared/config/site';
import { absoluteUrl, breadcrumbSchema } from '@/shared/lib/seo';

/**
 * پیام رسمی قدیر لوله پاسارگاد درباره نمایندگی قدیر لوله آنلاین — متن نامه عیناً همان متن رسمی شرکت است
 * و نباید بازنویسی شود. صفحه برای جستجوی «نماینده رسمی قدیر لوله پاسارگاد» ساخته شده و جایگاه
 * «تنها نماینده انحصاری» در هدر، هیرو و فوتر به آن لینک می‌دهد.
 */

const PATH = '/official-representative';
const TITLE = `نماینده رسمی و اختصاصی ${siteConfig.legalName}`;
const HEADLINE = `${siteConfig.name}؛ درگاه رسمی و اختصاصی عرضه محصولات ${siteConfig.legalName}`;
const DESCRIPTION = `پیام رسمی ${siteConfig.legalName}: معرفی ${siteConfig.name} به مدیریت امیر یوسفی به‌عنوان نماینده رسمی و اختصاصی فروش و عرضه آنلاین لوله کاروگیت، اسپیرال و پلی‌اتیلن.`;
const CERTIFICATE = { src: '/images/site/representation-certificate.webp', width: 720, height: 1080 };
const SIGNER = { name: 'جمشید شاطری', role: `مدیریت ${siteConfig.legalName}` };
/** تاریخ انتشار این پیام روی سایت */
const PUBLISHED = '2026-11-06';

export const metadata: Metadata = {
  // عنوان کامل با نام سایت زیر ۶۰ حرف است؛ قالب «| نام سایت» دوباره اضافه نشود
  title: { absolute: `${TITLE} | ${siteConfig.name}` },
  description: DESCRIPTION,
  keywords: [`نماینده رسمی ${siteConfig.legalName}`, `نمایندگی ${siteConfig.legalName}`, siteConfig.name, 'امیر یوسفی'],
  alternates: { canonical: `${siteConfig.url}${PATH}` },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${siteConfig.url}${PATH}`,
    type: 'article',
    publishedTime: PUBLISHED,
    images: [{ url: CERTIFICATE.src, width: CERTIFICATE.width, height: CERTIFICATE.height, alt: `گواهی نمایندگی ${siteConfig.name} از ${siteConfig.legalName}` }],
  },
};

const GOALS = [
  `عرضه محصولات اصلی و مورد تأیید ${siteConfig.legalName}`,
  'ارائه اطلاعات فنی و مشخصات محصولات',
  'پیگیری استعلام قیمت و موجودی',
  'هماهنگی تأمین و ارسال سفارش‌ها',
  'پشتیبانی و پاسخ‌گویی به مشتریان و پروژه‌های عمرانی',
  'ایجاد بستری مطمئن برای خرید عمده و تأمین مستقیم محصولات',
];

/** href فقط برای محصولاتی که صفحه منتشرشده دارند */
const PRODUCTS: { title: string; text: string; href?: string }[] = [
  {
    title: 'لوله‌های کاروگیت (دوجداره پلی‌اتیلن)',
    text: 'در سایزهای مختلف، با کاربردهای متنوع در شبکه‌های جمع‌آوری و انتقال فاضلاب، زهکشی و پروژه‌های زیرساختی.',
    href: '/products/corrugated-pipes',
  },
  {
    title: 'لوله‌های اسپیرال پلی‌اتیلن',
    text: 'مناسب پروژه‌های بزرگ عمرانی، شبکه‌های انتقال و زیرساخت‌های تخصصی.',
    href: '/products/spiral-pipes',
  },
  {
    title: 'لوله‌های پلی‌اتیلن آبرسانی',
    text: 'جهت استفاده در شبکه‌های انتقال و توزیع آب و پروژه‌های آبرسانی، متناسب با فشار کاری و مشخصات فنی مورد نیاز.',
  },
];

export default function OfficialRepresentativePage() {
  const url = `${siteConfig.url}${PATH}`;
  const manufacturer = { '@type': 'Organization', name: siteConfig.legalName, alternateName: siteConfig.legalNameEn, url: siteConfig.manufacturerUrl };

  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: TITLE, path: PATH }])} />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: HEADLINE,
          description: DESCRIPTION,
          inLanguage: 'fa-IR',
          url,
          mainEntityOfPage: url,
          datePublished: PUBLISHED,
          image: absoluteUrl(CERTIFICATE.src),
          author: { '@type': 'Person', name: SIGNER.name, jobTitle: SIGNER.role, worksFor: manufacturer },
          publisher: { '@type': 'Organization', name: siteConfig.name, url: siteConfig.url },
          // فقط آنچه در نامه آمده: موضوع نامه دو مجموعه‌اند؛ ادعای زیرمجموعه بودن یا مؤسس در schema نمی‌آید
          about: [{ '@type': 'Organization', name: siteConfig.name, url: siteConfig.url }, manufacturer],
        }}
      />

      <PageHero label={`پیام رسمی شرکت ${siteConfig.legalName}`} title={HEADLINE} />

      <article className="section-padding-sm">
        <div className="container-main grid gap-10 lg:grid-cols-[1fr_340px] items-start">
          <div className="max-w-3xl text-[15px] sm:text-base leading-9">
            <p>
              شرکت <strong>{siteConfig.legalName}</strong> به‌عنوان تولیدکننده و تأمین‌کننده محصولات تخصصی صنعت لوله و زیرساخت، با هدف توسعه
              شبکه فروش، تسهیل دسترسی مشتریان و ارائه خدمات حرفه‌ای به فعالان صنعت ساختمان و پروژه‌های عمرانی، همکاری رسمی خود را با مجموعه{' '}
              <strong>{siteConfig.name}</strong> برقرار نموده است.
            </p>

            <p className="mt-5 rounded-[var(--radius-panel)] border-s-4 border-[var(--accent)] bg-[var(--card)] px-5 py-4 font-bold">
              بر این اساس، مجموعه {siteConfig.name} به مدیریت آقای امیر یوسفی به‌عنوان نماینده رسمی و اختصاصی فروش و عرضه آنلاین محصولات{' '}
              {siteConfig.legalName} معرفی می‌گردد.
            </p>

            <p className="mt-5">
              {siteConfig.name} با بهره‌گیری از ظرفیت تولید و پشتوانه فنی و تجاری {siteConfig.legalName}، مسئولیت عرضه، معرفی، بازاریابی و پیگیری
              تأمین محصولات این شرکت را در بستر آنلاین بر عهده دارد.
            </p>

            <h2 className="mt-10 text-xl sm:text-2xl font-black">تعهد ما به مشتریان</h2>
            <p className="mt-3">
              ما در {siteConfig.legalName} بر این باوریم که تأمین محصولات باکیفیت، ارائه اطلاعات فنی صحیح و ایجاد اطمینان در فرآیند خرید، از
              مهم‌ترین اصول همکاری بلندمدت با مشتریان است.
            </p>
            <p className="mt-3">
              به همین منظور، مجموعه {siteConfig.name} به‌عنوان مسیر رسمی ارتباط و عرضه آنلاین محصولات، با اهداف زیر فعالیت می‌کند:
            </p>
            <ul className="mt-4 grid gap-2.5">
              {GOALS.map((g) => (
                <li key={g} className="flex items-start gap-2.5">
                  <span className="mt-2 grid place-items-center w-5 h-5 rounded-full bg-[var(--accent)] text-[var(--accent-foreground)] shrink-0">
                    <Check className="w-3 h-3" strokeWidth={3} />
                  </span>
                  {g}
                </li>
              ))}
            </ul>

            <h2 className="mt-10 text-xl sm:text-2xl font-black">حوزه محصولات</h2>
            <p className="mt-3">
              {siteConfig.name} با پشتوانه همکاری رسمی با {siteConfig.legalName}، در زمینه عرضه محصولات زیر فعالیت می‌کند:
            </p>
            <ol className="mt-4 grid gap-3">
              {PRODUCTS.map((p, i) => (
                <li key={p.title} className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--card)] p-4 sm:p-5">
                  <h3 className="font-black text-base sm:text-lg">
                    <span className="num">{(i + 1).toLocaleString('fa-IR')}.</span> {p.title}
                  </h3>
                  <p className="mt-1.5 text-[var(--muted-foreground)] leading-8">{p.text}</p>
                  {p.href && (
                    <Link href={p.href} className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-[var(--accent-text)] hover:underline">
                      مشاهده سایزها و قیمت<ChevronLeft className="w-4 h-4" />
                    </Link>
                  )}
                </li>
              ))}
            </ol>

            <h2 className="mt-10 text-xl sm:text-2xl font-black">سخن پایانی</h2>
            <p className="mt-3">
              اعتماد مشتریان، اعتبار تولیدکننده و کیفیت محصولات، سه اصل اساسی همکاری ما هستند.
            </p>
            <p className="mt-3">
              شرکت {siteConfig.legalName} با معرفی مجموعه {siteConfig.name} به‌عنوان درگاه رسمی و اختصاصی عرضه آنلاین محصولات خود، در مسیر توسعه
              خدمات، افزایش دسترسی مشتریان و ایجاد تجربه‌ای مطمئن‌تر در خرید محصولات صنعت لوله گام برداشته است.
            </p>
            <p className="mt-3 font-black">{siteConfig.name}؛ ارتباط مستقیم شما با محصولات {siteConfig.legalName}.</p>

            <footer className="mt-8 flex items-center gap-3 border-t border-[var(--border)] pt-6">
              <FileSignature className="w-6 h-6 text-[var(--accent-text)] shrink-0" aria-hidden />
              <p className="leading-7">
                <span className="block text-sm text-[var(--muted-foreground)]">با احترام</span>
                <span className="block font-bold">{SIGNER.role}</span>
                <span className="block font-black text-lg">{SIGNER.name}</span>
              </p>
            </footer>
          </div>

          <aside className="lg:sticky lg:top-[calc(var(--nav-height)+1.5rem)] grid gap-4">
            <figure className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--card)] p-3">
              <Image
                src={CERTIFICATE.src}
                alt={`گواهی نمایندگی ${siteConfig.name} به مدیریت امیر یوسفی از ${siteConfig.legalName}`}
                width={CERTIFICATE.width}
                height={CERTIFICATE.height}
                sizes="(min-width: 1024px) 340px, 100vw"
                className="w-full h-auto rounded-[var(--radius-control)]"
              />
              <figcaption className="mt-3 text-center text-sm font-bold">گواهی نمایندگی صادرشده از {siteConfig.legalName}</figcaption>
            </figure>
            <a
              href={siteConfig.manufacturerUrl}
              target="_blank"
              rel="noopener"
              className="flex items-center justify-center gap-2 h-11 rounded-[var(--radius-control)] border border-[var(--accent)] text-[var(--accent-text)] text-sm font-bold hover:bg-[var(--accent)]/5"
            >
              <Globe className="w-4 h-4" />وب‌سایت رسمی {siteConfig.legalName}
            </a>
            <Link
              href="/certificates"
              className="flex items-center justify-center gap-2 h-11 rounded-[var(--radius-control)] border border-[var(--border)] text-sm font-bold hover:border-[var(--accent)]"
            >
              <BadgeCheck className="w-4 h-4" />گواهینامه‌ها و استانداردهای کارخانه
            </Link>
            <Link
              href="/factory"
              className="flex items-center justify-center gap-2 h-11 rounded-[var(--radius-control)] bg-[var(--foreground)] text-[var(--background)] text-sm font-bold"
            >
              کارخانه و توانمندی تأمین<ChevronLeft className="w-4 h-4" />
            </Link>
          </aside>
        </div>
      </article>
    </>
  );
}
