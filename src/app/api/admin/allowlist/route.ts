import { NextRequest, NextResponse } from 'next/server';

import { addAllowedEmailService, listAllowedEmailsService } from '@/features/allowlist/service/allowlist.service';
import { AddAllowedEmailSchema } from '@/features/allowlist/validations/allowlist.validation';
import { requireAdmin } from '@/shared/middleware/require-auth';
import { validateBody } from '@/shared/middleware/validate-body';

export async function GET() {
  try {
    const authResult = await requireAdmin();
    if (authResult instanceof NextResponse) return authResult;

    const { data, status } = await listAllowedEmailsService(1, 100);
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAdmin();
    if (authResult instanceof NextResponse) return authResult;

    const validated = await validateBody(req, AddAllowedEmailSchema);
    if (validated instanceof NextResponse) return validated;

    const { data, status } = await addAllowedEmailService(authResult.data.userId, validated.data);
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
