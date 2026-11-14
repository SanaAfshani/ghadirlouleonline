import { defineSection, type ContentPage } from '../types';
import { seoSection } from '../seo-section';

/**
 * پیام رسمی قدیر لوله پاسارگاد درباره نمایندگی قدیر لوله آنلاین — متن فارسی نامه عیناً همان متن رسمی شرکت است
 * و نباید بازنویسی شود. نسخه انگلیسی ترجمه غیررسمی است و همین را در صفحه هم می‌گوید.
 */

export const officialRepresentativeSeo = seoSection('official-representative.seo', {
  fa: {
    metaTitle: 'نماینده رسمی و اختصاصی قدیر لوله پاسارگاد',
    metaDescription:
      'پیام رسمی قدیر لوله پاسارگاد: معرفی قدیر لوله آنلاین به مدیریت امیر یوسفی به‌عنوان نماینده رسمی و اختصاصی فروش و عرضه آنلاین لوله کاروگیت، اسپیرال و پلی‌اتیلن.',
  },
  en: {
    metaTitle: 'Official exclusive agent of Ghadir Louleh Pasargad',
    metaDescription:
      'Ghadir Louleh Pasargad’s official statement appointing Qadir Lule Online, managed by Amir Yousefi, as its official and exclusive online sales agent for corrugated, spiral and polyethylene pipes.',
  },
});

export const officialRepresentativeHero = defineSection({
  key: 'official-representative.hero',
  title: 'بالای صفحه',
  fields: {
    label: { type: 'text', label: 'برچسب کوچک بالای عنوان' },
    title: { type: 'text', label: 'عنوان' },
  },
  defaults: {
    fa: {
      label: 'پیام رسمی شرکت قدیر لوله پاسارگاد',
      title: 'قدیر لوله آنلاین؛ درگاه رسمی و اختصاصی عرضه محصولات قدیر لوله پاسارگاد',
    },
    en: {
      label: 'Official statement from Ghadir Louleh Pasargad',
      title: 'Qadir Lule Online: the official and exclusive gateway for Ghadir Louleh Pasargad products',
    },
  },
});

