'use client';

import { useMemo, useState } from 'react';
import { Check, ChevronDown, Search, Share2, X } from 'lucide-react';
import { siteConfig } from '@/shared/config/site';
import { formatPersianNumber, slugify, truncate } from '@/shared/lib/utils';
import {
  analyzeKeyword,
  counterTone,
  formatCounter,
  SEO_LIMITS,
  TONE_CLASS,
  VARIANT_LABELS,
  type SeoFields,
  type SeoVariant,
} from './seo';

type Props = {
  value: SeoFields;
  onChange: (patch: Partial<SeoFields>) => void;
  /** محتوای صفحه — برای fallback و تحلیل کلمه کلیدی */
  context: { title: string; excerpt: string; content: string };
  /** نوع محتوا — متن‌های راهنما و چک‌های کلمه کلیدی را تعیین می‌کند */
  variant?: SeoVariant;
  /** مسیر صفحه در پیش‌نمایش گوگل، بدون اسلش ابتدا. مثال: blog یا products/لوله-پلی-اتیلن */
  previewPath: string;
};

const inputCls =
  'w-full h-11 bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--accent)] transition-colors';
const textareaCls =
  'w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--accent)] resize-none transition-colors';

function Field({
  label,
  hint,
  counter,
  children,
}: {
  label: string;
  hint?: string;
  counter?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 mb-1.5">
        <label className="block text-sm font-medium text-[var(--foreground)]">{label}</label>
        {counter}
      </div>
      {children}
      {hint && <p className="text-xs text-[var(--muted-foreground)] mt-1.5 leading-relaxed">{hint}</p>}
    </div>
  );
}

