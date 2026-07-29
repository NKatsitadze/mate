import { ShopCategory } from '@/shared/const/categories.const';
import { PlanTier } from '@/shared/const/plans.const';

export type ShopResponse = {
  id: string;
  ownerId: string;
  name: string;
  category: ShopCategory;
  description?: string;
  phone: string;
  address: string;
  lat: number;
  lng: number;
  photo?: string;
  plan: PlanTier;
  status: 'active' | 'suspended';
  isVerified: boolean;
};
