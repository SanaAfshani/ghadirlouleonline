import Image from 'next/image';

/**
 * برندهایی که واقعاً تأمین می‌کنیم (هم‌خوان با دسته‌های سایت و فهرست برندهای لوله آنلاین).
 * لوگوها در public/images/brands — برندی که لوگوی تمیز نداشت (نوار واترمارک سایت دیگر روی لوگو) فعلاً نیامده.
 */
const brands = [
  { name: 'قدیر لوله پاسارگاد', line: 'لوله کاروگیت و اسپیرال — نماینده انحصاری', logo: '/images/brands/ghadir-louleh-pasargad.webp', main: true },
  { name: 'قطران اتصال', line: 'لوله و اتصالات پلی اتیلن', logo: '/images/brands/ghatran-etesal.webp' },
  { name: 'پلی رود اتصال', line: 'اتصالات پلی اتیلن', logo: '/images/brands/polyrood-etesal.webp' },
  { name: 'لوله گستر گلپایگان', line: 'لوله و اتصالات پلیکا', logo: '/images/brands/looleh-gostar-golpayegan.webp' },
  { name: 'سنا پلیمر', line: 'اتصالات پی وی سی', logo: '/images/brands/sana-polymer.webp' },
  { name: 'ویسپار (پایا بسپار آریا)', line: 'لوله و اتصالات آبیاری', logo: '/images/brands/vispar.webp' },
];

export function BrandsSection() {
  return (
    <section className="py-10 sm:py-14" aria-labelledby="brands-title">
      <div className="container-main">
        <h2 id="brands-title" className="text-center text-base sm:text-lg font-black">تامین‌کنندگان ما</h2>
        <p className="mt-1 text-center text-xs sm:text-sm text-[var(--muted-foreground)]">برندهای معتبر لوله و اتصالات که محصولاتشان را با قیمت روز عرضه می‌کنیم</p>
        <ul className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {brands.map((b) => (
            <li
              key={b.name}
              className={`flex flex-col items-center text-center rounded-2xl border bg-white p-3 pt-4 transition-shadow hover:shadow-md ${b.main ? 'border-[var(--accent)] ring-2 ring-[var(--accent)]/25' : 'border-[var(--border)]'}`}
            >
              <span className="relative block w-full h-14">
                <Image src={b.logo} alt={`لوگوی ${b.name}`} fill sizes="(min-width: 1024px) 180px, 45vw" className="object-contain" />
              </span>
              <span className="mt-3 text-[13px] font-black text-slate-800 leading-6">{b.name}</span>
              <span className="text-[11px] leading-5 text-slate-500">{b.line}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
