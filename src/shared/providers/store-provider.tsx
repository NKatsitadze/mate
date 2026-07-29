'use client';
import { type ReactNode, useState } from 'react';
import { type StoreApi } from 'zustand';

import { AuthStoreContext } from '@/features/auth/hooks/useAuthStore';
import { createAuthStore } from '@/features/auth/store/auth-store';
import { AuthStore } from '@/features/auth/types/auth.types';
import { ListingsFilterStoreContext } from '@/features/listings/hooks/useListingsFilterStore';
import { createListingsFilterStore } from '@/features/listings/store/listings-filter-store';
import { ListingsFilterStore } from '@/features/listings/types/listings-filter.types';

export type StoreProviderProps = { children: ReactNode };

export const StoreProvider = ({ children }: StoreProviderProps) => {
  const [authStore] = useState<StoreApi<AuthStore>>(() => createAuthStore());
  const [listingsFilterStore] = useState<StoreApi<ListingsFilterStore>>(() => createListingsFilterStore());

  return (
    <AuthStoreContext.Provider value={authStore}>
      <ListingsFilterStoreContext.Provider value={listingsFilterStore}>
        {children}
      </ListingsFilterStoreContext.Provider>
    </AuthStoreContext.Provider>
  );
};
