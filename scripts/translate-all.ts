// ترجمه گروهی همه محتوای بدون نسخه انگلیسی (همان کار صفحه «ترجمه انگلیسی» پنل) از خط فرمان.
//
//   npx tsx scripts/translate-all.ts                    فقط گزارش: چند رکورد و متن ترجمه نشده
//   npx tsx scripts/translate-all.ts --apply            ترجمه با Claude (ANTHROPIC_API_KEY) و ذخیره در دیتابیس
//   npx tsx scripts/translate-all.ts --export out.json  خروجی متن‌های ترجمه‌نشده برای ترجمه بیرونی
//   npx tsx scripts/translate-all.ts --import in.json   ذخیره ترجمه‌های فایل (فیلد translation هر ردیف)
//
// فقط جاهای خالی پر می‌شوند. سایت در حال اجرا صفحه‌ها را با revalidate زمان‌دار تازه می‌کند؛
// برای اعمال فوری روی سایت لایو، صفحه «ترجمه انگلیسی» پنل را ترجیح دهید (کش را هم پاک می‌کند).
import 'dotenv/config';
import { readFileSync, writeFileSync } from 'fs';
import { prisma } from '../src/shared/lib/prisma';
import { exportPending, importTranslations, TRANSLATION_TARGETS, translateTarget, translationCoverage, type ExportedItem } from '../src/shared/lib/bulk-translate';
import { translateToEnglish } from '../src/shared/lib/translate-core';

const args = process.argv.slice(2);
const flag = (name: string) => {
  const i = args.indexOf(name);
  return i === -1 ? undefined : args[i + 1] ?? '';
};

async function report() {
  for (const c of await translationCoverage()) {
    console.log(`${c.label.padEnd(40)} ${c.complete}/${c.total} کامل، ${c.pendingTexts} متن مانده`);
  }
}

async function main() {
  const exportFile = flag('--export');
  const importFile = flag('--import');
  if (exportFile) {
    const items = await exportPending();
    writeFileSync(exportFile, JSON.stringify(items, null, 2));
    console.log(`${items.length} متن در ${exportFile}`);
  } else if (importFile) {
    const entries = JSON.parse(readFileSync(importFile, 'utf8')) as ExportedItem[];
    console.log(`${await importTranslations(entries)} ترجمه ذخیره شد`);
  } else if (args.includes('--apply')) {
    for (const target of TRANSLATION_TARGETS) {
      for (;;) {
        const { translated, remaining } = await translateTarget(target.key, translateToEnglish);
        if (translated) console.log(`${target.label}: ${translated} رکورد ترجمه شد، ${remaining} مانده`);
        if (!remaining) break;
      }
    }
  }
  await report();
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