export function SeoPanel({ value, onChange, context, variant = 'article', previewPath }: Props) {
  const [socialOpen, setSocialOpen] = useState(false);
  const labels = VARIANT_LABELS[variant];
  const pathSegments = previewPath.split('/').filter(Boolean);
  // مسیر کامل در RTL بد خوانده می‌شود؛ برای برچسب کنار اینپوت فقط سطح اول را نشان می‌دهیم
  const slugPrefix = pathSegments.length > 1 ? `/${pathSegments[0]}/…/` : `/${pathSegments[0]}/`;

  // هر فیلد خالی، از محتوای مقاله fallback می‌شود — دقیقاً همان چیزی که صفحه عمومی رندر می‌کند
  const effectiveTitle = value.metaTitle || context.title || `عنوان ${labels.entity}`;
  const effectiveDescription =
    value.metaDescription || context.excerpt || `توضیحاتی برای این ${labels.entity} ثبت نشده است.`;
  const effectiveSlug = value.slug || slugify(context.title || '');
  // اگر عنوان سئو خالی باشد، Next نام سایت را به انتهای عنوان صفحه اضافه می‌کند
  const previewTitle =
    value.metaTitle || `${context.title || `عنوان ${labels.entity}`} | ${siteConfig.name}`;

  const checks = useMemo(
    () =>
      value.focusKeyword.trim()
        ? analyzeKeyword(value.focusKeyword, {
            title: context.title,
            metaTitle: value.metaTitle,
            metaDescription: value.metaDescription,
            excerpt: context.excerpt,
            slug: effectiveSlug,
            content: context.content,
          }, variant)
        : [],
    [value.focusKeyword, value.metaTitle, value.metaDescription, effectiveSlug, context, variant]
  );

  const passedCount = checks.filter((c) => c.passed).length;

  const titleTone = counterTone(value.metaTitle.length, SEO_LIMITS.metaTitle);
  const descTone = counterTone(value.metaDescription.length, SEO_LIMITS.metaDescription);

  return (
    <div className="bg-[var(--card)] border-2 border-[var(--accent)]/30 rounded-2xl overflow-hidden">
      {/* سربرگ متمایز — تا ادمین این بخش را با فیلدهای محتوا اشتباه نگیرد */}
      <div className="bg-[var(--accent)]/10 border-b border-[var(--accent)]/20 px-6 py-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[var(--accent)]/20 flex items-center justify-center flex-shrink-0">
          <Search className="w-4 h-4 text-[var(--accent-text)]" />
        </div>
        <div>
          <h2 className="text-[var(--foreground)] font-bold">تنظیمات سئو</h2>
          <p className="text-[var(--accent-text)]/60 text-xs mt-0.5">
            این بخش فقط روی نتایج گوگل اثر دارد و در خود صفحه نمایش داده نمی‌شود
          </p>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* پیش‌نمایش نتیجه گوگل */}
        <div>
          <div className="text-xs font-medium text-[var(--muted-foreground)] mb-2">پیش‌نمایش نتیجه در گوگل</div>
          <div className="bg-white rounded-xl p-4" dir="rtl">
            <div className="text-[#202124] text-xs mb-1" dir="ltr">
              {siteConfig.url.replace(/^https?:\/\//, '')} › {pathSegments.join(' › ')} ›{' '}
              {effectiveSlug || '...'}
            </div>
            <div className="text-[#1a0dab] text-lg leading-snug hover:underline cursor-pointer">
              {truncate(previewTitle, 60)}
            </div>
            <div className="text-[#4d5156] text-sm leading-relaxed mt-1">
              {truncate(effectiveDescription, 158)}
            </div>
          </div>
        </div>

        {/* کلمه کلیدی محوری */}
        <Field
          label="کلمه کلیدی محوری"
          hint={`عبارتی که می‌خواهید این ${labels.entity} با آن در گوگل پیدا شود — همان چیزی که مشتری تایپ می‌کند.`}
        >
          <input
            type="text"
            value={value.focusKeyword}
            onChange={(e) => onChange({ focusKeyword: e.target.value })}
            placeholder="مثال: قیمت لوله پلی اتیلن"
            className={inputCls}
          />
        </Field>

        {/* تحلیل کلمه کلیدی */}
        {checks.length > 0 && (
          <div className="bg-[var(--muted)]/50 border border-[var(--border)] rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[var(--foreground)]">بررسی کلمه کلیدی</span>
              <span
                className={`text-xs font-bold ${
                  passedCount === checks.length
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : passedCount >= 3
                      ? 'text-[var(--accent-text)]'
                      : 'text-red-700 dark:text-red-400'
                }`}
              >
                {formatPersianNumber(passedCount)} از {formatPersianNumber(checks.length)}
              </span>
            </div>
            {checks.map((check) => (
              <div key={check.label} className="flex items-start gap-2.5">
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    check.passed ? 'bg-emerald-500/20' : 'bg-red-500/20'
                  }`}
                >
                  {check.passed ? (
                    <Check className="w-2.5 h-2.5 text-emerald-700 dark:text-emerald-400" />
                  ) : (
                    <X className="w-2.5 h-2.5 text-red-700 dark:text-red-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className={`text-xs ${check.passed ? 'text-[var(--foreground)]' : 'text-[var(--muted-foreground)]'}`}>
                    {check.label}
                  </div>
                  {!check.passed && (
                    <div className="text-[11px] text-[var(--muted-foreground)] mt-0.5 leading-relaxed">
                      {check.hint}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* عنوان سئو */}
        <Field
          label="عنوان سئو (Meta Title)"
          hint={`عنوانی که در نتایج گوگل دیده می‌شود. خالی بماند، از عنوان ${labels.entity} استفاده می‌شود.`}
          counter={
            <span dir="ltr" className={`text-xs tabular-nums ${TONE_CLASS[titleTone]}`}>
              {formatCounter(value.metaTitle.length, SEO_LIMITS.metaTitle.max)}
            </span>
          }
        >
          <input
            type="text"
            value={value.metaTitle}
            onChange={(e) => onChange({ metaTitle: e.target.value })}
            placeholder={context.title || `عنوان ${labels.entity} (پیش‌فرض)`}
            className={inputCls}
          />
        </Field>

        {/* توضیحات متا */}
        <Field
          label="توضیحات متا (Meta Description)"
          hint={`خلاصه‌ای که زیر عنوان در گوگل نمایش داده می‌شود. خالی بماند، از ${labels.summary} استفاده می‌شود.`}
          counter={
            <span dir="ltr" className={`text-xs tabular-nums ${TONE_CLASS[descTone]}`}>
              {formatCounter(value.metaDescription.length, SEO_LIMITS.metaDescription.max)}
            </span>
          }
        >
          <textarea
            value={value.metaDescription}
            onChange={(e) => onChange({ metaDescription: e.target.value })}
            rows={3}
            placeholder={context.excerpt || `${labels.summary} (پیش‌فرض)`}
            className={textareaCls}
          />
        </Field>

        {/* اسلاگ */}
        <Field
          label="اسلاگ آدرس (Slug)"
          hint={`بخش پایانی آدرس ${labels.entity}، فقط با حروف انگلیسی، عدد و خط تیره. متن فارسی خودکار به انگلیسی تبدیل می‌شود — بهتر است اصلاحش کنی (مثلاً push-fit-pipes). اگر بعد از انتشار عوضش کنی، آدرس قبلی خودکار به جدید منتقل می‌شود.`}
        >
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--muted-foreground)] flex-shrink-0" dir="ltr">
              {slugPrefix}
            </span>
            <input
              type="text"
              value={value.slug}
              onChange={(e) => onChange({ slug: e.target.value })}
              onBlur={(e) => onChange({ slug: slugify(e.target.value) })}
              placeholder={slugify(context.title || '') || 'ادرس-مقاله'}
              className={inputCls}
              dir="ltr"
            />
          </div>
        </Field>

        {/* شبکه‌های اجتماعی — تاشو، چون معمولاً همان مقادیر بالا کافی است */}
        <div className="border-t border-[var(--border)] pt-5">
          <button
            type="button"
            onClick={() => setSocialOpen((o) => !o)}
            className="w-full flex items-center justify-between text-right group"
          >
            <span className="flex items-center gap-2.5">
              <Share2 className="w-4 h-4 text-[var(--muted-foreground)] group-hover:text-[var(--accent-text)] transition-colors" />
              <span className="text-sm font-medium text-[var(--foreground)]">
                اشتراک‌گذاری در شبکه‌های اجتماعی
              </span>
              <span className="text-[11px] text-[var(--muted-foreground)]">(اختیاری)</span>
            </span>
            <ChevronDown
              className={`w-4 h-4 text-[var(--muted-foreground)] transition-transform ${socialOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {socialOpen && (
            <div className="space-y-5 mt-5">
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed bg-[var(--muted)]/50 rounded-xl p-3">
                عنوان و توضیحاتی که هنگام ارسال لینک این صفحه در واتس‌اپ، تلگرام و اینستاگرام نمایش
                داده می‌شود. اگر خالی بماند، همان عنوان و توضیحات سئوی بالا استفاده می‌شود.
              </p>

              <Field label="عنوان شبکه‌های اجتماعی (og:title)">
                <input
                  type="text"
                  value={value.ogTitle}
                  onChange={(e) => onChange({ ogTitle: e.target.value })}
                  placeholder={effectiveTitle}
                  className={inputCls}
                />
              </Field>

              <Field label="توضیحات شبکه‌های اجتماعی (og:description)">
                <textarea
                  value={value.ogDescription}
                  onChange={(e) => onChange({ ogDescription: e.target.value })}
                  rows={3}
                  placeholder={effectiveDescription}
                  className={textareaCls}
                />
              </Field>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
