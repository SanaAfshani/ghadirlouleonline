import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import React from 'react';
import { Document, Font, Page, StyleSheet, Text, View, renderToBuffer } from '@react-pdf/renderer';
import { getQuoteByToken } from '@/shared/lib/quotes';
import { getSiteSettingsMap } from '@/shared/lib/site-settings-store';
import { mergeSiteSettings } from '@/shared/lib/site-settings';
import { siteConfig } from '@/shared/config/site';
import { serverErrorResponse } from '@/shared/lib/api-errors';
import { faDateLong } from '@/shared/lib/jalali';

type Props = { params: Promise<{ token: string }> };

let fontsReady = false;
async function ensureFonts() {
  if (fontsReady) return;
  const dir = path.join(process.cwd(), 'public', 'fonts');
  Font.register({
    family: 'Vazirmatn',
    fonts: [
      { src: path.join(dir, 'Vazirmatn-Regular.ttf'), fontWeight: 400 },
      { src: path.join(dir, 'Vazirmatn-Bold.ttf'), fontWeight: 700 },
    ],
  });
  await Promise.all([
    readFile(path.join(dir, 'Vazirmatn-Regular.ttf')),
    readFile(path.join(dir, 'Vazirmatn-Bold.ttf')),
  ]);
  fontsReady = true;
}

