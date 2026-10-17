// ساخت نشان واترمارک (لوگو + «قدیر لوله آنلاین») — یک بار؛ خروجی: public/images/watermark.png
// سرور فقط همین PNG را روی عکس‌ها می‌گذارد و به فونت نصب‌شده روی سرور وابسته نیست.
// (pango فایل فونت را همیشه نمی‌خواند و با فونت فارسی سیستم رندر می‌کند — شکل حروف درست است)
//   node scripts/make-watermark.mjs
import sharp from 'sharp';

const H = 160;            // ارتفاع نشان
const LOGO = 132;         // اندازه لوگو
const GAP = 18;
const PAD = 22;

const text = await sharp({
  text: {
    text: '<span foreground="white">قدیر لوله آنلاین</span>',
    font: 'Vazirmatn Bold 54',
    fontfile: 'public/fonts/Vazirmatn-Bold.ttf',
    rgba: true,
    dpi: 72,
  },
}).png().toBuffer({ resolveWithObject: true });

const logo = await sharp('public/images/logo.png').trim().resize(LOGO, LOGO, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();

const W = PAD + text.info.width + GAP + LOGO + PAD;
const textTop = Math.round((H - text.info.height) / 2);
const logoTop = Math.round((H - LOGO) / 2);
const textLeft = PAD;
const logoLeft = PAD + text.info.width + GAP;   // RTL: لوگو سمت راست متن

// لایه پایه: متن و لوگو
const base = await sharp({ create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
  .composite([{ input: text.data, left: textLeft, top: textTop }, { input: logo, left: logoLeft, top: logoTop }])
  .png().toBuffer();

// سایه: شکل تیره و محو همان لایه — روی عکس‌های روشن هم خوانا
const alpha = await sharp(base).extractChannel('alpha').toBuffer();
const shadow = await sharp({ create: { width: W, height: H, channels: 3, background: { r: 0, g: 0, b: 0 } } })
  .joinChannel(alpha).blur(6).linear(0.6, 0).png().toBuffer();

// زمینه نیمه‌شفاف تیره با گوشه گرد — روی عکس روشن (آسمان، بتن) هم متن سفید خوانا بماند
const pill = Buffer.from(`<svg width="${W}" height="${H}"><rect x="2" y="10" width="${W - 4}" height="${H - 20}" rx="${(H - 20) / 2}" fill="rgb(15,23,42)" fill-opacity="0.42"/></svg>`);

await sharp({ create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
  .composite([{ input: pill }, { input: shadow, top: 3, left: 0 }, { input: base }])
  .png()
  .toFile('public/images/watermark.png');
console.log('watermark', W, 'x', H);
