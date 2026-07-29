import { NextResponse } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/shops/service/shop.service', () => ({
  listAllShopsService: vi.fn(),
}));

vi.mock('@/shared/middleware/require-auth', () => ({
  requireAdmin: vi.fn(),
}));

import { listAllShopsService } from '@/features/shops/service/shop.service';
import { requireAdmin } from '@/shared/middleware/require-auth';

import { GET } from './route';

const mockList = vi.mocked(listAllShopsService);
const mockRequireAdmin = vi.mocked(requireAdmin);

describe('GET /api/admin/shops', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 403 short-circuit for a non-admin', async () => {
    mockRequireAdmin.mockResolvedValueOnce(NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 }));
    const res = await GET();
    expect(res.status).toBe(403);
    expect(mockList).not.toHaveBeenCalled();
  });

  it('returns 200 with all shops for an admin', async () => {
    mockRequireAdmin.mockResolvedValueOnce({ data: { userId: 'admin_1', email: 'a@b.com', role: 'admin' } });
    mockList.mockResolvedValueOnce({ data: { items: [] }, status: 200 });
    const res = await GET();
    expect(res.status).toBe(200);
  });

  it('returns 500 when the service throws', async () => {
    mockRequireAdmin.mockResolvedValueOnce({ data: { userId: 'admin_1', email: 'a@b.com', role: 'admin' } });
    mockList.mockRejectedValueOnce(new Error('DB error'));
    const res = await GET();
    expect(res.status).toBe(500);
  });
});
