import mongoose from 'mongoose';

import { listingRepository } from '@/features/listings/repository/listing.repository';
import { ListingDocument } from '@/features/listings/schema/listing.schema';
import { DailyUsage, ListingResponse, ListingStatus } from '@/features/listings/types/listing.types';
import {
  CreateListingType,
  ListingSearchQueryType,
  ListingStatusType,
  PresignUploadType,
  UpdateListingType,
} from '@/features/listings/validations/listing.validation';
import { getShopByOwnerIdService } from '@/features/shops/service/shop.service';
import { PLANS } from '@/shared/const/plans.const';
import { s3 } from '@/shared/lib/s3';
import { PaginatedResult, ServiceResult } from '@/shared/types/common';
import { escapeRegex } from '@/shared/utils/escape-regex';
import { HOUR_MS, startOfTodayInGeorgia } from '@/shared/utils/time';

function toListingResponse(doc: ListingDocument): ListingResponse {
  return {
    id: doc._id.toString(),
    shopId: doc.shopId.toString(),
    shopName: doc.shopName,
    lat: doc.location.coordinates[1],
    lng: doc.location.coordinates[0],
    title: doc.title,
    description: doc.description ?? undefined,
    category: doc.category,
    originalPrice: doc.originalPrice,
    discountPrice: doc.discountPrice,
    images: doc.images,
    quantityAvailable: doc.quantityAvailable,
    status: doc.status,
    expiresAt: doc.expiresAt,
  };
}

function toPaginatedListings(
  items: ListingDocument[],
  page: number,
  limit: number
): PaginatedResult<ListingResponse> {
  return { items: items.map(toListingResponse), page, limit };
}

export async function createListingService(
  ownerId: string,
  input: CreateListingType
): Promise<ServiceResult<{ id: string }>> {
  const shopResult = await getShopByOwnerIdService(ownerId);
  if ('error' in shopResult.data) return { data: { error: 'NO_SHOP' }, status: 404 };

  const shop = shopResult.data;
  if (shop.status === 'suspended') return { data: { error: 'SHOP_SUSPENDED' }, status: 403 };

  const limit = PLANS[shop.plan].dailyListingLimit;
  const usedToday = await listingRepository.countByShopSince(shop.id, startOfTodayInGeorgia());
  if (limit !== null && usedToday >= limit) {
    return { data: { error: 'DAILY_LIMIT_REACHED' }, status: 403 };
  }

  const expiresAt = new Date(Date.now() + input.listingDurationDays * 24 * HOUR_MS);

  const id = await listingRepository.create({
    shopId: new mongoose.Types.ObjectId(shop.id),
    shopOwnerId: new mongoose.Types.ObjectId(ownerId),
    shopName: shop.name,
    location: { type: 'Point', coordinates: [shop.lng, shop.lat] },
    title: input.title,
    description: input.description,
    category: input.category,
    originalPrice: input.originalPrice,
    discountPrice: input.discountPrice,
    images: input.images ?? [],
    quantityAvailable: input.quantityAvailable ?? 1,
    status: 'active',
    expiresAt,
  });

  return { data: { id }, status: 201 };
}

export async function getDailyUsageService(ownerId: string): Promise<ServiceResult<DailyUsage>> {
  const shopResult = await getShopByOwnerIdService(ownerId);
  if ('error' in shopResult.data) return { data: { error: 'NO_SHOP' }, status: 404 };

  const shop = shopResult.data;
  const limit = PLANS[shop.plan].dailyListingLimit;
  const used = await listingRepository.countByShopSince(shop.id, startOfTodayInGeorgia());

  return { data: { used, limit }, status: 200 };
}

export async function searchListingsService(
  query: ListingSearchQueryType
): Promise<ServiceResult<PaginatedResult<ListingResponse>>> {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const filter = {
    status: 'active' as const,
    ...(query.category ? { category: query.category } : {}),
    ...(query.q
      ? {
        $or: [
          { title: new RegExp(escapeRegex(query.q), 'i') },
          { description: new RegExp(escapeRegex(query.q), 'i') },
        ],
      }
      : {}),
  };

  let items: ListingDocument[];
  if (query.lat !== undefined && query.lng !== undefined) {
    const radiusMeters = (query.radiusKm ?? 10) * 1000;
    ({ items } = await listingRepository.findNearby(filter, [query.lng, query.lat], radiusMeters, page, limit));
  } else {
    ({ items } = await listingRepository.findRecent(filter, page, limit));
  }

  return { data: toPaginatedListings(items, page, limit), status: 200 };
}

