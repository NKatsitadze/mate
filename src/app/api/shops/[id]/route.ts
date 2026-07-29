import { NextResponse } from 'next/server';

import { getShopByIdService } from '@/features/shops/service/shop.service';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { data, status } = await getShopByIdService(id);
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
