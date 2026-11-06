'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type ThemeColor = 'water' | 'amber' | 'blue' | 'green' | 'red' | 'purple' | 'teal' | 'indigo' | 'rose';

/** رنگ پیش‌فرض: آبی صنعتی — همان مقادیر :root در globals.css */
const DEFAULT_COLOR: ThemeColor = 'water';

export const themeColors: { id: ThemeColor; label: string; hex: string }[] = [
  { id: 'water',  label: 'آبی صنعتی (پیش‌فرض)', hex: '#2563EB' },
  { id: 'amber',  label: 'طلایی',           hex: '#F59E0B' },
  { id: 'blue',   label: 'آبی',             hex: '#3B82F6' },
  { id: 'green',  label: 'سبز',             hex: '#22C55E' },
  { id: 'teal',   label: 'فیروزه‌ای',       hex: '#14B8A6' },
  { id: 'purple', label: 'بنفش',            hex: '#8B5CF6' },
  { id: 'indigo', label: 'نیلی',            hex: '#6366F1' },
  { id: 'red',    label: 'قرمز',            hex: '#EF4444' },
  { id: 'rose',   label: 'گلبهی',           hex: '#F43F5E' },
];

interface ThemeColorContextValue {
  color: ThemeColor;
  setColor: (color: ThemeColor) => void;
  colors: typeof themeColors;
}

const ThemeColorContext = createContext<ThemeColorContextValue>({
  color: DEFAULT_COLOR,
  setColor: () => {},
  colors: themeColors,
});

export function ThemeColorProvider({ children }: { children: React.ReactNode }) {
  const [color, setColorState] = useState<ThemeColor>(DEFAULT_COLOR);

  const applyColor = useCallback((c: ThemeColor) => {
    document.documentElement.setAttribute('data-theme-color', c);
  }, []);

  useEffect(() => {
    const applyIfValid = (c: string | null | undefined) => {
      if (c && themeColors.find((t) => t.id === c)) {
        setColorState(c as ThemeColor);
        applyColor(c as ThemeColor);
        return true;
      }
      return false;
    };

    // رنگ ذخیره‌شده مرورگر فقط برای نمایش سریع است؛ مقدار پنل همیشه خوانده می‌شود، وگرنه تغییر رنگ
    // در پنل هیچ‌وقت به بازدیدکننده‌ای که قبلاً آمده بود نمی‌رسید
    applyIfValid(localStorage.getItem('site-theme-color'));

    fetch('/api/settings')
      .then((r) => r.json())
      .then((json) => {
        const fromDb = json?.data?.theme_color as string | undefined;
        if (applyIfValid(fromDb)) {
          localStorage.setItem('site-theme-color', fromDb!);
        } else {
          applyColor(DEFAULT_COLOR);
        }
      })
      .catch(() => {});
  }, [applyColor]);

  const setColor = useCallback((c: ThemeColor) => {
    setColorState(c);
    applyColor(c);
    localStorage.setItem('site-theme-color', c);
    fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme_color: c }),
    }).catch(() => {});
  }, [applyColor]);

  return (
    <ThemeColorContext.Provider value={{ color, setColor, colors: themeColors }}>
      {children}
    </ThemeColorContext.Provider>
  );
}

export const useThemeColor = () => useContext(ThemeColorContext);
