import { NextResponse } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/lib/auth', () => ({
  auth: vi.fn(),
}));

import { auth } from '@/shared/lib/auth';

import { requireAdmin, requireAuth } from './require-auth';

type MockSession = { user: { id?: string; email?: string | null; role?: 'admin' | 'user' } };
type AuthFn = () => Promise<MockSession | null>;

const mockedAuth = vi.mocked(auth as AuthFn);

describe('requireAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when there is no session', async () => {
    mockedAuth.mockResolvedValue(null);
    const result = await requireAuth();
    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(401);
  });

  it('returns 401 when the session has no user id or email', async () => {
    mockedAuth.mockResolvedValue({ user: {} });
    const result = await requireAuth();
    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(401);
  });

  it('returns the auth context for a valid session', async () => {
    mockedAuth.mockResolvedValue({ user: { id: 'user_1', email: 'a@b.com', role: 'user' } });
    const result = await requireAuth();
    expect(result).toEqual({ data: { userId: 'user_1', email: 'a@b.com', role: 'user' } });
  });

  it('defaults role to "user" when the token has no role', async () => {
    mockedAuth.mockResolvedValue({ user: { id: 'user_1', email: 'a@b.com' } });
    const result = await requireAuth();
    expect(result).toEqual({ data: { userId: 'user_1', email: 'a@b.com', role: 'user' } });
  });
});

describe('requireAdmin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when there is no session', async () => {
    mockedAuth.mockResolvedValue(null);
    const result = await requireAdmin();
    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(401);
  });

  it('returns 403 for a non-admin session', async () => {
    mockedAuth.mockResolvedValue({ user: { id: 'user_1', email: 'a@b.com', role: 'user' } });
    const result = await requireAdmin();
    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(403);
  });

  it('passes through for an admin session', async () => {
    mockedAuth.mockResolvedValue({ user: { id: 'admin_1', email: 'admin@b.com', role: 'admin' } });
    const result = await requireAdmin();
    expect(result).toEqual({ data: { userId: 'admin_1', email: 'admin@b.com', role: 'admin' } });
  });
});
