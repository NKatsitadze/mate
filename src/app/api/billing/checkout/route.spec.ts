import { NextRequest, NextResponse } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/billing/service/billing.service', () => ({
  createCheckoutSessionService: vi.fn(),
}));

vi.mock('@/shared/middleware/require-auth', () => ({
  requireAuth: vi.fn(),
}));

vi.mock('@/shared/middleware/validate-body', () => ({
  validateBody: vi.fn(),
}));

import { createCheckoutSessionService } from '@/features/billing/service/billing.service';
import { requireAuth } from '@/shared/middleware/require-auth';
import { validateBody } from '@/shared/middleware/validate-body';

import { POST } from './route';

const mockCreateCheckout = vi.mocked(createCheckoutSessionService);
const mockRequireAuth = vi.mocked(requireAuth);
const mockValidate = vi.mocked(validateBody);

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost/api/billing/checkout', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('POST /api/billing/checkout', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 short-circuit without validating body', async () => {
    mockRequireAuth.mockResolvedValueOnce(NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 }));
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(401);
    expect(mockValidate).not.toHaveBeenCalled();
  });

  it('passes the caller\'s userId and email to the service', async () => {
    mockRequireAuth.mockResolvedValueOnce({ data: { userId: 'user_1', email: 'a@b.com', role: 'user' } });
    mockValidate.mockResolvedValueOnce({ data: { plan: 'pro' } });
    mockCreateCheckout.mockResolvedValueOnce({ data: { checkoutUrl: 'https://checkout.dodo.dev/x' }, status: 200 });
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(200);
    expect(mockCreateCheckout).toHaveBeenCalledWith('user_1', 'a@b.com', { plan: 'pro' });
  });

  it('returns 500 when the service throws', async () => {
    mockRequireAuth.mockResolvedValueOnce({ data: { userId: 'user_1', email: 'a@b.com', role: 'user' } });
    mockValidate.mockResolvedValueOnce({ data: { plan: 'pro' } });
    mockCreateCheckout.mockRejectedValueOnce(new Error('Dodo error'));
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(500);
  });
});
