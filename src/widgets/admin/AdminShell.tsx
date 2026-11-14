'use client';

import { useCallback, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AdminSidebar } from '@/widgets/admin/AdminSidebar';
import { AdminHeader } from '@/widgets/admin/AdminHeader';
import { AdminNotificationsProvider } from '@/widgets/admin/AdminNotifications';
import { AdminUserProvider } from '@/widgets/admin/AdminUser';
import { ConfirmProvider } from '@/shared/ui/ConfirmDialog';
import { cn } from '@/shared/lib/utils';

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  // Login page must render standalone — no sidebar, no header
  if (pathname === '/admin/login') {
    return <div className="site contents">{children}</div>;
  }

  return (
    // .site: همان لایه طراحی سایت عمومی (پالت، گوشه‌ها، رنگ آکسنت) — پنل و سایت یک تم دارند
    <div className="site contents">
      <AdminUserProvider>
      <AdminNotificationsProvider>
        <ConfirmProvider>
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex" dir="rtl">
          <AdminSidebar
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed((v) => !v)}
            mobileOpen={mobileOpen}
            onMobileClose={closeMobile}
          />
          <div className={cn('flex-1 flex flex-col min-w-0 transition-[margin] duration-300', collapsed ? 'lg:mr-[68px]' : 'lg:mr-64')}>
            <AdminHeader onMenu={() => setMobileOpen(true)} />
            <main className="flex-1 p-3 sm:p-5 md:p-6 min-w-0">{children}</main>
          </div>
        </div>
        </ConfirmProvider>
      </AdminNotificationsProvider>
      </AdminUserProvider>
    </div>
  );
}
