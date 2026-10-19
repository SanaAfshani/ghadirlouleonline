import { NextResponse } from 'next/server';
import { CATALOGS } from '@/shared/config/catalogs';
import { renderCatalogPdf } from '@/shared/lib/catalog-pdf';
import { serverErrorResponse } from '@/shared/lib/api-errors';

export const maxDuration = 60;

type Props = { params: Promise<{ slug: string }> };

/** کاتالوگ PDF با برند خودمان — از روی همان محصولات دیتابیس رندر می‌شود */
export async function GET(_request: Request, { params }: Props) {
  try {
    const { slug } = await params;
    const def = CATALOGS[slug];
    if (!def) return NextResponse.json({ success: false, error: 'کاتالوگ یافت نشد' }, { status: 404 });

    const buffer = await renderCatalogPdf(def);
    if (!buffer) return NextResponse.json({ success: false, error: 'محصولی برای این کاتالوگ نیست' }, { status: 404 });

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="catalog-${slug}.pdf"`,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    return serverErrorResponse(error, 'Catalog PDF error');
  }
}
