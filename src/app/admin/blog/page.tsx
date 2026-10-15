'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { m as motion } from 'framer-motion';
import { Plus, Search, Pencil, Trash2, Eye, FileText, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '@/shared/lib/utils';
import { useConfirm } from '@/shared/ui/ConfirmDialog';

type BlogRow = {
  id: string;
  slug: string;
  title: string;
  published: boolean;
  featured: boolean;
  viewCount: number;
  createdAt: string;
  author?: { name: string };
};

export default function AdminBlogPage() {
  const confirm = useConfirm();

  const [search, setSearch] = useState('');
  const [posts, setPosts] = useState<BlogRow[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/blog?admin=true&limit=100');
      const json = await res.json();
      if (json.success) {
        setPosts(json.data);
      } else {
        toast.error(json.error || 'بارگذاری مقالات ناموفق بود');
      }
    } catch {
      toast.error('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const filtered = posts.filter((p) => p.title.includes(search));

  const handleDelete = async (slug: string, title: string) => {
    if (!(await confirm({ title: `مقاله «${title}» حذف شود؟` }))) return;

    try {
      const res = await fetch(`/api/blog/${encodeURIComponent(slug)}`, { method: 'DELETE' });
      const json = await res.json();

      if (!res.ok || !json.success) {
        toast.error(json.error || 'حذف ناموفق بود');
        return;
      }

      toast.success('مقاله حذف شد');
      setPosts((prev) => prev.filter((p) => p.slug !== slug));
    } catch {
      toast.error('خطا در ارتباط با سرور');
    }
  };

  return (
    <motion.div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">مدیریت وبلاگ</h1>
          <p className="text-[var(--muted-foreground)] text-sm mt-1">
            {loading ? 'در حال بارگذاری...' : `${posts.length} مقاله در سیستم`}
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] font-semibold hover:bg-[var(--accent)]/90 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          مقاله جدید
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="جستجو در مقالات..."
          className="w-full h-11 bg-[var(--card)] border border-[var(--border)] rounded-xl pr-12 pl-4 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none"
        />
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
        {loading ? (
          <motion.div className="flex items-center justify-center py-16 text-[var(--muted-foreground)] gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            بارگذاری مقالات...
          </motion.div>
        ) : filtered.length === 0 ? (
          <motion.div className="text-center py-16 text-[var(--muted-foreground)]">
            مقاله‌ای یافت نشد. اولین مقاله را بسازید.
          </motion.div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[44rem] text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)] text-right">
                  <th className="px-6 py-4 font-medium">عنوان</th>
                  <th className="px-6 py-4 font-medium">نویسنده</th>
                  <th className="px-6 py-4 font-medium">تاریخ</th>
                  <th className="px-6 py-4 font-medium">بازدید</th>
                  <th className="px-6 py-4 font-medium">وضعیت</th>
                  <th className="px-6 py-4 font-medium">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((post, i) => (
                  <motion.tr
                    key={post.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-[var(--border)]/50 hover:bg-[var(--muted)]/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--muted)] flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-[var(--muted-foreground)]" />
                        </div>
                        <div>
                          <div className="text-[var(--foreground)] font-medium line-clamp-1">{post.title}</div>
                          {post.featured && <span className="text-xs text-[var(--accent-text)]">⭐ ویژه</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[var(--muted-foreground)]">{post.author?.name ?? '—'}</td>
                    <td className="px-6 py-4 text-[var(--muted-foreground)]">{formatDate(post.createdAt)}</td>
                    <td className="px-6 py-4 text-[var(--muted-foreground)]">{post.viewCount}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          post.published ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400' : 'bg-[var(--border)] text-[var(--muted-foreground)]'
                        }`}
                      >
                        {post.published ? 'منتشر شده' : 'پیش‌نویس'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {post.published && (
                          <Link
                            href={`/blog/${encodeURIComponent(post.slug)}`}
                            target="_blank"
                            className="w-8 h-8 rounded-lg bg-[var(--muted)] flex items-center justify-center text-[var(--muted-foreground)] hover:text-blue-700 dark:hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        )}
                        <Link
                          href={`/admin/blog/${encodeURIComponent(post.slug)}/edit`}
                          className="w-8 h-8 rounded-lg bg-[var(--muted)] flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--accent-text)] hover:bg-[var(--accent)]/10 transition-all"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(post.slug, post.title)}
                          className="w-8 h-8 rounded-lg bg-[var(--muted)] flex items-center justify-center text-[var(--muted-foreground)] hover:text-red-700 dark:hover:text-red-400 hover:bg-red-500/10 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}
