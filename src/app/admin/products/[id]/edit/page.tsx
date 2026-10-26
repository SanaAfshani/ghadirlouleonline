'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import type { Category, Product } from '@/shared/types';
import { ImageUploader } from '@/shared/ui/ImageUploader';
import { HtmlContentEditor } from '@/features/admin/editor/HtmlContentEditor';
import { SeoPanel } from '@/features/admin/seo/SeoPanel';
import { FaqEditor } from '@/features/admin/seo/FaqEditor';
import { CatalogEditor } from '@/features/admin/catalogs/CatalogEditor';
import type { SeoFields } from '@/features/admin/seo/seo';
import type { CatalogFile, FaqItem } from '@/shared/types';
import { Select } from '@/shared/ui/Select';

type Spec = { key: string; value: string };

interface FormState {
  name: string;
  categoryId: string;
  shortDescription: string;
  description: string;
  price: string;
  quoteOnly: boolean;
  images: string[];
  inStock: boolean;
  featured: boolean;
  published: boolean;
  specs: Spec[];
  // --- سئو ---
  slug: string;
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  ogTitle: string;
  ogDescription: string;
  faqs: FaqItem[];
  catalogs: CatalogFile[];
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<FormState>({
    name: '', categoryId: '', shortDescription: '', description: '',
    price: '', images: [], inStock: true, featured: false, published: true, quoteOnly: false,
    specs: [{ key: '', value: '' }],
    slug: '',
    metaTitle: '',
    metaDescription: '',
    focusKeyword: '',
    ogTitle: '',
    ogDescription: '',
    faqs: [],
    catalogs: [],
  });

  const handleSeoChange = (patch: Partial<SeoFields>) =>
    setForm((f) => ({ ...f, ...patch }));

  const selectedCategorySlug =
    categories.find((c) => c.id === form.categoryId)?.slug || 'دسته-بندی';

