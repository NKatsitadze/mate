import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/listings/repository/listing.repository', () => ({
  listingRepository: {
    create: vi.fn(),
    findById: vi.fn(),
    updateById: vi.fn(),
    deleteById: vi.fn(),
    countByShopSince: vi.fn(),
    findByShopId: vi.fn(),
    findNearby: vi.fn(),
    findRecent: vi.fn(),
    updateManyByShopId: vi.fn(),
    deactivateActiveByShopId: vi.fn(),
  },
}));

vi.mock('@/features/shops/service/shop.service', () => ({
  getShopByOwnerIdService: vi.fn(),
}));

vi.mock('@/shared/lib/s3', () => ({
  s3: {
    getPresignedUploadUrl: vi.fn(),
  },
}));

import { listingRepository } from '@/features/listings/repository/listing.repository';
import { getShopByOwnerIdService } from '@/features/shops/service/shop.service';
import { s3 } from '@/shared/lib/s3';

import {
  createListingService,
  deactivateAllListingsForShopService,
  deleteListingService,
  getDailyUsageService,
  getListingByIdService,
  getListingImagePresignedUrlService,
  getListingsByShopService,
  listAllListingsService,
  searchListingsService,
  setListingStatusService,
  syncShopDenormalizationService,
  updateListingService,
} from './listing.service';

const mockRepo = vi.mocked(listingRepository);
const mockGetShop = vi.mocked(getShopByOwnerIdService);
const mockS3 = vi.mocked(s3);

const activeFreeShop = {
  id: '507f1f77bcf86cd799439022',
  ownerId: '507f1f77bcf86cd799439099',
  name: 'Corner Grocery',
  category: 'grocery_store' as const,
  phone: '+995500000000',
  address: 'Vake, Tbilisi',
  lat: 41.72,
  lng: 44.78,
  plan: 'free' as const,
  status: 'active' as const,
  isVerified: false,
};

const createInput = {
  title: 'Discounted sofa',
  category: 'furniture_home' as const,
  originalPrice: 200,
  discountPrice: 120,
  listingDurationDays: 7,
};

const fakeListing = {
  _id: { toString: () => '507f1f77bcf86cd799439011' },
  shopId: { toString: () => '507f1f77bcf86cd799439022' },
  shopOwnerId: { toString: () => '507f1f77bcf86cd799439099' },
  shopName: 'Corner Grocery',
  location: { type: 'Point' as const, coordinates: [44.78, 41.72] },
  title: 'Discounted sofa',
  description: undefined,
  category: 'furniture_home' as const,
  originalPrice: 200,
  discountPrice: 120,
  images: [],
  quantityAvailable: 1,
  status: 'active' as const,
  expiresAt: new Date('2026-08-01T00:00:00.000Z'),
};

