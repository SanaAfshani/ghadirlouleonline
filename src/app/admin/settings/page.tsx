'use client';

import { useEffect, useState } from 'react';
import { m as motion } from 'framer-motion';
import {
  Save, Phone, Loader2, Building2, LayoutPanelTop, UserRound, MessageCircle, ShieldCheck,
  Sparkles, Plus, Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ImageUploader } from '@/shared/ui/ImageUploader';
import {
  defaultLocalizedText, defaultSiteSettings, localizedSettingKey, parseTrustBadges,
  type LocalizedSiteText, type TrustBadge,
} from '@/shared/lib/site-settings';
import { requestTranslation } from '@/features/admin/content/translate-client';
import { faDigits } from '@/shared/lib/utils';

/** متن دوزبانه: نسخه فارسی در `key` و انگلیسی در `key_en`؛ text پیش‌فرض هر زبان را برای placeholder می‌دهد */
type LocalizedRow = { kind: 'localized'; key: string; text: keyof LocalizedSiteText; label: string; multiline?: boolean };
type PlainRow = { kind: 'plain'; key: string; label: string; type?: string; ltr?: boolean; placeholder?: string; hint?: string };
type Row = LocalizedRow | PlainRow;
type Section = { title: string; icon: React.ReactNode; rows: Row[] };

const iconCls = 'w-5 h-5 text-[var(--accent-text)]';

const SECTIONS: Section[] = [
  {
    title: 'اطلاعات کسب‌وکار',
    icon: <Building2 className={iconCls} />,
    rows: [
      { kind: 'localized', key: 'site_title', text: 'siteName', label: 'نام سایت' },
      { kind: 'localized', key: 'site_description', text: 'siteDescription', label: 'توضیحات سایت', multiline: true },
      { kind: 'localized', key: 'manufacturer_name', text: 'legalName', label: 'نام کارخانه تولیدکننده' },
      { kind: 'localized', key: 'exclusive_title', text: 'exclusiveTitle', label: 'عنوان نمایندگی انحصاری (هدر، هیرو و فوتر)' },
    ],
  },
  {
    title: 'صفحه اصلی (هیرو)',
    icon: <LayoutPanelTop className={iconCls} />,
    rows: [
      { kind: 'localized', key: 'hero_title', text: 'heroTitle', label: 'عنوان هیرو' },
      { kind: 'localized', key: 'hero_subtitle', text: 'heroSubtitle', label: 'زیرعنوان هیرو', multiline: true },
    ],
  },
  {
    title: 'تماس',
    icon: <Phone className={iconCls} />,
    rows: [
      { kind: 'plain', key: 'contact_phone', label: 'تلفن فروش (هدر و دکمه تماس)', type: 'tel', placeholder: defaultSiteSettings.phone },
      { kind: 'plain', key: 'contact_mobile', label: 'موبایل (واتس‌اپ)', type: 'tel', placeholder: defaultSiteSettings.mobile },
      {
        kind: 'plain',
        key: 'company_phones',
        label: 'تلفن‌های ثابت شرکت',
        placeholder: defaultSiteSettings.companyPhones.join('، '),
        hint: 'با ویرگول از هم جدا کنید.',
      },
      { kind: 'plain', key: 'contact_email', label: 'ایمیل', type: 'email', placeholder: defaultSiteSettings.email },
      { kind: 'localized', key: 'contact_address', text: 'address', label: 'آدرس دفتر مرکزی' },
      { kind: 'localized', key: 'factory_address', text: 'factoryAddress', label: 'آدرس کارخانه و انبار' },
      { kind: 'plain', key: 'map_url', label: 'لینک گوگل مپ کارخانه', type: 'url', ltr: true, placeholder: defaultSiteSettings.mapUrl },
      { kind: 'localized', key: 'working_hours', text: 'workingHours', label: 'ساعت کاری' },
    ],
  },
  {
    title: 'کارشناس فروش',
    icon: <UserRound className={iconCls} />,
    rows: [
      { kind: 'localized', key: 'sales_expert_name', text: 'salesExpertName', label: 'نام کارشناس' },
      { kind: 'localized', key: 'sales_expert_role', text: 'salesExpertRole', label: 'سمت' },
    ],
  },
  {
    title: 'شبکه‌های اجتماعی',
    icon: <MessageCircle className={iconCls} />,
    rows: [
      { kind: 'plain', key: 'rubika_id', label: 'شناسه روبیکا', ltr: true, placeholder: defaultSiteSettings.rubikaId },
      {
        kind: 'plain',
        key: 'rubika_url',
        label: 'لینک حساب روبیکا',
        type: 'url',
        ltr: true,
        placeholder: defaultSiteSettings.rubikaUrl,
        hint: 'باید با https:// شروع شود؛ همان لینکی که «اشتراک حساب» روبیکا می‌سازد.',
      },
    ],
  },
];

