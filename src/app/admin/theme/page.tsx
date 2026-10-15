'use client';

import { m as motion } from 'framer-motion';
import { Palette, Check } from 'lucide-react';
import { useThemeColor, themeColors } from '@/shared/providers/ThemeColorProvider';
import toast from 'react-hot-toast';

export default function AdminThemePage() {
  const { color, setColor } = useThemeColor();

  const handleColorChange = (id: typeof themeColors[0]['id']) => {
    setColor(id);
    toast.success(`رنگ سایت به "${themeColors.find(c => c.id === id)?.label}" تغییر یافت`);
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)] flex items-center gap-3">
          <Palette className="w-7 h-7 text-[var(--accent-text)]" />
          مدیریت رنگ‌بندی سایت
        </h1>
        <p className="text-[var(--muted-foreground)] text-sm mt-2">
          رنگ اصلی سایت را از اینجا تغییر دهید. تغییر فوری روی تمام صفحات اعمال می‌شود.
        </p>
      </div>

      {/* Color Presets */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
        <h2 className="text-[var(--foreground)] font-semibold mb-5">انتخاب رنگ اصلی</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {themeColors.map((c) => (
            <motion.button
              key={c.id}
              onClick={() => handleColorChange(c.id)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className={`relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                color === c.id
                  ? 'border-[var(--foreground)]/40 bg-[var(--muted)]'
                  : 'border-[var(--border)] hover:border-[var(--border)]'
              }`}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                style={{ backgroundColor: c.hex, boxShadow: `0 4px 16px ${c.hex}60` }}
              >
                {color === c.id && <Check className="w-5 h-5 text-[var(--foreground)]" strokeWidth={3} />}
              </div>
              <span className="text-xs font-medium text-[var(--foreground)] text-center">{c.label}</span>
              {color === c.id && (
                <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-green-400" />
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
        <h2 className="text-[var(--foreground)] font-semibold mb-5">پیش‌نمایش</h2>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <button
              className="px-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5"
              style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }}
            >
              دکمه اصلی
            </button>
            <button
              className="px-5 py-2.5 rounded-xl font-semibold text-sm border-2 transition-all"
              style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
            >
              دکمه حاشیه‌دار
            </button>
            <span
              className="px-3 py-1 rounded-full text-xs font-semibold"
              style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}
            >
              برچسب
            </span>
          </div>
          <div
            className="h-2 rounded-full"
            style={{ backgroundColor: 'var(--accent)' }}
          />
          <p className="text-sm" style={{ color: 'var(--accent)' }}>
            این متن با رنگ اصلی سایت نمایش داده می‌شود
          </p>
        </div>
      </div>

      <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/20 rounded-xl p-4 text-[var(--accent-text)] text-sm">
        💡 تغییر رنگ بلافاصله روی تمام صفحات سایت اعمال می‌شود و در مرورگر ذخیره می‌شود.
      </div>
    </div>
  );
}
