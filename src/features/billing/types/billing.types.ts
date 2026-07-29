import { SubscriptionDocument } from '@/features/billing/schema/subscription.schema';
import { PlanTier } from '@/shared/const/plans.const';

export type SubscriptionStatus = SubscriptionDocument['status'];

export type PaidPlanTier = Exclude<PlanTier, 'free'>;

export type SubscriptionResponse = {
  plan: PlanTier;
  status: SubscriptionStatus | null;
  currentPeriodEnd: string | null;
};
