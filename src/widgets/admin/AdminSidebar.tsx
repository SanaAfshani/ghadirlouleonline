'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { m as motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Package, Layers, FileText, FileSpreadsheet, HelpCircle,
  Star, Building2, MessageSquare, Settings, Users, LogOut,
  Menu, Palette, ChevronLeft, SearchCheck, CandlestickChart, PhoneCall, BadgeCheck, GalleryHorizontal, Sparkles, LayoutTemplate, Languages, ShoppingBag } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import toast from 'react-hot-toast';
import { useAdminNotifications } from '@/widgets/admin/AdminNotifications';
import { logoutAdmin } from '@/widgets/admin/logout';
import { useAdminUser } from '@/widgets/admin/AdminUser';
import { DEFAULT_LOGO } from '@/shared/lib/site-settings';

/** لوگوی تنظیم‌شده در پنل (تنظیمات ← لوگو و آیکون)؛ تا رسیدن پاسخ، لوگوی پیش‌فرض */
function useSiteLogo() {
  const [logo, setLogo] = useState(DEFAULT_LOGO);
  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((j) => typeof j?.data?.site_logo === 'string' && j.data.site_logo && setLogo(j.data.site_logo))
      .catch(() => {});
  }, []);
  return logo;
}
import { faDigits } from '@/shared/lib/utils';

/** adminOnly: فقط مدیر کل (API همین بخش‌ها برای ویرایشگر ۴۰۳ می‌دهد؛ این‌جا فقط از منو پنهان می‌شوند) */
const navGroups: { label: string; items: { href: string; label: string; icon: React.ElementType; exact?: boolean; adminOnly?: boolean }[] }[] = [
  {
    label: 'داشبورد',
    items: [
      { href: '/admin', label: 'داشبورد', icon: LayoutDashboard, exact: true },
      { href: '/admin/leads', label: 'گزارش تماس‌ها', icon: PhoneCall },
    ],
  },
  {
    label: 'فروش',
    items: [
      { href: '/admin/prices', label: 'تابلوی قیمت', icon: CandlestickChart },
      { href: '/admin/quotes', label: 'پیش‌فاکتورها', icon: FileSpreadsheet },
      { href: '/admin/messages', label: 'پیام‌ها', icon: MessageSquare },
    ],
  },
  {
    label: 'کاتالوگ',
    items: [
      { href: '/admin/products', label: 'محصولات', icon: Package },
      { href: '/admin/categories', label: 'دسته‌بندی‌ها', icon: Layers },
    ],
  },
  {
    label: 'محتوای سایت',
    items: [
      { href: '/admin/content', label: 'محتوای صفحات', icon: LayoutTemplate },
      { href: '/admin/translations', label: 'ترجمه انگلیسی', icon: Languages, adminOnly: true },
      { href: '/admin/hero', label: 'اسلایدر هرو', icon: GalleryHorizontal },
      { href: '/admin/certificates', label: 'گواهینامه‌ها', icon: BadgeCheck },
      { href: '/admin/blog', label: 'وبلاگ', icon: FileText },
      { href: '/admin/youtix', label: 'یوتیکس (تولید مقاله)', icon: Sparkles, exact: true },
      { href: '/admin/youtix/products', label: 'یوتیکس (سئوی محصولات)', icon: ShoppingBag },
      { href: '/admin/projects', label: 'پروژه‌ها', icon: Building2 },
      { href: '/admin/faq', label: 'سوالات متداول', icon: HelpCircle },
      { href: '/admin/testimonials', label: 'نظرات', icon: Star },
    ],
  },
  {
    label: 'تنظیمات',
    items: [
      { href: '/admin/settings', label: 'تنظیمات عمومی', icon: Settings, adminOnly: true },
      { href: '/admin/seo', label: 'مرکز سئو', icon: SearchCheck, adminOnly: true },
      { href: '/admin/theme', label: 'رنگ‌بندی سایت', icon: Palette, adminOnly: true },
      { href: '/admin/users', label: 'کاربران', icon: Users, adminOnly: true },
    ],
  },
];

