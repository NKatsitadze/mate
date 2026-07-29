import { NextRequest, NextResponse } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/listings/service/listing.service', () => ({
  setListingStatusService: vi.fn(),
}));

vi.mock('@/shared/middleware/require-auth', () => ({
  requireAdmin: vi.fn(),
}));

vi.mock('@/shared/middleware/validate-body', () => ({
  validateBody: vi.fn(),
}));

import { setListingStatusService } from '@/features/listings/service/listing.service';
import { requireAdmin } from '@/shared/middleware/require-auth';
import { validateBody } from '@/shared/middleware/validate-body';

import { PATCH } from './route';

const mockSetStatus = vi.mocked(setListingStatusService);
const mockRequireAdmin = vi.mocked(requireAdmin);
const mockValidate = vi.mocked(validateBody);

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost/api/admin/listings/listing_1/status', {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe('PATCH /api/admin/listings/[id]/status', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 403 short-circuit for a non-admin without validating body', async () => {
    mockRequireAdmin.mockResolvedValueOnce(NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 }));
    const res = await PATCH(makeRequest({}), makeParams('listing_1'));
    expect(res.status).toBe(403);
    expect(mockValidate).not.toHaveBeenCalled();
  });

  it('returns 200 on success', async () => {
    mockRequireAdmin.mockResolvedValueOnce({ data: { userId: 'admin_1', email: 'a@b.com', role: 'admin' } });
    mockValidate.mockResolvedValueOnce({ data: { status: 'deactivated' } });
    mockSetStatus.mockResolvedValueOnce({ data: { message: 'Listing status updated' }, status: 200 });
    const res = await PATCH(makeRequest({}), makeParams('listing_1'));
    expect(res.status).toBe(200);
    expect(mockSetStatus).toHaveBeenCalledWith('listing_1', 'deactivated');
  });

  it('returns 500 when the service throws', async () => {
    mockRequireAdmin.mockResolvedValueOnce({ data: { userId: 'admin_1', email: 'a@b.com', role: 'admin' } });
    mockValidate.mockResolvedValueOnce({ data: { status: 'active' } });
    mockSetStatus.mockRejectedValueOnce(new Error('DB error'));
    const res = await PATCH(makeRequest({}), makeParams('listing_1'));
    expect(res.status).toBe(500);
  });
});