export const officialRepresentativeLetter = defineSection({
  key: 'official-representative.letter',
  title: 'متن نامه رسمی',
  description: 'متن فارسی، متن رسمی کارخانه است؛ فقط با هماهنگی کارخانه تغییر دهید. نسخه انگلیسی ترجمه غیررسمی است.',
  fields: {
    note: { type: 'text', label: 'یادداشت بالای نامه', hint: 'در فارسی خالی بماند؛ در انگلیسی: توضیح «ترجمه غیررسمی».' },
    opening: {
      type: 'html',
      label: 'متن نامه تا پیش از فهرست اهداف',
      hint: 'پاراگراف برجسته (معرفی نماینده) داخل <blockquote> است و عنوان‌های میانی <h2>.',
    },
    goals: {
      type: 'list',
      label: 'اهداف (تیک‌دار)',
      itemLabel: 'هدف',
      max: 12,
      fields: { text: { type: 'text', label: 'متن' } },
    },
    productsIntro: { type: 'html', label: 'عنوان و متن پیش از فهرست محصولات' },
    products: {
      type: 'list',
      label: 'حوزه محصولات',
      itemLabel: 'محصول',
      max: 8,
      fields: {
        title: { type: 'text', label: 'عنوان' },
        text: { type: 'text', label: 'متن', multiline: true },
        link: { type: 'link', label: 'لینک «مشاهده سایزها و قیمت»', hint: 'فقط برای محصولی که صفحه منتشرشده دارد؛ خالی = بدون لینک' },
      },
    },
    closing: { type: 'html', label: 'سخن پایانی', hint: 'جمله پایانی پررنگ داخل <strong> است.' },
    regards: { type: 'text', label: 'عبارت پیش از امضا' },
    signerRole: { type: 'text', label: 'سمت امضاکننده' },
    signerName: { type: 'text', label: 'نام امضاکننده' },
    published: { type: 'text', label: 'تاریخ انتشار در سایت (میلادی، مثلاً 2026-11-06)', hint: 'فقط برای گوگل (schema و اشتراک‌گذاری) — در صفحه نمایش داده نمی‌شود.' },
  },
  defaults: {
    fa: {
      note: '',
      opening: `<p>شرکت <strong>قدیر لوله پاسارگاد</strong> به‌عنوان تولیدکننده و تأمین‌کننده محصولات تخصصی صنعت لوله و زیرساخت، با هدف توسعه شبکه فروش، تسهیل دسترسی مشتریان و ارائه خدمات حرفه‌ای به فعالان صنعت ساختمان و پروژه‌های عمرانی، همکاری رسمی خود را با مجموعه <strong>قدیر لوله آنلاین</strong> برقرار نموده است.</p>
<blockquote>بر این اساس، مجموعه قدیر لوله آنلاین به مدیریت آقای امیر یوسفی به‌عنوان نماینده رسمی و اختصاصی فروش و عرضه آنلاین محصولات قدیر لوله پاسارگاد معرفی می‌گردد.</blockquote>
<p>قدیر لوله آنلاین با بهره‌گیری از ظرفیت تولید و پشتوانه فنی و تجاری قدیر لوله پاسارگاد، مسئولیت عرضه، معرفی، بازاریابی و پیگیری تأمین محصولات این شرکت را در بستر آنلاین بر عهده دارد.</p>
<h2>تعهد ما به مشتریان</h2>
<p>ما در قدیر لوله پاسارگاد بر این باوریم که تأمین محصولات باکیفیت، ارائه اطلاعات فنی صحیح و ایجاد اطمینان در فرآیند خرید، از مهم‌ترین اصول همکاری بلندمدت با مشتریان است.</p>
<p>به همین منظور، مجموعه قدیر لوله آنلاین به‌عنوان مسیر رسمی ارتباط و عرضه آنلاین محصولات، با اهداف زیر فعالیت می‌کند:</p>`,
      goals: [
        { id: 'genuine', text: 'عرضه محصولات اصلی و مورد تأیید قدیر لوله پاسارگاد' },
        { id: 'technical', text: 'ارائه اطلاعات فنی و مشخصات محصولات' },
        { id: 'inquiries', text: 'پیگیری استعلام قیمت و موجودی' },
        { id: 'supply', text: 'هماهنگی تأمین و ارسال سفارش‌ها' },
        { id: 'support', text: 'پشتیبانی و پاسخ‌گویی به مشتریان و پروژه‌های عمرانی' },
        { id: 'bulk', text: 'ایجاد بستری مطمئن برای خرید عمده و تأمین مستقیم محصولات' },
      ],
      productsIntro: `<h2>حوزه محصولات</h2>
<p>قدیر لوله آنلاین با پشتوانه همکاری رسمی با قدیر لوله پاسارگاد، در زمینه عرضه محصولات زیر فعالیت می‌کند:</p>`,
      products: [
        {
          id: 'corrugated',
          title: 'لوله‌های کاروگیت (دوجداره پلی‌اتیلن)',
          text: 'در سایزهای مختلف، با کاربردهای متنوع در شبکه‌های جمع‌آوری و انتقال فاضلاب، زهکشی و پروژه‌های زیرساختی.',
          link: '/products/corrugated-pipes',
        },
        {
          id: 'spiral',
          title: 'لوله‌های اسپیرال پلی‌اتیلن',
          text: 'مناسب پروژه‌های بزرگ عمرانی، شبکه‌های انتقال و زیرساخت‌های تخصصی.',
          link: '/products/spiral-pipes',
        },
        {
          id: 'water',
          title: 'لوله‌های پلی‌اتیلن آبرسانی',
          text: 'جهت استفاده در شبکه‌های انتقال و توزیع آب و پروژه‌های آبرسانی، متناسب با فشار کاری و مشخصات فنی مورد نیاز.',
          link: '',
        },
      ],
      closing: `<h2>سخن پایانی</h2>
<p>اعتماد مشتریان، اعتبار تولیدکننده و کیفیت محصولات، سه اصل اساسی همکاری ما هستند.</p>
<p>شرکت قدیر لوله پاسارگاد با معرفی مجموعه قدیر لوله آنلاین به‌عنوان درگاه رسمی و اختصاصی عرضه آنلاین محصولات خود، در مسیر توسعه خدمات، افزایش دسترسی مشتریان و ایجاد تجربه‌ای مطمئن‌تر در خرید محصولات صنعت لوله گام برداشته است.</p>
<p><strong>قدیر لوله آنلاین؛ ارتباط مستقیم شما با محصولات قدیر لوله پاسارگاد.</strong></p>`,
      regards: 'با احترام',
      signerRole: 'مدیریت قدیر لوله پاسارگاد',
      signerName: 'جمشید شاطری',
      published: '2026-11-06',
    },
    en: {
      note: 'Unofficial English translation; the Persian text is the official version.',
      opening: `<p><strong>Ghadir Louleh Pasargad</strong>, as a manufacturer and supplier of specialised products for the pipe and infrastructure industry, has established an official partnership with <strong>Qadir Lule Online</strong> in order to expand its sales network, make its products easier for customers to obtain, and provide professional services to those working in construction and on civil engineering projects.</p>
<blockquote>Accordingly, Qadir Lule Online, managed by Mr. Amir Yousefi, is hereby introduced as the official and exclusive sales and online distribution agent for Ghadir Louleh Pasargad products.</blockquote>
<p>Drawing on the production capacity and the technical and commercial backing of Ghadir Louleh Pasargad, Qadir Lule Online is responsible for offering, presenting, marketing and following up the supply of this company’s products online.</p>
<h2>Our commitment to customers</h2>
<p>At Ghadir Louleh Pasargad, we believe that supplying high-quality products, providing accurate technical information and building confidence in the purchasing process are among the most important principles of a long-term partnership with our customers.</p>
<p>To this end, Qadir Lule Online operates as the official channel for contact and online sales of our products, with the following goals:</p>`,
      goals: [
        { id: 'genuine', text: 'Offering genuine, approved Ghadir Louleh Pasargad products' },
        { id: 'technical', text: 'Providing technical information and product specifications' },
        { id: 'inquiries', text: 'Following up price and stock inquiries' },
        { id: 'supply', text: 'Coordinating the supply and shipping of orders' },
        { id: 'support', text: 'Supporting and responding to customers and civil engineering projects' },
        { id: 'bulk', text: 'Creating a reliable platform for bulk purchasing and direct supply of products' },
      ],
      productsIntro: `<h2>Product range</h2>
<p>Backed by its official partnership with Ghadir Louleh Pasargad, Qadir Lule Online supplies the following products:</p>`,
      products: [
        {
          id: 'corrugated',
          title: 'Corrugated pipes (double-wall polyethylene)',
          text: 'In a range of sizes, for a variety of uses in sewage collection and conveyance networks, drainage and infrastructure projects.',
        },
        {
          id: 'spiral',
          title: 'Polyethylene spiral pipes',
          text: 'Suitable for large civil engineering projects, conveyance networks and specialised infrastructure.',
        },
        {
          id: 'water',
          title: 'Polyethylene water supply pipes',
          text: 'For water transmission and distribution networks and water supply projects, matched to the required working pressure and technical specifications.',
        },
      ],
      closing: `<h2>Closing remarks</h2>
<p>Customer trust, the manufacturer’s credibility and product quality are the three fundamental principles of our partnership.</p>
<p>By introducing Qadir Lule Online as the official and exclusive gateway for the online sale of its products, Ghadir Louleh Pasargad has taken a step towards expanding its services, improving customer access and creating a more reliable purchasing experience for pipe industry products.</p>
<p><strong>Qadir Lule Online: your direct connection to Ghadir Louleh Pasargad products.</strong></p>`,
      regards: 'Sincerely,',
      signerRole: 'Management, Ghadir Louleh Pasargad',
      signerName: 'Jamshid Shateri',
      published: '2026-11-06',
    },
  },
});

