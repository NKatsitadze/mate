import mongoose, { Schema, InferSchemaType } from 'mongoose';

import { LISTING_CATEGORY_VALUES } from '@/shared/const/categories.const';

const LocationSchema = new Schema(
  {
    type: { type: String, enum: ['Point'], default: 'Point', required: true },
    coordinates: { type: [Number], required: true },
  },
  { _id: false }
);

const ListingSchema = new Schema(
  {
    shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true },
    shopOwnerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    shopName: { type: String, required: true },
    location: { type: LocationSchema, required: true },
    title: { type: String, required: true, maxlength: 140 },
    description: { type: String, required: false, maxlength: 2000 },
    category: { type: String, enum: LISTING_CATEGORY_VALUES, required: true },
    originalPrice: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, required: true, min: 0 },
    images: { type: [String], default: [] },
    quantityAvailable: { type: Number, default: 1, min: 0 },
    status: {
      type: String,
      enum: ['active', 'sold_out', 'deactivated'],
      default: 'active',
      required: true,
    },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// Geo key must lead a compound index.
ListingSchema.index({ location: '2dsphere', category: 1, status: 1 });
// TTL auto-expiry — no cron job needed.
ListingSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
// Merchant's own listings + daily-count query.
ListingSchema.index({ shopId: 1, createdAt: -1 });
// Plain recency browse when no geo/keyword filter is given.
ListingSchema.index({ status: 1, category: 1, createdAt: -1 });

export type ListingDocument = InferSchemaType<typeof ListingSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const ListingModel = mongoose.models.Listing || mongoose.model('Listing', ListingSchema);
