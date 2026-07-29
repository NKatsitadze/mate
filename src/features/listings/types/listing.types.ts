import { ListingCategory } from '@/shared/const/categories.const';

export type ListingStatus = 'active' | 'sold_out' | 'deactivated';

export type ListingResponse = {
  id: string;
  shopId: string;
  shopName: string;
  lat: number;
  lng: number;
  title: string;
  description?: string;
  category: ListingCategory;
  originalPrice: number;
  discountPrice: number;
  images: string[];
  quantityAvailable: number;
  status: ListingStatus;
  expiresAt: Date;
};

export type DailyUsage = {
  used: number;
  limit: number | null;
};
