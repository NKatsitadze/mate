'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { UpdateListingType } from '@/features/listings/validations/listing.validation';
import { http } from '@/shared/lib/http';

export const useUpdateListing = (listingId: string) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateListing = async (data: UpdateListingType) => {
    setLoading(true);
    setError(null);
    try {
      await http.patch(`/listings/${listingId}`, data);
      router.push('/dashboard/listings');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update listing');
    } finally {
      setLoading(false);
    }
  };

  return { updateListing, loading, error };
};
