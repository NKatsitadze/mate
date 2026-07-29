import { NextRequest, NextResponse } from 'next/server';

import { getShopPhotoPresignedUrlService } from '@/features/shops/service/shop.service';
import { PresignUploadSchema } from '@/features/shops/validations/shop.validation';
import { requireAuth } from '@/shared/middleware/require-auth';
import { validateBody } from '@/shared/middleware/validate-body';

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    const validated = await validateBody(req, PresignUploadSchema);
    if (validated instanceof NextResponse) return validated;

    const { data, status } = await getShopPhotoPresignedUrlService(authResult.data.userId, validated.data);
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
