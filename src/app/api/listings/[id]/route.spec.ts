import { NextRequest, NextResponse } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/listings/service/listing.service', () => ({
  getListingByIdService: vi.fn(),
  updateListingService: vi.fn(),
  deleteListingService: vi.fn(),
}));

vi.mock('@/shared/middleware/require-auth', () => ({
  requireAuth: vi.fn(),
}));

vi.mock('@/shared/middleware/validate-body', () => ({
  validateBody: vi.fn(),
}));

import {
  deleteListingService,
  getListingByIdService,
  updateListingService,
} from '@/features/listings/service/listing.service';
import { requireAuth } from '@/shared/middleware/require-auth';
import { validateBody } from '@/shared/middleware/validate-body';

import { DELETE, GET, PATCH } from './route';

const mockGet = vi.mocked(getListingByIdService);
const mockUpdate = vi.mocked(updateListingService);
const mockDelete = vi.mocked(deleteListingService);
const mockRequireAuth = vi.mocked(requireAuth);
const mockValidate = vi.mocked(validateBody);

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost/api/listings/listing_1', {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe('GET /api/listings/[id]', () => {
  beforeEach(() => vi.clearAllMocks());

  it('is public — no auth check performed', async () => {
    mockGet.mockResolvedValueOnce({ data: { id: 'listing_1' } as never, status: 200 });
    const res = await GET(new Request('http://localhost/api/listings/listing_1'), makeParams('listing_1'));
    expect(res.status).toBe(200);
    expect(mockRequireAuth).not.toHaveBeenCalled();
  });

  it('returns 404 for a missing or deactivated listing', async () => {
    mockGet.mockResolvedValueOnce({ data: { error: 'NOT_FOUND' }, status: 404 });
    const res = await GET(new Request('http://localhost/api/listings/missing'), makeParams('missing'));
    expect(res.status).toBe(404);
  });
});

describe('PATCH /api/listings/[id]', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 short-circuit without validating body', async () => {
    mockRequireAuth.mockResolvedValueOnce(NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 }));
    const res = await PATCH(makeRequest({}), makeParams('listing_1'));
    expect(res.status).toBe(401);
    expect(mockValidate).not.toHaveBeenCalled();
  });

  it('returns 403 when the caller does not own the listing', async () => {
    mockRequireAuth.mockResolvedValueOnce({ data: { userId: 'user_1', email: 'a@b.com', role: 'user' } });
    mockValidate.mockResolvedValueOnce({ data: { title: 'X' } });
    mockUpdate.mockResolvedValueOnce({ data: { error: 'FORBIDDEN' }, status: 403 });
    const res = await PATCH(makeRequest({}), makeParams('listing_1'));
    expect(res.status).toBe(403);
  });

  it('returns 200 on success', async () => {
    mockRequireAuth.mockResolvedValueOnce({ data: { userId: 'user_1', email: 'a@b.com', role: 'user' } });
    mockValidate.mockResolvedValueOnce({ data: { title: 'New title' } });
    mockUpdate.mockResolvedValueOnce({ data: { message: 'Listing updated' }, status: 200 });
    const res = await PATCH(makeRequest({}), makeParams('listing_1'));
    expect(res.status).toBe(200);
    expect(mockUpdate).toHaveBeenCalledWith('user_1', 'listing_1', { title: 'New title' });
  });
});

describe('DELETE /api/listings/[id]', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 short-circuit from requireAuth', async () => {
    mockRequireAuth.mockResolvedValueOnce(NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 }));
    const res = await DELETE(makeRequest({}), makeParams('listing_1'));
    expect(res.status).toBe(401);
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it('returns 200 on success', async () => {
    mockRequireAuth.mockResolvedValueOnce({ data: { userId: 'user_1', email: 'a@b.com', role: 'user' } });
    mockDelete.mockResolvedValueOnce({ data: { message: 'Listing deleted' }, status: 200 });
    const res = await DELETE(makeRequest({}), makeParams('listing_1'));
    expect(res.status).toBe(200);
    expect(mockDelete).toHaveBeenCalledWith('user_1', 'listing_1');
  });

  it('returns 500 when the service throws', async () => {
    mockRequireAuth.mockResolvedValueOnce({ data: { userId: 'user_1', email: 'a@b.com', role: 'user' } });
    mockDelete.mockRejectedValueOnce(new Error('DB error'));
    const res = await DELETE(makeRequest({}), makeParams('listing_1'));
    expect(res.status).toBe(500);
  });
});
