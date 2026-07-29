import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/shops/repository/shop.repository', () => ({
  shopRepository: {
    findByOwnerId: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    updateById: vi.fn(),
    findAll: vi.fn(),
    countAll: vi.fn(),
  },
}));

vi.mock('@/shared/lib/s3', () => ({
  s3: {
    getPresignedUploadUrl: vi.fn(),
  },
}));

vi.mock('@/features/listings/service/listing.service', () => ({
  syncShopDenormalizationService: vi.fn(),
  deactivateAllListingsForShopService: vi.fn(),
}));

import {
  deactivateAllListingsForShopService,
  syncShopDenormalizationService,
} from '@/features/listings/service/listing.service';
import { shopRepository } from '@/features/shops/repository/shop.repository';
import { s3 } from '@/shared/lib/s3';

import {
  createShopService,
  getShopByIdService,
  getShopByOwnerIdService,
  getShopPhotoPresignedUrlService,
  listAllShopsService,
  updateShopService,
  updateShopStatusService,
} from './shop.service';

const mockRepo = vi.mocked(shopRepository);
const mockS3 = vi.mocked(s3);
const mockSyncDenormalization = vi.mocked(syncShopDenormalizationService);
const mockDeactivateListings = vi.mocked(deactivateAllListingsForShopService);

const fakeShop = {
  _id: { toString: () => '507f1f77bcf86cd799439011' },
  ownerId: { toString: () => '507f1f77bcf86cd799439099' },
  name: 'Corner Grocery',
  category: 'grocery_store' as const,
  description: undefined,
  phone: '+995500000000',
  address: 'Vake, Tbilisi',
  location: { type: 'Point' as const, coordinates: [44.78, 41.72] },
  photo: undefined,
  plan: 'free' as const,
  status: 'active' as const,
  isVerified: false,
};

describe('createShopService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 409 when the owner already has a shop', async () => {
    mockRepo.findByOwnerId.mockResolvedValueOnce(fakeShop as never);
    const result = await createShopService('507f1f77bcf86cd799439099', {
      name: 'Corner Grocery',
      category: 'grocery_store',
      phone: '+995500000000',
      address: 'Vake, Tbilisi',
      lat: 41.72,
      lng: 44.78,
    });
    expect(result.status).toBe(409);
    expect(result.data).toEqual({ error: 'SHOP_EXISTS' });
    expect(mockRepo.create).not.toHaveBeenCalled();
  });

  it('builds the GeoJSON point in [lng, lat] order — regression test for the classic swap bug', async () => {
    mockRepo.findByOwnerId.mockResolvedValueOnce(null);
    mockRepo.create.mockResolvedValueOnce('507f1f77bcf86cd799439011');
    await createShopService('507f1f77bcf86cd799439099', {
      name: 'Corner Grocery',
      category: 'grocery_store',
      phone: '+995500000000',
      address: 'Vake, Tbilisi',
      lat: 41.72,
      lng: 44.78,
    });
    expect(mockRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        location: { type: 'Point', coordinates: [44.78, 41.72] },
        plan: 'free',
        status: 'active',
      })
    );
  });
});

describe('getShopByOwnerIdService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 404 when no shop exists', async () => {
    mockRepo.findByOwnerId.mockResolvedValueOnce(null);
    const result = await getShopByOwnerIdService('507f1f77bcf86cd799439099');
    expect(result.status).toBe(404);
  });

  it('returns the mapped shop response', async () => {
    mockRepo.findByOwnerId.mockResolvedValueOnce(fakeShop as never);
    const result = await getShopByOwnerIdService('507f1f77bcf86cd799439099');
    expect(result.status).toBe(200);
    expect(result.data).toMatchObject({ id: '507f1f77bcf86cd799439011', lat: 41.72, lng: 44.78 });
  });
});

describe('getShopByIdService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 404 when not found', async () => {
    mockRepo.findById.mockResolvedValueOnce(null);
    const result = await getShopByIdService('missing');
    expect(result.status).toBe(404);
  });

  it('returns 404 for a suspended shop even though it exists', async () => {
    mockRepo.findById.mockResolvedValueOnce({ ...fakeShop, status: 'suspended' } as never);
    const result = await getShopByIdService('507f1f77bcf86cd799439011');
    expect(result.status).toBe(404);
  });

  it('returns 200 for an active shop', async () => {
    mockRepo.findById.mockResolvedValueOnce(fakeShop as never);
    const result = await getShopByIdService('507f1f77bcf86cd799439011');
    expect(result.status).toBe(200);
  });
});

