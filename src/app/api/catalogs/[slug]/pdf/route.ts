import { NextResponse } from 'next/server';
import { CATALOGS } from '@/shared/config/catalogs';
import { getCatalogPdf } from '@/shared/lib/catalog-cache';
import { serverErrorResponse } from '@/shared/lib/api-errors';

export const maxDuration = 60;

type Props = { params: Promise<{ slug: string }> };

/** کاتالوگ PDF با برند خودمان — از روی همان محصولات دیتابیس رندر و کش می‌شود */
export async function GET(_request: Request, { params }: Props) {
  try {
    const { slug } = await params;
    if (!CATALOGS[slug]) return NextResponse.json({ success: false, error: 'کاتالوگ یافت نشد' }, { status: 404 });

    const buffer = await getCatalogPdf(slug);
    if (!buffer) return NextResponse.json({ success: false, error: 'محصولی برای این کاتالوگ نیست' }, { status: 404 });

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="catalog-${slug}.pdf"`,
        'Content-Length': String(buffer.length),
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    return serverErrorResponse(error, 'Catalog PDF error');
  }
}
