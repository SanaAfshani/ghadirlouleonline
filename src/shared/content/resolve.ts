import { defaultLocale, type Locale } from '@/shared/i18n/config';
import type { AnySection, Fields, SectionDef, SectionValue, StoredBlock } from './types';

type Plain = Record<string, unknown>;

function isPlain(value: unknown): value is Plain {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asItems(value: unknown): Plain[] {
  return Array.isArray(value) ? value.filter((v): v is Plain => isPlain(v) && typeof v.id === 'string') : [];
}

/** نسخه فارسی (زبان اصلی): مقدار ذخیره‌شده روی پیش‌فرض؛ فهرست ذخیره‌شده کل فهرست پیش‌فرض را جایگزین می‌کند */
function mergePrimary(fields: Fields, defaults: Plain, stored: unknown): Plain {
  const source = isPlain(stored) ? stored : {};
  const out: Plain = {};
  for (const [name, field] of Object.entries(fields)) {
    if (field.type === 'list') {
      const items = Array.isArray(source[name]) ? asItems(source[name]) : asItems(defaults[name]);
      const defaultItems = asItems(defaults[name]);
      out[name] = items.map((item) => ({
        id: item.id,
        ...mergePrimary(field.fields, defaultItems.find((d) => d.id === item.id) ?? {}, item),
      }));
    } else {
      out[name] = typeof source[name] === 'string' ? source[name] : typeof defaults[name] === 'string' ? defaults[name] : '';
    }
  }
  return out;
}

/**
 * نسخه زبان دوم روی نسخه فارسی: عکس و لینک و ترتیب فهرست از فارسی، متن از ترجمه.
 * ترجمه پیش‌فرضِ کد فقط وقتی معتبر است که متن فارسی همان پیش‌فرض باشد؛ اگر ادمین متن فارسی را عوض کرده و
 * ترجمه‌اش را ننوشته، ترجمه قدیمی ممکن است حرف دیگری بزند (مثلاً شماره یا سال قدیمی)، پس متن فارسی نمایش داده می‌شود.
 */
function mergeTranslation(fields: Fields, primary: Plain, primaryDefaults: Plain, stored: unknown, defaults: unknown, emptyIfMissing: boolean): Plain {
  const source = isPlain(stored) ? stored : {};
  const fallback = isPlain(defaults) ? defaults : {};
  const out: Plain = {};
  for (const [name, field] of Object.entries(fields)) {
    if (field.type === 'image' || field.type === 'link') {
      out[name] = primary[name];
    } else if (field.type === 'list') {
      const storedItems = asItems(source[name]);
      const defaultItems = asItems(fallback[name]);
      const primaryDefaultItems = asItems(primaryDefaults[name]);
      out[name] = asItems(primary[name]).map((item) => ({
        id: item.id,
        ...mergeTranslation(
          field.fields,
          item,
          primaryDefaultItems.find((d) => d.id === item.id) ?? {},
          storedItems.find((d) => d.id === item.id),
          defaultItems.find((d) => d.id === item.id),
          emptyIfMissing,
        ),
      }));
    } else {
      const translated = typeof source[name] === 'string' ? (source[name] as string).trim() : '';
      const defaultTranslation = typeof fallback[name] === 'string' ? (fallback[name] as string) : '';
      const primaryUnchanged = primary[name] === primaryDefaults[name];
      out[name] = translated ? source[name] : defaultTranslation && primaryUnchanged ? defaultTranslation : emptyIfMissing ? '' : primary[name];
    }
  }
  return out;
}

export function resolveSection<S extends Fields>(def: SectionDef<S>, stored: StoredBlock | undefined, locale: Locale): SectionValue<S> {
  const primaryDefaults = def.defaults.fa as Plain;
  const primary = mergePrimary(def.fields, primaryDefaults, stored?.[defaultLocale]);
  if (locale === defaultLocale) return primary as SectionValue<S>;
  return mergeTranslation(def.fields, primary, primaryDefaults, stored?.[locale], def.defaults[locale], false) as SectionValue<S>;
}

/**
 * مقدار فرم پنل برای یک زبان. فرق با resolveSection: متنِ ترجمه‌نشده خالی برمی‌گردد (نه متن فارسی)،
 * وگرنه ذخیره بدون تغییر، متن فارسی را به‌عنوان «ترجمه انگلیسی» ثبت می‌کرد.
 */
export function editableSection(def: AnySection, stored: StoredBlock | undefined, locale: Locale): Record<string, unknown> {
  const primaryDefaults = def.defaults.fa as Plain;
  const primary = mergePrimary(def.fields, primaryDefaults, stored?.[defaultLocale]);
  if (locale === defaultLocale) return primary;
  return mergeTranslation(def.fields, primary, primaryDefaults, stored?.[locale], def.defaults[locale], true);
}

/** تعداد متن‌هایی که در زبان دوم ترجمه ندارند (و در سایت متن فارسی نشان می‌دهند) — برای نشان «نیاز به ترجمه» در پنل */
export function countUntranslated(def: AnySection, stored: StoredBlock | undefined, locale: Locale): number {
  if (locale === defaultLocale) return 0;
  const primary = editableSection(def, stored, defaultLocale);
  const translated = editableSection(def, stored, locale);
  const count = (fields: Fields, a: Plain, b: Plain): number =>
    Object.entries(fields).reduce((sum, [name, field]) => {
      if (field.type === 'image' || field.type === 'link') return sum;
      if (field.type === 'list') {
        const bItems = asItems(b[name]);
        return sum + asItems(a[name]).reduce((n, item, i) => n + count(field.fields, item, bItems[i] ?? {}), 0);
      }
      return sum + (a[name] && !b[name] ? 1 : 0);
    }, 0);
  return count(def.fields, primary, translated);
}
