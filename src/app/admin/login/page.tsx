'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { m as motion } from 'framer-motion';
import { Eye, EyeOff, LogIn, Lock, Mail, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ email: '', password: '' });

  useEffect(() => {
    if (searchParams.get('expired')) {
      setError('نشست شما منقضی شده است. لطفاً دوباره وارد شوید.');
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!form.email) { setError('ایمیل را وارد کنید'); return; }
    if (!form.password) { setError('رمز عبور را وارد کنید'); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(`خوش آمدید، ${data.user?.name || 'مدیر'} 👋`);
        // فقط مسیرهای داخلی پنل — وگرنه ?redirect=//evil.com کاربر را بعد از ورود به سایت دیگری می‌برد
        const redirect = searchParams.get('redirect') ?? '';
        router.push(/^\/admin(\/|$)/.test(redirect) ? redirect : '/admin');
        router.refresh();
      } else {
        setError(data.error || 'اطلاعات ورود نادرست است');
      }
    } catch {
      setError('خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-[var(--accent)]/5 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full bg-blue-500/5 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.1 }}
            className="inline-flex w-16 h-16 rounded-2xl bg-[var(--accent)] items-center justify-center mb-4 shadow-xl"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-9 h-9 text-[var(--foreground)]" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="currentColor" opacity="0.2" />
              <path d="M4 12h16M12 4v16" strokeLinecap="round" />
            </svg>
          </motion.div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">قدیر لوله آنلاین </h1>
          <p className="text-[var(--muted-foreground)] text-sm mt-1">پنل مدیریت سیستم</p>
        </div>

        {/* Card */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8 shadow-2xl">
          <h2 className="text-[var(--foreground)] font-bold text-lg mb-6 text-center">ورود به حساب کاربری</h2>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl p-3.5 mb-5 text-red-700 dark:text-red-400 text-sm"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">ایمیل</label>
              <div className="relative">
                <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="admin@luleonline.ir"
                  autoComplete="email"
                  className="w-full h-11 bg-[var(--muted)] border border-[var(--border)] rounded-xl pr-10 pl-4 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">رمز عبور</label>
              <div className="relative">
                <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="رمز عبور خود را وارد کنید"
                  autoComplete="current-password"
                  className="w-full h-11 bg-[var(--muted)] border border-[var(--border)] rounded-xl pr-10 pl-11 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] font-bold text-sm hover:bg-[var(--accent)]/90 transition-all disabled:opacity-60 flex items-center justify-center gap-2 mt-2 shadow-lg shadow-amber-500/25"
            >
              {loading ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : <LogIn className="w-4 h-4" />}
              {loading ? 'در حال ورود...' : 'ورود به پنل'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[var(--border)]">
            <p className="text-xs text-[var(--muted-foreground)] text-center">
              اطلاعات آزمایشی: <span className="text-[var(--muted-foreground)]">admin@luleonline.ir</span> / <span className="text-[var(--muted-foreground)]">admin123456</span>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-[var(--muted-foreground)] mt-6">
          © ۱۴۰۳ قدیر لوله آنلاین  — تمامی حقوق محفوظ است
        </p>
      </motion.div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
