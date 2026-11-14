import { Vazirmatn } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import '@/app/globals.css';
import { ThemeProvider } from '@/shared/providers/ThemeProvider';
import { NavigationProgress } from '@/shared/ui/NavigationProgress';

/**
 * فونت سلف‌هاست با next/font: فایل از همین دامنه و با preload می‌آید و stylesheet خارجی گوگل
 * (که رندر را تا دانلودش متوقف می‌کرد و هر ۹ وزن را می‌گرفت) حذف شد. Vazirmatn متغیر است؛ یک فایل همه وزن‌ها
 * و حروف لاتینش برای نسخه انگلیسی هم کافی است.
 */
const vazirmatn = Vazirmatn({ subsets: ['arabic', 'latin'], display: 'swap', variable: '--font-vazirmatn' });

/**
 * سند HTML مشترک سایت (app/[lang]/layout) و پنل (app/admin/layout). هر دو root layout جدا هستند —
 * چون lang و dir سایت از پارامتر [lang] می‌آید و پنل بیرون از آن است.
 */
export function RootDocument({ lang, dir, children }: { lang: string; dir: 'rtl' | 'ltr'; children: React.ReactNode }) {
  return (
    <html lang={lang} dir={dir} className={vazirmatn.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var c=localStorage.getItem('site-theme-color');if(c)document.documentElement.setAttribute('data-theme-color',c);}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-screen antialiased">
        <ThemeProvider>
          <NavigationProgress />
          {children}
          <Toaster
            position="bottom-center"
            toastOptions={{
              style: {
                background: 'var(--card)',
                color: 'var(--foreground)',
                border: '1px solid var(--border)',
                fontFamily: 'var(--font-sans)',
                direction: dir,
              },
              duration: 4000,
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
