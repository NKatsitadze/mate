import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/features/allowlist/service/allowlist.service', () => ({
  isEmailAllowedService: vi.fn(),
}));

vi.mock('@/features/auth/repository/user.repository', () => ({
  userRepository: {
    findByEmail: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
  },
}));

import { isEmailAllowedService } from '@/features/allowlist/service/allowlist.service';
import { userRepository } from '@/features/auth/repository/user.repository';

import { loginService, registerService, getUserByIdService } from './auth.service';

const mockRepo = vi.mocked(userRepository);
const mockIsEmailAllowed = vi.mocked(isEmailAllowedService);

const fakeUser = {
  _id: { toString: () => '507f1f77bcf86cd799439011' },
  name: 'Alice',
  email: 'alice@example.com',
  passwordHash: '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
  role: 'admin' as const,
  avatar: undefined,
};

describe('registerService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsEmailAllowed.mockResolvedValue(true);
  });

  it('returns 403 when the email is not on the allowlist, without checking EMAIL_TAKEN', async () => {
    mockIsEmailAllowed.mockResolvedValueOnce(false);
    const result = await registerService({ fullName: 'Alice', email: 'alice@example.com', password: 'password123' });
    expect(result.status).toBe(403);
    expect(result.data).toEqual({ error: 'EMAIL_NOT_ALLOWED' });
    expect(mockRepo.findByEmail).not.toHaveBeenCalled();
  });

  it('returns 409 when email already taken', async () => {
    mockRepo.findByEmail.mockResolvedValueOnce(fakeUser as never);
    const result = await registerService({ fullName: 'Alice', email: 'alice@example.com', password: 'password123' });
    expect(result.status).toBe(409);
    expect(result.data).toEqual({ error: 'EMAIL_TAKEN' });
  });

  it('returns 201 on successful registration', async () => {
    mockRepo.findByEmail.mockResolvedValueOnce(null);
    mockRepo.create.mockResolvedValueOnce('507f1f77bcf86cd799439011');
    const result = await registerService({ fullName: 'Bob', email: 'bob@example.com', password: 'password123' });
    expect(result.status).toBe(201);
    expect(result.data).toEqual({ message: 'Account created' });
  });

  it('creates user with default role "user"', async () => {
    mockRepo.findByEmail.mockResolvedValueOnce(null);
    mockRepo.create.mockResolvedValueOnce('507f1f77bcf86cd799439011');
    await registerService({ fullName: 'Bob', email: 'bob@example.com', password: 'password123' });
    expect(mockRepo.create).toHaveBeenCalledWith(expect.objectContaining({ role: 'user', name: 'Bob' }));
  });
});

describe('loginService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 404 when user not found', async () => {
    mockRepo.findByEmail.mockResolvedValueOnce(null);
    const result = await loginService({ email: 'nobody@test.com', password: 'password123' });
    expect(result.status).toBe(404);
  });

  it('returns 401 when password is wrong', async () => {
    mockRepo.findByEmail.mockResolvedValueOnce(fakeUser as never);
    const result = await loginService({ email: 'alice@example.com', password: 'wrongpass' });
    expect(result.status).toBe(401);
    expect(result.data).toEqual({ error: 'INVALID_CREDENTIALS' });
  });

  it('returns 200 with role on valid credentials', async () => {
    mockRepo.findByEmail.mockResolvedValueOnce(fakeUser as never);
    const result = await loginService({ email: 'alice@example.com', password: '123456' });
    expect(result.status).toBe(200);
    expect(result.data).toMatchObject({ email: 'alice@example.com', role: 'admin' });
  });
});

describe('getUserByIdService', () => {
  it('returns 404 when not found', async () => {
    mockRepo.findById.mockResolvedValueOnce(null);
    const result = await getUserByIdService('nonexistent');
    expect(result.status).toBe(404);
  });

  it('returns 200 with user data including role', async () => {
    mockRepo.findById.mockResolvedValueOnce(fakeUser as never);
    const result = await getUserByIdService('507f1f77bcf86cd799439011');
    expect(result.status).toBe(200);
    expect(result.data).toMatchObject({ name: 'Alice', role: 'admin' });
  });
});
