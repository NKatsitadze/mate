'use client';
import { createContext, useContext } from 'react';
import { StoreApi, useStore } from 'zustand';
import { useShallow } from 'zustand/react/shallow';

import { ListingsFilterStore } from '@/features/listings/types/listings-filter.types';

export const ListingsFilterStoreContext = createContext<StoreApi<ListingsFilterStore> | null>(null);

export const useListingsFilterStore = () => {
  const store = useContext(ListingsFilterStoreContext);
  if (!store) throw new Error('useListingsFilterStore must be used within StoreProvider');
  return useStore(
    store,
    useShallow((state: ListingsFilterStore) => ({
      category: state.category,
      maxDistanceKm: state.maxDistanceKm,
      searchQuery: state.searchQuery,
      coordinates: state.coordinates,
      setCategory: state.setCategory,
      setMaxDistanceKm: state.setMaxDistanceKm,
      setSearchQuery: state.setSearchQuery,
      setCoordinates: state.setCoordinates,
      resetFilters: state.resetFilters,
    }))
  );
};