const styles = StyleSheet.create({
  page: { fontFamily: 'Vazirmatn', fontSize: 10, padding: 32, direction: 'rtl', color: '#0f172a' },
  header: { flexDirection: 'row-reverse', justifyContent: 'space-between', gap: 12, paddingBottom: 12, borderBottomWidth: 2, borderBottomColor: '#e2e8f0' },
  titleBlock: { textAlign: 'center', paddingVertical: 14, marginTop: 8, marginBottom: 8, backgroundColor: '#f8fafc', borderRadius: 4 },
  docTitle: { fontSize: 16, fontWeight: 700, textAlign: 'center' },
  docSub: { fontSize: 8, color: '#64748b', textAlign: 'center', marginTop: 4 },
  muted: { color: '#64748b', fontSize: 8, marginBottom: 2 },
  bold: { fontWeight: 700 },
  section: { marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  th: { flexDirection: 'row-reverse', borderBottomWidth: 1.5, borderBottomColor: '#cbd5e1', paddingBottom: 6, marginBottom: 2 },
  tr: { flexDirection: 'row-reverse', paddingVertical: 6, borderBottomWidth: 0.5, borderBottomColor: '#f1f5f9' },
  cell: { textAlign: 'right' },
  footer: { marginTop: 16, paddingTop: 10, borderTopWidth: 2, borderTopColor: '#e2e8f0', fontSize: 8, color: '#475569', lineHeight: 1.55 },
  footerGrid: { flexDirection: 'row-reverse', justifyContent: 'space-between', gap: 16, marginBottom: 8 },
});

function money(n: number) {
  return n.toLocaleString('fa-IR');
}

const faDate = (iso: string | null) => faDateLong(iso);

export async function GET(_request: NextRequest, { params }: Props) {
  try {
    const { token } = await params;
    const quote = await getQuoteByToken(token);
    if (!quote || (quote.status !== 'ISSUED' && quote.status !== 'REQUESTED')) {
      return NextResponse.json({ success: false, error: 'سند یافت نشد' }, { status: 404 });
    }
    await ensureFonts();
    const settings = mergeSiteSettings(await getSiteSettingsMap());
    const phones = [settings.companyPhones[0], settings.mobile, settings.phone].filter(Boolean).join(' · ');
    const col = { idx: 28, title: 220, qty: 70, price: 80, total: 80 };
    const issued = quote.status === 'ISSUED';
    const docTitle = issued ? 'فاکتور فروش' : 'پیش‌فاکتور فروش';

    const doc = React.createElement(
      Document,
      { title: `${docTitle} ${quote.number}`, language: 'fa' },
      React.createElement(
        Page,
        { size: 'A4', style: styles.page },
        // هدر
        React.createElement(
          View,
          { style: styles.header },
          React.createElement(View, { style: { flex: 1 } },
            React.createElement(Text, { style: { fontSize: 14, fontWeight: 700, marginBottom: 2 } }, settings.siteName),
            React.createElement(Text, { style: styles.muted }, siteConfig.legalName),
            settings.address ? React.createElement(Text, { style: styles.muted }, `دفتر فروش: ${settings.address}`) : null,
            React.createElement(Text, { style: styles.muted }, `تلفن: ${phones}`),
            React.createElement(Text, { style: styles.muted }, settings.email),
          ),
          React.createElement(View, { style: { width: 150, backgroundColor: '#f8fafc', padding: 8, borderRadius: 4 } },
            React.createElement(Text, { style: [styles.bold, { fontSize: 11, marginBottom: 4 }] }, quote.number),
            React.createElement(Text, { style: styles.muted }, `${issued ? 'صدور' : 'درخواست'}: ${faDate((issued ? quote.issuedAt : quote.createdAt)?.toISOString() ?? null)}`),
            issued ? React.createElement(Text, { style: styles.muted }, `اعتبار: ${faDate(quote.validUntil?.toISOString() ?? null)}`) : React.createElement(Text, { style: styles.muted }, 'وضعیت: در انتظار تأیید'),
          ),
        ),
        // سرتیتر
        React.createElement(
          View,
          { style: styles.titleBlock },
          React.createElement(Text, { style: styles.docTitle }, docTitle),
          React.createElement(Text, { style: styles.docSub }, issued ? 'مبالغ به تومان — هزینه حمل جداگانه اعلام می‌شود' : 'پیش‌فاکتور اولیه — مبالغ پس از تأیید کارشناس قطعی می‌شوند'),
        ),
        // خریدار
        React.createElement(
          View,
          { style: { marginBottom: 8 } },
          React.createElement(Text, { style: [styles.muted, { marginBottom: 4 }] }, 'مشخصات خریدار'),
          React.createElement(Text, { style: styles.bold }, `${quote.customerName}${quote.customerCompany ? ` — ${quote.customerCompany}` : ''}`),
          React.createElement(Text, { style: styles.muted }, quote.customerPhone),
          quote.customerEmail ? React.createElement(Text, { style: styles.muted }, quote.customerEmail) : null,
        ),
        // جدول
        React.createElement(
          View,
          null,
          React.createElement(View, { style: styles.th },
            React.createElement(Text, { style: [styles.cell, styles.bold, { width: col.idx }] }, 'ردیف'),
            React.createElement(Text, { style: [styles.cell, styles.bold, { width: col.title }] }, 'شرح کالا'),
            React.createElement(Text, { style: [styles.cell, styles.bold, { width: col.qty }] }, 'مقدار'),
            React.createElement(Text, { style: [styles.cell, styles.bold, { width: col.price }] }, 'فی'),
            React.createElement(Text, { style: [styles.cell, styles.bold, { width: col.total }] }, 'مبلغ'),
          ),
          ...quote.items.map((it, i) =>
            React.createElement(View, { key: it.id, style: styles.tr },
              React.createElement(Text, { style: [styles.cell, { width: col.idx }] }, String(i + 1)),
              React.createElement(Text, { style: [styles.cell, { width: col.title }] }, it.title),
              React.createElement(Text, { style: [styles.cell, { width: col.qty }] }, `${it.quantity} ${it.unit}`),
              React.createElement(Text, { style: [styles.cell, { width: col.price }] }, money(it.unitPrice)),
              React.createElement(Text, { style: [styles.cell, styles.bold, { width: col.total }] }, money(it.lineTotal)),
            ),
          ),
        ),
        // جمع
        React.createElement(
          View,
          { style: [styles.section, { alignItems: 'flex-start' }] },
          ...(quote.vatRate > 0
            ? [
                React.createElement(Text, { key: 'sub' }, `جمع کالا: ${money(quote.subtotal)} تومان`),
                React.createElement(Text, { key: 'vat' }, `ارزش افزوده ${quote.vatRate}٪: ${money(quote.vatAmount)} تومان`),
              ]
            : []),
          React.createElement(Text, { style: [styles.bold, { fontSize: 12, marginTop: 4 }] }, `جمع کل: ${money(quote.total)} تومان`),
        ),
        // فوتر کارخانه
        React.createElement(
          View,
          { style: styles.footer },
          React.createElement(
            View,
            { style: styles.footerGrid },
            React.createElement(View, { style: { flex: 1 } },
              React.createElement(Text, { style: styles.bold }, 'کارخانه و انبار'),
              React.createElement(Text, null, settings.factoryAddress || siteConfig.factoryAddress),
            ),
            React.createElement(View, { style: { flex: 1 } },
              React.createElement(Text, { style: styles.bold }, 'دفتر فروش'),
              React.createElement(Text, null, `${siteConfig.salesExpert.role}: ${siteConfig.salesExpert.name}`),
              React.createElement(Text, null, settings.address || siteConfig.address),
              React.createElement(Text, null, phones),
              React.createElement(Text, null, settings.email),
            ),
          ),
          React.createElement(
            Text,
            { style: { marginTop: 6 } },
            issued
              ? 'این سند پس از تأیید کارشناس صادر شده است و فاکتور رسمی مالیاتی محسوب نمی‌شود. قیمت‌ها تا تاریخ اعتبار و به‌شرط موجودی معتبرند. هزینه حمل هنگام هماهنگی بارگیری اعلام می‌شود.'
              : 'این سند پیش‌فاکتور اولیه است و تا تأیید کارشناس فروش قطعی نیست. پس از تأیید، فاکتور نهایی روی همین لینک در دسترس قرار می‌گیرد.',
          ),
          React.createElement(Text, { style: [styles.bold, { marginTop: 4 }] }, `${siteConfig.legalName} — ${settings.siteName}`),
        ),
      ),
    );

    const buffer = await renderToBuffer(doc);
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${quote.number}.pdf"`,
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (error) {
    return serverErrorResponse(error, 'Quote PDF error:');
  }
}
