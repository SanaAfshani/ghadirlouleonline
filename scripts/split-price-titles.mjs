// تفکیک عنوان‌های بلند ردیف‌های قیمت به مدل/سایز/کلاس/مشخصات/ابعاد (یک‌بار، بعد از دیپلوی کدی که این ستون‌ها را نمایش می‌دهد)
// اول دیپلوی، بعد اجرا — وگرنه سایت قدیمی فقط «مدل» کوتاه را نشان می‌دهد.
// DATABASE_URL از .env خوانده می‌شود. خروجی (plan و backup) در پوشه داده‌شده یا پوشه فعلی.
//   node scripts/split-price-titles.mjs [outDir]            → dry run (فقط گزارش + backfill-plan.json)
//   node scripts/split-price-titles.mjs [outDir] --apply    → backup + update
import { createRequire } from 'module'; import fs from 'fs';
const pg = createRequire(process.cwd() + '/x.js')('pg');
const url = process.env.DATABASE_URL || fs.readFileSync('.env', 'utf8').match(/DATABASE_URL="?([^"\n]+)/)[1];
const APPLY = process.argv.includes('--apply');
const OUT = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : '.';

const lat = (s) => s.replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
const N = '(\\d+(?:[./]\\d+)?)';

function split(raw) {
  let t = ' ' + lat(raw).replace(/‌/g, '‌').replace(/\s+/g, ' ') + ' ';
  const o = { size: '', grade: '', spec: [], dims: [] };
  const take = (re, fn) => { const m = t.match(re); if (!m) return false; fn(m); t = t.replace(m[0], ' '); return true; };

  // ضخامت قبل از سایز میلیمتری
  take(new RegExp(`ضخامت\\s*${N}\\s*میلی\\s*متر`), (m) => o.dims.push(`ضخامت ${m[1]} میلیمتر`));
  // کاروگیت
  take(new RegExp(`${N}\\s*کیلونیوتن\\s*(SN\\d+)`), (m) => { o.spec.push(`${m[2]} (${m[1]} کیلونیوتن)`); o.grade = m[2] === 'SN4' ? 'سبک' : m[2] === 'SN8' ? 'سنگین' : ''; });
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
  // اتصالات: «زانو 90° 110»، «کوپلر 110»، «تبدیل 110*90»، «زانو 45 درجه 110 دوسر کوپلر»
  if (!o.size && !/"/.test(t)) {
    take(/(?:^|\s)(\d+(?:\s*[*×]\s*\d+)*)(?=\s|$)(?![\s\S]*\s\d)/, (m) => { o.size = m[1].replace(/\s/g, ''); });
  }
  const title = t.replace(/\(\s*\)/g, ' ').replace(/\(\s*([^)]*?)\s*\)/g, ' ($1)').replace(/[-،,]\s*$/, '').replace(/\s+[-،,]\s+/g, ' ').replace(/\s+/g, ' ').trim()
    .replace(/^[-،,\s]+|[-،,\s]+$/g, '');
  return { title, size: o.size, grade: o.grade, spec: o.spec.join(' · '), dimensions: o.dims.join(' · ') };
}

// عنوان‌های این محصولات ساختار ثابتی ندارند — دستی در پنل تفکیک شوند
const SKIP = ['تجهیزات آبیاری قطره‌ای', 'لوله آبیاری قطره‌ای'];
const c = new pg.Client({ connectionString: url }); await c.connect();
const { rows } = await c.query(`select i.id, i.title, i.size, i.grade, i.spec, i.dimensions, p.name product from "PriceItem" i join "Product" p on p.id = i."productId" order by p.name, i."sortOrder"`);
const changes = [], skipped = [];
for (const r of rows) {
  if (r.size || r.grade || r.spec || r.dimensions) continue; // قبلاً تفکیک شده
  if (SKIP.includes(r.product)) { skipped.push(r); continue; }
  const s = split(r.title);
  if (!s.size || !s.title) { skipped.push(r); continue; }
  changes.push({ id: r.id, product: r.product, before: r.title, ...s });
}
const by = {};
for (const ch of changes) (by[ch.product] ??= []).push(ch);
for (const [p, list] of Object.entries(by)) {
  console.log(`\n## ${p} — ${list.length} ردیف`);
  for (const ch of list.filter((_, i) => i % Math.max(1, Math.floor(list.length / 6)) === 0).slice(0, 7))
    console.log(`  ${ch.before}\n    → مدل «${ch.title}» | سایز «${ch.size}» | کلاس «${ch.grade}» | مشخصات «${ch.spec}» | ابعاد «${ch.dimensions}»`);
}
const skipBy = {};
for (const r of skipped) skipBy[r.product] = (skipBy[r.product] ?? 0) + 1;
console.log(`\nتفکیک‌پذیر: ${changes.length} — بدون تغییر: ${skipped.length}`, skipBy);
fs.writeFileSync(`${OUT}/backfill-plan.json`, JSON.stringify(changes, null, 1));

if (APPLY) {
  const backup = await c.query(`select id, title, size, grade, spec, dimensions, "updatedAt"::text from "PriceItem" where id = any($1)`, [changes.map((x) => x.id)]);
  fs.writeFileSync(`${OUT}/backfill-backup-${Date.now()}.json`, JSON.stringify(backup.rows));
  await c.query('begin');
  // updatedAt دست نمی‌خورد تا «آخرین تغییر قیمت» سایت عوض نشود؛ نسخه تابلو با تغییر عنوان خودکار عوض نمی‌شود پس کش ۱۰ ثانیه‌ای کافی است
  for (const ch of changes)
    await c.query(`update "PriceItem" set title=$2, size=$3, grade=$4, spec=$5, dimensions=$6 where id=$1`, [ch.id, ch.title, ch.size, ch.grade, ch.spec, ch.dimensions]);
  await c.query('commit');
  console.log('applied', changes.length);
}
await c.end();
