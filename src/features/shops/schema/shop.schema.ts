import mongoose, { Schema, InferSchemaType } from 'mongoose';

import { SHOP_CATEGORY_VALUES } from '@/shared/const/categories.const';
import { PLAN_TIER_VALUES } from '@/shared/const/plans.const';

const LocationSchema = new Schema(
  {
    type: { type: String, enum: ['Point'], default: 'Point', required: true },
    coordinates: { type: [Number], required: true },
  },
  { _id: false }
);

const ShopSchema = new Schema(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, enum: SHOP_CATEGORY_VALUES, required: true },
    description: { type: String, required: false },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    location: { type: LocationSchema, required: true },
    photo: { type: String, required: false },
    plan: { type: String, enum: PLAN_TIER_VALUES, default: 'free', required: true },
    status: { type: String, enum: ['active', 'suspended'], default: 'active', required: true },
    isVerified: { type: Boolean, default: false, required: true },
  },
  { timestamps: true }
);

ShopSchema.index({ location: '2dsphere' });
ShopSchema.index({ status: 1 });

export type ShopDocument = InferSchemaType<typeof ShopSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const ShopModel = mongoose.models.Shop || mongoose.model('Shop', ShopSchema);
