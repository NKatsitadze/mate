import { NextResponse } from 'next/server';

import { listAllShopsService } from '@/features/shops/service/shop.service';
import { requireAdmin } from '@/shared/middleware/require-auth';

export async function GET() {
  try {
    const authResult = await requireAdmin();
    if (authResult instanceof NextResponse) return authResult;

    const { data, status } = await listAllShopsService(1, 100);
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
