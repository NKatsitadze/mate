export type ListingCategory =
  | 'groceries_food'
  | 'furniture_home'
  | 'electronics'
  | 'fashion'
  | 'real_estate_rentals'
  | 'services'
  | 'other';

export type ShopCategory =
  | 'grocery_store'
  | 'furniture_store'
  | 'electronics_store'
  | 'event_venue'
  | 'restaurant_cafe'
  | 'service_provider'
  | 'other';

export type CategoryOption<T extends string> = {
  value: T;
  label: string;
};

export const LISTING_CATEGORIES: CategoryOption<ListingCategory>[] = [
  { value: 'groceries_food', label: 'Groceries & Food' },
  { value: 'furniture_home', label: 'Furniture & Home' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'fashion', label: 'Fashion' },
  { value: 'real_estate_rentals', label: 'Real Estate & Rentals' },
  { value: 'services', label: 'Services' },
  { value: 'other', label: 'Other' },
];

export const LISTING_CATEGORY_VALUES = LISTING_CATEGORIES.map((category) => category.value) as [
  ListingCategory,
  ...ListingCategory[],
];

export const SHOP_CATEGORIES: CategoryOption<ShopCategory>[] = [
  { value: 'grocery_store', label: 'Grocery Store' },
  { value: 'furniture_store', label: 'Furniture Store' },
  { value: 'electronics_store', label: 'Electronics Store' },
  { value: 'event_venue', label: 'Event Venue / Real Estate' },
  { value: 'restaurant_cafe', label: 'Restaurant / Cafe' },
  { value: 'service_provider', label: 'Service Provider' },
  { value: 'other', label: 'Other' },
];

export const SHOP_CATEGORY_VALUES = SHOP_CATEGORIES.map((category) => category.value) as [
  ShopCategory,
  ...ShopCategory[],
];
