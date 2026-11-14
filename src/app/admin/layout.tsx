import type { Metadata } from 'next';
import { RootDocument } from '@/shared/ui/RootDocument';
import { AdminShell } from '@/widgets/admin/AdminShell';

export const metadata: Metadata = {
  title: 'پنل مدیریت',
  robots: { index: false, follow: false },
};

/** پنل root layout جداست (بیرون از [lang])؛ همیشه فارسی و راست‌به‌چپ */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RootDocument lang="fa" dir="rtl">
      <AdminShell>{children}</AdminShell>
    </RootDocument>
  );
}
