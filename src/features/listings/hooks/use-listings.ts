'use client';
import { useEffect, useState } from 'react';

import { useListingsFilterStore } from '@/features/listings/hooks/useListingsFilterStore';
import { ListingResponse } from '@/features/listings/types/listing.types';
import { http } from '@/shared/lib/http';
import { PaginatedResult } from '@/shared/types/common';

export const useListings = () => {
  const { category, maxDistanceKm, searchQuery, coordinates } = useListingsFilterStore();
  const [listings, setListings] = useState<ListingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchListings = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await http.get<PaginatedResult<ListingResponse>>('/listings', {
          params: {
            category: category ?? undefined,
            q: searchQuery || undefined,
            lat: coordinates?.lat,
            lng: coordinates?.lng,
            radiusKm: coordinates ? maxDistanceKm : undefined,
          },
        });
        if (!cancelled) setListings(result.items);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load listings');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void fetchListings();

    return () => {
      cancelled = true;
    };
  }, [category, maxDistanceKm, searchQuery, coordinates]);

  return { listings, loading, error };
};
