'use client';

import { useCallback, useEffect, useState } from 'react';
import { m as motion } from 'framer-motion';
import Link from 'next/link';
import { Plus, Search, Pencil, Trash2, Package, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatPersianNumber } from '@/shared/lib/utils';
import type { Product } from '@/shared/types';
import { useConfirm } from '@/shared/ui/ConfirmDialog';

export default function AdminProductsPage() {
  const confirm = useConfirm();

  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products?admin=true&limit=200');
      const json = await res.json();
      if (json.success) {
        setProducts(json.data);
      } else {
        toast.error(json.error || 'بارگذاری محصولات ناموفق بود');
      }
    } catch {
      toast.error('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const filtered = products.filter(
    (p) =>
      p.name.includes(search) ||
      p.category?.name?.includes(search),
  );

  const handleDelete = async (id: string, name: string) => {
    if (!(await confirm({ title: `محصول «${name}» حذف شود؟` }))) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const json = await res.json();

      if (!res.ok || !json.success) {
        toast.error(json.error || 'حذف ناموفق بود');
        return;
      }

      toast.success('محصول حذف شد');
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      toast.error('خطا در ارتباط با سرور');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <motion.div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">مدیریت محصولات</h1>
          <p className="text-[var(--muted-foreground)] text-sm mt-1">
            {loading ? 'در حال بارگذاری...' : `${products.length} محصول در سیستم`}
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] font-semibold hover:bg-[var(--accent)]/90 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          محصول جدید
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="جستجو در محصولات..."
          className="w-full h-11 bg-[var(--card)] border border-[var(--border)] rounded-xl pr-12 pl-4 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none"
        />
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-[var(--muted-foreground)] gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            بارگذاری محصولات...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-[var(--muted-foreground)]">محصولی یافت نشد.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[44rem] text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)] text-right">
                  <th className="px-6 py-4 font-medium">محصول</th>
                  <th className="px-6 py-4 font-medium">دسته‌بندی</th>
                  <th className="px-6 py-4 font-medium">قیمت</th>
                  <th className="px-6 py-4 font-medium">موجودی</th>
                  <th className="px-6 py-4 font-medium">وضعیت</th>
                  <th className="px-6 py-4 font-medium">ویژه</th>
                  <th className="px-6 py-4 font-medium">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product, i) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-[var(--border)]/50 hover:bg-[var(--muted)]/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--muted)] flex items-center justify-center flex-shrink-0">
                          <Package className="w-5 h-5 text-[var(--muted-foreground)]" />
                        </div>
                        <span className="text-[var(--foreground)] font-medium">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[var(--muted-foreground)]">{product.category?.name ?? '—'}</td>
                    <td className="px-6 py-4 text-[var(--foreground)]">
                      {product.price != null && product.price > 0 ? (
                        `${formatPersianNumber(product.price)} ت`
                      ) : (
                        <span className="text-[var(--muted-foreground)]">استعلام</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          product.inStock ? 'bg-green-500/10 text-green-700 dark:text-green-400' : 'bg-red-500/10 text-red-700 dark:text-red-400'
                        }`}
                      >
                        {product.inStock ? 'موجود' : 'ناموجود'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          product.published ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400' : 'bg-[var(--border)] text-[var(--muted-foreground)]'
                        }`}
                      >
                        {product.published ? 'منتشر شده' : 'پیش‌نویس'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {product.featured && <span className="text-[var(--accent-text)] text-xs">⭐ ویژه</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="w-8 h-8 rounded-lg bg-[var(--muted)] flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--accent-text)] hover:bg-[var(--accent)]/10 transition-all"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          disabled={deletingId === product.id}
                          onClick={() => handleDelete(product.id, product.name)}
                          className="w-8 h-8 rounded-lg bg-[var(--muted)] flex items-center justify-center text-[var(--muted-foreground)] hover:text-red-700 dark:hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
                        >
                          {deletingId === product.id ? (
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
    </motion.div>
  );
}
