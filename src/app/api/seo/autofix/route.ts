import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireSuperAdmin } from '@/shared/lib/admin-auth';
import { runAutofix } from '@/shared/lib/seo-audit';
import { serverErrorResponse } from '@/shared/lib/api-errors';

/** body: { dryRun?: boolean } — پیش‌فرض dryRun تا بدون تایید صریح چیزی نوشته نشود */
export async function POST(request: NextRequest) {
  const auth = requireSuperAdmin(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await request.json().catch(() => ({}));
    const dryRun = body?.dryRun !== false;
    const fixes = await runAutofix(dryRun);
    if (!dryRun && fixes.length) revalidatePath('/', 'layout');
    return NextResponse.json({ success: true, data: { dryRun, fixes } });
  } catch (error) {
    return serverErrorResponse(error, 'SEO autofix error:');
  }
}
