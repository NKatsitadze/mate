import { NextRequest, NextResponse } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/listings/service/listing.service', () => ({
  getListingImagePresignedUrlService: vi.fn(),
}));

vi.mock('@/shared/middleware/require-auth', () => ({
  requireAuth: vi.fn(),
}));

vi.mock('@/shared/middleware/validate-body', () => ({
  validateBody: vi.fn(),
}));

import { getListingImagePresignedUrlService } from '@/features/listings/service/listing.service';
import { requireAuth } from '@/shared/middleware/require-auth';
import { validateBody } from '@/shared/middleware/validate-body';

import { POST } from './route';

const mockPresign = vi.mocked(getListingImagePresignedUrlService);
const mockRequireAuth = vi.mocked(requireAuth);
const mockValidate = vi.mocked(validateBody);

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost/api/listings/presign-upload', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('POST /api/listings/presign-upload', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 short-circuit without validating body', async () => {
    mockRequireAuth.mockResolvedValueOnce(NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 }));
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(401);
    expect(mockValidate).not.toHaveBeenCalled();
  });

  it('returns 200 with the presigned URL', async () => {
    mockRequireAuth.mockResolvedValueOnce({ data: { userId: 'user_1', email: 'a@b.com', role: 'user' } });
    mockValidate.mockResolvedValueOnce({ data: { fileName: 'a.jpg', contentType: 'image/jpeg' } });
    mockPresign.mockResolvedValueOnce({
      data: { uploadUrl: 'https://upload.example.com', objectUrl: 'https://cdn.example.com/a.jpg' },
      status: 200,
    });
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(200);
  });

  it('returns 500 when the service throws', async () => {
    mockRequireAuth.mockResolvedValueOnce({ data: { userId: 'user_1', email: 'a@b.com', role: 'user' } });
    mockValidate.mockResolvedValueOnce({ data: {} as never });
    mockPresign.mockRejectedValueOnce(new Error('S3 error'));
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(500);
  });
});
