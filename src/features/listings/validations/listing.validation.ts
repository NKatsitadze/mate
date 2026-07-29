import { z } from 'zod';

import { LISTING_CATEGORY_VALUES } from '@/shared/const/categories.const';
import { ALLOWED_IMAGE_MIME_TYPES } from '@/shared/const/images.const';

const BaseListingSchema = z.object({
  title: z.string().min(3).max(140),
  description: z.string().max(2000).optional(),
  category: z.enum(LISTING_CATEGORY_VALUES),
  originalPrice: z.number().positive(),
  discountPrice: z.number().positive(),
  images: z.array(z.string().url()).max(5).optional(),
  quantityAvailable: z.number().int().positive().max(9999).optional(),
  listingDurationDays: z.number().int().min(1).max(30),
});

export const CreateListingSchema = BaseListingSchema.refine(
  (data) => data.discountPrice < data.originalPrice,
  { message: 'DISCOUNT_MUST_BE_LESS_THAN_ORIGINAL', path: ['discountPrice'] }
);

export type CreateListingType = z.infer<typeof CreateListingSchema>;

export const UpdateListingSchema = BaseListingSchema.partial().extend({
  status: z.enum(['active', 'sold_out']).optional(),
});

export type UpdateListingType = z.infer<typeof UpdateListingSchema>;

export const ListingStatusSchema = z.object({
  status: z.enum(['active', 'deactivated']),
});

export type ListingStatusType = z.infer<typeof ListingStatusSchema>;

export const ListingSearchQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  radiusKm: z.coerce.number().positive().max(50).optional(),
  category: z.enum(LISTING_CATEGORY_VALUES).optional(),
  q: z.string().min(1).max(100).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(50).optional(),
});

export type ListingSearchQueryType = z.infer<typeof ListingSearchQuerySchema>;

export const PresignUploadSchema = z.object({
  fileName: z.string().min(1).max(255),
  contentType: z.enum(ALLOWED_IMAGE_MIME_TYPES),
});

export type PresignUploadType = z.infer<typeof PresignUploadSchema>;
