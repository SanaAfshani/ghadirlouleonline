// تفکیک عنوان‌های بلند ردیف‌های قیمت به مدل/سایز/کلاس/مشخصات/ابعاد (یک‌بار، بعد از دیپلوی کدی که این ستون‌ها را نمایش می‌دهد)
// اول دیپلوی، بعد اجرا — وگرنه سایت قدیمی فقط «مدل» کوتاه را نشان می‌دهد.
// DATABASE_URL از .env خوانده می‌شود. خروجی (plan و backup) در پوشه داده‌شده یا پوشه فعلی.
//   node scripts/split-price-titles.mjs [outDir]            → dry run (فقط گزارش + backfill-plan.json)
//   node scripts/split-price-titles.mjs [outDir] --apply    → backup + update
import { createRequire } from 'module'; import fs from 'fs';
import { splitTitle as split, SPLIT_SKIP as SKIP } from '../src/shared/lib/price-title-split.ts';
const pg = createRequire(process.cwd() + '/x.js')('pg');
const url = process.env.DATABASE_URL || fs.readFileSync('.env', 'utf8').match(/DATABASE_URL="?([^"\n]+)/)[1];
const APPLY = process.argv.includes('--apply');
const OUT = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : '.';

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
