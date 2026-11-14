'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export type AdminUser = { id: string; name: string; email: string; role: 'ADMIN' | 'EDITOR' | 'VIEWER' };

const AdminUserContext = createContext<AdminUser | null>(null);

/** کاربر واردشده برای نمایش نام و پنهان کردن بخش‌های مخصوص مدیر کل — بررسی واقعی دسترسی در API است */
export function AdminUserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((j) => j.success && setUser(j.data))
      .catch(() => {});
  }, []);

  return <AdminUserContext.Provider value={user}>{children}</AdminUserContext.Provider>;
}

export function useAdminUser() {
  return useContext(AdminUserContext);
}