const ROWS = SECTIONS.flatMap((s) => s.rows);
const LOCALIZED_ROWS = ROWS.filter((r): r is LocalizedRow => r.kind === 'localized');
/** همه کلیدهای متنی این فرم — همه در EDITABLE_SETTING_KEYS هستند */
const TEXT_KEYS = ROWS.flatMap((r) => (r.kind === 'localized' ? [r.key, localizedSettingKey(r.key, 'en')] : [r.key]));

type Values = Record<string, string>;

/** قاعده سراسری input/textarea در globals.css جهت را rtl می‌کند و بر dir غلبه دارد؛ فیلد انگلیسی باید صریحاً چپ‌چین شود */
const ltrStyle = { direction: 'ltr', textAlign: 'left' } as const;

const inputCls =
  'w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--accent)] transition-colors';

function TextInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  ltr,
  multiline,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  ltr?: boolean;
  multiline?: boolean;
}) {
  const dir = ltr ? 'ltr' : undefined;
  const style = ltr ? ltrStyle : undefined;
  return multiline ? (
    <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} dir={dir} style={style} rows={3} className={`${inputCls} py-2.5 leading-7 resize-y`} />
  ) : (
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} dir={dir} style={style} className={`${inputCls} h-11`} />
  );
}

/** trust_badges ذخیره‌نشده یعنی نمادهای پیش‌فرض کد — همان‌ها در فرم نشان داده می‌شوند */
function badgesFrom(raw: Values): TrustBadge[] {
  return parseTrustBadges(raw.trust_badges) ?? defaultSiteSettings.trustBadges;
}

