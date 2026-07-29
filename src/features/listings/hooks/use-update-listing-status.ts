'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { http } from '@/shared/lib/http';

export const useUpdateListingStatus = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const updateStatus = async (listingId: string, status: 'active' | 'sold_out') => {
    setLoading(true);
    try {
      await http.patch(`/listings/${listingId}`, { status });
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return { updateStatus, loading };
};
