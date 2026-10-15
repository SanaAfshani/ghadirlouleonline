'use client';

import { useCallback, useEffect, useState } from 'react';
import { m as motion } from 'framer-motion';
import { Plus, Search, Trash2, Layers, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { slugify } from '@/shared/lib/utils';
import type { Category } from '@/shared/types';
import { useConfirm } from '@/shared/ui/ConfirmDialog';

type CategoryRow = Category & { _count?: { products: number } };

export default function AdminCategoriesPage() {
  const confirm = useConfirm();

  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/categories?admin=true');
      const json = await res.json();
      if (json.success) {
        setCategories(json.data);
      } else {
        toast.error(json.error || 'بارگذاری دسته‌بندی‌ها ناموفق بود');
      }
    } catch {
      toast.error('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const filtered = categories.filter((c) => c.name.includes(search));

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setSaving(true);
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          slug: slugify(newName),
          published: true,
        }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        toast.error(json.error || 'افزودن دسته‌بندی ناموفق بود');
        return;
      }

      toast.success(`دسته‌بندی «${newName}» اضافه شد!`);
      setNewName('');
      setShowForm(false);
      loadCategories();
    } catch {
      toast.error('خطا در ارتباط با سرور');
    } finally {
      setSaving(false);
    }
  };

  const togglePublished = async (cat: CategoryRow) => {
    setTogglingId(cat.id);
    try {
      const res = await fetch(`/api/categories/${cat.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !cat.published }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        toast.error(json.error || 'به‌روزرسانی ناموفق بود');
        return;
      }

      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, published: !c.published } : c)),
      );
      toast.success(cat.published ? 'دسته‌بندی غیرفعال شد' : 'دسته‌بندی فعال شد');
    } catch {
      toast.error('خطا در ارتباط با سرور');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (cat: CategoryRow) => {
    const productCount = cat._count?.products ?? 0;
    const ok = await confirm({
      title: `دسته‌بندی «${cat.name}» حذف شود؟`,
      message: productCount > 0 ? `${productCount} محصول مرتبط هم حذف می‌شود. این کار قابل بازگشت نیست.` : undefined,
    });
    if (!ok) return;

    setDeletingId(cat.id);
    try {
      const res = await fetch(`/api/categories/${cat.id}`, { method: 'DELETE' });
      const json = await res.json();

      if (!res.ok || !json.success) {
        toast.error(json.error || 'حذف ناموفق بود');
        return;
      }

      if (json.deletedProducts > 0) {
        toast.success(`دسته‌بندی و ${json.deletedProducts} محصول حذف شد`);
      } else {
        toast.success('دسته‌بندی حذف شد');
      }
      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
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
          <h1 className="text-2xl font-bold text-[var(--foreground)]">مدیریت دسته‌بندی‌ها</h1>
          <p className="text-[var(--muted-foreground)] text-sm mt-1">
            {loading ? 'در حال بارگذاری...' : `${categories.length} دسته‌بندی در سیستم`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] font-semibold hover:bg-[var(--accent)]/90 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          دسته‌بندی جدید
        </button>
      </div>

      {showForm && (
        <motion.form
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleAdd}
          className="bg-[var(--card)] border border-[var(--accent)]/30 rounded-2xl p-6 flex items-end gap-4"
        >
          <div className="flex-1">
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">نام دسته‌بندی جدید</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="مثال: لوله پلی‌اتیلن"
              required
              autoFocus
              className="w-full h-11 bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="h-11 px-6 rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] font-semibold hover:bg-[var(--accent)]/90 transition-colors text-sm disabled:opacity-50 flex items-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            ذخیره
          </button>
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="h-11 px-4 rounded-xl bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors text-sm"
          >
            انصراف
          </button>
        </motion.form>
      )}

      <div className="relative">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="جستجو در دسته‌بندی‌ها..."
          className="w-full h-11 bg-[var(--card)] border border-[var(--border)] rounded-xl pr-12 pl-4 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none"
        />
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-[var(--muted-foreground)] gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            بارگذاری دسته‌بندی‌ها...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-[var(--muted-foreground)]">دسته‌بندی‌ای یافت نشد.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[44rem] text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)] text-right">
                  <th className="px-6 py-4 font-medium">دسته‌بندی</th>
                  <th className="px-6 py-4 font-medium">شناسه URL</th>
                  <th className="px-6 py-4 font-medium">تعداد محصولات</th>
                  <th className="px-6 py-4 font-medium">وضعیت</th>
                  <th className="px-6 py-4 font-medium">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((cat, i) => (
                  <motion.tr
                    key={cat.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-[var(--border)]/50 hover:bg-[var(--muted)]/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center">
                          <Layers className="w-4 h-4 text-[var(--accent-text)]" />
                        </div>
                        <span className="text-[var(--foreground)] font-medium">{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[var(--muted-foreground)] font-mono text-xs">{cat.slug}</td>
                    <td className="px-6 py-4 text-[var(--muted-foreground)]">{cat._count?.products ?? 0} محصول</td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        disabled={togglingId === cat.id}
                        onClick={() => togglePublished(cat)}
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                          cat.published ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400 hover:bg-blue-500/20' : 'bg-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--border)]'
                        } disabled:opacity-50`}
                      >
                        {togglingId === cat.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : cat.published ? (
                          'فعال'
                        ) : (
                          'غیرفعال'
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        disabled={deletingId === cat.id}
                        onClick={() => handleDelete(cat)}
                        className="w-8 h-8 rounded-lg bg-[var(--muted)] flex items-center justify-center text-[var(--muted-foreground)] hover:text-red-700 dark:hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
                      >
                        {deletingId === cat.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
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
