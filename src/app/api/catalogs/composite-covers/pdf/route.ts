import { NextResponse } from 'next/server';
import path from 'node:path';
import React from 'react';
import sharp from 'sharp';
import { Document, Font, Image, Page, StyleSheet, Text, View, renderToBuffer } from '@react-pdf/renderer';
import { prisma } from '@/shared/lib/prisma';
import { siteConfig } from '@/shared/config/site';
import { parseJsonArray, parseJsonObject } from '@/shared/lib/serializers';
import { serverErrorResponse } from '@/shared/lib/api-errors';

export const maxDuration = 60;

/** محصولاتی که در این کاتالوگ می‌آیند، به ترتیب */
const SLUGS = [
  'composite-manhole-covers',
  'telecom-covers',
  'gas-covers-manholes',
  'industrial-park-covers',
  'electrical-duct-boxes',
  'urban-furniture-composite',
];

const ACCENT = '#d97706';
const INK = '#0f172a';
const MUTED = '#64748b';
const LINE = '#e2e8f0';

function registerFonts() {
  const dir = path.join(process.cwd(), 'public', 'fonts');
  Font.register({
    family: 'Vazirmatn',
    fonts: [
      { src: path.join(dir, 'Vazirmatn-Regular.ttf'), fontWeight: 400 },
      { src: path.join(dir, 'Vazirmatn-Bold.ttf'), fontWeight: 700 },
    ],
  });
}

const s = StyleSheet.create({
  page: { fontFamily: 'Vazirmatn', fontSize: 9.5, padding: 34, direction: 'rtl', color: INK },
  cover: { fontFamily: 'Vazirmatn', direction: 'rtl', color: INK, padding: 0 },
  coverBand: { backgroundColor: INK, paddingVertical: 54, paddingHorizontal: 44 },
  coverTitle: { fontSize: 30, fontWeight: 700, color: '#fff', textAlign: 'right' },
  coverSub: { fontSize: 12, color: '#cbd5e1', textAlign: 'right', marginTop: 10, lineHeight: 1.7 },
  coverRule: { height: 5, backgroundColor: ACCENT },
  head: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 8, borderBottomWidth: 2, borderBottomColor: LINE, marginBottom: 14 },
  brand: { fontSize: 10, fontWeight: 700 },
  pageNo: { fontSize: 8, color: MUTED },
  h1: { fontSize: 16, fontWeight: 700, textAlign: 'right', marginBottom: 4 },
  h2: { fontSize: 12, fontWeight: 700, textAlign: 'right', marginTop: 14, marginBottom: 6 },
  p: { fontSize: 9.5, lineHeight: 1.85, textAlign: 'right', color: '#334155' },
  muted: { fontSize: 8.5, color: MUTED, textAlign: 'right', lineHeight: 1.7 },
  photo: { width: '100%', height: 168, objectFit: 'contain', marginTop: 10, marginBottom: 6 },
  th: { flexDirection: 'row-reverse', backgroundColor: INK, paddingVertical: 5, paddingHorizontal: 4 },
  thText: { color: '#fff', fontSize: 8.5, fontWeight: 700, textAlign: 'center' },
  tr: { flexDirection: 'row-reverse', borderBottomWidth: 0.5, borderBottomColor: LINE, paddingVertical: 4, paddingHorizontal: 4 },
  trAlt: { backgroundColor: '#f8fafc' },
  td: { fontSize: 8.5, textAlign: 'center' },
  specRow: { flexDirection: 'row-reverse', borderBottomWidth: 0.5, borderBottomColor: LINE, paddingVertical: 4 },
  specKey: { width: '38%', fontSize: 9, color: MUTED, textAlign: 'right' },
  specVal: { width: '62%', fontSize: 9, fontWeight: 700, textAlign: 'right' },
  footer: { position: 'absolute', bottom: 18, left: 34, right: 34, borderTopWidth: 1, borderTopColor: LINE, paddingTop: 6, flexDirection: 'row-reverse', justifyContent: 'space-between' },
  footText: { fontSize: 7.5, color: MUTED },
});

const el = React.createElement;

/** جدول‌های داخل توضیحات HTML محصول → ردیف‌های قابل رندر در PDF */
function tablesFromHtml(html: string) {
  const out: { head: string[]; rows: string[][] }[] = [];
  for (const [, table] of html.matchAll(/<table>([\s\S]*?)<\/table>/g)) {
    const head = [...table.matchAll(/<th>([\s\S]*?)<\/th>/g)].map((m) => strip(m[1]));
    const rows = [...table.matchAll(/<tr>([\s\S]*?)<\/tr>/g)]
      .map((m) => [...m[1].matchAll(/<td>([\s\S]*?)<\/td>/g)].map((c) => strip(c[1])))
      .filter((r) => r.length > 0);
    if (head.length && rows.length) out.push({ head, rows });
  }
  return out;
}
const strip = (v: string) => v.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

