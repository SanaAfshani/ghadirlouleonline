import { Header } from '@/widgets/header/Header';
import { MobileBottomNav } from '@/widgets/header/MobileBottomNav';
import { FloatingContact } from '@/widgets/header/FloatingContact';
import { Footer } from '@/widgets/footer/Footer';
import { getNavCategories, getSiteSettingsMap } from '@/shared/lib/data';
import { mergeSiteSettings } from '@/shared/lib/site-settings';
import { SiteSettingsProvider } from '@/shared/providers/SiteSettingsProvider';
import { ConsultProvider } from '@/features/consult/ConsultProvider';
import { QuoteCartProvider } from '@/features/quotes/QuoteCartProvider';
import { LeadTracker } from '@/features/leads/LeadTracker';
import { RouteSkeleton } from '@/shared/ui/RouteSkeleton';
import { ImageGuard } from '@/shared/ui/ImageGuard';

/**
 * این لایه عمداً force-dynamic ندارد.
 *
 * قبلاً داشت و چون تنظیمِ لایه بر همه صفحات زیرش غالب است، کل سایت در هر درخواست از نو رندر
 * می‌شد؛ یعنی هر بازدید و هر خزش مستقیم به پستگرس می‌خورد. نتیجه‌اش در Search Console دیده
 * می‌شد: صفحه دسته و محصول «لوله کاروگیت» با وضعیت Discovered و آخرین خزش N/A مانده بودند —
 * گوگل آدرس را دیده بود ولی چون سرور کند جواب می‌داد نرخ خزش را پایین آورده و هیچ‌وقت سراغشان نرفته بود.
 *
 * حالا هر صفحه خودش تصمیم می‌گیرد: جدول قیمت داینامیک می‌ماند، بقیه با revalidate کش می‌شوند.
 */

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // دسته‌ها سمت سرور گرفته می‌شوند تا لینک‌های منو در HTML اولیه باشند (برای خزنده گوگل و بدون پرش صفحه)
  const [raw, categories] = await Promise.all([getSiteSettingsMap(), getNavCategories()]);
  const settings = mergeSiteSettings(raw);

  return (
    <SiteSettingsProvider settings={settings}>
      {/* .site: لایه طراحی صنعتی سایت عمومی (globals.css) — contents یعنی بدون اثر روی چیدمان */}
      <div className="site contents">
        <ConsultProvider>
          <QuoteCartProvider>
            <div className="flex flex-col min-h-screen">
              <Header categories={categories} />
              <main className="flex-1 pt-[var(--nav-height)]">{children}</main>
              <RouteSkeleton />
              <ImageGuard />
              <Footer categories={categories} />
            </div>
            <MobileBottomNav />
            <FloatingContact />
            <LeadTracker />
          </QuoteCartProvider>
        </ConsultProvider>
      </div>
    </SiteSettingsProvider>
  );
}
