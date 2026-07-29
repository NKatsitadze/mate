import { NextResponse } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/listings/service/listing.service', () => ({
  getListingsByShopService: vi.fn(),
}));

vi.mock('@/shared/middleware/require-auth', () => ({
  requireAuth: vi.fn(),
}));

import { getListingsByShopService } from '@/features/listings/service/listing.service';
import { requireAuth } from '@/shared/middleware/require-auth';

import { GET } from './route';

const mockGet = vi.mocked(getListingsByShopService);
const mockRequireAuth = vi.mocked(requireAuth);

describe('GET /api/listings/mine', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 short-circuit from requireAuth', async () => {
    mockRequireAuth.mockResolvedValueOnce(NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 }));
    const res = await GET();
    expect(res.status).toBe(401);
    expect(mockGet).not.toHaveBeenCalled();
  });

  it('returns 200 with the caller\'s listings', async () => {
    mockRequireAuth.mockResolvedValueOnce({ data: { userId: 'user_1', email: 'a@b.com', role: 'user' } });
    mockGet.mockResolvedValueOnce({ data: { items: [] }, status: 200 });
    const res = await GET();
    expect(res.status).toBe(200);
    expect(mockGet).toHaveBeenCalledWith('user_1', 1, 50);
  });

  it('returns 500 when the service throws', async () => {
    mockRequireAuth.mockResolvedValueOnce({ data: { userId: 'user_1', email: 'a@b.com', role: 'user' } });
    mockGet.mockRejectedValueOnce(new Error('DB error'));
    const res = await GET();
    expect(res.status).toBe(500);
  });
});
