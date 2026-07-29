import { ListingCategory } from '@/shared/const/categories.const';

export type ListingsFilterState = {
  category: ListingCategory | null;
  maxDistanceKm: number;
  searchQuery: string;
  coordinates: { lat: number; lng: number } | null;
};

export type ListingsFilterActions = {
  setCategory: (category: ListingCategory | null) => void;
  setMaxDistanceKm: (km: number) => void;
  setSearchQuery: (query: string) => void;
  setCoordinates: (coordinates: { lat: number; lng: number } | null) => void;
  resetFilters: () => void;
};

export type ListingsFilterStore = ListingsFilterState & ListingsFilterActions;
