import { NextRequest, NextResponse } from 'next/server';

import { createCheckoutSessionService } from '@/features/billing/service/billing.service';
import { CreateCheckoutSessionSchema } from '@/features/billing/validations/billing.validation';
import { requireAuth } from '@/shared/middleware/require-auth';
import { validateBody } from '@/shared/middleware/validate-body';

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    const validated = await validateBody(req, CreateCheckoutSessionSchema);
    if (validated instanceof NextResponse) return validated;

    const { data, status } = await createCheckoutSessionService(
      authResult.data.userId,
      authResult.data.email,
      validated.data
    );
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
