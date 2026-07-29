import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/shops/service/shop.service', () => ({
  getShopByIdService: vi.fn(),
}));

import { getShopByIdService } from '@/features/shops/service/shop.service';

import { GET } from './route';

const mockGet = vi.mocked(getShopByIdService);

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe('GET /api/shops/[id]', () => {
  beforeEach(() => vi.clearAllMocks());

  it('is public — no auth check performed', async () => {
    mockGet.mockResolvedValueOnce({ data: { id: 'shop_1' } as never, status: 200 });
    const res = await GET(new Request('http://localhost/api/shops/shop_1'), makeParams('shop_1'));
    expect(res.status).toBe(200);
    expect(mockGet).toHaveBeenCalledWith('shop_1');
  });

  it('returns 404 for a missing or suspended shop', async () => {
    mockGet.mockResolvedValueOnce({ data: { error: 'NOT_FOUND' }, status: 404 });
    const res = await GET(new Request('http://localhost/api/shops/missing'), makeParams('missing'));
    expect(res.status).toBe(404);
  });

  it('returns 500 when the service throws', async () => {
    mockGet.mockRejectedValueOnce(new Error('DB error'));
    const res = await GET(new Request('http://localhost/api/shops/shop_1'), makeParams('shop_1'));
    expect(res.status).toBe(500);
  });
});