describe('createListingService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 404 NO_SHOP when the caller has no shop', async () => {
    mockGetShop.mockResolvedValueOnce({ data: { error: 'NOT_FOUND' }, status: 404 });
    const result = await createListingService('507f1f77bcf86cd799439099', createInput);
    expect(result.status).toBe(404);
    expect(result.data).toEqual({ error: 'NO_SHOP' });
  });

  it('returns 403 SHOP_SUSPENDED when the shop is suspended', async () => {
    mockGetShop.mockResolvedValueOnce({ data: { ...activeFreeShop, status: 'suspended' }, status: 200 });
    const result = await createListingService('507f1f77bcf86cd799439099', createInput);
    expect(result.status).toBe(403);
    expect(result.data).toEqual({ error: 'SHOP_SUSPENDED' });
  });

  it('returns 403 DAILY_LIMIT_REACHED at the free tier limit (3/day)', async () => {
    mockGetShop.mockResolvedValueOnce({ data: activeFreeShop, status: 200 });
    mockRepo.countByShopSince.mockResolvedValueOnce(3);
    const result = await createListingService('507f1f77bcf86cd799439099', createInput);
    expect(result.status).toBe(403);
    expect(result.data).toEqual({ error: 'DAILY_LIMIT_REACHED' });
    expect(mockRepo.create).not.toHaveBeenCalled();
  });

  it('returns 403 DAILY_LIMIT_REACHED at the pro tier limit (15/day) — proving the limit is PLANS-driven, not hardcoded', async () => {
    mockGetShop.mockResolvedValueOnce({ data: { ...activeFreeShop, plan: 'pro' }, status: 200 });
    mockRepo.countByShopSince.mockResolvedValueOnce(15);
    const result = await createListingService('507f1f77bcf86cd799439099', createInput);
    expect(result.status).toBe(403);
    expect(result.data).toEqual({ error: 'DAILY_LIMIT_REACHED' });
  });

  it('allows unlimited posting on the premium tier (null limit)', async () => {
    mockGetShop.mockResolvedValueOnce({ data: { ...activeFreeShop, plan: 'premium' }, status: 200 });
    mockRepo.countByShopSince.mockResolvedValueOnce(500);
    mockRepo.create.mockResolvedValueOnce('507f1f77bcf86cd799439011');
    const result = await createListingService('507f1f77bcf86cd799439099', createInput);
    expect(result.status).toBe(201);
  });

  it('computes expiresAt from input.listingDurationDays, not a fixed constant', async () => {
    mockGetShop.mockResolvedValueOnce({ data: activeFreeShop, status: 200 });
    mockRepo.countByShopSince.mockResolvedValueOnce(0);
    mockRepo.create.mockResolvedValueOnce('507f1f77bcf86cd799439011');

    const before = Date.now();
    await createListingService('507f1f77bcf86cd799439099', { ...createInput, listingDurationDays: 14 });
    const after = Date.now();

    const createCall = mockRepo.create.mock.calls[0][0] as { expiresAt: Date };
    const expectedMin = before + 14 * 24 * 60 * 60 * 1000;
    const expectedMax = after + 14 * 24 * 60 * 60 * 1000;
    expect(createCall.expiresAt.getTime()).toBeGreaterThanOrEqual(expectedMin);
    expect(createCall.expiresAt.getTime()).toBeLessThanOrEqual(expectedMax);
  });

  it('denormalizes shopName/location/shopOwnerId onto the create payload', async () => {
    mockGetShop.mockResolvedValueOnce({ data: activeFreeShop, status: 200 });
    mockRepo.countByShopSince.mockResolvedValueOnce(0);
    mockRepo.create.mockResolvedValueOnce('507f1f77bcf86cd799439011');
    await createListingService('507f1f77bcf86cd799439099', createInput);
    expect(mockRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        shopName: 'Corner Grocery',
        location: { type: 'Point', coordinates: [44.78, 41.72] },
        status: 'active',
      })
    );
  });
});

describe('getDailyUsageService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 404 when the caller has no shop', async () => {
    mockGetShop.mockResolvedValueOnce({ data: { error: 'NOT_FOUND' }, status: 404 });
    const result = await getDailyUsageService('507f1f77bcf86cd799439099');
    expect(result.status).toBe(404);
  });

  it('returns used/limit for the shop\'s plan', async () => {
    mockGetShop.mockResolvedValueOnce({ data: activeFreeShop, status: 200 });
    mockRepo.countByShopSince.mockResolvedValueOnce(2);
    const result = await getDailyUsageService('507f1f77bcf86cd799439099');
    expect(result.data).toEqual({ used: 2, limit: 3 });
  });
});

