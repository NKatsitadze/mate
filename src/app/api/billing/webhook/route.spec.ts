import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/billing/service/billing.service', () => ({
  handleDodoWebhookService: vi.fn(),
}));

import { handleDodoWebhookService } from '@/features/billing/service/billing.service';

import { POST } from './route';

const mockHandleWebhook = vi.mocked(handleDodoWebhookService);

function makeWebhookRequest(rawBody: string) {
  return new NextRequest('http://localhost/api/billing/webhook', {
    method: 'POST',
    body: rawBody,
    headers: {
      'webhook-id': 'evt_123',
      'webhook-signature': 'sig',
      'webhook-timestamp': '1234567890',
    },
  });
}

describe('POST /api/billing/webhook', () => {
  beforeEach(() => vi.clearAllMocks());

  it('reads the raw text body (never JSON-parses) and forwards the standard webhook headers', async () => {
    mockHandleWebhook.mockResolvedValueOnce({ data: { message: 'ok' }, status: 200 });
    const rawBody = '{"type":"subscription.active"}';
    const res = await POST(makeWebhookRequest(rawBody));
    expect(res.status).toBe(200);
    expect(mockHandleWebhook).toHaveBeenCalledWith(rawBody, {
      'webhook-id': 'evt_123',
      'webhook-signature': 'sig',
      'webhook-timestamp': '1234567890',
    });
  });

  it('returns 400 when the service reports an invalid signature', async () => {
    mockHandleWebhook.mockResolvedValueOnce({ data: { error: 'INVALID_SIGNATURE' }, status: 400 });
    const res = await POST(makeWebhookRequest('{}'));
    expect(res.status).toBe(400);
  });

  it('returns 500 when the service throws', async () => {
    mockHandleWebhook.mockRejectedValueOnce(new Error('unexpected'));
    const res = await POST(makeWebhookRequest('{}'));
    expect(res.status).toBe(500);
  });
});
