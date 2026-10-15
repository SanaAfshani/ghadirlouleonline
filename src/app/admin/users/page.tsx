'use client';

import { useCallback, useEffect, useState } from 'react';
import { m as motion } from 'framer-motion';
import { Plus, Search, Pencil, Trash2, Shield, User, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '@/shared/lib/utils';
import { useConfirm } from '@/shared/ui/ConfirmDialog';

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'EDITOR' | 'VIEWER';
  createdAt: string;
  updatedAt: string;
};

const roleMap: Record<UserRow['role'], { label: string; cls: string }> = {
  ADMIN: { label: 'مدیر', cls: 'bg-[var(--accent)]/10 text-[var(--accent-text)]' },
  EDITOR: { label: 'ویرایشگر', cls: 'bg-blue-500/10 text-blue-700 dark:text-blue-400' },
  VIEWER: { label: 'بازدیدکننده', cls: 'bg-purple-500/10 text-purple-700 dark:text-purple-400' },
};

const emptyForm = {
  name: '',
  email: '',
  password: '',
  role: 'EDITOR' as UserRow['role'],
};

export default function AdminUsersPage() {
  const confirm = useConfirm();

  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users?admin=true');
      const json = await res.json();
      if (json.success) setUsers(json.data);
      else toast.error(json.error || 'بارگذاری کاربران ناموفق بود');
    } catch {
      toast.error('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filtered = users.filter(
    (u) => u.name.includes(search) || u.email.includes(search),
  );

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (user: UserRow) => {
    setEditing(user);
    setForm({ name: user.name, email: user.email, password: '', role: user.role });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editing ? `/api/users/${editing.id}` : '/api/users';
      const method = editing ? 'PUT' : 'POST';
      const body: Record<string, string> = {
        name: form.name,
        email: form.email,
        role: form.role,
      };
      if (form.password) body.password = form.password;
      if (!editing && !form.password) {
        toast.error('رمز عبور الزامی است');
        setSaving(false);
        return;
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        toast.error(json.error || 'ذخیره ناموفق بود');
        return;
      }

      toast.success(editing ? 'کاربر به‌روزرسانی شد' : 'کاربر ایجاد شد');
      setModalOpen(false);
      loadUsers();
    } catch {
      toast.error('خطا در ارتباط با سرور');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user: UserRow) => {
    if (!(await confirm({ title: `کاربر «${user.name}» حذف شود؟` }))) return;
    setDeletingId(user.id);
    try {
      const res = await fetch(`/api/users/${user.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error || 'حذف ناموفق بود');
        return;
      }
      toast.success('کاربر حذف شد');
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch {
      toast.error('خطا در ارتباط با سرور');
    } finally {
      setDeletingId(null);
    }
  };

  const inputCls =
    'w-full h-11 bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">مدیریت کاربران</h1>
          <p className="text-[var(--muted-foreground)] text-sm mt-1">
            {loading ? 'در حال بارگذاری...' : `${users.length} کاربر`}
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] font-semibold hover:bg-[var(--accent)]/90 text-sm"
        >
          <Plus className="w-4 h-4" />
          کاربر جدید
        </button>
      </div>

      <div className="relative">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="جستجو در کاربران..."
          className="w-full h-11 bg-[var(--card)] border border-[var(--border)] rounded-xl pr-12 pl-4 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none"
        />
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-[var(--muted-foreground)] gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            بارگذاری...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[44rem] text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)] text-right">
                  <th className="px-6 py-4 font-medium">کاربر</th>
                  <th className="px-6 py-4 font-medium">نقش</th>
                  <th className="px-6 py-4 font-medium">آخرین به‌روزرسانی</th>
                  <th className="px-6 py-4 font-medium">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user, i) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-[var(--border)]/50 hover:bg-[var(--muted)]/30"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--muted)] flex items-center justify-center">
                          {user.role === 'ADMIN' ? (
                            <Shield className="w-5 h-5 text-[var(--accent-text)]" />
                          ) : (
                            <User className="w-5 h-5 text-[var(--muted-foreground)]" />
                          )}
                        </div>
                        <div>
                          <div className="text-[var(--foreground)] font-medium">{user.name}</div>
                          <div className="text-[var(--muted-foreground)] text-xs">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${roleMap[user.role].cls}`}>
                        {roleMap[user.role].label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[var(--muted-foreground)]">{formatDate(user.updatedAt)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(user)}
                          className="w-8 h-8 rounded-lg bg-[var(--muted)] flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--accent-text)]"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          disabled={deletingId === user.id}
                          onClick={() => handleDelete(user)}
                          className="w-8 h-8 rounded-lg bg-[var(--muted)] flex items-center justify-center text-[var(--muted-foreground)] hover:text-red-700 dark:hover:text-red-400 disabled:opacity-50"
                        >
                          {deletingId === user.id ? (
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

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[var(--foreground)]">{editing ? 'ویرایش کاربر' : 'کاربر جدید'}</h2>
              <button type="button" onClick={() => setModalOpen(false)} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="نام"
                className={inputCls}
              />
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="ایمیل"
                className={inputCls}
                dir="ltr"
              />
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder={editing ? 'رمز جدید (اختیاری)' : 'رمز عبور'}
                className={inputCls}
                dir="ltr"
              />
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as UserRow['role'] })}
                className={inputCls}
              >
                <option value="ADMIN">مدیر</option>
                <option value="EDITOR">ویرایشگر</option>
                <option value="VIEWER">بازدیدکننده</option>
              </select>
              <button
                type="submit"
                disabled={saving}
                className="w-full h-11 rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] font-bold disabled:opacity-50"
              >
                {saving ? 'در حال ذخیره...' : 'ذخیره'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
