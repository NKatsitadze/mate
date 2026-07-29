import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/lib/mongo', () => ({
  mongo: {
    connect: vi.fn(),
  },
}));

vi.mock('@/features/shops/schema/shop.schema', () => ({
  ShopModel: {
    findOne: vi.fn(),
    findById: vi.fn(),
    find: vi.fn(),
    create: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    countDocuments: vi.fn(),
  },
}));

import { ShopModel } from '@/features/shops/schema/shop.schema';
import { mongo } from '@/shared/lib/mongo';

import { shopRepository } from './shop.repository';

const mockMongo = vi.mocked(mongo);
const mockModel = vi.mocked(ShopModel);

const fakeShop = {
  _id: '507f1f77bcf86cd799439011',
  ownerId: '507f1f77bcf86cd799439099',
  name: 'Corner Grocery',
  category: 'grocery_store',
  phone: '+995500000000',
  address: 'Vake, Tbilisi',
  location: { type: 'Point', coordinates: [44.78, 41.72] },
  plan: 'free',
  status: 'active',
  isVerified: false,
};

function makeLeanQuery<T>(result: T) {
  return { lean: () => ({ exec: () => Promise.resolve(result) }) };
}

function makeSortableLeanQuery<T>(result: T) {
  return { sort: () => makeLeanQuery(result) };
}

describe('shopRepository', () => {
  beforeEach(() => vi.clearAllMocks());

  it('findByOwnerId connects and calls findOne with ownerId', async () => {
    (mockModel.findOne as ReturnType<typeof vi.fn>).mockReturnValueOnce(makeLeanQuery(fakeShop));
    const result = await shopRepository.findByOwnerId('507f1f77bcf86cd799439099');
    expect(mockMongo.connect).toHaveBeenCalled();
    expect(mockModel.findOne).toHaveBeenCalledWith({ ownerId: '507f1f77bcf86cd799439099' });
    expect(result).toEqual(fakeShop);
  });

  it('findByOwnerId returns null when not found', async () => {
    (mockModel.findOne as ReturnType<typeof vi.fn>).mockReturnValueOnce(makeLeanQuery(null));
    const result = await shopRepository.findByOwnerId('nobody');
    expect(result).toBeNull();
  });

  it('findById connects and calls findById', async () => {
    (mockModel.findById as ReturnType<typeof vi.fn>).mockReturnValueOnce(makeLeanQuery(fakeShop));
    const result = await shopRepository.findById('507f1f77bcf86cd799439011');
    expect(mockMongo.connect).toHaveBeenCalled();
    expect(result).toEqual(fakeShop);
  });

  it('create calls model.create and returns id string', async () => {
    (mockModel.create as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      _id: { toString: () => '507f1f77bcf86cd799439011' },
    });
    const id = await shopRepository.create(fakeShop as never);
    expect(id).toBe('507f1f77bcf86cd799439011');
  });

  it('updateById calls findByIdAndUpdate with a $set patch', async () => {
    (mockModel.findByIdAndUpdate as ReturnType<typeof vi.fn>).mockResolvedValueOnce(fakeShop);
    const result = await shopRepository.updateById('507f1f77bcf86cd799439011', { name: 'New Name' });
    expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith('507f1f77bcf86cd799439011', {
      $set: { name: 'New Name' },
    });
    expect(result).toBe(true);
  });

  it('updateById returns false when nothing matched', async () => {
    (mockModel.findByIdAndUpdate as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);
    const result = await shopRepository.updateById('missing', { name: 'X' });
    expect(result).toBe(false);
  });

  it('findAll connects, sorts by newest, and paginates with the given filter', async () => {
    (mockModel.find as ReturnType<typeof vi.fn>).mockReturnValueOnce(makeSortableLeanQuery([fakeShop]));
    const result = await shopRepository.findAll({ status: 'active' }, 2, 10);
    expect(mockMongo.connect).toHaveBeenCalled();
    expect(mockModel.find).toHaveBeenCalledWith({ status: 'active' }, null, { skip: 10, limit: 10 });
    expect(result).toEqual({ items: [fakeShop] });
  });

  it('countAll connects and calls countDocuments with the given filter', async () => {
    (mockModel.countDocuments as ReturnType<typeof vi.fn>).mockReturnValueOnce({ exec: () => Promise.resolve(3) });
    const result = await shopRepository.countAll({ status: 'suspended' });
    expect(mockMongo.connect).toHaveBeenCalled();
    expect(mockModel.countDocuments).toHaveBeenCalledWith({ status: 'suspended' });
    expect(result).toBe(3);
  });
});
