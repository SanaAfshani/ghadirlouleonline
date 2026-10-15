'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Save, FileJson, FileText, X, Loader2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { slugify } from '@/shared/lib/utils';
import { uploadPdf } from '@/shared/lib/uploadPdf';
import { ImageUploader } from '@/shared/ui/ImageUploader';
import { ArticleImportDialog } from '@/features/admin/editor/ArticleImportDialog';
import type { ImportedArticle, ImportField } from '@/shared/lib/article-import';
import { HtmlContentEditor } from '@/features/admin/editor/HtmlContentEditor';
import { SeoPanel } from '@/features/admin/seo/SeoPanel';
import type { SeoFields } from '@/features/admin/seo/seo';
import { FaqEditor } from '@/features/admin/seo/FaqEditor';
import type { FaqItem } from '@/shared/types';

export default function NewBlogPostPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);
  const [pdfUploading, setPdfUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    title: '', slug: '', excerpt: '', content: '', coverImage: '',
    pdfUrl: '', featured: false, published: true,
    // فیلدهای سئو — در SeoPanel ویرایش می‌شوند
    metaTitle: '', metaDescription: '', focusKeyword: '', ogTitle: '', ogDescription: '',
    faqs: [] as FaqItem[],
  });

  /** تغییر اسلاگ توسط کاربر، هم‌گام‌سازی خودکار با عنوان را متوقف می‌کند */

  const [importOpen, setImportOpen] = useState(false);

  /** فقط فیلدهایی که کاربر در دیالوگ انتخاب کرده نوشته می‌شوند */
  const applyImport = (data: ImportedArticle, fields: ImportField[]) => {
    setForm((f) => {
      const next = { ...f };
      for (const key of fields) {
        if (key === 'faqs') next.faqs = data.faqs;
        else next[key] = data[key];
      }
      return next;
    });
    if (fields.includes('slug')) setSlugTouched(true);
  };

  const filledFields: Partial<Record<ImportField, boolean>> = {
    title: Boolean(form.title),
    slug: Boolean(form.slug),
    excerpt: Boolean(form.excerpt),
    content: Boolean(form.content),
    metaTitle: Boolean(form.metaTitle),
    metaDescription: Boolean(form.metaDescription),
    focusKeyword: Boolean(form.focusKeyword),
    ogTitle: Boolean(form.ogTitle),
    ogDescription: Boolean(form.ogDescription),
    faqs: form.faqs.length > 0,
  };

  const handleSeoChange = (patch: Partial<SeoFields>) => {
    if (patch.slug !== undefined) setSlugTouched(true);
    setForm((f) => ({ ...f, ...patch }));
  };

  const handlePdfUpload = async (file: File) => {
    setPdfUploading(true);
    setUploadProgress(0);
    try {
      const url = await uploadPdf(file, (pct) => setUploadProgress(pct));
      setForm((f) => ({ ...f, pdfUrl: url }));
      toast.success('فایل PDF با موفقیت آپلود شد');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'خطا در آپلود فایل');
    } finally {
      setPdfUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const meRes = await fetch('/api/auth/me');
      const meJson = await meRes.json();
      const authorId = meJson?.data?.id as string | undefined;

      const res = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          slug: form.slug || slugify(form.title),
          excerpt: form.excerpt || undefined,
          content: form.content,
          coverImage: form.coverImage || undefined,
          pdfUrl: form.pdfUrl || undefined,
          featured: form.featured,
          published: form.published,
          metaTitle: form.metaTitle,
          metaDescription: form.metaDescription,
          focusKeyword: form.focusKeyword,
          ogTitle: form.ogTitle,
          ogDescription: form.ogDescription,
          faqs: form.faqs,
          authorId,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        toast.error(json.error || 'ذخیره مقاله ناموفق بود');
        return;
      }

      toast.success('مقاله با موفقیت ذخیره شد!');
      router.push('/admin/blog');
    } catch {
      toast.error('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    'w-full h-11 bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none transition-colors';

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/blog"
          className="w-9 h-9 rounded-xl bg-[var(--muted)] flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
        >
          <ArrowRight className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">نوشتن مقاله جدید</h1>
          <p className="text-[var(--muted-foreground)] text-sm">اطلاعات مقاله جدید را وارد کنید</p>
        </div>
        <button
          type="button"
          onClick={() => setImportOpen(true)}
          className="mr-auto flex items-center gap-2 h-10 px-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-sm font-semibold hover:bg-emerald-500/25 transition-colors"
        >
          <FileJson className="w-4 h-4" />
          ورود از ابزار تولید محتوا
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 space-y-4">
              <h2 className="text-[var(--foreground)] font-bold">محتوای مقاله</h2>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">عنوان *</label>
                <input
                  type="text" required value={form.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    setForm((f) => ({
                      ...f,
                      title,
                      slug: slugTouched ? f.slug : slugify(title),
                    }));
                  }}
                  placeholder="عنوان مقاله..."
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">خلاصه</label>
                <textarea
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  rows={3}
                  placeholder="خلاصه‌ای کوتاه از مقاله..."
                  className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none resize-none transition-colors"
                />
              </div>

              <HtmlContentEditor
                label="متن کامل مقاله"
                value={form.content}
                onChange={(content) => setForm((f) => ({ ...f, content }))}
                rows={14}
                placeholder="متن مقاله را اینجا بنویسید یا از ابزار تولید محتوا پیست کن..."
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
              context={{ title: form.title, excerpt: form.excerpt, content: form.content }}
              variant="article"
              previewPath="blog"
            />

            <FaqEditor
              value={form.faqs}
              onChange={(faqs) => setForm((f) => ({ ...f, faqs }))}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* تصویر شاخص */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
              <h2 className="text-[var(--foreground)] font-bold mb-4">تصویر شاخص</h2>
              <ImageUploader
                images={form.coverImage ? [form.coverImage] : []}
                onChange={(imgs) => setForm((f) => ({ ...f, coverImage: imgs[0] ?? '' }))}
                max={1}
              />
              <p className="text-xs text-[var(--muted-foreground)] mt-2.5 leading-relaxed">
                در بالای صفحه مقاله و در کارت‌های وبلاگ نمایش داده می‌شود. نسبت ۱۶:۹ پیشنهاد
                می‌شود.
              </p>
            </div>

            {/* PDF Upload */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
              <h2 className="text-[var(--foreground)] font-bold mb-4">فایل PDF مقاله</h2>
              <input
                ref={pdfInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handlePdfUpload(file);
                }}
              />
              {form.pdfUrl ? (
                <div className="flex items-center gap-3 bg-[var(--muted)] rounded-xl px-4 py-3">
                  <FileText className="w-5 h-5 text-[var(--accent-text)] flex-shrink-0" />
                  <span className="text-sm text-[var(--foreground)] flex-1 truncate" dir="ltr">
                    {form.pdfUrl.split('/').pop()}
                  </span>
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, pdfUrl: '' }))}
                    className="text-[var(--muted-foreground)] hover:text-red-700 dark:hover:text-red-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => pdfInputRef.current?.click()}
                  disabled={pdfUploading}
                  className="w-full border-2 border-dashed border-[var(--border)] rounded-xl p-6 flex flex-col items-center justify-center gap-3 text-[var(--muted-foreground)] hover:border-[var(--accent)] hover:text-[var(--accent-text)] transition-colors disabled:opacity-50"
                >
                  {pdfUploading ? (
                    <Loader2 className="w-7 h-7 animate-spin text-[var(--accent-text)]" />
                  ) : (
                    <FileText className="w-7 h-7" />
                  )}
                  <div className="text-sm text-center w-full">
                    <div>{pdfUploading ? `در حال آپلود... ${uploadProgress}%` : 'آپلود فایل PDF'}</div>
                    <div className="text-xs mt-1 text-[var(--muted-foreground)]">حداکثر ۱۰۰ مگابایت</div>
                    {pdfUploading && (
                      <div className="mt-2 w-full bg-[var(--border)] rounded-full h-1.5">
                        <div
                          className="bg-[var(--accent)] h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </button>
              )}
            </div>

            {/* Settings */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 space-y-4">
              <h2 className="text-[var(--foreground)] font-bold">تنظیمات</h2>

              {(
                [
                  { key: 'featured', label: 'مقاله ویژه' },
                  { key: 'published', label: 'منتشر شده' },
                ] as { key: 'featured' | 'published'; label: string }[]
              ).map(({ key, label }) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer">
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, [key]: !f[key] }))}
                    className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${form[key] ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${form[key] ? 'right-1' : 'left-1'}`} />
                  </button>
                  <span className="text-[var(--foreground)] text-sm">{label}</span>
                </label>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] font-bold hover:bg-[var(--accent)]/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              ) : (
                <Save className="w-5 h-5" />
              )}
              ذخیره مقاله
            </button>
          </div>
        </div>
      </form>

      <ArticleImportDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        filled={filledFields}
        onImport={applyImport}
      />
    </div>
  );
}
