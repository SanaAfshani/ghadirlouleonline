'use client';

import { useCallback, useEffect, useState } from 'react';
import { m as motion } from 'framer-motion';
import Link from 'next/link';
import { Plus, Search, Trash2, Building2, MapPin, Loader2, Pencil, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatPersianNumber } from '@/shared/lib/utils';
import type { Project } from '@/shared/types';
import { useConfirm } from '@/shared/ui/ConfirmDialog';

export default function AdminProjectsPage() {
  const confirm = useConfirm();

  const [search, setSearch] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const togglePublished = async (project: Project) => {
    setTogglingId(project.id);
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !project.published }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error || 'به‌روزرسانی ناموفق بود');
        return;
      }
      setProjects((prev) =>
        prev.map((p) => (p.id === project.id ? { ...p, published: !p.published } : p)),
      );
    } catch {
      toast.error('خطا در ارتباط با سرور');
    } finally {
      setTogglingId(null);
    }
  };

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/projects?admin=true');
      const json = await res.json();
      if (json.success) {
        setProjects(json.data);
      } else {
        toast.error(json.error || 'بارگذاری پروژه‌ها ناموفق بود');
      }
    } catch {
      toast.error('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const filtered = projects.filter(
    (p) =>
      p.title.includes(search) ||
      (p.location && p.location.includes(search)),
  );

  const handleDelete = async (id: string, title: string) => {
    if (!(await confirm({ title: `پروژه «${title}» حذف شود؟` }))) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      const json = await res.json();

      if (!res.ok || !json.success) {
        toast.error(json.error || 'حذف ناموفق بود');
        return;
      }

      toast.success('پروژه حذف شد');
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch {
      toast.error('خطا در ارتباط با سرور');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">مدیریت پروژه‌ها</h1>
          <p className="text-[var(--muted-foreground)] text-sm mt-1">
            {loading ? 'در حال بارگذاری...' : `${projects.length} پروژه در سیستم`}
          </p>
        </div>
        <Link
          href="/admin/projects/new"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] font-semibold hover:bg-[var(--accent)]/90 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          پروژه جدید
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="جستجو در پروژه‌ها..."
          className="w-full h-11 bg-[var(--card)] border border-[var(--border)] rounded-xl pr-12 pl-4 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none"
        />
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-[var(--muted-foreground)] gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            بارگذاری پروژه‌ها...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-[var(--muted-foreground)]">پروژه‌ای یافت نشد.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[44rem] text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)] text-right">
                  <th className="px-6 py-4 font-medium">پروژه</th>
                  <th className="px-6 py-4 font-medium">موقعیت</th>
                  <th className="px-6 py-4 font-medium">سال</th>
                  <th className="px-6 py-4 font-medium">وضعیت</th>
                  <th className="px-6 py-4 font-medium">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((project, i) => (
                  <motion.tr
                    key={project.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-[var(--border)]/50 hover:bg-[var(--muted)]/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--muted)] flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-5 h-5 text-[var(--muted-foreground)]" />
                        </div>
                        <div>
                          <div className="text-[var(--foreground)] font-medium">{project.title}</div>
                          {project.featured && <span className="text-xs text-[var(--accent-text)]">⭐ ویژه</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-[var(--muted-foreground)]">
                        <MapPin className="w-3.5 h-3.5" />
                        {project.location || '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[var(--muted-foreground)]">{formatPersianNumber(project.year)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          project.published ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400' : 'bg-[var(--border)] text-[var(--muted-foreground)]'
                        }`}
                      >
                        {project.published ? 'منتشر شده' : 'پیش‌نویس'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {project.published && (
                          <Link
                            href={`/projects/${project.slug}`}
                            target="_blank"
                            className="w-8 h-8 rounded-lg bg-[var(--muted)] flex items-center justify-center text-[var(--muted-foreground)] hover:text-blue-700 dark:hover:text-blue-400"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        )}
                        <Link
                          href={`/admin/projects/${project.id}/edit`}
                          className="w-8 h-8 rounded-lg bg-[var(--muted)] flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--accent-text)]"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          disabled={togglingId === project.id}
                          onClick={() => togglePublished(project)}
                          className="text-xs px-2 py-1 rounded-lg bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] disabled:opacity-50"
                        >
                          {togglingId === project.id ? '...' : project.published ? 'پیش‌نویس' : 'انتشار'}
                        </button>
                        <button
                          type="button"
                          disabled={deletingId === project.id}
                          onClick={() => handleDelete(project.id, project.title)}
                          className="w-8 h-8 rounded-lg bg-[var(--muted)] flex items-center justify-center text-[var(--muted-foreground)] hover:text-red-700 dark:hover:text-red-400 disabled:opacity-50"
                        >
                          {deletingId === project.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
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
    </div>
  );
}