function NavItem({
  href,
  label,
  icon: Icon,
  exact,
  collapsed,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
  collapsed: boolean;
}) {
  const pathname = usePathname();
  const { unread, pendingQuotes } = useAdminNotifications();
  const badge =
    href === '/admin/messages' && unread > 0 ? unread
      : href === '/admin/quotes' && pendingQuotes > 0 ? pendingQuotes
        : 0;
  const active = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={cn(
        'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
        collapsed ? 'justify-center px-2' : '',
        active
          ? 'bg-[var(--accent)]/15 text-[var(--accent-text)]'
          : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]',
      )}
    >
      {active && (
        <motion.span
          layoutId="activeNav"
          className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-l-full bg-[var(--accent)]"
        />
      )}
      <Icon
        className={cn(
          'flex-shrink-0 transition-colors',
          active ? 'text-[var(--accent-text)]' : 'text-[var(--muted-foreground)] group-hover:text-[var(--foreground)]',
          collapsed ? 'w-5 h-5' : 'w-4 h-4',
        )}
      />
      {!collapsed && <span className="truncate">{label}</span>}
      {badge > 0 && (
        <span className={cn('min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-[11px] font-bold grid place-items-center num', collapsed ? 'absolute top-0.5 left-0.5' : 'mr-auto')}>
          {faDigits(badge)}
        </span>
      )}
      {!collapsed && active && !badge && (
        <ChevronLeft className="w-3.5 h-3.5 mr-auto text-[var(--accent-text)]/60" />
      )}

      {collapsed && (
        <div className="absolute right-full mr-3 px-2.5 py-1.5 rounded-lg bg-[var(--muted)] text-[var(--foreground)] text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-[var(--border)] shadow-lg z-50">
          {label}
          <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[var(--muted)]" />
        </div>
      )}
    </Link>
  );
}

type SidebarProps = {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
};

function SidebarContent({ collapsed, onToggleCollapse, onLogout }: { collapsed: boolean; onToggleCollapse?: () => void; onLogout: () => void }) {
  const user = useAdminUser();
  const logo = useSiteLogo();
  // تا نقش معلوم نشده، بخش‌های مدیر کل پنهان می‌مانند (بعد از رسیدن نقش ظاهر می‌شوند، نه برعکس)
  const groups = navGroups
    .map((group) => ({ ...group, items: group.items.filter((item) => !item.adminOnly || user?.role === 'ADMIN') }))
    .filter((group) => group.items.length);
  return (
    <div className="flex flex-col h-full bg-[var(--background)] border-l border-[var(--border)]/80">
      {/* Logo + Toggle */}
      <div
        className={cn(
          'flex items-center h-16 px-4 border-b border-[var(--border)]/80 flex-shrink-0',
          collapsed ? 'justify-center' : 'justify-between',
        )}
      >
        {!collapsed && (
          <div className="flex items-center gap-3 min-w-0">
            <Image src={logo} alt="" width={36} height={36} className="w-9 h-9 object-contain flex-shrink-0" />
            <div className="min-w-0">
              <div className="font-bold text-[var(--foreground)] text-sm truncate">قدیر لوله آنلاین</div>
              <div className="text-[var(--muted-foreground)] text-xs">پنل مدیریت</div>
            </div>
          </div>
        )}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'باز کردن منو' : 'جمع کردن منو'}
            className="flex w-8 h-8 rounded-lg items-center justify-center text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-all flex-shrink-0"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {groups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <div className="text-[var(--muted-foreground)] text-[10px] font-semibold uppercase tracking-widest px-3 mb-2">
                {group.label}
              </div>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavItem key={item.href} href={item.href} label={item.label} icon={item.icon} exact={item.exact} collapsed={collapsed} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom actions */}
      <div
        className={cn(
          'p-3 border-t border-[var(--border)]/80 space-y-0.5',
          collapsed && 'flex flex-col items-center',
        )}
      >
        <button
          onClick={onLogout}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[var(--muted-foreground)] hover:bg-red-500/10 hover:text-red-700 dark:hover:text-red-400 transition-all w-full',
            collapsed && 'justify-center px-2 w-auto',
          )}
          title={collapsed ? 'خروج' : undefined}
        >
          <LogOut className={cn('flex-shrink-0', collapsed ? 'w-5 h-5' : 'w-4 h-4')} />
          {!collapsed && 'خروج از حساب'}
        </button>
      </div>
    </div>
  );
}

/** وضعیت باز/بسته در layout است تا دکمه منوی موبایل داخل هدر باشد و فاصله محتوا با عرض واقعی منو هماهنگ بماند */
export function AdminSidebar({ collapsed, onToggleCollapse, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    onMobileClose();
  }, [pathname, onMobileClose]);

  const handleLogout = async () => {
    await logoutAdmin();
    toast.success('با موفقیت خارج شدید');
    router.push('/admin/login');
  };

  return (
    <>
      {/* Desktop sidebar */}
      <motion.div
        animate={{ width: collapsed ? 68 : 256 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="hidden lg:block fixed right-0 top-0 bottom-0 z-30 overflow-hidden"
      >
        <SidebarContent collapsed={collapsed} onToggleCollapse={onToggleCollapse} onLogout={handleLogout} />
      </motion.div>

      {/* Mobile drawer — حالت جمع‌شده در موبایل معنا ندارد */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/60 z-40"
              onClick={onMobileClose}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="lg:hidden fixed top-0 right-0 bottom-0 w-72 max-w-[85vw] z-50"
            >
              <SidebarContent collapsed={false} onLogout={handleLogout} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