function Header({ page }: { page: number }) {
  return el(View, { style: s.head }, [
    el(Text, { key: 'b', style: s.brand }, siteConfig.name),
    el(Text, { key: 'p', style: s.pageNo }, `صفحه ${page.toLocaleString('fa-IR')}`),
  ]);
}

function Footer() {
  return el(View, { style: s.footer, fixed: true }, [
    el(Text, { key: 'a', style: s.footText }, `${siteConfig.name} — ${siteConfig.url.replace('https://', '')}`),
    el(Text, { key: 'b', style: s.footText }, [siteConfig.companyPhones[0], siteConfig.mobile].join('  ·  ')),
  ]);
}

function Table({ head, rows }: { head: string[]; rows: string[][] }) {
  const w = `${(100 / head.length).toFixed(2)}%`;
  // جدول بلند اجازه دارد بین دو صفحه بشکند؛ با wrap: false کل صفحه قبلی خالی می‌ماند.
  // سرستون با fixed روی صفحه بعد هم تکرار می‌شود.
  return el(View, { style: { marginTop: 8 } }, [
    el(View, { key: 'h', style: s.th, fixed: true }, head.map((h, i) => el(Text, { key: i, style: [s.thText, { width: w }] }, h))),
    ...rows.map((r, ri) =>
      el(
        View,
        { key: ri, style: ri % 2 ? [s.tr, s.trAlt] : s.tr },
        head.map((_, ci) => el(Text, { key: ci, style: [s.td, { width: w }] }, r[ci] ?? '—')),
      ),
    ),
  ]);
}


/**
 * کاتالوگ «دریچه و منهول کامپوزیتی» با برند خودمان، ساخته‌شده از همان محصولات دیتابیس.
 * چون از روی داده زنده رندر می‌شود، کاتالوگ و صفحه محصول هیچ‌وقت از هم عقب نمی‌افتند.
 */
