import { NextRequest, NextResponse } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/shops/service/shop.service', () => ({
  getShopByOwnerIdService: vi.fn(),
  updateShopService: vi.fn(),
}));

vi.mock('@/shared/middleware/require-auth', () => ({
  requireAuth: vi.fn(),
}));

vi.mock('@/shared/middleware/validate-body', () => ({
  validateBody: vi.fn(),
}));

import { getShopByOwnerIdService, updateShopService } from '@/features/shops/service/shop.service';
import { requireAuth } from '@/shared/middleware/require-auth';
import { validateBody } from '@/shared/middleware/validate-body';

import { GET, PATCH } from './route';

const mockGet = vi.mocked(getShopByOwnerIdService);
const mockUpdate = vi.mocked(updateShopService);
const mockRequireAuth = vi.mocked(requireAuth);
const mockValidate = vi.mocked(validateBody);

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost/api/shops/me', {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('GET /api/shops/me', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 short-circuit from requireAuth', async () => {
    mockRequireAuth.mockResolvedValueOnce(NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 }));
    const res = await GET();
    expect(res.status).toBe(401);
    expect(mockGet).not.toHaveBeenCalled();
  });

  it('returns 404 when the caller has no shop yet', async () => {
    mockRequireAuth.mockResolvedValueOnce({ data: { userId: 'user_1', email: 'a@b.com', role: 'user' } });
    mockGet.mockResolvedValueOnce({ data: { error: 'NOT_FOUND' }, status: 404 });
    const res = await GET();
    expect(res.status).toBe(404);
  });

  it('returns 200 with the shop', async () => {
    mockRequireAuth.mockResolvedValueOnce({ data: { userId: 'user_1', email: 'a@b.com', role: 'user' } });
    mockGet.mockResolvedValueOnce({ data: { id: 'shop_1' } as never, status: 200 });
    const res = await GET();
    expect(res.status).toBe(200);
    expect(mockGet).toHaveBeenCalledWith('user_1');
  });
});

describe('PATCH /api/shops/me', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 short-circuit without validating body', async () => {
    mockRequireAuth.mockResolvedValueOnce(NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 }));
    const res = await PATCH(makeRequest({}));
    expect(res.status).toBe(401);
    expect(mockValidate).not.toHaveBeenCalled();
  });

  it('returns 200 on success', async () => {
    mockRequireAuth.mockResolvedValueOnce({ data: { userId: 'user_1', email: 'a@b.com', role: 'user' } });
    mockValidate.mockResolvedValueOnce({ data: { name: 'New Name' } as never });
    mockUpdate.mockResolvedValueOnce({ data: { message: 'Shop updated' }, status: 200 });
    const res = await PATCH(makeRequest({}));
    expect(res.status).toBe(200);
    expect(mockUpdate).toHaveBeenCalledWith('user_1', { name: 'New Name' });
  });

  it('returns 500 when the service throws', async () => {
    mockRequireAuth.mockResolvedValueOnce({ data: { userId: 'user_1', email: 'a@b.com', role: 'user' } });
    mockValidate.mockResolvedValueOnce({ data: {} as never });
    mockUpdate.mockRejectedValueOnce(new Error('DB error'));
    const res = await PATCH(makeRequest({}));
    expect(res.status).toBe(500);
  });
});
