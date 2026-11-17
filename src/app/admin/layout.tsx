import type { Metadata } from 'next';
import { RootDocument } from '@/shared/ui/RootDocument';
import { AdminShell } from '@/widgets/admin/AdminShell';
import { getSiteSettingsMap } from '@/shared/lib/site-settings-store';
import { mergeSiteSettings } from '@/shared/lib/site-settings';
import { iconMetadata } from '@/shared/lib/site-icon';

export async function generateMetadata(): Promise<Metadata> {
  const settings = mergeSiteSettings(await getSiteSettingsMap());
  return {
    title: 'پنل مدیریت',
    robots: { index: false, follow: false },
    icons: iconMetadata(settings.iconVersion),
  };
}

/** پنل root layout جداست (بیرون از [lang])؛ همیشه فارسی و راست‌به‌چپ */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RootDocument lang="fa" dir="rtl">
      <AdminShell>{children}</AdminShell>
    </RootDocument>
  );
}
