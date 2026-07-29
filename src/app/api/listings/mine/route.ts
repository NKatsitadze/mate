import { NextResponse } from 'next/server';

import { getListingsByShopService } from '@/features/listings/service/listing.service';
import { requireAuth } from '@/shared/middleware/require-auth';

export async function GET() {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    const { data, status } = await getListingsByShopService(authResult.data.userId, 1, 50);
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
