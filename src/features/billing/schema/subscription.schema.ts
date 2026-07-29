import mongoose, { Schema, InferSchemaType } from 'mongoose';

import { PLAN_TIER_VALUES } from '@/shared/const/plans.const';

const SubscriptionSchema = new Schema(
  {
    shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true, unique: true },
    dodoCustomerId: { type: String, required: true },
    dodoSubscriptionId: { type: String, required: true, unique: true },
    plan: { type: String, enum: PLAN_TIER_VALUES, required: true },
    status: {
      type: String,
      enum: ['active', 'on_hold', 'cancelled', 'expired', 'failed'] as const,
      required: true,
    },
    currentPeriodEnd: { type: Date, required: false },
  },
  { timestamps: true }
);

export type SubscriptionDocument = InferSchemaType<typeof SubscriptionSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const SubscriptionModel =
  mongoose.models.Subscription || mongoose.model('Subscription', SubscriptionSchema);
