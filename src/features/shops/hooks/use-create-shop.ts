'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { CreateShopType } from '@/features/shops/validations/shop.validation';
import { http } from '@/shared/lib/http';

export const useCreateShop = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createShop = async (data: CreateShopType) => {
    setLoading(true);
    setError(null);
    try {
      await http.post('/shops', data);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create shop');
    } finally {
      setLoading(false);
    }
  };

  return { createShop, loading, error };
};
