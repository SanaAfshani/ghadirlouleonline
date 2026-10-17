'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { slugify } from '@/shared/lib/utils';
import type { Category } from '@/shared/types';
import { ImageUploader } from '@/shared/ui/ImageUploader';
import { HtmlContentEditor } from '@/features/admin/editor/HtmlContentEditor';
import { SeoPanel } from '@/features/admin/seo/SeoPanel';
import { FaqEditor } from '@/features/admin/seo/FaqEditor';
import type { SeoFields } from '@/features/admin/seo/seo';
import type { FaqItem } from '@/shared/types';
import { Select } from '@/shared/ui/Select';

type Spec = { key: string; value: string };

interface FormState {
  name: string;
  categoryId: string;
  shortDescription: string;
  description: string;
  price: string;
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
}

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<FormState>({
    name: '',
    categoryId: '',
    shortDescription: '',
    description: '',
    price: '',
    images: [],
    inStock: true,
    featured: false,
    published: true,
    specs: [{ key: '', value: '' }],
    slug: '',
    metaTitle: '',
    metaDescription: '',
    focusKeyword: '',
    ogTitle: '',
    ogDescription: '',
    faqs: [],
  });
  const [slugTouched, setSlugTouched] = useState(false);

  /** تغییر دستی اسلاگ، هم‌گام‌سازی خودکار با نام محصول را متوقف می‌کند */
  const handleSeoChange = (patch: Partial<SeoFields>) => {
    if (patch.slug !== undefined) setSlugTouched(true);
    setForm((f) => ({ ...f, ...patch }));
  };

  const selectedCategorySlug =
    categories.find((c) => c.id === form.categoryId)?.slug || 'دسته-بندی';

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/categories?admin=true');
        const json = await res.json();
        if (json.success) setCategories(json.data);
        else toast.error(json.error || 'بارگذاری دسته‌بندی‌ها ناموفق بود');
      } catch {
        toast.error('خطا در ارتباط با سرور');
      } finally {
        setCategoriesLoading(false);
      }
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.categoryId) { toast.error('دسته‌بندی را انتخاب کنید'); return; }

    setLoading(true);
    const specifications = Object.fromEntries(
      form.specs.filter((s) => s.key.trim()).map((s) => [s.key.trim(), s.value.trim()]),
    );

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          slug: form.slug || slugify(form.name),
          categoryId: form.categoryId,
          shortDescription: form.shortDescription || undefined,
          description: form.description || undefined,
          price: form.price || null,
          images: form.images,
          specifications,
          inStock: form.inStock,
          featured: form.featured,
          published: form.published,
          metaTitle: form.metaTitle,
          metaDescription: form.metaDescription,
          focusKeyword: form.focusKeyword,
          ogTitle: form.ogTitle,
          ogDescription: form.ogDescription,
          faqs: form.faqs,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) { toast.error(json.error || 'ذخیره محصول ناموفق بود'); return; }
      toast.success('محصول با موفقیت ذخیره شد!');
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
  const toggleField = (key: 'inStock' | 'featured' | 'published') =>
    setForm((f) => ({ ...f, [key]: !f[key] }));

  const inputCls =
    'w-full h-11 bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none transition-colors';

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/products" className="w-9 h-9 rounded-xl bg-[var(--muted)] flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
          <ArrowRight className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">افزودن محصول جدید</h1>
          <p className="text-[var(--muted-foreground)] text-sm">اطلاعات محصول جدید را وارد کنید</p>
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
                  onChange={(e) => {
                    const name = e.target.value;
                    // اسلاگ تا وقتی ادمین دستی تغییرش نداده، با نام محصول هم‌گام می‌ماند
                    setForm((f) => ({ ...f, name, slug: slugTouched ? f.slug : slugify(name) }));
                  }}
                  placeholder="مثال: لوله فولادی ۲ اینچ API"
                  className={inputCls} />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">دسته‌بندی *</label>
                {categoriesLoading ? (
                  <div className="flex items-center gap-2 text-[var(--muted-foreground)] text-sm py-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> بارگذاری...
                  </div>
                ) : (
                  <Select
                    required
                    value={form.categoryId}
                    onChange={(categoryId) => setForm({ ...form, categoryId })}
                    options={categories.map((c) => ({ value: c.id, label: c.name }))}
                    placeholder="انتخاب دسته‌بندی..."
                    aria-label="دسته‌بندی"
                    className={inputCls}
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">توضیح کوتاه</label>
                <input type="text" value={form.shortDescription}
                  onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                  placeholder="یک جمله کوتاه درباره محصول..."
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
                      placeholder="ویژگی (مثال: قطر)"
                      className="flex-1 h-10 bg-[var(--muted)] border border-[var(--border)] rounded-xl px-3 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none text-sm" />
                    <input type="text" value={spec.value}
                      onChange={(e) => updateSpec(i, 'value', e.target.value)}
                      placeholder="مقدار (مثال: ۲ اینچ)"
                      className="flex-1 h-10 bg-[var(--muted)] border border-[var(--border)] rounded-xl px-3 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none text-sm" />
                    <button type="button" onClick={() => removeSpec(i)}
                      className="w-10 h-10 rounded-xl bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-red-700 dark:hover:text-red-400 hover:bg-red-500/10 transition-colors flex items-center justify-center flex-shrink-0">
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <p className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-5 py-4 text-xs text-emerald-200/70 leading-6">
              بعد از ذخیره محصول، جدول قیمت آن را از «تابلوی قیمت» در منوی پنل وارد کنید (امکان پیست از اکسل دارد).
            </p>

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
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-6">
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 space-y-4">
              <h2 className="text-[var(--foreground)] font-bold">تنظیمات</h2>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">قیمت (تومان)</label>
                <input type="number" value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="خالی = استعلام"
                  className={inputCls} />
              </div>

              {([
                { key: 'inStock', label: 'موجود در انبار' },
                { key: 'featured', label: 'محصول ویژه' },
                { key: 'published', label: 'منتشر شده' },
              ] as { key: 'inStock' | 'featured' | 'published'; label: string }[]).map(({ key, label }) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer">
                  <button type="button" onClick={() => toggleField(key)}
                    className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${form[key] ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'}`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${form[key] ? 'right-1' : 'left-1'}`} />
                  </button>
                  <span className="text-[var(--foreground)] text-sm">{label}</span>
                </label>
              ))}
            </div>

            <button type="submit" disabled={loading || categoriesLoading}
              className="w-full h-12 rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] font-bold hover:bg-[var(--accent)]/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              ذخیره محصول
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
