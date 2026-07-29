'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { http } from '@/shared/lib/http';

export const useDeleteListing = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const deleteListing = async (listingId: string) => {
    setLoading(true);
    try {
      await http.delete(`/listings/${listingId}`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return { deleteListing, loading };
};
