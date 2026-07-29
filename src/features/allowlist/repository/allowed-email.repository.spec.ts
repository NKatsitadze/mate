import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/lib/mongo', () => ({
  mongo: {
    connect: vi.fn(),
  },
}));

vi.mock('@/features/allowlist/schema/allowed-email.schema', () => ({
  AllowedEmailModel: {
    findOne: vi.fn(),
    find: vi.fn(),
    create: vi.fn(),
  },
}));

import { AllowedEmailModel } from '@/features/allowlist/schema/allowed-email.schema';
import { mongo } from '@/shared/lib/mongo';

import { allowedEmailRepository } from './allowed-email.repository';

const mockMongo = vi.mocked(mongo);
const mockModel = vi.mocked(AllowedEmailModel);

const fakeEntry = {
  _id: '507f1f77bcf86cd799439011',
  email: 'shop@example.com',
  note: 'referred by X',
  addedByAdminId: '507f1f77bcf86cd799439099',
};

function makeLeanQuery<T>(result: T) {
  return { lean: () => ({ exec: () => Promise.resolve(result) }) };
}

function makeSortableLeanQuery<T>(result: T) {
  return { sort: () => makeLeanQuery(result) };
}

describe('allowedEmailRepository', () => {
  beforeEach(() => vi.clearAllMocks());

  it('findByEmail connects and calls findOne', async () => {
    (mockModel.findOne as ReturnType<typeof vi.fn>).mockReturnValueOnce(makeLeanQuery(fakeEntry));
    const result = await allowedEmailRepository.findByEmail('shop@example.com');
    expect(mockMongo.connect).toHaveBeenCalled();
    expect(mockModel.findOne).toHaveBeenCalledWith({ email: 'shop@example.com' });
    expect(result).toEqual(fakeEntry);
  });

  it('findByEmail returns null when not found', async () => {
    (mockModel.findOne as ReturnType<typeof vi.fn>).mockReturnValueOnce(makeLeanQuery(null));
    const result = await allowedEmailRepository.findByEmail('none@test.com');
    expect(result).toBeNull();
  });

  it('create calls model.create and returns id string', async () => {
    (mockModel.create as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      _id: { toString: () => '507f1f77bcf86cd799439011' },
    });
    const id = await allowedEmailRepository.create({
      email: 'shop@example.com',
      addedByAdminId: 'admin-id' as never,
    });
    expect(id).toBe('507f1f77bcf86cd799439011');
  });

  it('findAll connects, sorts by newest, and paginates', async () => {
    (mockModel.find as ReturnType<typeof vi.fn>).mockReturnValueOnce(makeSortableLeanQuery([fakeEntry]));
    const result = await allowedEmailRepository.findAll(2, 10);
    expect(mockMongo.connect).toHaveBeenCalled();
    expect(mockModel.find).toHaveBeenCalledWith({}, null, { skip: 10, limit: 10 });
    expect(result).toEqual({ items: [fakeEntry] });
  });
});
