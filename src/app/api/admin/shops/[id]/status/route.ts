import { NextRequest, NextResponse } from 'next/server';

import { updateShopStatusService } from '@/features/shops/service/shop.service';
import { ShopStatusSchema } from '@/features/shops/validations/shop.validation';
import { requireAdmin } from '@/shared/middleware/require-auth';
import { validateBody } from '@/shared/middleware/validate-body';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await requireAdmin();
    if (authResult instanceof NextResponse) return authResult;

    const validated = await validateBody(req, ShopStatusSchema);
    if (validated instanceof NextResponse) return validated;

    const { id } = await params;
    const { data, status } = await updateShopStatusService(id, validated.data.status);
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
