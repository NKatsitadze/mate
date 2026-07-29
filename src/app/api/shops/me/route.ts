import { NextRequest, NextResponse } from 'next/server';

import { getShopByOwnerIdService, updateShopService } from '@/features/shops/service/shop.service';
import { UpdateShopSchema } from '@/features/shops/validations/shop.validation';
import { requireAuth } from '@/shared/middleware/require-auth';
import { validateBody } from '@/shared/middleware/validate-body';

export async function GET() {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    const { data, status } = await getShopByOwnerIdService(authResult.data.userId);
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    const validated = await validateBody(req, UpdateShopSchema);
    if (validated instanceof NextResponse) return validated;

    const { data, status } = await updateShopService(authResult.data.userId, validated.data);
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