  useEffect(() => {
    (async () => {
      try {
        const [productRes, categoriesRes] = await Promise.all([
          fetch(`/api/products/${id}?admin=true`),
          fetch('/api/categories?admin=true'),
        ]);
        const productJson = await productRes.json();
        const categoriesJson = await categoriesRes.json();

        if (categoriesJson.success) setCategories(categoriesJson.data);
        if (!productRes.ok || !productJson.success) {
          toast.error(productJson.error || 'محصول یافت نشد');
          router.push('/admin/products');
          return;
        }

        const product = productJson.data as Product;
        const specEntries = Object.entries(product.specifications || {});
        setForm({
          name: product.name,
          categoryId: product.categoryId,
          shortDescription: product.shortDescription || '',
          description: product.description || '',
          price: product.price != null ? String(product.price) : '',
          quoteOnly: Boolean(product.quoteOnly),
          images: product.images || [],
          inStock: product.inStock,
          featured: product.featured,
          published: product.published,
          specs: specEntries.length > 0
            ? specEntries.map(([key, value]) => ({ key, value }))
            : [{ key: '', value: '' }],
          slug: product.slug || '',
          metaTitle: product.metaTitle || '',
          metaDescription: product.metaDescription || '',
          focusKeyword: product.focusKeyword || '',
          ogTitle: product.ogTitle || '',
          ogDescription: product.ogDescription || '',
          faqs: Array.isArray(product.faqs) ? product.faqs : [],
          catalogs: Array.isArray(product.catalogs) ? product.catalogs : [],
        });
      } catch {
        toast.error('خطا در ارتباط با سرور');
      } finally {
        setPageLoading(false);
      }
    })();
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.categoryId) { toast.error('دسته‌بندی را انتخاب کنید'); return; }

    setLoading(true);
    const specifications = Object.fromEntries(
      form.specs.filter((s) => s.key.trim()).map((s) => [s.key.trim(), s.value.trim()]),
    );

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          categoryId: form.categoryId,
          shortDescription: form.shortDescription,
          description: form.description,
          price: form.price || null,
          quoteOnly: form.quoteOnly,
          images: form.images,
          specifications,
          inStock: form.inStock,
          featured: form.featured,
          published: form.published,
          slug: form.slug || undefined,
          metaTitle: form.metaTitle,
          metaDescription: form.metaDescription,
          focusKeyword: form.focusKeyword,
          ogTitle: form.ogTitle,
          ogDescription: form.ogDescription,
          faqs: form.faqs,
          catalogs: form.catalogs,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) { toast.error(json.error || 'ذخیره محصول ناموفق بود'); return; }
      toast.success('محصول به‌روزرسانی شد!');
      router.push('/admin/products');
    } catch {
      toast.error('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

  const addSpec = () => setForm((f) => ({ ...f, specs: [...f.specs, { key: '', value: '' }] }));
  const updateSpec = (i: number, field: keyof Spec, val: string) => {
    const specs = [...form.specs];
    specs[i][field] = val;
    setForm((f) => ({ ...f, specs }));
  };
  const removeSpec = (i: number) => setForm((f) => ({ ...f, specs: f.specs.filter((_, idx) => idx !== i) }));
  const toggleField = (key: 'quoteOnly' | 'inStock' | 'featured' | 'published') =>
    setForm((f) => ({ ...f, [key]: !f[key] }));

  const inputCls =
    'w-full h-11 bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none transition-colors';

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-[var(--muted-foreground)] gap-2">
        <Loader2 className="w-6 h-6 animate-spin" /> بارگذاری محصول...
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/products" className="w-9 h-9 rounded-xl bg-[var(--muted)] flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
          <ArrowRight className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">ویرایش محصول</h1>
          <p className="text-[var(--muted-foreground)] text-sm">اطلاعات محصول را ویرایش کنید</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Main ── */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 space-y-4">
              <h2 className="text-[var(--foreground)] font-bold">اطلاعات اصلی</h2>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">نام محصول *</label>
                <input type="text" required value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={inputCls} />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">دسته‌بندی *</label>
                <Select
                  required
                  value={form.categoryId}
                  onChange={(categoryId) => setForm({ ...form, categoryId })}
                  options={categories.map((c) => ({ value: c.id, label: c.name }))}
                  placeholder="انتخاب دسته‌بندی..."
                  aria-label="دسته‌بندی"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">توضیح کوتاه</label>
                <input type="text" value={form.shortDescription}
                  onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                  className={inputCls} />
              </div>

              <HtmlContentEditor
                label="توضیحات کامل"
                value={form.description}
                onChange={(description) => setForm((f) => ({ ...f, description }))}
                rows={8}
                placeholder="توضیحات کامل محصول — می‌توانی مستقیم از ابزار تولید محتوا پیست کنی..."
              />
            </div>

            {/* Images */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
              <h2 className="text-[var(--foreground)] font-bold mb-4">تصاویر محصول</h2>
              <ImageUploader
                images={form.images}
                onChange={(imgs) => setForm((f) => ({ ...f, images: imgs }))}
              />
            </div>

            {/* Specs */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[var(--foreground)] font-bold">مشخصات فنی</h2>
                <button type="button" onClick={addSpec} className="text-[var(--accent-text)] hover:text-[var(--accent-text)] text-sm transition-colors">
                  + افزودن ردیف
                </button>
              </div>
              <div className="space-y-3">
                {form.specs.map((spec, i) => (
                  <div key={i} className="flex gap-2">
                    <input type="text" value={spec.key}
                      onChange={(e) => updateSpec(i, 'key', e.target.value)}
                      placeholder="ویژگی"
                      className="flex-1 h-10 bg-[var(--muted)] border border-[var(--border)] rounded-xl px-3 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none text-sm" />
                    <input type="text" value={spec.value}
                      onChange={(e) => updateSpec(i, 'value', e.target.value)}
                      placeholder="مقدار"
                      className="flex-1 h-10 bg-[var(--muted)] border border-[var(--border)] rounded-xl px-3 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none text-sm" />
                    <button type="button" onClick={() => removeSpec(i)}
                      className="w-10 h-10 rounded-xl bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-red-700 dark:hover:text-red-400 hover:bg-red-500/10 transition-colors flex items-center justify-center flex-shrink-0">
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href={`/admin/prices?product=${id}`}
              className="flex items-center justify-between gap-3 rounded-2xl border-2 border-emerald-500/30 bg-emerald-500/10 px-5 py-4 hover:border-emerald-500/60 transition-colors"
            >
              <span>
                <span className="block text-[var(--foreground)] font-bold">جدول قیمت این محصول</span>
                <span className="block text-emerald-200/60 text-xs mt-0.5">قیمت‌ها در «تابلوی قیمت» لحظه‌ای ویرایش می‌شوند</span>
              </span>
              <span className="text-emerald-700 dark:text-emerald-400 text-sm font-bold shrink-0">باز کردن ←</span>
            </Link>

            <SeoPanel
              value={{
                slug: form.slug,
                metaTitle: form.metaTitle,
                metaDescription: form.metaDescription,
                focusKeyword: form.focusKeyword,
                ogTitle: form.ogTitle,
                ogDescription: form.ogDescription,
              }}
              onChange={handleSeoChange}
              context={{
                title: form.name,
                excerpt: form.shortDescription,
                content: form.description,
              }}
              variant="product"
              previewPath={`products/${selectedCategorySlug}`}
            />

            <FaqEditor
              value={form.faqs}
              onChange={(faqs) => setForm((f) => ({ ...f, faqs }))}
              entityLabel="محصول"
            />

            <CatalogEditor
              value={form.catalogs}
              onChange={(catalogs) => setForm((f) => ({ ...f, catalogs }))}
            />
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-6">
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 space-y-4">
              <h2 className="text-[var(--foreground)] font-bold">تنظیمات</h2>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">قیمت (تومان)</label>
                <input type="number" value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  disabled={form.quoteOnly}
                  placeholder={form.quoteOnly ? 'غیرفعال — فقط استعلام' : 'خالی = استعلام'}
                  className={`${inputCls} disabled:opacity-50`} />
                {form.quoteOnly && (
                  <p className="text-xs text-[var(--muted-foreground)] mt-1.5 leading-relaxed">
                    با فعال‌بودن «فقط استعلام قیمت»، نه این عدد و نه ردیف‌های تابلوی قیمت بیرون نمی‌روند؛
                    همه‌جا «استعلام قیمت» دیده می‌شود. ردیف‌های جدول پاک نمی‌شوند و با خاموش‌کردن این کلید برمی‌گردند.
                  </p>
                )}
              </div>

              {([
                { key: 'quoteOnly', label: 'فقط استعلام قیمت' },
                { key: 'inStock', label: 'موجود در انبار' },
                { key: 'featured', label: 'محصول ویژه' },
                { key: 'published', label: 'منتشر شده' },
              ] as { key: 'quoteOnly' | 'inStock' | 'featured' | 'published'; label: string }[]).map(({ key, label }) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer">
                  <button type="button" onClick={() => toggleField(key)}
                    className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${form[key] ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'}`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${form[key] ? 'right-1' : 'left-1'}`} />
                  </button>
                  <span className="text-[var(--foreground)] text-sm">{label}</span>
                </label>
              ))}
            </div>

            <button type="submit" disabled={loading}
              className="w-full h-12 rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] font-bold hover:bg-[var(--accent)]/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              ذخیره تغییرات
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
