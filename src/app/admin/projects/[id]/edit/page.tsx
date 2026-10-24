'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowRight, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { slugify } from '@/shared/lib/utils';
import { HtmlContentEditor } from '@/features/admin/editor/HtmlContentEditor';
import { SeoPanel } from '@/features/admin/seo/SeoPanel';
import { FaqEditor } from '@/features/admin/seo/FaqEditor';
import { ProjectImageEditor } from '@/features/admin/projects/ProjectImageEditor';
import { normalizeProjectImages } from '@/shared/lib/serializers';
import type { SeoFields } from '@/features/admin/seo/seo';
import type { FaqItem, ProjectImage } from '@/shared/types';

export default function EditProjectPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    slug: '',
    location: '',
    client: '',
    description: '',
    content: '',
    images: [] as ProjectImage[],
    year: 1403,
    published: true,
    featured: false,
    // فیلدهای سئو — در SeoPanel ویرایش می‌شوند
    metaTitle: '',
    metaDescription: '',
    focusKeyword: '',
    ogTitle: '',
    ogDescription: '',
    faqs: [] as FaqItem[],
  });

  const handleSeoChange = (patch: Partial<SeoFields>) => setForm((f) => ({ ...f, ...patch }));

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/projects/${id}`);
        const json = await res.json();
        if (!res.ok || !json.success) {
          toast.error('پروژه یافت نشد');
          router.push('/admin/projects');
          return;
        }
        const p = json.data;
        setForm({
          title: p.title,
          slug: p.slug || '',
          location: p.location || '',
          client: p.client || '',
          description: p.description || '',
          content: p.content || '',
          // ردیف‌های قدیمی آرایه رشته‌اند — همان نرمال‌ساز سرور اینجا هم شکل را یکدست می‌کند
          images: normalizeProjectImages(p.images),
          year: p.year,
          published: p.published,
          featured: p.featured,
          metaTitle: p.metaTitle || '',
          metaDescription: p.metaDescription || '',
          focusKeyword: p.focusKeyword || '',
          ogTitle: p.ogTitle || '',
          ogDescription: p.ogDescription || '',
          faqs: Array.isArray(p.faqs) ? p.faqs : [],
        });
      } catch {
        toast.error('خطا در بارگذاری');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, slug: slugify(form.slug || form.title) }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error || 'ذخیره ناموفق بود');
        return;
      }
      toast.success('پروژه به‌روزرسانی شد!');
      router.push('/admin/projects');
    } catch {
      toast.error('خطا در ارتباط با سرور');
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    'w-full h-11 bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none transition-colors';
  const textareaCls =
    'w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none resize-none transition-colors';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-[var(--muted-foreground)] gap-2">
        <Loader2 className="w-6 h-6 animate-spin" />
        بارگذاری پروژه...
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/projects"
          className="w-9 h-9 rounded-xl bg-[var(--muted)] flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
        >
          <ArrowRight className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">ویرایش پروژه</h1>
          <p className="text-[var(--muted-foreground)] text-sm">اطلاعات پروژه را ویرایش کنید</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 space-y-4">
              <h2 className="text-[var(--foreground)] font-bold">مشخصات پروژه</h2>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">عنوان پروژه *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">توضیح کوتاه</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  placeholder="یک یا دو جمله — در کارت پروژه و توضیح گوگل استفاده می‌شود"
                  className={textareaCls}
                />
              </div>

              <HtmlContentEditor
                label="شرح کامل پروژه"
                value={form.content}
                onChange={(content) => setForm((f) => ({ ...f, content }))}
                rows={12}
              />
            </div>

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
              context={{ title: form.title, excerpt: form.description, content: form.content }}
              variant="project"
              previewPath="projects"
            />

            <FaqEditor
              value={form.faqs}
              onChange={(faqs) => setForm((f) => ({ ...f, faqs }))}
              entityLabel="پروژه"
            />
          </div>

          <div className="space-y-6">
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
              <h2 className="text-[var(--foreground)] font-bold mb-4">تصاویر پروژه</h2>
              <ProjectImageEditor
                value={form.images}
                onChange={(images) => setForm((f) => ({ ...f, images }))}
                projectTitle={form.title}
              />
            </div>

            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 space-y-4">
              <h2 className="text-[var(--foreground)] font-bold">جزئیات</h2>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">موقعیت</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="مثال: شهرک صنعتی"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">کارفرما</label>
                <input
                  type="text"
                  value={form.client}
                  onChange={(e) => setForm({ ...form, client: e.target.value })}
                  placeholder="مثال: شهرداری مشهد"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">سال</label>
                <input
                  type="number"
                  value={form.year}
                  onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
                  className={inputCls}
                />
              </div>

              <label className="flex items-center gap-2 text-[var(--foreground)] text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) => setForm({ ...form, published: e.target.checked })}
                />
                منتشر شده
              </label>

              <label className="flex items-center gap-2 text-[var(--foreground)] text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                />
                پروژه ویژه
              </label>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full h-12 rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] font-bold hover:bg-[var(--accent)]/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              ذخیره تغییرات
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
