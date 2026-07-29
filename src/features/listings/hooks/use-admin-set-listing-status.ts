'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { http } from '@/shared/lib/http';

export const useAdminSetListingStatus = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const setStatus = async (listingId: string, status: 'active' | 'deactivated') => {
    setLoading(true);
    try {
      await http.patch(`/admin/listings/${listingId}/status`, { status });
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return { setStatus, loading };
};
