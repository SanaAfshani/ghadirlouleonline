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

/** Render at request time — required for Prisma/Postgres on Vercel */
export const dynamic = 'force-dynamic';

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
