import { NextRequest, NextResponse } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/shops/service/shop.service', () => ({
  createShopService: vi.fn(),
}));

vi.mock('@/shared/middleware/require-auth', () => ({
  requireAuth: vi.fn(),
}));

vi.mock('@/shared/middleware/validate-body', () => ({
  validateBody: vi.fn(),
}));

import { createShopService } from '@/features/shops/service/shop.service';
import { requireAuth } from '@/shared/middleware/require-auth';
import { validateBody } from '@/shared/middleware/validate-body';

import { POST } from './route';

const mockCreate = vi.mocked(createShopService);
const mockRequireAuth = vi.mocked(requireAuth);
const mockValidate = vi.mocked(validateBody);

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost/api/shops', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('POST /api/shops', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 short-circuit from requireAuth without validating body', async () => {
    mockRequireAuth.mockResolvedValueOnce(NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 }));
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(401);
    expect(mockValidate).not.toHaveBeenCalled();
  });

  it('returns validation error when body is invalid', async () => {
    mockRequireAuth.mockResolvedValueOnce({ data: { userId: 'user_1', email: 'a@b.com', role: 'user' } });
    mockValidate.mockResolvedValueOnce(NextResponse.json({ error: 'VALIDATION_ERROR' }, { status: 400 }));
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
  });

  it('returns 201 on success', async () => {
    mockRequireAuth.mockResolvedValueOnce({ data: { userId: 'user_1', email: 'a@b.com', role: 'user' } });
    mockValidate.mockResolvedValueOnce({ data: { name: 'Shop' } as never });
    mockCreate.mockResolvedValueOnce({ data: { id: '507f1f77bcf86cd799439011' }, status: 201 });
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(201);
    expect(mockCreate).toHaveBeenCalledWith('user_1', { name: 'Shop' });
  });

  it('returns 500 when the service throws', async () => {
    mockRequireAuth.mockResolvedValueOnce({ data: { userId: 'user_1', email: 'a@b.com', role: 'user' } });
    mockValidate.mockResolvedValueOnce({ data: {} as never });
    mockCreate.mockRejectedValueOnce(new Error('DB error'));
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(500);
  });
});
