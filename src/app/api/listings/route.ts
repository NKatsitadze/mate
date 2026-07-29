import { NextRequest, NextResponse } from 'next/server';

import { createListingService, searchListingsService } from '@/features/listings/service/listing.service';
import { CreateListingSchema, ListingSearchQuerySchema } from '@/features/listings/validations/listing.validation';
import { requireAuth } from '@/shared/middleware/require-auth';
import { validateBody } from '@/shared/middleware/validate-body';
import { validateQuery } from '@/shared/middleware/validate-query';

export async function GET(req: NextRequest) {
  try {
    const validated = await validateQuery(req, ListingSearchQuerySchema);
    if (validated instanceof NextResponse) return validated;

    const { data, status } = await searchListingsService(validated.data);
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    const validated = await validateBody(req, CreateListingSchema);
    if (validated instanceof NextResponse) return validated;

    const { data, status } = await createListingService(authResult.data.userId, validated.data);
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
