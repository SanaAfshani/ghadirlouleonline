'use client';

import { m as motion } from 'framer-motion';
import Link from 'next/link';
import {
  Package, FileText, MessageSquare, Building2, Eye, ArrowLeft,
  FolderOpen, CheckCircle, Clock,
} from 'lucide-react';

type DashboardData = {
  productCount: number;
  publishedProductCount: number;
  blogCount: number;
  publishedBlogCount: number;
  messageCount: number;
  unreadMessageCount: number;
  projectCount: number;
  categoryCount: number;
  recentMessages: { id: string; name: string; subject: string | null; createdAt: Date; read: boolean }[];
  recentProducts: { id: string; name: string; createdAt: Date }[];
  recentPosts: { id: string; title: string; createdAt: Date; published: boolean }[];
};

const colorMap: Record<string, { bg: string; text: string; ring: string }> = {
  amber:  { bg: 'bg-[var(--accent)]/10',  text: 'text-[var(--accent-text)]',  ring: 'ring-[var(--accent)]/20' },
  blue:   { bg: 'bg-blue-500/10',   text: 'text-blue-700 dark:text-blue-400',   ring: 'ring-blue-500/20' },
  rose:   { bg: 'bg-rose-500/10',   text: 'text-rose-700 dark:text-rose-400',   ring: 'ring-rose-500/20' },
  green:  { bg: 'bg-green-500/10',  text: 'text-green-700 dark:text-green-400',  ring: 'ring-green-500/20' },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-700 dark:text-purple-400', ring: 'ring-purple-500/20' },
};

