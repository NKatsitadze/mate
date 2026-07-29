import { NextResponse } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/billing/service/billing.service', () => ({
  getSubscriptionByShopService: vi.fn(),
}));

vi.mock('@/shared/middleware/require-auth', () => ({
  requireAuth: vi.fn(),
}));

import { getSubscriptionByShopService } from '@/features/billing/service/billing.service';
import { requireAuth } from '@/shared/middleware/require-auth';

import { GET } from './route';

const mockGetSubscription = vi.mocked(getSubscriptionByShopService);
const mockRequireAuth = vi.mocked(requireAuth);

describe('GET /api/billing/subscription', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 short-circuit from requireAuth', async () => {
    mockRequireAuth.mockResolvedValueOnce(NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 }));
    const res = await GET();
    expect(res.status).toBe(401);
    expect(mockGetSubscription).not.toHaveBeenCalled();
  });

  it('returns 200 with the subscription', async () => {
    mockRequireAuth.mockResolvedValueOnce({ data: { userId: 'user_1', email: 'a@b.com', role: 'user' } });
    mockGetSubscription.mockResolvedValueOnce({
      data: { plan: 'free', status: null, currentPeriodEnd: null },
      status: 200,
    });
    const res = await GET();
    expect(res.status).toBe(200);
    expect(mockGetSubscription).toHaveBeenCalledWith('user_1');
  });

  it('returns 500 when the service throws', async () => {
    mockRequireAuth.mockResolvedValueOnce({ data: { userId: 'user_1', email: 'a@b.com', role: 'user' } });
    mockGetSubscription.mockRejectedValueOnce(new Error('DB error'));
    const res = await GET();
    expect(res.status).toBe(500);
  });
});