export const officialRepresentativeAside = defineSection({
  key: 'official-representative.aside',
  title: 'ستون کناری (گواهی و لینک‌ها)',
  fields: {
    image: { type: 'image', label: 'تصویر گواهی نمایندگی', hint: 'عکس اشتراک‌گذاری صفحه هم همین است.' },
    imageAlt: { type: 'text', label: 'متن جایگزین تصویر' },
    caption: { type: 'text', label: 'زیرنویس تصویر' },
    manufacturerLabel: { type: 'text', label: 'متن دکمه سایت رسمی کارخانه' },
    certificatesLabel: { type: 'text', label: 'متن دکمه گواهینامه‌ها' },
    factoryLabel: { type: 'text', label: 'متن دکمه صفحه کارخانه' },
  },
  defaults: {
    fa: {
      image: '/images/site/representation-certificate.webp',
      imageAlt: 'گواهی نمایندگی قدیر لوله آنلاین به مدیریت امیر یوسفی از قدیر لوله پاسارگاد',
      caption: 'گواهی نمایندگی صادرشده از قدیر لوله پاسارگاد',
      manufacturerLabel: 'وب‌سایت رسمی قدیر لوله پاسارگاد',
      certificatesLabel: 'گواهینامه‌ها و استانداردهای کارخانه',
      factoryLabel: 'کارخانه و توانمندی تأمین',
    },
    en: {
      imageAlt: 'Agency certificate issued by Ghadir Louleh Pasargad to Qadir Lule Online, managed by Amir Yousefi',
      caption: 'Agency certificate issued by Ghadir Louleh Pasargad',
      manufacturerLabel: 'Official Ghadir Louleh Pasargad website',
      certificatesLabel: 'Factory certificates and standards',
      factoryLabel: 'Factory and supply capacity',
    },
  },
});

export const officialRepresentativePage: ContentPage = {
  key: 'official-representative',
  title: 'پیام رسمی نمایندگی',
  path: '/official-representative',
  sections: [officialRepresentativeSeo, officialRepresentativeHero, officialRepresentativeLetter, officialRepresentativeAside],
};
