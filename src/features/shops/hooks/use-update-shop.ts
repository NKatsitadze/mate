'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { UpdateShopType } from '@/features/shops/validations/shop.validation';
import { http } from '@/shared/lib/http';

export const useUpdateShop = (onSuccess?: () => void) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateShop = async (data: UpdateShopType) => {
    setLoading(true);
    setError(null);
    try {
      await http.patch('/shops/me', data);
      router.refresh();
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update shop');
    } finally {
      setLoading(false);
    }
  };

  return { updateShop, loading, error };
};