export async function GET() {
  try {
    registerFonts();

    const rows = await prisma.product.findMany({
      where: { slug: { in: SLUGS } },
      select: { slug: true, name: true, shortDescription: true, description: true, specifications: true, images: true },
    });
    const products = SLUGS.map((slug) => rows.find((r) => r.slug === slug)).filter(Boolean) as typeof rows;
    if (!products.length) {
      return NextResponse.json({ success: false, error: 'محصولی برای کاتالوگ نیست' }, { status: 404 });
    }

    const today = new Date().toLocaleDateString('fa-IR', { year: 'numeric', month: 'long' });
    const pages: React.ReactNode[] = [];

    pages.push(
      el(Page, { key: 'cover', size: 'A4', style: s.cover }, [
        el(View, { key: 'r', style: s.coverRule }),
        el(View, { key: 'b', style: s.coverBand }, [
          el(Text, { key: 't', style: s.coverTitle }, 'کاتالوگ دریچه و منهول کامپوزیتی'),
          el(Text, { key: 'u', style: s.coverSub },
            'دریچه، درب و طوقه پایه سیمانی تقویت‌شده با نانوذرات\nآب و فاضلاب · مخابرات · گاز · برق · شهرک صنعتی · مبلمان شهری'),
        ]),
        el(View, { key: 'r2', style: s.coverRule }),
        el(View, { key: 'm', style: { padding: 44 } }, [
          el(Text, { key: '1', style: [s.p, { fontSize: 11 }] },
            'مجموعه‌ای از دریچه و تجهیزات پیش‌ساخته کامپوزیتی که به‌جای چدن در شبکه‌های شهری نصب می‌شوند: بدون ارزش بازیافتی و در نتیجه بدون انگیزه سرقت، مقاوم در برابر خوردگی و سبک‌تر از نمونه چدنی هم‌اندازه.'),
          el(Text, { key: '2', style: [s.muted, { marginTop: 18 }] }, `${siteConfig.name} — ${siteConfig.exclusiveTitle}`),
          el(Text, { key: '3', style: s.muted }, `دفتر فروش: ${siteConfig.address}  ·  کارخانه: ${siteConfig.factoryAddress}`),
          el(Text, { key: '4', style: s.muted }, `${siteConfig.companyPhones[0]}  ·  ${siteConfig.mobile}  ·  ${siteConfig.email}`),
          el(Text, { key: '5', style: [s.muted, { marginTop: 10 }] }, `ویرایش ${today}`),
        ]),
      ]),
    );

    let pageNo = 1;
    for (const p of products) {
      const images = parseJsonArray(p.images);
      const specs = Object.entries(parseJsonObject(p.specifications));
      const tables = tablesFromHtml(p.description ?? '');
      // @react-pdf فقط JPEG و PNG می‌خواند و عکس‌های سایت WebP هستند
      const photo = images[0]
        ? { data: await sharp(path.join(process.cwd(), 'public', images[0].replace(/^\//, ''))).png().toBuffer(), format: 'png' as const }
        : null;

      pages.push(
        el(Page, { key: p.slug, size: 'A4', style: s.page }, [
          el(Header, { key: 'h', page: pageNo }),
          el(Text, { key: 't', style: s.h1 }, p.name),
          el(Text, { key: 'd', style: s.p }, p.shortDescription ?? ''),
          photo ? el(Image, { key: 'img', src: photo, style: s.photo }) : null,
          specs.length
            ? el(View, { key: 'sp' }, [
                el(Text, { key: 'h2', style: s.h2 }, 'مشخصات کلی'),
                ...specs.map(([k, v], i) =>
                  el(View, { key: i, style: s.specRow }, [
                    el(Text, { key: 'k', style: s.specKey }, k),
                    el(Text, { key: 'v', style: s.specVal }, String(v)),
                  ]),
                ),
              ])
            : null,
          tables.length
            ? el(View, { key: 'tb' }, [
                el(Text, { key: 'h2', style: s.h2 }, 'جدول ابعاد و وزن'),
                ...tables
                  .filter((t) => !t.head.includes('کلاس'))
                  .map((t, i) => el(Table, { key: i, head: t.head, rows: t.rows })),
              ])
            : null,
          el(Footer, { key: 'f' }),
        ]),
      );
      pageNo++;
    }

    pages.push(
      el(Page, { key: 'end', size: 'A4', style: s.page }, [
        el(Header, { key: 'h', page: pageNo }),
        el(Text, { key: 't', style: s.h1 }, 'راهنمای کلاس باربری و سفارش'),
        el(Text, { key: 'p', style: s.p },
          'کلاس باربری بر اساس استاندارد EN 124 و استاندارد ملی ایران INSO 14976 و بر پایه محل نصب انتخاب می‌شود. انتخاب کلاس پایین‌تر از نیاز واقعی، شکستن دریچه زیر بار ترافیک را در پی دارد.'),
        el(Table, {
          key: 'tbl',
          head: ['کلاس', 'محل نصب'],
          rows: [
            ['A15', 'مکان‌هایی که فقط عابر پیاده تردد دارد'],
            ['B125', 'پارکینگ خودرو و معابر پیاده با تردد نادر خودرو'],
            ['C250', 'دریچه شانه جاده و کناره خیابان'],
            ['D400', 'جاده، خیابان و پارکینگ با تردد انواع وسایل نقلیه'],
            ['E600', 'محل تردد وسایل نقلیه سنگین مثل فرودگاه و اسکله'],
            ['F900', 'بارها و فشارهای شدید ترافیکی'],
          ],
        }),
        el(Text, { key: 'h2', style: s.h2 }, 'سفارش و مشاوره'),
        el(Text, { key: 'p2', style: s.p },
          'قیمت بر اساس سایز، کلاس باربری و تیراژ سفارش اعلام می‌شود. تولید در ابعاد و طرح سفارشی، شامل حک لوگو و نام سازمان کارفرما روی درب، امکان‌پذیر است.'),
        el(View, { key: 'c', style: { marginTop: 10 } }, [
          el(Text, { key: '1', style: s.p }, `${siteConfig.name} — ${siteConfig.exclusiveTitle}`),
          el(Text, { key: '2', style: s.p }, `دفتر فروش: ${siteConfig.address}`),
          el(Text, { key: '3', style: s.p }, `کارخانه: ${siteConfig.factoryAddress}`),
          el(Text, { key: '4', style: s.p }, `تلفن: ${siteConfig.companyPhones[0]}  ·  همراه: ${siteConfig.mobile}`),
          el(Text, { key: '5', style: s.p }, `${siteConfig.email}  ·  ${siteConfig.url}`),
          el(Text, { key: '6', style: s.p }, `کارشناس فروش: ${siteConfig.salesExpert.name}`),
        ]),
        el(Footer, { key: 'f' }),
      ]),
    );

    const buffer = await renderToBuffer(
      el(Document, { title: 'کاتالوگ دریچه و منهول کامپوزیتی', author: siteConfig.name }, pages) as never,
    );

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="catalog-composite-covers.pdf"',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    return serverErrorResponse(error, 'Covers catalog PDF error');
  }
}