describe('searchListingsService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('uses findNearby when lat/lng are given', async () => {
    mockRepo.findNearby.mockResolvedValueOnce({ items: [fakeListing as never] });
    await searchListingsService({ lat: 41.72, lng: 44.78 });
    expect(mockRepo.findNearby).toHaveBeenCalled();
    expect(mockRepo.findRecent).not.toHaveBeenCalled();
  });

  it('uses findRecent with a $or regex filter when only q is given (substring match, not $text)', async () => {
    mockRepo.findRecent.mockResolvedValueOnce({ items: [] });
    await searchListingsService({ q: 'burg' });
    expect(mockRepo.findNearby).not.toHaveBeenCalled();
    const [filter] = mockRepo.findRecent.mock.calls[0];
    expect(filter.$or).toEqual([{ title: /burg/i }, { description: /burg/i }]);
  });

  it('uses findRecent with no $or clause when neither lat/lng nor q are given', async () => {
    mockRepo.findRecent.mockResolvedValueOnce({ items: [] });
    await searchListingsService({});
    expect(mockRepo.findRecent).toHaveBeenCalled();
    const [filter] = mockRepo.findRecent.mock.calls[0];
    expect(filter.$or).toBeUndefined();
  });

  it('combines geo and text search when both lat/lng and q are given — both filters apply together', async () => {
    mockRepo.findNearby.mockResolvedValueOnce({ items: [] });
    await searchListingsService({ lat: 41.72, lng: 44.78, q: 'sofa' });
    expect(mockRepo.findNearby).toHaveBeenCalled();
    const [filter] = mockRepo.findNearby.mock.calls[0];
    expect(filter.$or).toEqual([{ title: /sofa/i }, { description: /sofa/i }]);
  });

  it('escapes regex metacharacters in the search query', async () => {
    mockRepo.findRecent.mockResolvedValueOnce({ items: [] });
    await searchListingsService({ q: 'a.b' });
    const [filter] = mockRepo.findRecent.mock.calls[0];
    const titlePattern = (filter.$or?.[0] as { title: RegExp }).title;
    expect(titlePattern.test('a.b')).toBe(true);
    expect(titlePattern.test('axb')).toBe(false);
  });
});

describe('getListingByIdService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 404 when not found', async () => {
    mockRepo.findById.mockResolvedValueOnce(null);
    const result = await getListingByIdService('missing');
    expect(result.status).toBe(404);
  });

  it('returns 404 when deactivated, even though the document exists', async () => {
    mockRepo.findById.mockResolvedValueOnce({ ...fakeListing, status: 'deactivated' } as never);
    const result = await getListingByIdService('507f1f77bcf86cd799439011');
    expect(result.status).toBe(404);
  });

  it('returns 200 for an active listing', async () => {
    mockRepo.findById.mockResolvedValueOnce(fakeListing as never);
    const result = await getListingByIdService('507f1f77bcf86cd799439011');
    expect(result.status).toBe(200);
  });
});

describe('updateListingService / deleteListingService — ownership checks', () => {
  beforeEach(() => vi.clearAllMocks());

  it('updateListingService returns 403 FORBIDDEN when the caller does not own the shop', async () => {
    mockRepo.findById.mockResolvedValueOnce(fakeListing as never);
    const result = await updateListingService('someone-else', '507f1f77bcf86cd799439011', { title: 'X' });
    expect(result.status).toBe(403);
    expect(mockRepo.updateById).not.toHaveBeenCalled();
  });

  it('updateListingService succeeds for the owner', async () => {
    mockRepo.findById.mockResolvedValueOnce(fakeListing as never);
    mockRepo.updateById.mockResolvedValueOnce(true);
    const result = await updateListingService('507f1f77bcf86cd799439099', '507f1f77bcf86cd799439011', {
      title: 'New title',
    });
    expect(result.status).toBe(200);
    expect(mockRepo.updateById).toHaveBeenCalledWith('507f1f77bcf86cd799439011', { title: 'New title' });
  });

  it('deleteListingService returns 403 FORBIDDEN when the caller does not own the shop', async () => {
    mockRepo.findById.mockResolvedValueOnce(fakeListing as never);
    const result = await deleteListingService('someone-else', '507f1f77bcf86cd799439011');
    expect(result.status).toBe(403);
    expect(mockRepo.deleteById).not.toHaveBeenCalled();
  });

  it('deleteListingService succeeds for the owner', async () => {
    mockRepo.findById.mockResolvedValueOnce(fakeListing as never);
    mockRepo.deleteById.mockResolvedValueOnce(true);
    const result = await deleteListingService('507f1f77bcf86cd799439099', '507f1f77bcf86cd799439011');
    expect(result.status).toBe(200);
  });
});

