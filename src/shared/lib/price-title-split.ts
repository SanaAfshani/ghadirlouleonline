/**
 * تفکیک عنوان بلند ردیف قیمت به مدل/سایز/کلاس (سبک، نیمه‌سنگین، سنگین)/مشخصات/ابعاد.
 * مشترک بین scripts/split-price-titles.mjs و همگام‌سازی خودکار دیتابیس سرور (content-sync.ts).
 * بدون import تا Node بتواند مستقیم از اسکریپت بخواندش.
 */

export type SplitTitle = { title: string; size: string; grade: string; spec: string; dimensions: string };

/** عنوان‌های این محصولات ساختار ثابتی ندارند — دستی در پنل تفکیک شوند */
export const SPLIT_SKIP = ['تجهیزات آبیاری قطره‌ای', 'لوله آبیاری قطره‌ای'];

const lat = (s: string) => s.replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
const N = '(\\d+(?:[./]\\d+)?)';

export function splitTitle(raw: string): SplitTitle {
  let t = ' ' + lat(raw).replace(/‌/g, '‌').replace(/\s+/g, ' ') + ' ';
  const o = { size: '', grade: '', spec: [] as string[], dims: [] as string[] };
  const take = (re: RegExp, fn: (m: RegExpMatchArray) => void) => { const m = t.match(re); if (!m) return false; fn(m); t = t.replace(m[0], ' '); return true; };

  // ضخامت قبل از سایز میلیمتری
  take(new RegExp(`ضخامت\\s*${N}\\s*میلی\\s*متر`), (m) => o.dims.push(`ضخامت ${m[1]} میلیمتر`));
  // کاروگیت
  take(new RegExp(`${N}\\s*کیلونیوتن\\s*(SN\\d+)`), (m) => { o.spec.push(`${m[2]} (${m[1]} کیلونیوتن)`); o.grade = m[2] === 'SN4' ? 'سبک' : m[2] === 'SN8' ? 'سنگین' : ''; });
  // اسپیرال: «(16 کیلو نیوتن)» بدون SN — ۱۶ همان SN4 (سبک) و ۳۱.۵ همان SN8 (سنگین) کاروگیت است
  take(new RegExp(`\\(\\s*${N}\\s*کیلو\\s*نیوتن\\s*\\)`), (m) => { o.spec.push(`${m[1]} کیلونیوتن`); o.grade = m[1] === '16' ? 'سبک' : m[1] === '31.5' ? 'سنگین' : ''; });
  take(new RegExp(`سایز\\s*(\\d+)\\s*\\*\\s*(\\d+)\\s*کیلونیوتن`), (m) => { o.size = `${m[1]} میلیمتر`; o.spec.push(`${m[2]} کیلونیوتن`); });
  // پلیکا: ضخامت*قطر + کلاس
  if (/پلیکا/.test(t)) {
    take(new RegExp(`${N}\\s*\\*\\s*(\\d+)`), (m) => { o.size = `${m[2]} میلیمتر`; o.dims.push(`ضخامت ${m[1]} میلیمتر`); });
    take(/\s+وزن\s*[\d.]+\s*$/, () => {});
    if (!take(/نیمه قوی/, () => (o.grade = 'نیمه‌سنگین')) && !take(/ قوی /, () => (o.grade = 'سنگین'))) take(/ناودانی/, () => { o.grade = 'سبک'; o.spec.push('ناودانی'); });
    take(/فاضلابی/, () => o.spec.push('فاضلابی'));
  }
  // سایز میلیمتری با اینچ
  if (!o.size) take(new RegExp(`(?:قطر|سایز)?\\s*${N}\\s*میلی\\s*متر\\s*(?:\\(\\s*([\\d./ ]+?)\\s*اینچ\\s*\\))?`), (m) => { o.size = `${m[1]} میلیمتر${m[2] ? ` (${m[2].replace(/\s/g, '')} اینچ)` : ''}`; });
  if (!o.size) take(/(\d+)\s*متر مکعبی/, (m) => { o.size = `${m[1]} متر مکعب`; });
  // جدار چاه
  take(/(\d+)\s*کیلویی/, (m) => o.spec.push(`${m[1]} کیلویی`));
  if (!o.size) take(/(\d+)\s*اینچ/, (m) => { o.size = `${m[1]} اینچ`; });
  take(/(\d+)\s*میل(?![ی])/, (m) => o.dims.push(`ضخامت ${m[1]} میلیمتر`));
  // ابعاد
  take(new RegExp(`شاخه\\s*${N}\\s*متری`), (m) => o.dims.push(`شاخه ${m[1].replace('/', '.')} متری`));
  take(/-?\s*(ارتفاع|کفی)\s*(\d+)\s*سانتیمتر/, (m) => o.dims.push(`${m[1]} ${m[2]} سانتیمتر`));
  take(/-?\s*کلاف\s*(\d+)\s*متری/, (m) => o.dims.push(`کلاف ${m[1]} متری`));
  // فشار
  take(new RegExp(`-?\\s*${N}\\s*بار(?![^\\s])`), (m) => o.spec.push(`${m[1]} بار`));
  // بتنی / UPVC: «سایز 1000»
  if (!o.size) take(/سایز\s*(\d+)/, (m) => { o.size = /بتنی/.test(t) ? `${m[1]} میلیمتر` : m[1]; });
  // اتصالات دنده‌ای: «"1/2 * 20» = دنده ۱/۲ اینچ روی لوله ۲۰؛ «"1/2 1» همان ۱ ۱/۲ است که برعکس تایپ شده.
  // قطر لوله اول می‌آید تا مرتب‌سازی بر اساس سایز درست باشد
  if (!o.size && t.includes('"')) {
    t = t.replace(/\\/g, '');
    const inches: string[] = [];
    while (take(/"\s*(\d+\/\d+\s+\d+(?!\s*\/)|\d+\s+\d+\/\d+|\d+(?:\/\d+)?)/, (m) => inches.push(m[1].replace(/^(\d+\/\d+)\s+(\d+)$/, '$2 $1') + '"'))) {}
    let pipe = '';
    take(/\*\s*(\d+)/, (m) => (pipe = m[1]));
    while (take(/\s\*\s/, () => {})) {}
    o.size = [pipe, ...inches].filter(Boolean).join(' × ');
  }
  // اتصالات: «زانو 90° 110»، «کوپلر 110»، «تبدیل 110*90»، «زانو 45 درجه 110 دوسر کوپلر»
  if (!o.size && !/"/.test(t)) {
    take(/(?:^|\s)(\d+(?:\s*[*×]\s*\d+)*)(?=\s|$)(?![\s\S]*\s\d)/, (m) => { o.size = m[1].replace(/\s/g, ''); });
  }
  const title = t.replace(/\(\s*\)/g, ' ').replace(/\(\s*([^)]*?)\s*\)/g, ' ($1)').replace(/[-،,]\s*$/, '').replace(/\s+[-،,]\s+/g, ' ').replace(/\s+/g, ' ').trim()
    .replace(/^[-،,\s]+|[-،,\s]+$/g, '');
  return { title, size: o.size, grade: o.grade, spec: o.spec.join(' · '), dimensions: o.dims.join(' · ') };
}
