'use client';

import { useState } from 'react';
import { m as motion } from 'framer-motion';
import Link from 'next/link';
import { Package, Phone, MessageCircle, Share2, CheckCircle, XCircle, ChevronDown, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSiteSettings } from '@/shared/providers/SiteSettingsProvider';

const productData: Record<string, {
  name: string;
  category: string;
  categorySlug: string;
  price: string;
  inStock: boolean;
  featured: boolean;
  shortDesc: string;
  description: string;
  specs: Record<string, string>;
  applications: string[];
}> = {
  'steel-pipe-2-inch': {
    name: 'لوله فولادی ۲ اینچ API',
    category: 'لوله فولادی',
    categorySlug: 'steel-pipes',
    price: '450,000',
    inStock: true,
    featured: true,
    shortDesc: 'لوله فولادی درزدار ۲ اینچ استاندارد API 5L مناسب برای خطوط آب و گاز صنعتی',
    description: 'لوله فولادی درزدار با قطر ۲ اینچ (DN50) از جنس فولاد کربنی A36 که مطابق با استاندارد API 5L تولید شده است. این محصول برای خطوط انتقال آب، گاز و سیالات صنعتی مناسب است.',
    specs: {
      'قطر خارجی': '۶۰.۳ میلیمتر',
      'ضخامت دیواره': '۳.۵ میلیمتر',
      'استاندارد': 'API 5L Grade B',
      'جنس': 'فولاد کربنی A36',
      'طول شاخه': '۶ متر',
      'وزن هر شاخه': '۵.۸ کیلوگرم',
      'درجه': 'Grade B',
      'حداکثر فشار': '۳۸ بار',
    },
    applications: ['خط لوله آب', 'خط انتقال گاز', 'پایپینگ صنعتی', 'ساختمان‌سازی'],
  },
};

const defaultProduct = {
  name: 'محصول صنعتی',
  category: 'لوله',
  categorySlug: 'steel-pipes',
  price: '0',
  inStock: true,
  featured: false,
  shortDesc: 'لوله صنعتی باکیفیت',
  description: 'برای اطلاعات بیشتر و استعلام قیمت با ما تماس بگیرید.',
  specs: { 'نوع': 'صنعتی', 'کاربرد': 'عمومی' },
  applications: ['صنعتی'],
};

interface Props { slug: string; }

export function ProductDetailClient({ slug }: Props) {
  const product = productData[slug] ?? { ...defaultProduct, name: slug.replace(/-/g, ' ') };
  const [openSpec, setOpenSpec] = useState(true);
  const { phone, phoneHref } = useSiteSettings();

  const handleQuote = () => {
    toast.success('درخواست شما ارسال شد. کارشناس ما با شما تماس می‌گیرد.');
  };

  return (
    <div className="container-main py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] mb-8">
        <Link href="/" className="hover:text-[var(--accent-text)]">خانه</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-[var(--accent-text)]">محصولات</Link>
        <span>/</span>
        <Link href={`/products/${product.categorySlug}`} className="hover:text-[var(--accent-text)]">{product.category}</Link>
        <span>/</span>
        <span className="text-[var(--foreground)]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* Image gallery */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="aspect-square rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center relative overflow-hidden"
          >
            <Package className="w-32 h-32 text-slate-300 dark:text-slate-600" />
            {product.featured && (
              <div className="absolute top-4 right-4 bg-[var(--accent)] text-[var(--accent-foreground)] text-sm font-bold px-3 py-1.5 rounded-full">ویژه</div>
            )}
          </motion.div>
        </div>

        {/* Product info */}
        <div className="lg:col-span-3 space-y-6">
          <motion.div>
            <div className="text-[var(--accent-text)] text-sm font-medium mb-2">{product.category}</div>
            <h1 className="text-3xl font-black text-[var(--foreground)] mb-3">{product.name}</h1>
            <p className="text-[var(--muted-foreground)] leading-relaxed">{product.shortDesc}</p>
          </motion.div>

          {/* Stock & price */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-4 flex-wrap"
          >
            <div className={`flex items-center gap-2 text-sm font-medium ${product.inStock ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
              {product.inStock ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
              {product.inStock ? 'موجود در انبار' : 'ناموجود'}
            </div>
            {product.price !== '0' ? (
              <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/20 rounded-2xl px-5 py-3">
                <div className="text-2xl font-black text-[var(--accent-text)]">{product.price} تومان</div>
                <div className="text-xs text-[var(--muted-foreground)]">قیمت هر شاخه</div>
              </div>
            ) : (
              <div className="bg-[var(--muted)] rounded-2xl px-5 py-3">
                <div className="text-lg font-bold text-[var(--foreground)]">استعلام قیمت</div>
                <div className="text-xs text-[var(--muted-foreground)]">برای قیمت تماس بگیرید</div>
              </div>
            )}
          </motion.div>

          {/* Applications */}
          {product.applications && (
            <motion.div>
              <div className="text-sm font-medium text-[var(--foreground)] mb-2">کاربردها:</div>
              <div className="flex flex-wrap gap-2">
                {product.applications.map((app) => (
                  <span key={app} className="px-3 py-1.5 rounded-full bg-[var(--muted)] text-[var(--muted-foreground)] text-sm">{app}</span>
                ))}
              </div>
            </motion.div>
          )}

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-3"
          >
            <button
              onClick={handleQuote}
              className="flex items-center gap-2 h-12 px-6 rounded-2xl bg-[var(--accent)] text-[var(--accent-foreground)] font-semibold hover:bg-[var(--accent-hover)] transition-all hover:-translate-y-0.5 shadow-lg shadow-accent"
            >
              <MessageCircle className="w-5 h-5" />
              درخواست قیمت
            </button>
            <a
              href={phoneHref}
              className="flex items-center gap-2 h-12 px-6 rounded-2xl border-2 border-[var(--border)] text-[var(--foreground)] font-medium hover:border-[var(--accent)] hover:text-[var(--accent-text)] transition-all"
            >
              <Phone className="w-5 h-5" />
              {phone}
            </a>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success('لینک کپی شد!');
              }}
              className="h-12 w-12 rounded-2xl border-2 border-[var(--border)] flex items-center justify-center text-[var(--muted-foreground)] hover:border-[var(--accent)] hover:text-[var(--accent-text)] transition-all"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </div>

      {/* Specs & Description */}
      <div className="mt-12 space-y-4">
        {/* Specs accordion */}
        <div className="rounded-2xl border border-[var(--border)] overflow-hidden">
          <button
            onClick={() => setOpenSpec(!openSpec)}
            className="w-full flex items-center justify-between p-6 bg-[var(--card)] hover:bg-[var(--muted)]/50 transition-colors"
          >
            <h2 className="font-bold text-[var(--foreground)] text-lg">مشخصات فنی</h2>
            <ChevronDown className={`w-5 h-5 text-[var(--muted-foreground)] transition-transform ${openSpec ? 'rotate-180' : ''}`} />
          </button>
          {openSpec && (
            <div className="p-6 border-t border-[var(--border)]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(product.specs).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between p-4 rounded-xl bg-[var(--muted)]/50">
                    <span className="text-[var(--muted-foreground)] text-sm">{key}</span>
                    <span className="font-semibold text-[var(--foreground)] text-sm">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="rounded-2xl border border-[var(--border)] p-6 bg-[var(--card)]">
          <h2 className="font-bold text-[var(--foreground)] text-lg mb-4">توضیحات محصول</h2>
          <p className="text-[var(--muted-foreground)] leading-loose">{product.description}</p>
        </div>
      </div>
    </div>
  );
}
