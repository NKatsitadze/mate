import mongoose from 'mongoose';

import {
  deactivateAllListingsForShopService,
  syncShopDenormalizationService,
} from '@/features/listings/service/listing.service';
import { shopRepository } from '@/features/shops/repository/shop.repository';
import { ShopDocument } from '@/features/shops/schema/shop.schema';
import { ShopResponse } from '@/features/shops/types/shop.types';
import {
  CreateShopType,
  PresignUploadType,
  ShopStatusType,
  UpdateShopType,
} from '@/features/shops/validations/shop.validation';
import { PlanTier } from '@/shared/const/plans.const';
import { s3 } from '@/shared/lib/s3';
import { PaginatedResult, ServiceResult } from '@/shared/types/common';

function toGeoPoint(lat: number, lng: number): ShopDocument['location'] {
  return { type: 'Point', coordinates: [lng, lat] };
}

function toShopResponse(doc: ShopDocument): ShopResponse {
  return {
    id: doc._id.toString(),
    ownerId: doc.ownerId.toString(),
    name: doc.name,
    category: doc.category,
    description: doc.description ?? undefined,
    phone: doc.phone,
    address: doc.address,
    lat: doc.location.coordinates[1],
    lng: doc.location.coordinates[0],
    photo: doc.photo ?? undefined,
    plan: doc.plan,
    status: doc.status,
    isVerified: doc.isVerified,
  };
}

export async function createShopService(
  ownerId: string,
  input: CreateShopType
): Promise<ServiceResult<{ id: string }>> {
  const existing = await shopRepository.findByOwnerId(ownerId);
  if (existing) return { data: { error: 'SHOP_EXISTS' }, status: 409 };

  const id = await shopRepository.create({
    ownerId: new mongoose.Types.ObjectId(ownerId),
    name: input.name,
    category: input.category,
    description: input.description,
    phone: input.phone,
    address: input.address,
    location: toGeoPoint(input.lat, input.lng),
    photo: input.photo,
    plan: 'free',
    status: 'active',
    isVerified: false,
  });

  return { data: { id }, status: 201 };
}

export async function getShopByOwnerIdService(ownerId: string): Promise<ServiceResult<ShopResponse>> {
  const shop = await shopRepository.findByOwnerId(ownerId);
  if (!shop) return { data: { error: 'NOT_FOUND' }, status: 404 };

  return { data: toShopResponse(shop), status: 200 };
}

export async function getShopByIdService(id: string): Promise<ServiceResult<ShopResponse>> {
  const shop = await shopRepository.findById(id);
  if (!shop || shop.status === 'suspended') return { data: { error: 'NOT_FOUND' }, status: 404 };

  return { data: toShopResponse(shop), status: 200 };
}

export async function updateShopService(
  ownerId: string,
  input: UpdateShopType
): Promise<ServiceResult<{ message: string }>> {
  const shop = await shopRepository.findByOwnerId(ownerId);
  if (!shop) return { data: { error: 'NOT_FOUND' }, status: 404 };

  const patch: Partial<ShopDocument> = {};
  if (input.name !== undefined) patch.name = input.name;
  if (input.category !== undefined) patch.category = input.category;
  if (input.description !== undefined) patch.description = input.description;
  if (input.phone !== undefined) patch.phone = input.phone;
  if (input.address !== undefined) patch.address = input.address;
  if (input.photo !== undefined) patch.photo = input.photo;
  if (input.lat !== undefined && input.lng !== undefined) {
    patch.location = toGeoPoint(input.lat, input.lng);
  }

  await shopRepository.updateById(shop._id.toString(), patch);

  if (patch.name !== undefined || patch.location !== undefined) {
    await syncShopDenormalizationService(shop._id.toString(), {
      shopName: patch.name,
      location: patch.location,
    });
  }

  return { data: { message: 'Shop updated' }, status: 200 };
}

export async function getShopPhotoPresignedUrlService(
  ownerId: string,
  input: PresignUploadType
): Promise<ServiceResult<{ uploadUrl: string; objectUrl: string }>> {
  const key = `shops/${ownerId}/${crypto.randomUUID()}-${input.fileName}`;
  const result = await s3.getPresignedUploadUrl(key, input.contentType);

  return { data: result, status: 200 };
}

export async function listAllShopsService(
  page: number,
  limit: number,
  status?: ShopStatusType['status']
): Promise<ServiceResult<PaginatedResult<ShopResponse>>> {
  const filter = status ? { status } : {};
  const { items } = await shopRepository.findAll(filter, page, limit);

  return {
    data: { items: items.map(toShopResponse), page, limit },
    status: 200,
  };
}

export async function updateShopStatusService(
  id: string,
  status: ShopStatusType['status']
): Promise<ServiceResult<{ message: string }>> {
  const shop = await shopRepository.findById(id);
  if (!shop) return { data: { error: 'NOT_FOUND' }, status: 404 };

  await shopRepository.updateById(id, { status });

  if (status === 'suspended') {
    await deactivateAllListingsForShopService(id);
  }

  return { data: { message: 'Shop status updated' }, status: 200 };
}

// Internal cross-feature helper for the billing feature's webhook handler —
// not backed by its own API route, so it isn't ServiceResult-wrapped (mirrors
// isEmailAllowedService's plain-function convention).
export async function updateShopPlanService(shopId: string, plan: PlanTier): Promise<void> {
  await shopRepository.updateById(shopId, { plan });
}