describe('updateShopService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 404 when the owner has no shop', async () => {
    mockRepo.findByOwnerId.mockResolvedValueOnce(null);
    const result = await updateShopService('507f1f77bcf86cd799439099', { name: 'New Name' });
    expect(result.status).toBe(404);
  });

  it('updates only the provided fields', async () => {
    mockRepo.findByOwnerId.mockResolvedValueOnce(fakeShop as never);
    mockRepo.updateById.mockResolvedValueOnce(true);
    await updateShopService('507f1f77bcf86cd799439099', { name: 'New Name' });
    expect(mockRepo.updateById).toHaveBeenCalledWith('507f1f77bcf86cd799439011', { name: 'New Name' });
  });

  it('rebuilds the location field only when both lat and lng are provided', async () => {
    mockRepo.findByOwnerId.mockResolvedValueOnce(fakeShop as never);
    mockRepo.updateById.mockResolvedValueOnce(true);
    await updateShopService('507f1f77bcf86cd799439099', { lat: 41.7, lng: 44.8 });
    expect(mockRepo.updateById).toHaveBeenCalledWith('507f1f77bcf86cd799439011', {
      location: { type: 'Point', coordinates: [44.8, 41.7] },
    });
  });

  it('calls syncShopDenormalizationService when name changes', async () => {
    mockRepo.findByOwnerId.mockResolvedValueOnce(fakeShop as never);
    mockRepo.updateById.mockResolvedValueOnce(true);
    await updateShopService('507f1f77bcf86cd799439099', { name: 'New Name' });
    expect(mockSyncDenormalization).toHaveBeenCalledWith('507f1f77bcf86cd799439011', {
      shopName: 'New Name',
      location: undefined,
    });
  });

  it('calls syncShopDenormalizationService when location changes', async () => {
    mockRepo.findByOwnerId.mockResolvedValueOnce(fakeShop as never);
    mockRepo.updateById.mockResolvedValueOnce(true);
    await updateShopService('507f1f77bcf86cd799439099', { lat: 41.7, lng: 44.8 });
    expect(mockSyncDenormalization).toHaveBeenCalledWith('507f1f77bcf86cd799439011', {
      shopName: undefined,
      location: { type: 'Point', coordinates: [44.8, 41.7] },
    });
  });

  it('does not call syncShopDenormalizationService when neither name nor location changed', async () => {
    mockRepo.findByOwnerId.mockResolvedValueOnce(fakeShop as never);
    mockRepo.updateById.mockResolvedValueOnce(true);
    await updateShopService('507f1f77bcf86cd799439099', { phone: '+995500000001' });
    expect(mockSyncDenormalization).not.toHaveBeenCalled();
  });
});

describe('getShopPhotoPresignedUrlService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('builds a key namespaced by ownerId and delegates to s3', async () => {
    mockS3.getPresignedUploadUrl.mockResolvedValueOnce({
      uploadUrl: 'https://upload.example.com',
      objectUrl: 'https://cdn.example.com/photo.jpg',
    });
    const result = await getShopPhotoPresignedUrlService('507f1f77bcf86cd799439099', {
      fileName: 'photo.jpg',
      contentType: 'image/jpeg',
    });
    expect(mockS3.getPresignedUploadUrl).toHaveBeenCalledWith(
      expect.stringMatching(/^shops\/507f1f77bcf86cd799439099\/.+-photo\.jpg$/),
      'image/jpeg'
    );
    expect(result.data).toEqual({
      uploadUrl: 'https://upload.example.com',
      objectUrl: 'https://cdn.example.com/photo.jpg',
    });
  });
});

describe('listAllShopsService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('lists shops filtered by status when provided', async () => {
    mockRepo.findAll.mockResolvedValueOnce({ items: [fakeShop] as never });
    const result = await listAllShopsService(1, 20, 'suspended');
    expect(mockRepo.findAll).toHaveBeenCalledWith({ status: 'suspended' }, 1, 20);
    expect(result.data).toMatchObject({ items: [expect.objectContaining({ id: '507f1f77bcf86cd799439011' })] });
  });

  it('lists all shops when no status filter is given', async () => {
    mockRepo.findAll.mockResolvedValueOnce({ items: [] });
    await listAllShopsService(1, 20);
    expect(mockRepo.findAll).toHaveBeenCalledWith({}, 1, 20);
  });
});

describe('updateShopStatusService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 404 when the shop does not exist', async () => {
    mockRepo.findById.mockResolvedValueOnce(null);
    const result = await updateShopStatusService('missing', 'suspended');
    expect(result.status).toBe(404);
  });

  it('updates the shop status', async () => {
    mockRepo.findById.mockResolvedValueOnce(fakeShop as never);
    mockRepo.updateById.mockResolvedValueOnce(true);
    const result = await updateShopStatusService('507f1f77bcf86cd799439011', 'suspended');
    expect(mockRepo.updateById).toHaveBeenCalledWith('507f1f77bcf86cd799439011', { status: 'suspended' });
    expect(result.status).toBe(200);
  });

  it('cascades to deactivate the shop\'s listings when suspending', async () => {
    mockRepo.findById.mockResolvedValueOnce(fakeShop as never);
    mockRepo.updateById.mockResolvedValueOnce(true);
    await updateShopStatusService('507f1f77bcf86cd799439011', 'suspended');
    expect(mockDeactivateListings).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
  });

  it('does not cascade-deactivate listings when reactivating a shop', async () => {
    mockRepo.findById.mockResolvedValueOnce(fakeShop as never);
    mockRepo.updateById.mockResolvedValueOnce(true);
    await updateShopStatusService('507f1f77bcf86cd799439011', 'active');
    expect(mockDeactivateListings).not.toHaveBeenCalled();
  });
});
