export type DistanceOption = {
  value: number;
  label: string;
};

export const TBILISI_CENTER = { lat: 41.6934, lng: 44.8015 };

export const MAX_DISTANCE_OPTIONS: DistanceOption[] = [
  { value: 1, label: 'Within 1 km' },
  { value: 3, label: 'Within 3 km' },
  { value: 5, label: 'Within 5 km' },
  { value: 10, label: 'Within 10 km' },
  { value: 25, label: 'Within 25 km' },
];

export const LISTING_DURATION_OPTIONS: number[] = [1, 3, 7, 14, 30];

export type ListingStatusTab = {
  value: 'active' | 'sold_out' | 'deactivated';
  label: string;
};

export const LISTING_STATUS_TABS: ListingStatusTab[] = [
  { value: 'active', label: 'Active' },
  { value: 'sold_out', label: 'Sold' },
  { value: 'deactivated', label: 'Deactivated' },
];
