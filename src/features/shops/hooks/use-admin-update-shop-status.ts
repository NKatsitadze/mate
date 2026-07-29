'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { ShopStatusType } from '@/features/shops/validations/shop.validation';
import { http } from '@/shared/lib/http';

export const useAdminUpdateShopStatus = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const updateStatus = async (shopId: string, status: ShopStatusType['status']) => {
    setLoading(true);
    try {
      await http.patch(`/admin/shops/${shopId}/status`, { status });
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return { updateStatus, loading };
};
