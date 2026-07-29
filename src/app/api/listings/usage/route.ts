import { NextResponse } from 'next/server';

import { getDailyUsageService } from '@/features/listings/service/listing.service';
import { requireAuth } from '@/shared/middleware/require-auth';

export async function GET() {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    const { data, status } = await getDailyUsageService(authResult.data.userId);
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
