import { NextRequest, NextResponse } from 'next/server';

import { handleDodoWebhookService } from '@/features/billing/service/billing.service';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const headers = {
      'webhook-id': req.headers.get('webhook-id') ?? '',
      'webhook-signature': req.headers.get('webhook-signature') ?? '',
      'webhook-timestamp': req.headers.get('webhook-timestamp') ?? '',
    };

    const { data, status } = await handleDodoWebhookService(rawBody, headers);
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