export default function AdminSettingsPage() {
  const [values, setValues] = useState<Values>({});
  const [badges, setBadges] = useState<TrustBadge[]>([]);
  // آخرین نسخه ذخیره‌شده — برای تشخیص تغییر و فرستادن فقط کلیدهای عوض‌شده
  const [saved, setSaved] = useState<{ values: Values; badges: TrustBadge[] } | null>(null);
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/settings');
        const json = await res.json();
        if (json.success && json.data) {
          const data = json.data as Values;
          const initial = Object.fromEntries(TEXT_KEYS.map((key) => [key, data[key] ?? '']));
          setValues(initial);
          setBadges(badgesFrom(data));
          setSaved({ values: initial, badges: badgesFrom(data) });
        } else {
          toast.error(json.error || 'بارگذاری تنظیمات ناموفق بود');
        }
      } catch {
        toast.error('خطا در ارتباط با سرور');
      }
    })();
  }, []);

  const changedKeys = saved ? TEXT_KEYS.filter((key) => values[key] !== saved.values[key]) : [];
  const badgesChanged = saved ? JSON.stringify(badges) !== JSON.stringify(saved.badges) : false;
  const dirty = changedKeys.length > 0 || badgesChanged;

  // هشدار مرورگر قبل از بستن تب با تغییرات ذخیره‌نشده
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const setValue = (key: string) => (value: string) => setValues((v) => ({ ...v, [key]: value }));
  const updateBadge = (i: number, patch: Partial<TrustBadge>) =>
    setBadges((list) => list.map((b, k) => (k === i ? { ...b, ...patch } : b)));

  // فارسیِ خالی یعنی متن پیش‌فرض که نسخه انگلیسی آماده دارد؛ فقط متن فارسی سفارشی با انگلیسی خالی ترجمه می‌شود
  const untranslated = LOCALIZED_ROWS.filter((r) => values[r.key]?.trim() && !values[localizedSettingKey(r.key, 'en')]?.trim());

  const translate = async () => {
    if (!untranslated.length) return toast('همه متن‌ها ترجمه دارند');
    setTranslating(true);
    try {
      const result = await requestTranslation(untranslated.map((r) => ({ id: r.key, text: values[r.key], html: false })));
      setValues((v) => ({
        ...v,
        ...Object.fromEntries(Object.entries(result).map(([key, text]) => [localizedSettingKey(key, 'en'), text])),
      }));
      toast.success(`${faDigits(Object.keys(result).length)} متن ترجمه شد — بازبینی و ذخیره کنید`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'ترجمه انجام نشد');
    } finally {
      setTranslating(false);
    }
  };

  const handleSave = async () => {
    if (!saved) return;
    if (badges.some((b) => !b.name.trim() || !b.image)) return toast.error('هر نماد اعتماد باید نام و تصویر داشته باشد');
    if (badges.some((b) => b.href.trim() && !/^https:\/\//i.test(b.href.trim()))) {
      return toast.error('لینک استعلام نماد باید با https:// شروع شود');
    }

    const nextValues = Object.fromEntries(TEXT_KEYS.map((key) => [key, values[key].trim()]));
    const nextBadges = badges.map((b) => ({ name: b.name.trim(), nameEn: b.nameEn?.trim() ?? '', image: b.image, href: b.href.trim() }));
    const payload: Values = Object.fromEntries(changedKeys.map((key) => [key, nextValues[key]]));
    if (badgesChanged) payload.trust_badges = JSON.stringify(nextBadges);

    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        toast.error(json.error || 'ذخیره تنظیمات ناموفق بود');
        return;
      }

      setValues(nextValues);
      setBadges(nextBadges);
      setSaved({ values: nextValues, badges: nextBadges });
      toast.success('تنظیمات ذخیره شد!');
    } catch {
      toast.error('خطا در ارتباط با سرور');
    } finally {
      setSaving(false);
    }
  };

  if (!saved) {
    return (
      <div className="flex items-center justify-center py-24 text-[var(--muted-foreground)] gap-2">
        <Loader2 className="w-6 h-6 animate-spin" />
        بارگذاری تنظیمات...
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-wrap items-start gap-3">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">تنظیمات سایت</h1>
          <p className="text-[var(--muted-foreground)] text-sm mt-1 leading-7">
            هر متن یک نسخه فارسی و یک نسخه انگلیسی (سایت /en) دارد. فیلد خالی یعنی متن پیش‌فرض همان زبان که کم‌رنگ داخل فیلد دیده می‌شود.
          </p>
        </div>
        <button
          type="button"
          onClick={translate}
          disabled={translating || saving || !untranslated.length}
          className="h-10 px-4 rounded-xl border border-[var(--border)] text-sm font-bold flex items-center gap-1.5 hover:border-[var(--accent)] disabled:opacity-50"
        >
          {translating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          ترجمه خودکار
          {untranslated.length > 0 && <span className="text-xs text-[var(--muted-foreground)]">({faDigits(untranslated.length)})</span>}
        </button>
      </div>

      <div className="grid gap-6">
        {SECTIONS.map((section, si) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: si * 0.05 }}
            className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 space-y-5"
          >
            <h2 className="text-[var(--foreground)] font-bold flex items-center gap-2">
              {section.icon}
              {section.title}
            </h2>
            {section.rows.map((row) => (
              <div key={row.key}>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">{row.label}</label>
                {row.kind === 'localized' ? (
                  <div className="grid sm:grid-cols-2 gap-2">
                    <div>
                      <span className="block text-[11px] font-bold text-[var(--muted-foreground)] mb-1">فارسی</span>
                      <TextInput value={values[row.key]} onChange={setValue(row.key)} placeholder={defaultLocalizedText.fa[row.text]} multiline={row.multiline} />
                    </div>
                    <div>
                      <span className="block text-[11px] font-bold text-[var(--muted-foreground)] mb-1" dir="ltr">English</span>
                      <TextInput
                        value={values[localizedSettingKey(row.key, 'en')]}
                        onChange={setValue(localizedSettingKey(row.key, 'en'))}
                        placeholder={defaultLocalizedText.en[row.text]}
                        multiline={row.multiline}
                        ltr
                      />
                    </div>
                  </div>
                ) : (
                  <TextInput value={values[row.key]} onChange={setValue(row.key)} placeholder={row.placeholder} type={row.type} ltr={row.ltr} />
                )}
                {row.kind === 'plain' && row.hint && <p className="mt-1 text-xs text-[var(--muted-foreground)]">{row.hint}</p>}
              </div>
            ))}
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: SECTIONS.length * 0.05 }}
          className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 space-y-4"
        >
          <div>
            <h2 className="text-[var(--foreground)] font-bold flex items-center gap-2">
              <ShieldCheck className={iconCls} />
              نمادهای اعتماد
            </h2>
            <p className="text-xs text-[var(--muted-foreground)] mt-1.5 leading-6">
              در فوتر نمایش داده می‌شوند. لینک استعلام رسمی هر نماد را بگذارید؛ نمادِ بدون لینک برای مشتری قابل بررسی نیست.
              اگر همه را حذف کنید، هیچ نمادی نمایش داده نمی‌شود.
            </p>
          </div>

          {badges.map((badge, i) => (
            <div key={i} className="grid sm:grid-cols-[140px_1fr_auto] gap-4 items-start p-4 rounded-xl border border-[var(--border)]">
              <ImageUploader images={badge.image ? [badge.image] : []} onChange={(imgs) => updateBadge(i, { image: imgs[0] ?? '' })} max={1} />
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--muted-foreground)] mb-1.5">نام نماد</label>
                  <TextInput value={badge.name} onChange={(name) => updateBadge(i, { name })} placeholder="مثلاً: نماد اعتماد الکترونیکی" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--muted-foreground)] mb-1.5">نام انگلیسی</label>
                  <TextInput value={badge.nameEn ?? ''} onChange={(nameEn) => updateBadge(i, { nameEn })} placeholder="e.g. eNamad trust seal" ltr />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--muted-foreground)] mb-1.5">لینک استعلام</label>
                  <TextInput value={badge.href} onChange={(href) => updateBadge(i, { href })} placeholder="https://..." type="url" ltr />
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBadges((list) => list.filter((_, k) => k !== i))}
                aria-label="حذف"
                className="w-9 h-9 grid place-items-center rounded-lg text-red-600 hover:bg-red-500/10 justify-self-end"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => setBadges((list) => [...list, { name: '', image: '', href: '' }])}
            disabled={badges.length >= 8}
            className="h-11 px-4 rounded-xl border-2 border-dashed border-[var(--border)] text-sm font-bold flex items-center gap-1.5 hover:border-[var(--accent)] disabled:opacity-40"
          >
            <Plus className="w-4 h-4" /> افزودن نماد
          </button>
        </motion.div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !dirty}
          className="flex items-center justify-center gap-2 h-12 px-8 rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] font-bold hover:bg-[var(--accent)]/90 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          ذخیره تنظیمات
        </button>
      </div>
    </div>
  );
}
