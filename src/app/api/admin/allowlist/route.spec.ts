import { NextRequest, NextResponse } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/allowlist/service/allowlist.service', () => ({
  addAllowedEmailService: vi.fn(),
  listAllowedEmailsService: vi.fn(),
}));

vi.mock('@/shared/middleware/require-auth', () => ({
  requireAdmin: vi.fn(),
}));

vi.mock('@/shared/middleware/validate-body', () => ({
  validateBody: vi.fn(),
}));

import { addAllowedEmailService, listAllowedEmailsService } from '@/features/allowlist/service/allowlist.service';
import { requireAdmin } from '@/shared/middleware/require-auth';
import { validateBody } from '@/shared/middleware/validate-body';

import { GET, POST } from './route';

const mockAdd = vi.mocked(addAllowedEmailService);
const mockList = vi.mocked(listAllowedEmailsService);
const mockRequireAdmin = vi.mocked(requireAdmin);
const mockValidate = vi.mocked(validateBody);

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost/api/admin/allowlist', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('GET /api/admin/allowlist', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401/403 short-circuit from requireAdmin', async () => {
    mockRequireAdmin.mockResolvedValueOnce(NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 }));
    const res = await GET();
    expect(res.status).toBe(403);
    expect(mockList).not.toHaveBeenCalled();
  });

  it('returns 200 with the allowlist', async () => {
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

describe('POST /api/admin/allowlist', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401/403 short-circuit from requireAdmin without validating body', async () => {
    mockRequireAdmin.mockResolvedValueOnce(NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 }));
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(401);
    expect(mockValidate).not.toHaveBeenCalled();
  });

  it('returns validation error when body is invalid', async () => {
    mockRequireAdmin.mockResolvedValueOnce({ data: { userId: 'admin_1', email: 'a@b.com', role: 'admin' } });
    mockValidate.mockResolvedValueOnce(NextResponse.json({ error: 'VALIDATION_ERROR' }, { status: 400 }));
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
  });

  it('returns 201 on success', async () => {
    mockRequireAdmin.mockResolvedValueOnce({ data: { userId: 'admin_1', email: 'a@b.com', role: 'admin' } });
    mockValidate.mockResolvedValueOnce({ data: { email: 'shop@example.com' } });
    mockAdd.mockResolvedValueOnce({ data: { id: '507f1f77bcf86cd799439011' }, status: 201 });
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(201);
    expect(mockAdd).toHaveBeenCalledWith('admin_1', { email: 'shop@example.com' });
  });

  it('returns 409 when already allowed', async () => {
    mockRequireAdmin.mockResolvedValueOnce({ data: { userId: 'admin_1', email: 'a@b.com', role: 'admin' } });
    mockValidate.mockResolvedValueOnce({ data: { email: 'shop@example.com' } });
    mockAdd.mockResolvedValueOnce({ data: { error: 'ALREADY_ALLOWED' }, status: 409 });
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(409);
  });

  it('returns 500 when the service throws', async () => {
    mockRequireAdmin.mockResolvedValueOnce({ data: { userId: 'admin_1', email: 'a@b.com', role: 'admin' } });
    mockValidate.mockResolvedValueOnce({ data: { email: 'shop@example.com' } });
    mockAdd.mockRejectedValueOnce(new Error('DB error'));
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(500);
  });
});