export async function getListingByIdService(id: string): Promise<ServiceResult<ListingResponse>> {
  const listing = await listingRepository.findById(id);
  if (!listing || listing.status === 'deactivated') return { data: { error: 'NOT_FOUND' }, status: 404 };

  return { data: toListingResponse(listing), status: 200 };
}

export async function updateListingService(
  ownerId: string,
  id: string,
  input: UpdateListingType
): Promise<ServiceResult<{ message: string }>> {
  const listing = await listingRepository.findById(id);
  if (!listing) return { data: { error: 'NOT_FOUND' }, status: 404 };
  if (listing.shopOwnerId.toString() !== ownerId) return { data: { error: 'FORBIDDEN' }, status: 403 };

  const patch: Partial<ListingDocument> = {};
  if (input.title !== undefined) patch.title = input.title;
  if (input.description !== undefined) patch.description = input.description;
  if (input.category !== undefined) patch.category = input.category;
  if (input.originalPrice !== undefined) patch.originalPrice = input.originalPrice;
  if (input.discountPrice !== undefined) patch.discountPrice = input.discountPrice;
  if (input.images !== undefined) patch.images = input.images;
  if (input.quantityAvailable !== undefined) patch.quantityAvailable = input.quantityAvailable;
  if (input.status !== undefined) patch.status = input.status;

  await listingRepository.updateById(id, patch);

  return { data: { message: 'Listing updated' }, status: 200 };
}

export async function deleteListingService(ownerId: string, id: string): Promise<ServiceResult<{ message: string }>> {
  const listing = await listingRepository.findById(id);
  if (!listing) return { data: { error: 'NOT_FOUND' }, status: 404 };
  if (listing.shopOwnerId.toString() !== ownerId) return { data: { error: 'FORBIDDEN' }, status: 403 };

  await listingRepository.deleteById(id);

  return { data: { message: 'Listing deleted' }, status: 200 };
}

export async function getListingsByShopService(
  ownerId: string,
  page: number,
  limit: number
): Promise<ServiceResult<PaginatedResult<ListingResponse>>> {
  const shopResult = await getShopByOwnerIdService(ownerId);
  if ('error' in shopResult.data) return { data: { error: 'NO_SHOP' }, status: 404 };

  const { items } = await listingRepository.findByShopId(shopResult.data.id, page, limit);

  return { data: toPaginatedListings(items, page, limit), status: 200 };
}

export async function getListingImagePresignedUrlService(
  ownerId: string,
  input: PresignUploadType
): Promise<ServiceResult<{ uploadUrl: string; objectUrl: string }>> {
  const shopResult = await getShopByOwnerIdService(ownerId);
  if ('error' in shopResult.data) return { data: { error: 'NO_SHOP' }, status: 404 };

  const key = `listings/${shopResult.data.id}/${crypto.randomUUID()}-${input.fileName}`;
  const result = await s3.getPresignedUploadUrl(key, input.contentType);

  return { data: result, status: 200 };
}

export async function listAllListingsService(
  page: number,
  limit: number,
  status?: ListingStatus
): Promise<ServiceResult<PaginatedResult<ListingResponse>>> {
  const filter = status ? { status } : {};
  const { items } = await listingRepository.findRecent(filter, page, limit);

  return { data: toPaginatedListings(items, page, limit), status: 200 };
}

export async function setListingStatusService(
  id: string,
  status: ListingStatusType['status']
): Promise<ServiceResult<{ message: string }>> {
  const listing = await listingRepository.findById(id);
  if (!listing) return { data: { error: 'NOT_FOUND' }, status: 404 };

  await listingRepository.updateById(id, { status });

  return { data: { message: 'Listing status updated' }, status: 200 };
}

export async function syncShopDenormalizationService(
  shopId: string,
  patch: Partial<Pick<ListingDocument, 'shopName' | 'location'>>
): Promise<void> {
  await listingRepository.updateManyByShopId(shopId, patch);
}

export async function deactivateAllListingsForShopService(shopId: string): Promise<void> {
  await listingRepository.deactivateActiveByShopId(shopId);
}
