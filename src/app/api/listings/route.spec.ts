import { NextRequest, NextResponse } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/listings/service/listing.service', () => ({
  createListingService: vi.fn(),
  searchListingsService: vi.fn(),
}));

vi.mock('@/shared/middleware/require-auth', () => ({
  requireAuth: vi.fn(),
}));

vi.mock('@/shared/middleware/validate-body', () => ({
  validateBody: vi.fn(),
}));

vi.mock('@/shared/middleware/validate-query', () => ({
  validateQuery: vi.fn(),
}));

import { createListingService, searchListingsService } from '@/features/listings/service/listing.service';
import { requireAuth } from '@/shared/middleware/require-auth';
import { validateBody } from '@/shared/middleware/validate-body';
import { validateQuery } from '@/shared/middleware/validate-query';

import { GET, POST } from './route';

const mockCreate = vi.mocked(createListingService);
const mockSearch = vi.mocked(searchListingsService);
const mockRequireAuth = vi.mocked(requireAuth);
const mockValidateBody = vi.mocked(validateBody);
const mockValidateQuery = vi.mocked(validateQuery);

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost/api/listings', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('GET /api/listings', () => {
  beforeEach(() => vi.clearAllMocks());

  it('is public — no auth check performed', async () => {
    mockValidateQuery.mockResolvedValueOnce({ data: {} });
    mockSearch.mockResolvedValueOnce({ data: { items: [] }, status: 200 });
    const res = await GET(new NextRequest('http://localhost/api/listings'));
    expect(res.status).toBe(200);
    expect(mockRequireAuth).not.toHaveBeenCalled();
  });

  it('returns 400 for an invalid query string', async () => {
    mockValidateQuery.mockResolvedValueOnce(NextResponse.json({ error: 'VALIDATION_ERROR' }, { status: 400 }));
    const res = await GET(new NextRequest('http://localhost/api/listings?page=abc'));
    expect(res.status).toBe(400);
  });

  it('returns 500 when the service throws', async () => {
    mockValidateQuery.mockResolvedValueOnce({ data: {} });
    mockSearch.mockRejectedValueOnce(new Error('DB error'));
    const res = await GET(new NextRequest('http://localhost/api/listings'));
    expect(res.status).toBe(500);
  });
});

describe('POST /api/listings', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 short-circuit without validating body', async () => {
    mockRequireAuth.mockResolvedValueOnce(NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 }));
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(401);
    expect(mockValidateBody).not.toHaveBeenCalled();
  });

  it('returns 201 on success', async () => {
    mockRequireAuth.mockResolvedValueOnce({ data: { userId: 'user_1', email: 'a@b.com', role: 'user' } });
    mockValidateBody.mockResolvedValueOnce({ data: { title: 'X' } as never });
    mockCreate.mockResolvedValueOnce({ data: { id: '507f1f77bcf86cd799439011' }, status: 201 });
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(201);
  });

  it('returns 403 when the daily limit is reached', async () => {
    mockRequireAuth.mockResolvedValueOnce({ data: { userId: 'user_1', email: 'a@b.com', role: 'user' } });
    mockValidateBody.mockResolvedValueOnce({ data: {} as never });
    mockCreate.mockResolvedValueOnce({ data: { error: 'DAILY_LIMIT_REACHED' }, status: 403 });
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(403);
  });

  it('returns 500 when the service throws', async () => {
    mockRequireAuth.mockResolvedValueOnce({ data: { userId: 'user_1', email: 'a@b.com', role: 'user' } });
    mockValidateBody.mockResolvedValueOnce({ data: {} as never });
    mockCreate.mockRejectedValueOnce(new Error('DB error'));
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(500);
  });
});
