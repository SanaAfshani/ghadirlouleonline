// استخراج عکس محصول‌ها از کاتالوگ رسمی ویسپار (vispar.co/catalog).
//
// برخلاف کاتالوگ دریچه‌ها که صفحه‌هایش تخت‌شده بود، این PDF عکس هر محصول را به‌صورت
// شیء جداگانه و با ماسک شفافیت دارد؛ پس عکس تمیزِ جدا درمی‌آید و نیازی به برش نیست.
// عکس‌ها معمولاً روی زمینه مشکیِ استودیو هستند: با ماسک جدا و روی سفید نشانده می‌شوند.
//
//   npx tsx scripts/extract-vispar-photos.ts <catalog.pdf> <outDir>
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { execFileSync } from 'node:child_process';

const [pdf, outDir] = process.argv.slice(2);
if (!pdf || !outDir) {
  console.error('استفاده: npx tsx scripts/extract-vispar-photos.ts <catalog.pdf> <outDir>');
  process.exit(1);
}

type Row = { page: number; num: number; type: string; width: number; height: number; object: string };

/** جدول pdfimages -list → ردیف‌های ساخت‌یافته */
function listImages(file: string): Row[] {
  const out = execFileSync('pdfimages', ['-list', file], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  const rows: Row[] = [];
  for (const line of out.split('\n').slice(2)) {
    const c = line.trim().split(/\s+/);
    if (c.length < 10) continue;
    rows.push({ page: +c[0], num: +c[1], type: c[2], width: +c[3], height: +c[4], object: c[9] });
  }
  return rows;
}

async function main() {
  const raw = path.join(outDir, 'raw');
  await fs.mkdir(raw, { recursive: true });
  execFileSync('pdfimages', ['-png', pdf, path.join(raw, 'p')], { stdio: 'ignore' });

  const rows = listImages(pdf);
  const file = (num: number) => path.join(raw, `p-${String(num).padStart(3, '0')}.png`);

  let kept = 0;
  const report: string[] = [];

  for (const [i, row] of rows.entries()) {
    if (row.type !== 'image') continue;
    // عکس‌های ریز، لوگو و تزئینات صفحه را نمی‌خواهیم
    if (row.width < 280 || row.height < 180) continue;

    const next = rows[i + 1];
    const mask = next?.type === 'smask' && next.object === row.object ? file(next.num) : null;

    let image = sharp(file(row.num));
    if (mask) {
      // ماسک، آلفای عکس است: محصول از زمینه مشکی جدا می‌شود
      const alpha = await sharp(mask).resize(row.width, row.height, { fit: 'fill' }).toColorspace('b-w').toBuffer();
      image = sharp(await image.ensureAlpha().joinChannel(alpha).png().toBuffer());
    }

    const flat = await image
      .flatten({ background: { r: 255, g: 255, b: 255 } })
      .trim({ threshold: 28 })
      .png()
      .toBuffer();

    const meta = await sharp(flat).metadata();
    if ((meta.width ?? 0) < 220 || (meta.height ?? 0) < 140) continue;

    const name = `v-${String(row.page).padStart(3, '0')}-${String(row.num).padStart(3, '0')}.png`;
    await fs.writeFile(path.join(outDir, name), flat);
    report.push(`${name}  ${meta.width}x${meta.height}${mask ? '  (ماسک‌دار)' : ''}  صفحه ${row.page}`);
    kept++;
  }

  await fs.writeFile(path.join(outDir, 'report.txt'), report.join('\n'));
  console.log(`${kept} عکس محصول استخراج شد → ${outDir}`);
  console.log(report.slice(0, 12).join('\n'));
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
