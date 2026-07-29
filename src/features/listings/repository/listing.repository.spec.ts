import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/lib/mongo', () => ({
  mongo: {
    connect: vi.fn(),
  },
}));

vi.mock('@/features/listings/schema/listing.schema', () => ({
  ListingModel: {
    findById: vi.fn(),
    find: vi.fn(),
    create: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findByIdAndDelete: vi.fn(),
    countDocuments: vi.fn(),
    updateMany: vi.fn(),
  },
}));

import { ListingModel } from '@/features/listings/schema/listing.schema';
import { mongo } from '@/shared/lib/mongo';

import { listingRepository } from './listing.repository';

const mockMongo = vi.mocked(mongo);
const mockModel = vi.mocked(ListingModel);

const fakeListing = {
  _id: '507f1f77bcf86cd799439011',
  shopId: '507f1f77bcf86cd799439022',
  title: 'Discounted sofa',
  status: 'active',
};

function makeLeanQuery<T>(result: T) {
  return { lean: () => ({ exec: () => Promise.resolve(result) }) };
}

function makeSortableLeanQuery<T>(result: T) {
  return { sort: () => makeLeanQuery(result) };
}

describe('listingRepository', () => {
  beforeEach(() => vi.clearAllMocks());

  it('create calls model.create and returns id string', async () => {
    (mockModel.create as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      _id: { toString: () => '507f1f77bcf86cd799439011' },
    });
    const id = await listingRepository.create(fakeListing as never);
    expect(mockMongo.connect).toHaveBeenCalled();
    expect(id).toBe('507f1f77bcf86cd799439011');
  });

  it('findById connects and calls findById', async () => {
    (mockModel.findById as ReturnType<typeof vi.fn>).mockReturnValueOnce(makeLeanQuery(fakeListing));
    const result = await listingRepository.findById('507f1f77bcf86cd799439011');
    expect(result).toEqual(fakeListing);
  });

  it('updateById calls findByIdAndUpdate with a $set patch', async () => {
    (mockModel.findByIdAndUpdate as ReturnType<typeof vi.fn>).mockResolvedValueOnce(fakeListing);
    const result = await listingRepository.updateById('507f1f77bcf86cd799439011', { status: 'sold_out' });
    expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith('507f1f77bcf86cd799439011', {
      $set: { status: 'sold_out' },
    });
    expect(result).toBe(true);
  });

  it('deleteById calls findByIdAndDelete', async () => {
    (mockModel.findByIdAndDelete as ReturnType<typeof vi.fn>).mockResolvedValueOnce(fakeListing);
    const result = await listingRepository.deleteById('507f1f77bcf86cd799439011');
    expect(mockModel.findByIdAndDelete).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    expect(result).toBe(true);
  });

  it('countByShopSince counts documents by shopId with createdAt >= since', async () => {
    const since = new Date('2026-01-01T00:00:00.000Z');
    (mockModel.countDocuments as ReturnType<typeof vi.fn>).mockReturnValueOnce({ exec: () => Promise.resolve(2) });
    const result = await listingRepository.countByShopSince('507f1f77bcf86cd799439022', since);
    expect(mockModel.countDocuments).toHaveBeenCalledWith({
      shopId: '507f1f77bcf86cd799439022',
      createdAt: { $gte: since },
    });
    expect(result).toBe(2);
  });

  it('findByShopId paginates and sorts by newest', async () => {
    (mockModel.find as ReturnType<typeof vi.fn>).mockReturnValueOnce(makeSortableLeanQuery([fakeListing]));
    const result = await listingRepository.findByShopId('507f1f77bcf86cd799439022', 2, 10);
    expect(mockModel.find).toHaveBeenCalledWith({ shopId: '507f1f77bcf86cd799439022' }, null, { skip: 10, limit: 10 });
    expect(result).toEqual({ items: [fakeListing] });
  });

  it('findNearby builds $near/$geometry with [lng, lat] coordinate order and $maxDistance', async () => {
    (mockModel.find as ReturnType<typeof vi.fn>).mockReturnValueOnce(makeLeanQuery([fakeListing]));
    await listingRepository.findNearby({ status: 'active' }, [44.78, 41.72], 5000, 1, 20);
    expect(mockModel.find).toHaveBeenCalledWith(
      {
        status: 'active',
        location: { $near: { $geometry: { type: 'Point', coordinates: [44.78, 41.72] }, $maxDistance: 5000 } },
      },
      null,
      { skip: 0, limit: 20 }
    );
  });

  it('findNearby merges a $or regex filter with the $near geo clause when both are given', async () => {
    (mockModel.find as ReturnType<typeof vi.fn>).mockReturnValueOnce(makeLeanQuery([fakeListing]));
    const filter = { status: 'active' as const, $or: [{ title: /sofa/i }, { description: /sofa/i }] };
    await listingRepository.findNearby(filter, [44.78, 41.72], 5000, 1, 20);
    expect(mockModel.find).toHaveBeenCalledWith(
      {
        status: 'active',
        $or: [{ title: /sofa/i }, { description: /sofa/i }],
        location: { $near: { $geometry: { type: 'Point', coordinates: [44.78, 41.72] }, $maxDistance: 5000 } },
      },
      null,
      { skip: 0, limit: 20 }
    );
  });

  it('findRecent sorts by newest with the given filter', async () => {
    (mockModel.find as ReturnType<typeof vi.fn>).mockReturnValueOnce(makeSortableLeanQuery([fakeListing]));
    await listingRepository.findRecent({ category: 'furniture_home' }, 1, 20);
    expect(mockModel.find).toHaveBeenCalledWith({ category: 'furniture_home' }, null, { skip: 0, limit: 20 });
  });

  it('updateManyByShopId updates shopName/location for all of a shop\'s listings', async () => {
    (mockModel.updateMany as ReturnType<typeof vi.fn>).mockReturnValueOnce({ exec: () => Promise.resolve({ modifiedCount: 4 }) });
    const result = await listingRepository.updateManyByShopId('507f1f77bcf86cd799439022', { shopName: 'New Name' });
    expect(mockModel.updateMany).toHaveBeenCalledWith(
      { shopId: '507f1f77bcf86cd799439022' },
      { $set: { shopName: 'New Name' } }
    );
    expect(result).toBe(4);
  });

  it('deactivateActiveByShopId only touches currently-active listings', async () => {
    (mockModel.updateMany as ReturnType<typeof vi.fn>).mockReturnValueOnce({ exec: () => Promise.resolve({ modifiedCount: 2 }) });
    const result = await listingRepository.deactivateActiveByShopId('507f1f77bcf86cd799439022');
    expect(mockModel.updateMany).toHaveBeenCalledWith(
      { shopId: '507f1f77bcf86cd799439022', status: 'active' },
      { $set: { status: 'deactivated' } }
    );
    expect(result).toBe(2);
  });
});
