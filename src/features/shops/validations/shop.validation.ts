import { z } from 'zod';

import { SHOP_CATEGORY_VALUES } from '@/shared/const/categories.const';
import { ALLOWED_IMAGE_MIME_TYPES } from '@/shared/const/images.const';

export const CreateShopSchema = z.object({
  name: z.string().min(2).max(100),
  category: z.enum(SHOP_CATEGORY_VALUES),
  description: z.string().max(1000).optional(),
  phone: z.string().min(9).max(20),
  address: z.string().min(5).max(300),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  photo: z.string().url().optional(),
});

export type CreateShopType = z.infer<typeof CreateShopSchema>;

export const UpdateShopSchema = CreateShopSchema.partial();

export type UpdateShopType = z.infer<typeof UpdateShopSchema>;

export const ShopStatusSchema = z.object({
  status: z.enum(['active', 'suspended']),
});

export type ShopStatusType = z.infer<typeof ShopStatusSchema>;

export const PresignUploadSchema = z.object({
  fileName: z.string().min(1).max(255),
  contentType: z.enum(ALLOWED_IMAGE_MIME_TYPES),
});

export type PresignUploadType = z.infer<typeof PresignUploadSchema>;
