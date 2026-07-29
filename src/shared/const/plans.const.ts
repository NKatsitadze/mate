export type PlanTier = 'free' | 'pro' | 'premium';

export type PlanDefinition = {
  tier: PlanTier;
  label: string;
  priceGel: number;
  dailyListingLimit: number | null;
  visibilityMultiplier: number;
  featureBullets: string[];
};

export const PLANS: Record<PlanTier, PlanDefinition> = {
  free: {
    tier: 'free',
    label: 'Free',
    priceGel: 0,
    dailyListingLimit: 3,
    visibilityMultiplier: 1,
    featureBullets: ['3 listings per day', 'Standard search visibility'],
  },
  pro: {
    tier: 'pro',
    label: 'Pro',
    priceGel: 45,
    dailyListingLimit: 15,
    visibilityMultiplier: 1.5,
    featureBullets: ['15 listings per day', 'Boosted search visibility', 'Priority support'],
  },
  premium: {
    tier: 'premium',
    label: 'Premium',
    priceGel: 95,
    dailyListingLimit: null,
    visibilityMultiplier: 2,
    featureBullets: ['Unlimited listings', 'Maximum search visibility', 'Priority support'],
  },
};

export const PLAN_TIER_VALUES = ['free', 'pro', 'premium'] as const;

export const USAGE_METER_CELLS = 24;
