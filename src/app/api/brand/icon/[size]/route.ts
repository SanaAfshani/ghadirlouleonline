import { NextRequest, NextResponse } from 'next/server';
import { ICON_SIZES, iconResponse, renderSiteIcon, type IconSize } from '@/shared/lib/site-icon';

type Props = { params: Promise<{ size: string }> };

/** /api/brand/icon/192?v=... — آیکون سایت (favicon و آیکون آیفون) از تنظیمات پنل */
export async function GET(request: NextRequest, { params }: Props) {
  const size = Number((await params).size);
  if (!ICON_SIZES.includes(size as IconSize)) return new NextResponse('Not found', { status: 404 });
  const { png, version } = await renderSiteIcon(size as IconSize);
  return iconResponse(png, request.nextUrl.searchParams.get('v') === version);
}
