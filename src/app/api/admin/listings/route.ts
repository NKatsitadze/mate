import { NextResponse } from 'next/server';

import { listAllListingsService } from '@/features/listings/service/listing.service';
import { requireAdmin } from '@/shared/middleware/require-auth';

export async function GET() {
  try {
    const authResult = await requireAdmin();
    if (authResult instanceof NextResponse) return authResult;

    const { data, status } = await listAllListingsService(1, 100);
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
