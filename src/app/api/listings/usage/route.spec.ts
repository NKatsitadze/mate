import { NextResponse } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/listings/service/listing.service', () => ({
  getDailyUsageService: vi.fn(),
}));

vi.mock('@/shared/middleware/require-auth', () => ({
  requireAuth: vi.fn(),
}));

import { getDailyUsageService } from '@/features/listings/service/listing.service';
import { requireAuth } from '@/shared/middleware/require-auth';

import { GET } from './route';

const mockGetUsage = vi.mocked(getDailyUsageService);
const mockRequireAuth = vi.mocked(requireAuth);

describe('GET /api/listings/usage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 short-circuit from requireAuth', async () => {
    mockRequireAuth.mockResolvedValueOnce(NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 }));
    const res = await GET();
    expect(res.status).toBe(401);
    expect(mockGetUsage).not.toHaveBeenCalled();
  });

  it('returns 200 with used/limit', async () => {
    mockRequireAuth.mockResolvedValueOnce({ data: { userId: 'user_1', email: 'a@b.com', role: 'user' } });
    mockGetUsage.mockResolvedValueOnce({ data: { used: 1, limit: 3 }, status: 200 });
    const res = await GET();
    expect(res.status).toBe(200);
    expect(mockGetUsage).toHaveBeenCalledWith('user_1');
  });

  it('returns 500 when the service throws', async () => {
    mockRequireAuth.mockResolvedValueOnce({ data: { userId: 'user_1', email: 'a@b.com', role: 'user' } });
    mockGetUsage.mockRejectedValueOnce(new Error('DB error'));
    const res = await GET();
    expect(res.status).toBe(500);
  });
});
