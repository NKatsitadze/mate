import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/allowlist/repository/allowed-email.repository', () => ({
  allowedEmailRepository: {
    findByEmail: vi.fn(),
    create: vi.fn(),
    findAll: vi.fn(),
  },
}));

import { allowedEmailRepository } from '@/features/allowlist/repository/allowed-email.repository';

import { addAllowedEmailService, isEmailAllowedService, listAllowedEmailsService } from './allowlist.service';

const mockRepo = vi.mocked(allowedEmailRepository);

describe('isEmailAllowedService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns true when the email is on the allowlist', async () => {
    mockRepo.findByEmail.mockResolvedValueOnce({ email: 'shop@example.com' } as never);
    const result = await isEmailAllowedService('shop@example.com');
    expect(result).toBe(true);
  });

  it('returns false when the email is not on the allowlist', async () => {
    mockRepo.findByEmail.mockResolvedValueOnce(null);
    const result = await isEmailAllowedService('nobody@example.com');
    expect(result).toBe(false);
  });

  it('normalizes email casing before checking', async () => {
    mockRepo.findByEmail.mockResolvedValueOnce(null);
    await isEmailAllowedService('Shop@Example.com');
    expect(mockRepo.findByEmail).toHaveBeenCalledWith('shop@example.com');
  });
});

describe('addAllowedEmailService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 409 when the email is already allowed', async () => {
    mockRepo.findByEmail.mockResolvedValueOnce({ email: 'shop@example.com' } as never);
    const result = await addAllowedEmailService('507f1f77bcf86cd799439099', { email: 'shop@example.com' });
    expect(result.status).toBe(409);
    expect(result.data).toEqual({ error: 'ALREADY_ALLOWED' });
  });

  it('returns 201 and creates a new allowlist entry', async () => {
    mockRepo.findByEmail.mockResolvedValueOnce(null);
    mockRepo.create.mockResolvedValueOnce('507f1f77bcf86cd799439011');
    const result = await addAllowedEmailService('507f1f77bcf86cd799439099', {
      email: 'shop@example.com',
      note: 'referred by X',
    });
    expect(result.status).toBe(201);
    expect(result.data).toEqual({ id: '507f1f77bcf86cd799439011' });
    expect(mockRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'shop@example.com', note: 'referred by X' })
    );
  });
});

describe('listAllowedEmailsService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('maps allowlist documents to the flat response shape', async () => {
    const createdAt = new Date('2026-01-01T00:00:00.000Z');
    mockRepo.findAll.mockResolvedValueOnce({
      items: [
        {
          _id: { toString: () => '507f1f77bcf86cd799439011' },
          email: 'shop@example.com',
          note: 'referred by X',
          createdAt,
        },
      ] as never,
    });

    const result = await listAllowedEmailsService(1, 20);

    expect(result.status).toBe(200);
    expect(result.data).toEqual({
      items: [{ id: '507f1f77bcf86cd799439011', email: 'shop@example.com', note: 'referred by X', createdAt }],
    });
  });
});