describe('getListingsByShopService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 404 when the caller has no shop', async () => {
    mockGetShop.mockResolvedValueOnce({ data: { error: 'NOT_FOUND' }, status: 404 });
    const result = await getListingsByShopService('507f1f77bcf86cd799439099', 1, 20);
    expect(result.status).toBe(404);
  });

  it('returns the shop\'s listings', async () => {
    mockGetShop.mockResolvedValueOnce({ data: activeFreeShop, status: 200 });
    mockRepo.findByShopId.mockResolvedValueOnce({ items: [fakeListing as never] });
    const result = await getListingsByShopService('507f1f77bcf86cd799439099', 1, 20);
    expect(result.status).toBe(200);
    expect(mockRepo.findByShopId).toHaveBeenCalledWith('507f1f77bcf86cd799439022', 1, 20);
  });
});

describe('getListingImagePresignedUrlService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 404 when the caller has no shop', async () => {
    mockGetShop.mockResolvedValueOnce({ data: { error: 'NOT_FOUND' }, status: 404 });
    const result = await getListingImagePresignedUrlService('507f1f77bcf86cd799439099', {
      fileName: 'a.jpg',
      contentType: 'image/jpeg',
    });
    expect(result.status).toBe(404);
  });

  it('builds a key namespaced by shopId and delegates to s3', async () => {
    mockGetShop.mockResolvedValueOnce({ data: activeFreeShop, status: 200 });
    mockS3.getPresignedUploadUrl.mockResolvedValueOnce({
      uploadUrl: 'https://upload.example.com',
      objectUrl: 'https://cdn.example.com/a.jpg',
    });
    await getListingImagePresignedUrlService('507f1f77bcf86cd799439099', {
      fileName: 'a.jpg',
      contentType: 'image/jpeg',
    });
    expect(mockS3.getPresignedUploadUrl).toHaveBeenCalledWith(
      expect.stringMatching(/^listings\/507f1f77bcf86cd799439022\/.+-a\.jpg$/),
      'image/jpeg'
    );
  });
});

describe('listAllListingsService / setListingStatusService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('listAllListingsService filters by status when given', async () => {
    mockRepo.findRecent.mockResolvedValueOnce({ items: [] });
    await listAllListingsService(1, 20, 'deactivated');
    expect(mockRepo.findRecent).toHaveBeenCalledWith({ status: 'deactivated' }, 1, 20);
  });

  it('setListingStatusService returns 404 when the listing does not exist', async () => {
    mockRepo.findById.mockResolvedValueOnce(null);
    const result = await setListingStatusService('missing', 'deactivated');
    expect(result.status).toBe(404);
  });

  it('setListingStatusService updates the status', async () => {
    mockRepo.findById.mockResolvedValueOnce(fakeListing as never);
    mockRepo.updateById.mockResolvedValueOnce(true);
    const result = await setListingStatusService('507f1f77bcf86cd799439011', 'deactivated');
    expect(mockRepo.updateById).toHaveBeenCalledWith('507f1f77bcf86cd799439011', { status: 'deactivated' });
    expect(result.status).toBe(200);
  });
});

describe('syncShopDenormalizationService / deactivateAllListingsForShopService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('syncShopDenormalizationService delegates to updateManyByShopId with the given patch', async () => {
    mockRepo.updateManyByShopId.mockResolvedValueOnce(3);
    await syncShopDenormalizationService('507f1f77bcf86cd799439022', { shopName: 'New Name' });
    expect(mockRepo.updateManyByShopId).toHaveBeenCalledWith('507f1f77bcf86cd799439022', { shopName: 'New Name' });
  });

  it('deactivateAllListingsForShopService delegates to deactivateActiveByShopId', async () => {
    mockRepo.deactivateActiveByShopId.mockResolvedValueOnce(2);
    await deactivateAllListingsForShopService('507f1f77bcf86cd799439022');
    expect(mockRepo.deactivateActiveByShopId).toHaveBeenCalledWith('507f1f77bcf86cd799439022');
  });
});