function timeAgo(date: Date): string {
  const now = new Date();
  const diff = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
  if (diff < 60) return 'چند لحظه پیش';
  if (diff < 3600) return `${Math.floor(diff / 60)} دقیقه پیش`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ساعت پیش`;
  if (diff < 172800) return 'دیروز';
  return `${Math.floor(diff / 86400)} روز پیش`;
}

const quickActions = [
  { href: '/admin/products/new', label: 'محصول جدید', icon: Package, color: 'amber' },
  { href: '/admin/blog/new', label: 'مقاله جدید', icon: FileText, color: 'blue' },
  { href: '/admin/projects/new', label: 'پروژه جدید', icon: Building2, color: 'green' },
  { href: '/admin/messages', label: 'مشاهده پیام‌ها', icon: MessageSquare, color: 'rose' },
];

export function AdminDashboardClient({ data }: { data: DashboardData }) {
  const {
    productCount, publishedProductCount,
    blogCount, publishedBlogCount,
    unreadMessageCount, messageCount,
    projectCount, categoryCount,
    recentMessages, recentProducts, recentPosts,
  } = data;

  const stats = [
    {
      title: 'کل محصولات',
      value: productCount,
      sub: `${publishedProductCount} منتشر شده`,
      icon: Package,
      color: 'amber',
      href: '/admin/products',
    },
    {
      title: 'مقالات وبلاگ',
      value: blogCount,
      sub: `${publishedBlogCount} منتشر شده`,
      icon: FileText,
      color: 'blue',
      href: '/admin/blog',
    },
    {
      title: 'پیام‌های دریافتی',
      value: messageCount,
      sub: `${unreadMessageCount} در انتظار تماس`,
      icon: MessageSquare,
      color: 'rose',
      href: '/admin/messages',
    },
    {
      title: 'پروژه‌ها',
      value: projectCount,
      sub: `${categoryCount} دسته‌بندی`,
      icon: Building2,
      color: 'green',
      href: '/admin/projects',
    },
  ];

  const recentActivity = [
    ...recentProducts.map((p) => ({
      text: `محصول "${p.name}" اضافه شد`,
      time: timeAgo(p.createdAt),
      type: 'product' as const,
    })),
    ...recentPosts.map((p) => ({
      text: `مقاله "${p.title}" ${p.published ? 'منتشر شد' : 'ذخیره شد'}`,
      time: timeAgo(p.createdAt),
      type: 'post' as const,
    })),
  ]
    .sort((a, b) => a.time.localeCompare(b.time))
    .slice(0, 5);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--foreground)]">داشبورد</h1>
          <p className="text-[var(--muted-foreground)] text-sm mt-0.5">خوش آمدید! وضعیت کلی سایت را مشاهده کنید.</p>
        </div>
        <Link
          href="/"
          target="_blank"
          className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--muted)] text-[var(--foreground)] hover:text-[var(--foreground)] text-sm transition-colors"
        >
          <Eye className="w-4 h-4" />
          مشاهده سایت
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const colors = colorMap[stat.color];
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Link
                href={stat.href}
                className="block bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 hover:border-[var(--border)] transition-all group hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ring-1 ${colors.bg} ${colors.text} ${colors.ring}`}
                  >
                    <stat.icon className="w-5 h-5" />
                  </div>
                  {stat.color === 'rose' && unreadMessageCount > 0 && (
                    <span className="text-xs bg-rose-500/15 text-rose-700 dark:text-rose-400 px-2 py-0.5 rounded-full border border-rose-500/20">
                      {unreadMessageCount} جدید
                    </span>
                  )}
                </div>
                <div className="text-2xl font-black text-[var(--foreground)] mb-0.5">{stat.value}</div>
                <div className="text-[var(--muted-foreground)] text-xs">{stat.title}</div>
                <div className="text-[var(--muted-foreground)] text-xs mt-1">{stat.sub}</div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Recent messages */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="xl:col-span-2 bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[var(--foreground)]">آخرین پیام‌ها</h2>
            <Link
              href="/admin/messages"
              className="text-[var(--accent-text)] hover:text-[var(--accent-text)] text-xs transition-colors flex items-center gap-1"
            >
              مشاهده همه <ArrowLeft className="w-3 h-3" />
            </Link>
          </div>
          {recentMessages.length === 0 ? (
            <p className="text-[var(--muted-foreground)] text-sm text-center py-8">هنوز پیامی دریافت نشده</p>
          ) : (
            <div className="space-y-2">
              {recentMessages.map((msg, i) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 + 0.35 }}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--muted)]/50 transition-colors"
                >
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${!msg.read ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium truncate ${!msg.read ? 'text-[var(--foreground)]' : 'text-[var(--muted-foreground)]'}`}>
                      {msg.name}
                    </div>
                    <div className="text-[var(--muted-foreground)] text-xs truncate">{msg.subject || '(بدون موضوع)'}</div>
                  </div>
                  <span className="text-[var(--muted-foreground)] text-xs flex-shrink-0">{timeAgo(msg.createdAt)}</span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6"
        >
          <h2 className="font-semibold text-[var(--foreground)] mb-4">دسترسی سریع</h2>
          <div className="grid grid-cols-2 gap-2.5">
            {quickActions.map((action) => {
              const colors = colorMap[action.color];
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex flex-col items-center gap-2.5 p-4 rounded-xl bg-[var(--muted)]/50 hover:bg-[var(--muted)] border border-[var(--border)]/50 hover:border-[var(--border)] transition-all group text-center"
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${colors.bg} ${colors.text} group-hover:scale-110 transition-transform`}
                  >
                    <action.icon className="w-4 h-4" />
                  </div>
                  <span className="text-[var(--muted-foreground)] text-xs font-medium group-hover:text-[var(--foreground)] transition-colors">
                    {action.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Recent activity */}
      {recentActivity.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6"
        >
          <h2 className="font-semibold text-[var(--foreground)] mb-4">آخرین افزوده‌ها</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-[var(--muted)]/40">
                <div className="mt-1.5 flex-shrink-0">
                  {item.type === 'product' ? (
                    <Package className="w-3.5 h-3.5 text-[var(--accent-text)]" />
                  ) : (
                    <FileText className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[var(--foreground)] text-xs leading-relaxed truncate">{item.text}</p>
                  <span className="text-[var(--muted-foreground)] text-xs">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
