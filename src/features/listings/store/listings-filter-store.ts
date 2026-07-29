import { createStore } from 'zustand/vanilla';

import { ListingsFilterState, ListingsFilterStore } from '@/features/listings/types/listings-filter.types';
import { TBILISI_CENTER } from '@/shared/const/listings.const';

export const createListingsFilterStore = (initState: Partial<ListingsFilterState> = {}) => {
  const DEFAULT_STATE: ListingsFilterState = {
    category: null,
    maxDistanceKm: 25,
    searchQuery: '',
    coordinates: TBILISI_CENTER,
  };

  return createStore<ListingsFilterStore>()((set) => ({
    ...DEFAULT_STATE,
    ...initState,
    setCategory: (category) => set({ category }),
    setMaxDistanceKm: (maxDistanceKm) => set({ maxDistanceKm }),
    setSearchQuery: (searchQuery) => set({ searchQuery }),
    setCoordinates: (coordinates) => set({ coordinates }),
    resetFilters: () => set(DEFAULT_STATE),
  }));
};
