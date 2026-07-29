import { ListingCategory, LISTING_CATEGORIES } from '@/shared/const/categories.const';
import { HOUR_MS } from '@/shared/utils/time';

const DAY_MS = 24 * HOUR_MS;

export function getDiscountPercent(originalPrice: number, discountPrice: number): number {
  return Math.round((1 - discountPrice / originalPrice) * 100);
}

export function getListingCategoryLabel(category: ListingCategory): string {
  return LISTING_CATEGORIES.find((option) => option.value === category)?.label ?? category;
}

export function getExpiryLabel(expiresAt: Date | string): string {
  const expiry = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt;
  const msRemaining = expiry.getTime() - Date.now();

  if (msRemaining <= 0) return 'Expired';
  if (msRemaining < DAY_MS) return 'Expires today';
  if (msRemaining < 2 * DAY_MS) return 'Expires tomorrow';

  return `Expires in ${Math.ceil(msRemaining / DAY_MS)} days`;
}
