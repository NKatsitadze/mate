'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { CreateListingType } from '@/features/listings/validations/listing.validation';
import { http } from '@/shared/lib/http';

export const useCreateListing = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createListing = async (data: CreateListingType) => {
    setLoading(true);
    setError(null);
    try {
      await http.post('/listings', data);
      router.push('/dashboard/listings');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create listing');
    } finally {
      setLoading(false);
    }
  };

  return { createListing, loading, error };
};
